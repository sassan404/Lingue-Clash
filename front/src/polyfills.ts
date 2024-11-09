// ...existing polyfills...
(window as any).process = {
  env: { DEBUG: undefined },
};
