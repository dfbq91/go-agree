import { describe, expect, it } from 'vitest';
import { es } from '../../src/locales/es';

describe('Landing Page Copy Truthfulness & Compliance Audit', () => {
  const landingCopy = es.landing;

  // Flatten all landing strings excluding legal disclaimer
  function extractPromotionalStrings(obj: Record<string, unknown>): string[] {
    const results: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'legalDisclaimer') continue; // disclaimer disclaims lawyer services
      if (typeof value === 'string') {
        results.push(value.toLowerCase());
      } else if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string') {
            results.push(item.toLowerCase());
          } else if (typeof item === 'object' && item !== null) {
            results.push(...extractPromotionalStrings(item as Record<string, unknown>));
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        results.push(...extractPromotionalStrings(value as Record<string, unknown>));
      }
    }
    return results;
  }

  const promoTexts = extractPromotionalStrings(landingCopy as unknown as Record<string, unknown>);
  const consolidatedPromo = promoTexts.join(' ');

  it('contains zero false claims about electronic signatures', () => {
    const forbiddenSignatureTerms = [
      'firma electrónica',
      'firmas electrónicas',
      'firma digital',
      'firmas digitales',
      'firmar en línea',
      'firmar digitalmente',
      'e-firma',
      'validez de firma',
    ];

    for (const term of forbiddenSignatureTerms) {
      expect(
        consolidatedPromo.includes(term),
        `Found unauthorized signature claim "${term}" in promotional copy`
      ).toBe(false);
    }
  });

  it('contains zero false claims of lawyer reviews or legal advice', () => {
    const forbiddenLawyerTerms = [
      'revisado por abogados',
      'revisión por abogados',
      'abogados expertos',
      'equipo de abogados',
      'asesoría legal incluida',
      'asesoría jurídica garantizada',
      'abogado personalizado',
    ];

    for (const term of forbiddenLawyerTerms) {
      expect(
        consolidatedPromo.includes(term),
        `Found unauthorized lawyer service claim "${term}" in promotional copy`
      ).toBe(false);
    }
  });

  it('contains zero false claims of unbuilt third-party integrations', () => {
    const forbiddenIntegrationTerms = [
      'google drive',
      'dropbox',
      'onedrive',
      'zapier',
      'slack',
      'salesforce',
      'hubspot',
    ];

    for (const term of forbiddenIntegrationTerms) {
      expect(
        consolidatedPromo.includes(term),
        `Found unauthorized integration claim "${term}" in promotional copy`
      ).toBe(false);
    }
  });

  it('promotes only actual supported formats: Word (.docx) and PDF', () => {
    expect(consolidatedPromo).toContain('word');
    expect(consolidatedPromo).toContain('pdf');
  });

  it('promotes the actual free tier: 3 free contracts without credit card', () => {
    expect(consolidatedPromo).toContain('3 contratos gratis');
    expect(consolidatedPromo).toContain('sin tarjeta de crédito');
  });

  it('preserves the mandatory statutory disclaimer disclaiming legal advice and lawyer representation', () => {
    const disclaimer = landingCopy.footer.legalDisclaimer.toLowerCase();
    expect(disclaimer).toContain('aviso legal');
    expect(disclaimer).toContain('no constituye una firma de abogados');
    expect(disclaimer).toContain('no presta asesoría jurídica personalizada');
    expect(disclaimer).toContain('ni sustituye la consulta con un profesional del derecho');
  });
});
