/**
 * @file DocxDocumentGeneratorAdapter.ts
 * @description Compiles structured AssembledContractDTO into a professionally styled Word (.docx) document.
 */

import type {
  AssembledContractDTO,
  DocumentBuffer,
  DocumentGeneratorPort,
} from '@go-agree/application';
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

export class DocxDocumentGeneratorAdapter implements DocumentGeneratorPort {
  async generateDocx(contract: AssembledContractDTO): Promise<DocumentBuffer> {
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(
      new Paragraph({
        text: contract.title.toUpperCase(),
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 400 },
      })
    );

    // Parties
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ENTRE LOS SUSCRITOS A SABER:',
            bold: true,
          }),
        ],
        spacing: { before: 200, after: 200 },
      })
    );

    const clientDesc = `${contract.client.name}, identificado(a) como ${
      contract.client.entityType === 'legal_entity' ? 'persona jurídica' : 'persona natural'
    }${contract.client.idNumber ? ` con documento/NIT número ${contract.client.idNumber}` : ''}${
      contract.client.address ? `, con domicilio en ${contract.client.address}` : ''
    }, quien en adelante y para los efectos del presente contrato se denominará el CONTRATANTE; y por la otra parte, ${
      contract.provider.name
    }, identificado(a) como ${
      contract.provider.entityType === 'legal_entity' ? 'persona jurídica' : 'persona natural'
    }${contract.provider.idNumber ? ` con documento/NIT número ${contract.provider.idNumber}` : ''}${
      contract.provider.address ? `, con domicilio en ${contract.provider.address}` : ''
    }, quien en adelante se denominará el CONTRATISTA, acuerdan celebrar el presente contrato contenido en las siguientes cláusulas precedidas de sus antecedentes:`;

    children.push(
      new Paragraph({
        text: clientDesc,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 300 },
      })
    );

    // Declarations
    if (contract.declarations && contract.declarations.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'DECLARACIONES Y ANTECEDENTES:', bold: true })],
          spacing: { before: 200, after: 200 },
        })
      );

      for (const dec of contract.declarations) {
        children.push(
          new Paragraph({
            text: dec,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
          })
        );
      }
    }

    // Operative Clauses
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'CLÁUSULAS DEL CONTRATO:', bold: true })],
        spacing: { before: 200, after: 200 },
      })
    );

    for (const clause of contract.operativeClauses) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${clause.title.toUpperCase()}: `,
              bold: true,
            }),
            new TextRun({
              text: clause.text,
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 250 },
        })
      );
    }

    // Dynamic Clauses
    if (contract.dynamicClauses && contract.dynamicClauses.length > 0) {
      for (const clause of contract.dynamicClauses) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${clause.title.toUpperCase()}: `,
                bold: true,
              }),
              new TextRun({
                text: clause.text,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 250 },
          })
        );
      }
    }

    // Signatures Section
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'En señal de conformidad y aceptación de las estipulaciones pactadas, las partes suscriben el presente documento:',
            italics: true,
          }),
        ],
        spacing: { before: 400, after: 600 },
      })
    );

    const clientBlock = contract.signatureBlocks.find((b) => b.role === 'client');
    const providerBlock = contract.signatureBlocks.find((b) => b.role === 'provider');

    const signatureTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({ text: '____________________________________' }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: clientBlock?.partyName || contract.client.name,
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  text: clientBlock?.representativeName
                    ? `${clientBlock.representativeName}`
                    : 'EL CONTRATANTE',
                }),
                new Paragraph({
                  text: clientBlock?.idNumber || contract.client.idNumber || '',
                }),
              ],
            }),
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({ text: '____________________________________' }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: providerBlock?.partyName || contract.provider.name,
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  text: providerBlock?.representativeName
                    ? `${providerBlock.representativeName}`
                    : 'EL CONTRATISTA',
                }),
                new Paragraph({
                  text: providerBlock?.idNumber || contract.provider.idNumber || '',
                }),
              ],
            }),
          ],
        }),
      ],
    });

    children.push(signatureTable);

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                bottom: 1440,
                left: 1440,
                right: 1440,
              },
            },
          },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${contract.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.docx`;

    return {
      format: 'docx',
      content: buffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename,
    };
  }

  // Implementation of DocumentGeneratorPort interface
  async generatePdf(): Promise<DocumentBuffer> {
    throw new Error('Use PdfDocumentGeneratorAdapter for PDF generation');
  }
}
