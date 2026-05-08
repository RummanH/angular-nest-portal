import { Global, Module } from '@nestjs/common';
import { GdsModule } from '../gds/gds.module';
import { SabreModule } from '../sabre/sabre.module';
import { GdsVendorProvider } from './providers/gds-vendor.provider';
import { VendorsService } from './vendors.service';
import { SabreVendorProvider } from './providers/sabre-vendor.provider';

@Global()
@Module({
  imports: [GdsModule, SabreModule],
  providers: [GdsVendorProvider, VendorsService, SabreVendorProvider],
  exports: [VendorsService],
})
export class VendorsModule {}
