import { Global, Module } from '@nestjs/common';
import { LeekPayService } from './leekpay/leekpay.service';
import { WhatsAppService } from './whatsapp/whatsapp.service';

@Global()
@Module({
  providers: [LeekPayService, WhatsAppService],
  exports: [LeekPayService, WhatsAppService],
})
export class IntegrationsModule {}