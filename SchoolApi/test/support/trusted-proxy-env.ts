// Import FIRST in a spec (before test-app / AppModule): e2e-env sets huge
// limits, and ConfigModule reads process.env when AppModule is loaded.
Object.assign(process.env, {
  AUTH_THROTTLE_LIMIT: '3',
  // supertest connects from loopback = the trusted proxy (web BFF) here.
  TRUSTED_PROXIES: 'loopback',
});
