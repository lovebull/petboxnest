import * as migration_20260910_061542_password_reset_requests from './20260910_061542_password_reset_requests';
import * as migration_20260926_000001_product_enhancement_external_image_blocks from './20260926_000001_product_enhancement_external_image_blocks';

export const migrations = [
  {
    up: migration_20260910_061542_password_reset_requests.up,
    down: migration_20260910_061542_password_reset_requests.down,
    name: '20260910_061542_password_reset_requests'
  },
  {
    up: migration_20260926_000001_product_enhancement_external_image_blocks.up,
    down: migration_20260926_000001_product_enhancement_external_image_blocks.down,
    name: '20260926_000001_product_enhancement_external_image_blocks'
  },
];
