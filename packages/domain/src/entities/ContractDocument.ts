/**
 * @file ContractDocument.ts
 * @description Domain entity representing a compiled contract document artifact (.docx or .pdf).
 */

export type DocumentFormat = 'pdf' | 'docx';

export interface ContractDocumentProps {
  id: string;
  contractId: string;
  userId: string;
  fileFormat: DocumentFormat;
  storagePath: string;
  createdAt: Date;
}

export class ContractDocument {
  readonly id: string;
  readonly contractId: string;
  readonly userId: string;
  readonly fileFormat: DocumentFormat;
  readonly storagePath: string;
  readonly createdAt: Date;

  constructor(props: ContractDocumentProps) {
    if (!props.id) {
      throw new Error('ContractDocument ID cannot be empty');
    }
    if (!props.contractId) {
      throw new Error('ContractDocument contractId cannot be empty');
    }
    if (!props.userId) {
      throw new Error('ContractDocument userId cannot be empty');
    }
    if (props.fileFormat !== 'pdf' && props.fileFormat !== 'docx') {
      throw new Error(`Unsupported document file format: ${props.fileFormat}`);
    }
    if (!props.storagePath) {
      throw new Error('ContractDocument storagePath cannot be empty');
    }

    this.id = props.id;
    this.contractId = props.contractId;
    this.userId = props.userId;
    this.fileFormat = props.fileFormat;
    this.storagePath = props.storagePath;
    this.createdAt = props.createdAt;
  }

  static create(params: {
    id: string;
    contractId: string;
    userId: string;
    fileFormat: DocumentFormat;
    storagePath: string;
    createdAt?: Date;
  }): ContractDocument {
    return new ContractDocument({
      id: params.id,
      contractId: params.contractId,
      userId: params.userId,
      fileFormat: params.fileFormat,
      storagePath: params.storagePath,
      createdAt: params.createdAt || new Date(),
    });
  }
}
