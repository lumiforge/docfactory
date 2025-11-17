 
// @ts-nocheck
// This file is used to mock API calls during development and testing
async function enableMSW() {
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'test') {
    // Server-side (during SSR or testing)
    const { server } = await import('../mocks/server');
    server.listen();
    return;
  }

  // Client-side (browser)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const { worker } = await import('../mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
}

export { enableMSW };