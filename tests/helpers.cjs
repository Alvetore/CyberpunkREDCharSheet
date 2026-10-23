// Regression harness for actual application modules and component handlers.
// React hooks/JSX and audio are isolated; tests use in-memory storage.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
let current;
const react = {
  useState(initial) {
    const state = current, i = state.cursor++;
    if (!(i in state.values)) state.values[i] = typeof initial === 'function' ? initial() : initial;
    return [state.values[i], value => { state.values[i] = typeof value === 'function' ? value(state.values[i]) : value; }];
  },
  useEffect() {},
  useMemo(fn) { return fn(); },
  useRef(value) { return { current: value }; },
  useCallback(fn) { return fn; },
};
react.default = react;
const jsx = (type, props) => ({ type, props: props || {} });
const icons = new Proxy({}, { get: (_, key) => key === '__esModule' ? true : `icon:${String(key)}` });
const noop = () => {};
function load(relative) {
  let file = path.resolve(root, relative);
  if (!path.extname(file)) file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx';
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const source = fs.readFileSync(file, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  }, fileName: file }).outputText;
  const localRequire = name => {
    if (name === 'react') return react;
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
    if (name === 'lucide-react') return icons;
    if (name === 'canvas-confetti') return noop;
    if (name.includes('utils/audio') || name === './audio') return { sfx: new Proxy({}, { get: () => noop }) };
    if (name.startsWith('@tiptap') || name === 'tiptap-markdown') return {};
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
    return require(name);
  };
  new Function('require', 'module', 'exports', output)(localRequire, module, module.exports);
  return module.exports;
}
function mount(Component, props) {
  const state = { values: [], cursor: 0 };
  return {
    props, state,
    render() { current = state; state.cursor = 0; return Component(this.props); },
  };
}
function nodes(tree, predicate) {
  const result = [];
  function walk(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) return value.forEach(walk);
    if (predicate(value)) result.push(value);
    walk(value.props?.children);
  }
  walk(tree);
  return result;
}
function label(tree) {
  if (tree == null || tree === false) return '';
  if (Array.isArray(tree)) return tree.map(label).join(' ');
  return typeof tree === 'object' ? label(tree.props?.children) : String(tree);
}
function button(tree, text) {
  const found = nodes(tree, n => n.type === 'button' && label(n).includes(text));
  assert.ok(found.length, `Button not found: ${text}`);
  return found[0];
}
function randomSequence(values, fn) {
  const previous = Math.random;
  let i = 0;
  Math.random = () => values[Math.min(i++, values.length - 1)];
  try { return fn(); } finally { Math.random = previous; }
}

module.exports = { load, mount, nodes, label, button, randomSequence };
