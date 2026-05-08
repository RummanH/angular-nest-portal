import { registerAs } from '@nestjs/config';

const DEFAULT_ACTIVE_VENDORS = ['gds', 'sabre'];

export default registerAs('vendors', () => ({
  active:
    process.env.ACTIVE_VENDORS?.split(',')
      .map((vendor) => vendor.trim().toLowerCase())
      .filter(Boolean) ?? DEFAULT_ACTIVE_VENDORS,
}));
