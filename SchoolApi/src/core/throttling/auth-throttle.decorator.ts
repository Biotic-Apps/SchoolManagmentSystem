import { SetMetadata } from '@nestjs/common';

export const AUTH_THROTTLE_KEY = 'authThrottle';

/** Applies the strict `auth` throttler (per IP) to a controller or route. */
export const AuthThrottle = () => SetMetadata(AUTH_THROTTLE_KEY, true);
