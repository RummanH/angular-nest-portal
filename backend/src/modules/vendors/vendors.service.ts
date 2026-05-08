import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TravelVendorProvider, VendorName } from './vendors.types';
import { GdsVendorProvider } from './providers/gds-vendor.provider';
import { SabreVendorProvider } from './providers/sabre-vendor.provider';

@Injectable()
export class VendorsService {
  private readonly vendors: Map<VendorName, TravelVendorProvider>;
  private readonly activeVendorNames: VendorName[];

  constructor(
    gdsVendorProvider: GdsVendorProvider,
    sabreVendorProvider: SabreVendorProvider,
    configService: ConfigService,
  ) {
    this.vendors = new Map<VendorName, TravelVendorProvider>([
      [gdsVendorProvider.name, gdsVendorProvider],
      [sabreVendorProvider.name, sabreVendorProvider],
    ]);

    const configuredVendorsValue = configService.get<string | string[]>(
      'vendors.active',
      {
        infer: true,
      },
    );
    const configuredVendors = Array.isArray(configuredVendorsValue)
      ? configuredVendorsValue
      : [configuredVendorsValue ?? 'gds'];

    const activeVendorNames = configuredVendors.filter((vendorName) =>
      this.vendors.has(vendorName as VendorName),
    ) as VendorName[];

    console.log(activeVendorNames);

    this.activeVendorNames = activeVendorNames.length
      ? activeVendorNames
      : ['gds'];
  }

  resolve(vendor?: string): TravelVendorProvider {
    const fallbackVendor = this.activeVendorNames[0] ?? 'gds';
    const name = (vendor?.toLowerCase() || fallbackVendor) as VendorName;
    const provider = this.vendors.get(name);

    if (!provider) {
      throw new NotFoundException(`Vendor '${vendor}' is not configured`);
    }

    return provider;
  }

  getActiveProviders(): TravelVendorProvider[] {
    return this.activeVendorNames.map((vendorName) => this.resolve(vendorName));
  }
}
