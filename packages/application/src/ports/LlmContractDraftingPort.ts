/**
 * @file LlmContractDraftingPort.ts
 * @description Port definition for synthesizing contract questionnaire responses into
 * traditional Spanish legal contract anatomy via LLM.
 */

export interface ContractPartyDTO {
  name: string;
  entityType: 'individual' | 'legal_entity';
  idNumber?: string;
  address?: string;
  details?: string;
}

export interface ContractClauseDTO {
  number: number;
  title: string;
  text: string;
}

export interface SignatureBlockDTO {
  role: 'client' | 'provider';
  partyName: string;
  idNumber?: string;
  representativeName?: string;
}

export interface AssembledContractDTO {
  contractId: string;
  title: string;
  client: ContractPartyDTO;
  provider: ContractPartyDTO;
  declarations: string[];
  operativeClauses: ContractClauseDTO[];
  dynamicClauses: ContractClauseDTO[];
  signatureBlocks: SignatureBlockDTO[];
}

export interface DraftContractInput {
  contractId: string;
  title: string;
  transcript: string;
  answers: Record<string, unknown>;
}

export interface LlmContractDraftingPort {
  draftContract(input: DraftContractInput): Promise<AssembledContractDTO>;
}
