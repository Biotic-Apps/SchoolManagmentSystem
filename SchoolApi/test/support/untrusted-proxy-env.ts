// Import FIRST in a spec: only 10.9.9.9 is a trusted proxy, so requests from
// loopback (supertest) are direct clients and X-Forwarded-For is ignored.
Object.assign(process.env, {
  AUTH_THROTTLE_LIMIT: '3',
  TRUSTED_PROXIES: '10.9.9.9',
});
