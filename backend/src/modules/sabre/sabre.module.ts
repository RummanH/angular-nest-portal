import { Global, Module } from '@nestjs/common';
import { SabreClientService } from './sabre-client.service';

@Global()
@Module({
  providers: [SabreClientService],
  exports: [SabreClientService],
})
export class SabreModule {}
