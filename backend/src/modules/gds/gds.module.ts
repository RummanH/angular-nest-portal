import { Global, Module } from '@nestjs/common';
import { GdsClientService } from './gds-client.service';

@Global()
@Module({
  providers: [GdsClientService],
  exports: [GdsClientService],
})
export class GdsModule {}
