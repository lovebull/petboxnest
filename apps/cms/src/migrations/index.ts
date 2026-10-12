import * as migration_20260910_061542_password_reset_requests from './20260910_061542_password_reset_requests';
import * as migration_20260926_000001_product_enhancement_external_image_blocks from './20260926_000001_product_enhancement_external_image_blocks';
import * as migration_20261011_174307_payload_3_90_2_security_upgrade from './20261011_174307_payload_3_90_2_security_upgrade';

export const migrations = [
  {
    up: migration_20260910_061542_password_reset_requests.up,
    down: migration_20260910_061542_password_reset_requests.down,
    name: '20260910_061542_password_reset_requests',
  },
  {
    up: migration_20260926_000001_product_enhancement_external_image_blocks.up,
    down: migration_20260926_000001_product_enhancement_external_image_blocks.down,
    name: '20260926_000001_product_enhancement_external_image_blocks',
  },
  {
    up: migration_20261011_174307_payload_3_90_2_security_upgrade.up,
    down: migration_20261011_174307_payload_3_90_2_security_upgrade.down,
    name: '20261011_174307_payload_3_90_2_security_upgrade'
  },
];
