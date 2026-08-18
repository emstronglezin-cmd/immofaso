import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ReceiptService } from './receipt.service';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, ReceiptService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
