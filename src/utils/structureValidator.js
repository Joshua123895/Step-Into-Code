import { ensurePyodide } from "./pyodide";

export async function validateStructure(code, sourceChecks) {
  if (!sourceChecks) return { valid: true };

  const pyodide = await ensurePyodide();

  try {
    pyodide.globals.set("__check_code__", code);
    const raw = pyodide.runPython(`
import ast, json

tree = ast.parse(__check_code__)

classes = []
functions = []
class_methods = {}
inheritance = {}

for node in ast.walk(tree):
    if isinstance(node, ast.ClassDef):
        classes.append(node.name)
        bases = []
        for base in node.bases:
            if isinstance(base, ast.Name):
                bases.append(base.id)
            elif isinstance(base, ast.Attribute):
                bases.append(base.attr)
        if bases:
            inheritance[node.name] = bases
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                if node.name not in class_methods:
                    class_methods[node.name] = []
                class_methods[node.name].append(item.name)

for node in tree.body:
    if isinstance(node, ast.FunctionDef):
        functions.append(node.name)

json.dumps({
    "classes": classes,
    "functions": functions,
    "classMethods": class_methods,
    "inheritance": inheritance
})
`);

    const result = JSON.parse(raw);

    if (sourceChecks.classes) {
      for (const required of sourceChecks.classes) {
        if (!result.classes.includes(required)) {
          return { valid: false, error: `Class "${required}" not found in your code.` };
        }
      }
    }

    if (sourceChecks.functions) {
      for (const required of sourceChecks.functions) {
        if (!result.functions.includes(required)) {
          return { valid: false, error: `Function "${required}" not found in your code.` };
        }
      }
    }

    if (sourceChecks.inheritance) {
      for (const [child, parent] of Object.entries(sourceChecks.inheritance)) {
        const bases = result.inheritance[child];
        if (!bases || !bases.includes(parent)) {
          return { valid: false, error: `Class "${child}" does not inherit from "${parent}".` };
        }
      }
    }

    if (sourceChecks.methods) {
      for (const [className, methods] of Object.entries(sourceChecks.methods)) {
        const existingMethods = result.classMethods[className] || [];
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
