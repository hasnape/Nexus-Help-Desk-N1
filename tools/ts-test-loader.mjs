import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import ts from "typescript";

const extensions = new Set([".ts", ".tsx"]);

export async function load(url, context, defaultLoad) {
  if (url.startsWith("data:")) {
    return defaultLoad(url, context, defaultLoad);
  }

  const filePath = url.startsWith("file://") ? fileURLToPath(url) : url;
  const ext = path.extname(filePath);

  if (!extensions.has(ext)) {
    return defaultLoad(url, context, defaultLoad);
  }

  const source = await readFile(filePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      esModuleInterop: true,
      importHelpers: false,
    },
    fileName: filePath,
  });

  return {
    format: "module",
    source: outputText,
    shortCircuit: true,
  };
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith("data:")) {
    return defaultResolve(specifier, context, defaultResolve);
  }

  const resolved = await defaultResolve(specifier, context, defaultResolve).catch(async (error) => {
    if (error?.code === "ERR_MODULE_NOT_FOUND") {
      for (const extension of extensions) {
        try {
          return await defaultResolve(`${specifier}${extension}`, context, defaultResolve);
        } catch (innerError) {
          if (innerError?.code !== "ERR_MODULE_NOT_FOUND") {
            throw innerError;
          }
        }
      }
    }
    throw error;
  });

  return resolved;
}
