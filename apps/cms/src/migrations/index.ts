import * as migration_20260910_061542_password_reset_requests from './20260910_061542_password_reset_requests';

export const migrations = [
  {
    up: migration_20260910_061542_password_reset_requests.up,
    down: migration_20260910_061542_password_reset_requests.down,
    name: '20260910_061542_password_reset_requests'
  },
];
