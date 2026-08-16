import { Global, Module } from '@nestjs/common';
import { LickPayService } from './lickpay/lickpay.service';
import { WhatsAppService } from './whatsapp/whatsapp.service';

@Global()
@Module({
  providers: [LickPayService, WhatsAppService],
  exports: [LickPayService, WhatsAppService],
})
export class IntegrationsModule {}