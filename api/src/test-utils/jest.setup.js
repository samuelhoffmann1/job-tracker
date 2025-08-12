global.console = {
  ...console,
  log: jest.fn(),
  debug: console.debug,
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error,
};