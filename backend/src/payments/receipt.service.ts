import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

interface ReceiptData {
  reference: string;
  createdAt: Date;
  amount: number;
  method: string;
  tenantName?: string;
  tenantPhone?: string;
  propertyName?: string;
  propertyAddress?: string;
  period?: string;
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Espèces',
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Virement bancaire',
  LEEKPAY: 'LeekPay',
  OTHER: 'Autre',
};

function formatAmount(n: number): string {
  return `${n.toLocaleString('fr-FR').replace(/\u202f/g, ' ')} FCFA`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

@Injectable()
export class ReceiptService {
  generate(data: ReceiptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A5',
        margin: 36,
        info: { Title: `Reçu ${data.reference}` },
      });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const primary = '#0f766e';
      const dark = '#1e293b';
      const muted = '#64748b';

      doc.rect(0, 0, doc.page.width, 6).fill(primary);

      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .fillColor(primary)
        .text('IMMOFASO', { align: 'center' })
        .fontSize(10)
        .fillColor(muted)
        .text('Gestion immobilière — Burkina Faso', { align: 'center' });

      doc.moveDown(0.8);
      doc
        .fontSize(14)
        .fillColor(dark)
        .text('REÇU DE PAIEMENT', { align: 'center' });

      doc.moveDown(0.6);
      doc
        .fontSize(9)
        .fillColor(muted)
        .text(`Référence : ${data.reference}`, { align: 'center' })
        .text(`Date : ${formatDate(data.createdAt)}`, { align: 'center' });

      doc.moveDown(1);

      doc.roundedRect(36, doc.y, doc.page.width - 72, 90, 8).strokeColor('#e2e8f0').lineWidth(1).stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(dark)
        .text('Montant payé', 56, doc.y + 12);
      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .fillColor(primary)
        .text(formatAmount(data.amount), 56, doc.y + 6);

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(dark)
        .text(`Mode : ${METHOD_LABELS[data.method] || data.method}`, 56, doc.y + 22)
        .fontSize(9)
        .fillColor(muted)
        .text(
          data.period ? `Période : ${data.period}` : '',
          56,
          doc.y + 4,
        );

      doc.moveDown(1.5);

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(dark)
        .text('Locataire')
        .font('Helvetica')
        .fontSize(10)
        .fillColor(muted)
        .text(data.tenantName || '—')
        .text(data.tenantPhone || '');

      doc.moveDown(0.6);

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(dark)
        .text('Bien')
        .font('Helvetica')
        .fontSize(10)
        .fillColor(muted)
        .text(data.propertyName || '—')
        .text(data.propertyAddress || '');

      doc.moveDown(1);

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(muted)
        .text('Merci pour votre paiement. Ce reçu fait foi de transaction.', {
          align: 'center',
        });

      doc.end();
    });
  }
}
