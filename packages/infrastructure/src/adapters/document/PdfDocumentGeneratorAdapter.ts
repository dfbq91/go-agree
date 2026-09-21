/**
 * @file PdfDocumentGeneratorAdapter.ts
 * @description Compiles structured AssembledContractDTO into a high-quality PDF document using pdfkit.
 */

import type {
  AssembledContractDTO,
  DocumentBuffer,
  DocumentGeneratorPort,
} from '@go-agree/application';
import PDFDocument from 'pdfkit';

export class PdfDocumentGeneratorAdapter implements DocumentGeneratorPort {
  async generateDocx(): Promise<DocumentBuffer> {
    throw new Error('Use DocxDocumentGeneratorAdapter for Word document compilation');
  }

  async generatePdf(contract: AssembledContractDTO): Promise<DocumentBuffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 54, bottom: 54, left: 54, right: 54 }, // 0.75 in margins
          info: {
            Title: contract.title,
            Author: 'go-agree',
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const filename = `${contract.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`;
          resolve({
            format: 'pdf',
            content: buffer,
            mimeType: 'application/pdf',
            filename,
          });
        });
        doc.on('error', (err: Error) => reject(err));

        // 1. Formal Title
        doc
          .font('Helvetica-Bold')
          .fontSize(14)
          .text(contract.title.toUpperCase(), { align: 'center' });
        doc.moveDown(1.5);

        // 2. Contracting Parties Identification
        doc.font('Helvetica-Bold').fontSize(10).text('ENTRE LOS SUSCRITOS A SABER:');
        doc.moveDown(0.5);

        const clientDesc = `${contract.client.name}, identificado(a) como ${
          contract.client.entityType === 'legal_entity' ? 'persona jurídica' : 'persona natural'
        }${contract.client.idNumber ? ` con documento/NIT número ${contract.client.idNumber}` : ''}${
          contract.client.address ? `, con domicilio en ${contract.client.address}` : ''
        }, quien en adelante se denominará el CONTRATANTE; y por la otra parte, ${
          contract.provider.name
        }, identificado(a) como ${
          contract.provider.entityType === 'legal_entity' ? 'persona jurídica' : 'persona natural'
        }${contract.provider.idNumber ? ` con documento/NIT número ${contract.provider.idNumber}` : ''}${
          contract.provider.address ? `, con domicilio en ${contract.provider.address}` : ''
        }, quien en adelante se denominará el CONTRATISTA, han acordado celebrar el presente contrato regido por las siguientes cláusulas y declaraciones:`;

        doc.font('Helvetica').fontSize(10).text(clientDesc, {
          align: 'justify',
          lineGap: 2,
        });
        doc.moveDown(1);

        // 3. Declarations and Recitals
        if (contract.declarations && contract.declarations.length > 0) {
          doc.font('Helvetica-Bold').fontSize(10).text('DECLARACIONES Y ANTECEDENTES:');
          doc.moveDown(0.5);

          for (const dec of contract.declarations) {
            doc.font('Helvetica').fontSize(10).text(dec, {
              align: 'justify',
              lineGap: 2,
            });
            doc.moveDown(0.5);
          }
          doc.moveDown(0.5);
        }

        // 4. Operative Clauses
        doc.font('Helvetica-Bold').fontSize(10).text('CLÁUSULAS DEL CONTRATO:');
        doc.moveDown(0.5);

        for (const clause of contract.operativeClauses) {
          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .text(`${clause.title.toUpperCase()}: `, { continued: true });
          doc.font('Helvetica').fontSize(10).text(clause.text, { align: 'justify', lineGap: 2 });
          doc.moveDown(0.8);
        }

        // 5. Dynamic Clauses
        if (contract.dynamicClauses && contract.dynamicClauses.length > 0) {
          for (const clause of contract.dynamicClauses) {
            doc
              .font('Helvetica-Bold')
              .fontSize(10)
              .text(`${clause.title.toUpperCase()}: `, { continued: true });
            doc.font('Helvetica').fontSize(10).text(clause.text, { align: 'justify', lineGap: 2 });
            doc.moveDown(0.8);
          }
        }

        // 6. Signatures
        doc.moveDown(1.5);
        doc
          .font('Helvetica-Oblique')
          .fontSize(9)
          .text(
            'En señal de conformidad y aceptación plena de las estipulaciones contenidas en el presente instrumento, las partes suscriben:',
            { align: 'justify' }
          );
        doc.moveDown(2);

        const clientBlock = contract.signatureBlocks.find((b) => b.role === 'client');
        const providerBlock = contract.signatureBlocks.find((b) => b.role === 'provider');

        const startY = doc.y;
        const leftX = 54;
        const rightX = 330;

        // Left signature (Client)
        doc
          .font('Helvetica')
          .fontSize(10)
          .text('____________________________________', leftX, startY);
        doc
          .font('Helvetica-Bold')
          .text(clientBlock?.partyName || contract.client.name, leftX, startY + 15);
        doc
          .font('Helvetica')
          .text(clientBlock?.representativeName || 'EL CONTRATANTE', leftX, startY + 30);
        if (clientBlock?.idNumber || contract.client.idNumber) {
          doc.text(clientBlock?.idNumber || contract.client.idNumber || '', leftX, startY + 45);
        }

        // Right signature (Provider)
        doc
          .font('Helvetica')
          .fontSize(10)
          .text('____________________________________', rightX, startY);
        doc
          .font('Helvetica-Bold')
          .text(providerBlock?.partyName || contract.provider.name, rightX, startY + 15);
        doc
          .font('Helvetica')
          .text(providerBlock?.representativeName || 'EL CONTRATISTA', rightX, startY + 30);
        if (providerBlock?.idNumber || contract.provider.idNumber) {
          doc.text(
            providerBlock?.idNumber || contract.provider.idNumber || '',
            rightX,
            startY + 45
          );
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
