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
  private readonly apiKey: string | undefined;
  private readonly authKey: string | undefined;
  private readonly apiUrl: string | undefined;

  constructor(private config: ConfigService) {
    this.enabled = this.config.get<string>('WHATSAPP_ENABLED') === 'true';
    this.apiKey = this.config.get<string>('WHATSAPP_API_KEY');
    this.authKey = this.config.get<string>('WHATSAPP_AUTH_KEY');
    this.apiUrl = this.config.get<string>('WHATSAPP_API_URL');
    if (this.enabled && (!this.apiKey || !this.authKey)) {
      this.logger.warn(
        'WHATSAPP_ENABLED=true mais clés WhatsApp OTP absentes : WhatsApp désactivé',
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
      const response = await fetch(this.apiUrl!, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey!,
          'X-Auth-Key': this.authKey!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp OTP HTTP ${response.status}`);
      }

      this.logger.log(
        `OTP WhatsApp envoyé au ${phone}${text ? ` (motif : ${text})` : ''}`,
      );
      return { provider: 'whatsapp', sent: true, disabled: false };
    } catch (err) {
      this.logger.error('Échec de l\'envoi WhatsApp OTP', err);
      return { provider: 'whatsapp', sent: false, disabled: true };
    }
  }
}