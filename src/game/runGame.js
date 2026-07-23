// Proof-of-concept pygame runner. Opens a popup window with its OWN Pyodide
// instance and a small pure-Python `pygame` shim that maps the common drawing/
// event calls onto an HTML5 canvas. The student's game loop runs as an asyncio
// task (yielding each frame via `await asyncio.sleep`), so it never blocks —
// closing the window is how you stop it (a game's `while running:` is supposed
// to loop forever, so the 8s failsafe doesn't apply here).
//
// This is intentionally a SUBSET of pygame (shapes + keyboard), enough to prove
// the concept end-to-end without a heavyweight WASM pygame build.

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.29.4/full/";

// The fake `pygame` module, installed into sys.modules before the student code
// runs. Browser keyCodes are used for the K_* constants so keyboard "just works".
const PYGAME_SHIM = String.raw`
import sys, types, asyncio
import js
from js import document, window

_state = {"ctx": None, "w": 0, "h": 0}

def _css(color):
    if isinstance(color, (tuple, list)) and len(color) >= 3:
        r, g, b = int(color[0]), int(color[1]), int(color[2])
        return "rgb(%d,%d,%d)" % (r, g, b)
    return str(color)

class Surface:
    def __init__(self, w, h):
        self.w = w
        self.h = h
    def fill(self, color):
        ctx = _state["ctx"]
        if ctx:
            ctx.fillStyle = _css(color)
            ctx.fillRect(0, 0, self.w, self.h)
    def get_width(self):
        return self.w
    def get_height(self):
        return self.h
    def blit(self, *a, **k):
        pass  # POC: no image blitting

class _Display:
    def set_mode(self, size, *a, **k):
        w, h = int(size[0]), int(size[1])
        canvas = document.getElementById("game")
        canvas.width = w
        canvas.height = h
        _state["ctx"] = canvas.getContext("2d")
        _state["w"], _state["h"] = w, h
        return Surface(w, h)
    def set_caption(self, title):
        document.getElementById("title").textContent = str(title)
    def flip(self):
        pass  # direct-draw: the browser paints on the async yield
    def update(self, *a):
        pass

class _Draw:
    def rect(self, surface, color, rect, width=0):
        ctx = _state["ctx"]
        x, y, w, h = rect
        if width == 0:
            ctx.fillStyle = _css(color)
            ctx.fillRect(x, y, w, h)
        else:
            ctx.strokeStyle = _css(color)
            ctx.lineWidth = width
            ctx.strokeRect(x, y, w, h)
    def circle(self, surface, color, center, radius, width=0):
        ctx = _state["ctx"]
        ctx.beginPath()
        ctx.arc(center[0], center[1], radius, 0, 6.283185)
        if width == 0:
            ctx.fillStyle = _css(color)
            ctx.fill()
        else:
            ctx.strokeStyle = _css(color)
            ctx.lineWidth = width
            ctx.stroke()
    def line(self, surface, color, start, end, width=1):
        ctx = _state["ctx"]
        ctx.beginPath()
        ctx.moveTo(start[0], start[1])
        ctx.lineTo(end[0], end[1])
        ctx.strokeStyle = _css(color)
        ctx.lineWidth = width
        ctx.stroke()

class Event:
    def __init__(self, type_, key=0):
        self.type = type_
        self.key = key

class _EventModule:
    def get(self):
        out = []
        q = window._pygame_events
        while q.length > 0:
            e = q.shift()
            out.append(Event(int(e.type), int(e.key)))
        return out

class Clock:
    def tick(self, fps=60):
        return 16

class _Time:
    def Clock(self):
        return Clock()

class _KeyModule:
    def get_pressed(self):
        held = window._pygame_held
        return {int(k): True for k in js.Object.keys(held)}

pygame = types.ModuleType("pygame")
pygame.display = _Display()
pygame.draw = _Draw()
pygame.event = _EventModule()
pygame.time = _Time()
pygame.key = _KeyModule()
pygame.Surface = Surface
pygame.init = lambda *a, **k: (0, 0)
pygame.quit = lambda *a, **k: None
pygame.QUIT = 256
pygame.KEYDOWN = 768
pygame.KEYUP = 769
pygame.K_LEFT = 37
pygame.K_UP = 38
pygame.K_RIGHT = 39
pygame.K_DOWN = 40
pygame.K_SPACE = 32
pygame.K_a = 65
pygame.K_d = 68
pygame.K_w = 87
pygame.K_s = 83
sys.modules["pygame"] = pygame

# Under Pyodide there is already a running event loop, so asyncio.run() would
# raise. Reroute it to schedule the coroutine on the existing loop and return.
def _bg_run(coro):
    asyncio.ensure_future(coro)
asyncio.run = _bg_run
`;

// Returns a fully self-contained HTML document that runs the given pygame code
// on its own Pyodide instance and canvas. Rendered inside an <iframe srcDoc>
// (see GameModal), so it is isolated from the React app and torn down cleanly by
// unmounting the iframe.
export function buildGameHTML(code) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Game</title>
<style>
  html, body { margin: 0; background: #14141c; color: #cdd6f4; font-family: system-ui, sans-serif; }
  #bar { display: flex; align-items: center; gap: 10px; padding: 8px 12px; }
  #title { font-weight: 700; font-size: 14px; }
  #stop { margin-left: auto; background: #FF5F57; color: #fff; border: none; border-radius: 6px; padding: 5px 12px; font-weight: 700; cursor: pointer; }
  canvas { display: block; margin: 0 auto; background: #000; border-top: 1px solid #2a2a3a; max-width: 100%; height: auto; }
  #status { font-size: 11px; color: #7f849c; padding: 6px 12px; margin: 0; }
</style>
</head>
<body>
  <div id="bar"><span id="title">Game</span><button id="stop">■ Stop</button></div>
  <canvas id="game" width="480" height="320"></canvas>
  <pre id="status">Loading Python runtime…</pre>
  <script>
    window._pygame_events = [];
    window._pygame_held = {};
    const KEYMAP = { 37:37, 38:38, 39:39, 40:40, 32:32, 65:65, 68:68, 87:87, 83:83 };
    window.addEventListener('keydown', function (e) {
      // Esc closes the modal even when the game (this iframe) holds focus, since
      // the parent window can't see keydowns that land inside the iframe.
      if (e.key === 'Escape') {
        if (window.parent) window.parent.postMessage('game-stop', '*');
        return;
      }
      const k = KEYMAP[e.keyCode] || e.keyCode;
      window._pygame_events.push({ type: 768, key: k });
      window._pygame_held[k] = 1;
      if ([32,37,38,39,40].indexOf(e.keyCode) >= 0) e.preventDefault();
    });
    window.addEventListener('keyup', function (e) {
      const k = KEYMAP[e.keyCode] || e.keyCode;
      window._pygame_events.push({ type: 769, key: k });
      delete window._pygame_held[k];
    });
    document.getElementById('stop').onclick = function () {
      window._pygame_events.push({ type: 256, key: 0 });
      setTimeout(function () {
        if (window.parent) window.parent.postMessage('game-stop', '*');
      }, 100);
    };
    const USER_CODE = ${JSON.stringify(code)};
    const SHIM = ${JSON.stringify(PYGAME_SHIM)};
    const status = document.getElementById('status');
    // Load Pyodide via a dynamic script + onload so we never depend on the
    // document.write() script ordering (which is fragile in a popup).
    const s = document.createElement('script');
    s.src = ${JSON.stringify(PYODIDE_URL + "pyodide.js")};
    s.onload = async function () {
      try {
        const pyodide = await loadPyodide({ indexURL: ${JSON.stringify(PYODIDE_URL)} });
        status.textContent = 'Running — close this window (or Stop) to end.';
        await pyodide.runPythonAsync(SHIM);
        await pyodide.runPythonAsync(USER_CODE);
      } catch (err) {
        status.textContent = 'Error: ' + err;
        status.style.color = '#FF5F57';
      }
    };
    s.onerror = function () {
      status.textContent = 'Failed to load the Python runtime (network?).';
      status.style.color = '#FF5F57';
    };
    document.head.appendChild(s);
  </script>
</body>
</html>`;
}
