async function ensureSkulptLoaded() {
  if (window.Sk && window.Sk.parse) return;
  await import("skulpt/dist/skulpt.min.js");
  await import("skulpt/dist/skulpt-stdlib.js");
}

export async function validateStructure(code, sourceChecks) {
  if (!sourceChecks) return { valid: true };

  await ensureSkulptLoaded();

  const sk = window.Sk;
  if (!sk || !sk.parse) return { valid: true };

  try {
    const parsed = sk.parse("<stdin>", code);
    const ast = sk.astFromParse(parsed.cst, "<stdin>", parsed.flags);

    const classNames = [];
    const functionNames = [];
    const classMethods = {};
    const inheritance = {};

    function walk(node, currentClass = null) {
      if (!node || typeof node !== "object") return;

      if (node.constructor === sk.astnodes.ClassDef) {
        classNames.push(node.name);
        const bases = (node.bases || [])
          .map((b) => {
            if (b.constructor === sk.astnodes.Name) return b.id;
            if (b.constructor === sk.astnodes.Attribute) return b.attr;
            return null;
          })
          .filter(Boolean);
        if (bases.length > 0) inheritance[node.name] = bases;
        if (Array.isArray(node.body)) {
          for (const stmt of node.body) walk(stmt, node.name);
        }
        return;
      } else if (node.constructor === sk.astnodes.FunctionDef) {
        if (currentClass) {
          if (!classMethods[currentClass]) classMethods[currentClass] = [];
          classMethods[currentClass].push(node.name);
        } else {
          functionNames.push(node.name);
        }
      }

      if (Array.isArray(node.body)) {
        for (const stmt of node.body) walk(stmt, currentClass);
      }
    }

    walk(ast);

    if (sourceChecks.classes) {
      for (const required of sourceChecks.classes) {
        if (!classNames.includes(required)) {
          return { valid: false, error: `Class "${required}" not found in your code.` };
        }
      }
    }

    if (sourceChecks.functions) {
      for (const required of sourceChecks.functions) {
        if (!functionNames.includes(required)) {
          return { valid: false, error: `Function "${required}" not found in your code.` };
        }
      }
    }

    if (sourceChecks.inheritance) {
      for (const [child, parent] of Object.entries(sourceChecks.inheritance)) {
        const bases = inheritance[child];
        if (!bases || !bases.includes(parent)) {
          return { valid: false, error: `Class "${child}" does not inherit from "${parent}".` };
        }
      }
    }

    if (sourceChecks.methods) {
      for (const [className, methods] of Object.entries(sourceChecks.methods)) {
        const existingMethods = classMethods[className] || [];
        for (const method of methods) {
          if (!existingMethods.includes(method)) {
            return { valid: false, error: `Method "${method}" not found in class "${className}".` };
          }
        }
      }
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, error: `Could not parse your code: ${e.message}` };
  }
}
