import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WhatsAppResult {
  provider: 'whatsapp';
  sent: boolean;
  disabled: boolean;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly enabled: boolean;
  private readonly token: string | undefined;
  private readonly apiUrl: string | undefined;
  private readonly phoneId: string | undefined;

  constructor(private config: ConfigService) {
    this.enabled = this.config.get<string>('WHATSAPP_ENABLED') === 'true';
    this.token = this.config.get<string>('WHATSAPP_API_TOKEN');
    this.apiUrl = this.config.get<string>('WHATSAPP_API_URL');
    this.phoneId = this.config.get<string>('WHATSAPP_PHONE_ID');
    if (this.enabled && !this.token) {
      this.logger.warn(
        'WHATSAPP_ENABLED=true mais WHATSAPP_API_TOKEN absent : WhatsApp désactivé',
      );
      this.enabled = false;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async sendMessage(phone: string, text: string): Promise<WhatsAppResult> {
    if (!this.enabled) {
      return { provider: 'whatsapp', sent: false, disabled: true };
    }

    try {
      const url = `${this.apiUrl}/${this.phoneId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: text },
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp HTTP ${response.status}`);
      }

      return { provider: 'whatsapp', sent: true, disabled: false };
    } catch (err) {
      this.logger.error('Échec de l\'envoi WhatsApp', err);
      return { provider: 'whatsapp', sent: false, disabled: true };
    }
  }
}