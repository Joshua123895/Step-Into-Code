async function ensureSkulpt(inputfun) {
  if (window.Sk && window.Sk.configure) {
    window.Sk.configure({ inputfun });
    return window.Sk;
  }

  await import("skulpt/dist/skulpt.min.js");
  await import("skulpt/dist/skulpt-stdlib.js");

  if (!window.Sk || !window.Sk.configure) {
    throw new Error("Skulpt failed to load");
  }

  window.Sk.configure({
    output: () => {},
    read: (x) => {
      if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
      return window.Sk.builtinFiles["files"][x];
    },
    __future__: window.Sk.python3,
    inputfun,
  });

  const typingStub = `
class _Subscriptable:
    def __getitem__(self, item):
        return self
    def __call__(self, *a, **kw):
        return self

List = _Subscriptable()
Dict = _Subscriptable()
Tuple = _Subscriptable()
Set = _Subscriptable()
Optional = _Subscriptable()
Union = _Subscriptable()
Callable = _Subscriptable()
TypeVar = lambda name: name
Protocol = type('Protocol', (object,), {'__init__': lambda s: None})

def TypedDict(name, fields=None, **kw):
    if fields is None:
        fields = kw
    return type(name, (dict,), {'__annotations__': fields})
`;
  window.Sk.builtinFiles["files"]["src/lib/typing.py"] = typingStub;

  const contextlibStub = `
class suppress:
    def __init__(self, *exceptions):
        self._exceptions = exceptions

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            for exc in self._exceptions:
                if issubclass(exc_type, exc):
                    return True
        return False
`;
  window.Sk.builtinFiles["files"]["src/lib/contextlib.py"] = contextlibStub;

  return window.Sk;
}

export async function runPythonWithIO(code, inputs = []) {
  let i = 0;
  const chunks = [];

  const onInput = (resolve) => {
    resolve(i < inputs.length ? inputs[i++] : "");
  };

  const onOutput = (text) => {
    chunks.push(text);
  };

  await runPython(code, onInput, onOutput);

  return chunks.join("");
}

export async function runPython(code, onInput, onOutput) {
  try {
    const inputfun = (prompt) => {
      if (onOutput) onOutput(prompt);
      return new Promise((resolve) => onInput(resolve));
    };
    const sk = await ensureSkulpt(inputfun);

    sk.output = (text) => {
      if (onOutput) onOutput(text);
    };

    try {
      await sk.misceval.asyncToPromise(() =>
        sk.importMainWithBody("<stdin>", false, code, true)
      );
    } catch (e) {
      const msg = String(e);
      if (msg.includes('lineno')) {
        onOutput('Skulpt cannot parse this code (likely type annotations or advanced Python 3 syntax).\nThis level requires the server to run — make sure you are connected.\n');
      } else {
        onOutput(msg);
      }
    }

    sk.output = () => {};
  } catch (e) {
    if (onOutput) onOutput("Error: " + (e.message || String(e)));
  }
}
