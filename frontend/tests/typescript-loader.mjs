import { readFile, access } from 'node:fs/promises';
import ts from 'typescript';

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && context.parentURL) {
    for (const extension of ['', '.ts', '.tsx']) {
      const url = new URL(specifier + extension, context.parentURL);
      try {
        await access(url);
        if (/\.tsx?$/.test(url.pathname)) return { url: url.href, shortCircuit: true };
      } catch { /* Thử phần mở rộng tiếp theo. */ }
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (/\.tsx?$/.test(new URL(url).pathname)) {
    const source = await readFile(new URL(url), 'utf8');
    return { format: 'module', shortCircuit: true, source: ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText };
  }
  return nextLoad(url, context);
}
