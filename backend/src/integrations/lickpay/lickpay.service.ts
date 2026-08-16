import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LickPayResult {
  provider: 'lickpay';
  providerRef: string;
  paymentUrl?: string;
  disabled: boolean;
}

@Injectable()
export class LickPayService {
  private readonly logger = new Logger(LickPayService.name);
  private readonly enabled: boolean;
  private readonly apiKey: string | undefined;
  private readonly apiUrl: string | undefined;

  constructor(private config: ConfigService) {
    this.enabled = this.config.get<string>('LICKPAY_ENABLED') === 'true';
    this.apiKey = this.config.get<string>('LICKPAY_API_KEY');
    this.apiUrl = this.config.get<string>('LICKPAY_API_URL');
    if (this.enabled && !this.apiKey) {
      this.logger.warn(
        'LICKPAY_ENABLED=true mais LICKPAY_API_KEY absent : LickPay désactivé',
      );
      this.enabled = false;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async createPayment(
    amount: number,
    reference: string,
    customer: { email?: string; phone?: string },
  ): Promise<LickPayResult> {
    if (!this.enabled) {
      return {
        provider: 'lickpay',
        providerRef: '',
        disabled: true,
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount,
          reference,
          customer,
          currency: 'XOF',
        }),
      });

      if (!response.ok) {
        throw new Error(`LickPay HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        id?: string;
        payment_url?: string;
      };
      return {
        provider: 'lickpay',
        providerRef: data.id || reference,
        paymentUrl: data.payment_url,
        disabled: false,
      };
    } catch (err) {
      this.logger.error('Échec de la création du paiement LickPay', err);
      return {
        provider: 'lickpay',
        providerRef: '',
        disabled: true,
      };
    }
  }
}