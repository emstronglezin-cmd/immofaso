import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LeekPayResult {
  provider: 'leekpay';
  providerRef: string;
  paymentUrl?: string;
  disabled: boolean;
}

@Injectable()
export class LeekPayService {
  private readonly logger = new Logger(LeekPayService.name);
  private readonly enabled: boolean;
  private readonly publicKey: string | undefined;
  private readonly secretKey: string | undefined;
  private readonly apiUrl: string | undefined;

  constructor(private config: ConfigService) {
    this.enabled = this.config.get<string>('LEEKPAY_ENABLED') === 'true';
    this.publicKey = this.config.get<string>('LEEKPAY_PUBLIC_KEY');
    this.secretKey = this.config.get<string>('LEEKPAY_SECRET_KEY');
    this.apiUrl = this.config.get<string>('LEEKPAY_API_URL');
    if (this.enabled && (!this.publicKey || !this.secretKey)) {
      this.logger.warn(
        'LEEKPAY_ENABLED=true mais clés LeekPay absentes : LeekPay désactivé',
      );
      this.enabled = false;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getPublicKey(): string | undefined {
    return this.publicKey;
  }

  async createPayment(
    amount: number,
    reference: string,
    customer: { email?: string; phone?: string },
  ): Promise<LeekPayResult> {
    if (!this.enabled) {
      return {
        provider: 'leekpay',
        providerRef: '',
        disabled: true,
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify({
          amount,
          currency: 'XOF',
          description: reference,
          customer_email: customer.email || undefined,
          customer_phone: customer.phone || undefined,
          metadata: { reference },
        }),
      });

      if (!response.ok) {
        throw new Error(`LeekPay HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        id?: string;
        payment_url?: string;
      };
      return {
        provider: 'leekpay',
        providerRef: data.id || reference,
        paymentUrl: data.payment_url,
        disabled: false,
      };
    } catch (err) {
      this.logger.error('Échec de la création du paiement LeekPay', err);
      return {
        provider: 'leekpay',
        providerRef: '',
        disabled: true,
      };
    }
  }
}