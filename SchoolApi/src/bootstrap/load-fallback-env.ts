import { config as loadEnv } from 'dotenv';

// Lets offline tooling (OpenAPI export) run without a local .env.
loadEnv({ quiet: true });
loadEnv({ path: '.env.example', quiet: true });
