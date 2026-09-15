import type {
  CompleteQuestionnaireInput,
  ContractGenerationDTO,
  ContractGenerationSummaryDTO,
  ContractProgressPort,
  ContractRepositoryPort,
  UpdateProgressInput,
  UpdateTitleInput,
} from '@go-agree/application';
import {
  ContractNotFoundError,
  EmptyTitleError,
  TYPE_ID_PREFIXES,
  ensureTypeId,
  isUuid,
  stripTypeIdPrefix,
} from '@go-agree/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

const formatContractId = (id: string): string => {
  return isUuid(stripTypeIdPrefix(id)) ? ensureTypeId(TYPE_ID_PREFIXES.CONTRACT, id) : id;
};

const formatUserId = (userId: string): string => {
  return isUuid(stripTypeIdPrefix(userId)) ? ensureTypeId(TYPE_ID_PREFIXES.USER, userId) : userId;
};

export class SupabaseContractRepository implements ContractRepositoryPort, ContractProgressPort {
  constructor(private readonly supabase: SupabaseClient) {}

  async listByUserId(userId: string): Promise<ContractGenerationSummaryDTO[]> {
    const rawUserId = stripTypeIdPrefix(userId);
    const { data, error } = await this.supabase
      .from('contract_generations')
      .select('id, user_id, title, status, current_question_index, updated_at')
      .eq('user_id', rawUserId)
      .order('updated_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      id: formatContractId(row.id),
      userId: formatUserId(row.user_id),
      title: row.title,
      status: row.status,
      currentQuestionIndex: row.current_question_index,
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getByIdAndUserId(id: string, userId: string): Promise<ContractGenerationDTO | null> {
    const rawId = stripTypeIdPrefix(id);
    const rawUserId = stripTypeIdPrefix(userId);
    const query = this.supabase
      .from('contract_generations')
      .select('*')
      .eq('id', rawId)
      .eq('user_id', rawUserId);

    const { data, error } =
      typeof (query as any).maybeSingle === 'function'
        ? await (query as any).maybeSingle()
        : await query.single();

    if (error || !data) {
      return null;
    }

    if (data.user_id !== rawUserId && data.user_id !== userId) {
      return null;
    }

    return {
      id: formatContractId(data.id),
      userId: formatUserId(data.user_id),
      title: data.title,
      status: data.status,
      currentQuestionIndex: data.current_question_index,
      answers: data.answers || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async getContractById(contractId: string, userId: string): Promise<ContractGenerationDTO | null> {
    return this.getByIdAndUserId(contractId, userId);
  }

  async save(contract: ContractGenerationDTO): Promise<void> {
    const rawId = stripTypeIdPrefix(contract.id);
    const rawUserId = stripTypeIdPrefix(contract.userId);
    const { error } = await this.supabase
      .from('contract_generations')
      .update({
        title: contract.title,
        status: contract.status,
        current_question_index: contract.currentQuestionIndex,
        answers: contract.answers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rawId)
      .eq('user_id', rawUserId);

    if (error) {
      throw new Error(`Failed to save contract: ${error.message}`);
    }
  }

  async create(
    contract: Omit<ContractGenerationDTO, 'createdAt' | 'updatedAt'>
  ): Promise<ContractGenerationDTO> {
    const rawId = stripTypeIdPrefix(contract.id);
    const rawUserId = stripTypeIdPrefix(contract.userId);
    const now = new Date().toISOString();
    const query = this.supabase
      .from('contract_generations')
      .insert({
        id: rawId,
        user_id: rawUserId,
        title: contract.title,
        status: contract.status,
        current_question_index: contract.currentQuestionIndex,
        answers: contract.answers,
        created_at: now,
        updated_at: now,
      })
      .select('*');

    const { data, error } =
      typeof (query as any).maybeSingle === 'function'
        ? await (query as any).maybeSingle()
        : await query.single();

    if (error || !data) {
      throw new Error(`Failed to create contract: ${error?.message || 'Unknown error'}`);
    }

    return {
      id: formatContractId(data.id),
      userId: formatUserId(data.user_id),
      title: data.title,
      status: data.status,
      currentQuestionIndex: data.current_question_index,
      answers: data.answers || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async updateProgress(input: UpdateProgressInput): Promise<ContractGenerationDTO> {
    const existing = await this.getByIdAndUserId(input.contractId, input.userId);
    if (!existing) {
      throw new ContractNotFoundError(input.contractId);
    }

    const mergedAnswers = {
      ...(existing.answers || {}),
      ...input.answers,
    };
    const now = new Date().toISOString();
    const rawId = stripTypeIdPrefix(input.contractId);
    const rawUserId = stripTypeIdPrefix(input.userId);

    const query = this.supabase
      .from('contract_generations')
      .update({
        current_question_index: input.questionIndex,
        answers: mergedAnswers,
        updated_at: now,
      })
      .eq('id', rawId)
      .eq('user_id', rawUserId)
      .select('*');

    const { data, error } =
      typeof (query as any).maybeSingle === 'function'
        ? await (query as any).maybeSingle()
        : await query.single();

    if (error) {
      throw new Error(`Failed to update progress: ${error.message}`);
    }
    if (!data) {
      throw new ContractNotFoundError(input.contractId);
    }

    return {
      id: formatContractId(data.id),
      userId: formatUserId(data.user_id),
      title: data.title,
      status: data.status,
      currentQuestionIndex: data.current_question_index,
      answers: data.answers || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async updateTitle(input: UpdateTitleInput): Promise<ContractGenerationDTO> {
    if (!input.title || input.title.trim().length === 0) {
      throw new EmptyTitleError();
    }

    const existing = await this.getByIdAndUserId(input.contractId, input.userId);
    if (!existing) {
      throw new ContractNotFoundError(input.contractId);
    }

    const now = new Date().toISOString();
    const rawId = stripTypeIdPrefix(input.contractId);
    const rawUserId = stripTypeIdPrefix(input.userId);

    const query = this.supabase
      .from('contract_generations')
      .update({
        title: input.title.trim(),
        updated_at: now,
      })
      .eq('id', rawId)
      .eq('user_id', rawUserId)
      .select('*');

    const { data, error } =
      typeof (query as any).maybeSingle === 'function'
        ? await (query as any).maybeSingle()
        : await query.single();

    if (error) {
      throw new Error(`Failed to update title: ${error.message}`);
    }
    if (!data) {
      throw new ContractNotFoundError(input.contractId);
    }

    return {
      id: formatContractId(data.id),
      userId: formatUserId(data.user_id),
      title: data.title,
      status: data.status,
      currentQuestionIndex: data.current_question_index,
      answers: data.answers || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async completeQuestionnaire(input: CompleteQuestionnaireInput): Promise<ContractGenerationDTO> {
    const existing = await this.getByIdAndUserId(input.contractId, input.userId);
    if (!existing) {
      throw new ContractNotFoundError(input.contractId);
    }

    const now = new Date().toISOString();
    const rawId = stripTypeIdPrefix(input.contractId);
    const rawUserId = stripTypeIdPrefix(input.userId);

    const query = this.supabase
      .from('contract_generations')
      .update({
        status: 'completed',
        updated_at: now,
      })
      .eq('id', rawId)
      .eq('user_id', rawUserId)
      .select('*');

    const { data, error } =
      typeof (query as any).maybeSingle === 'function'
        ? await (query as any).maybeSingle()
        : await query.single();

    if (error) {
      throw new Error(`Failed to complete questionnaire: ${error.message}`);
    }
    if (!data) {
      throw new ContractNotFoundError(input.contractId);
    }

    return {
      id: formatContractId(data.id),
      userId: formatUserId(data.user_id),
      title: data.title,
      status: data.status,
      currentQuestionIndex: data.current_question_index,
      answers: data.answers || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async getNextDefaultTitle(userId: string): Promise<string> {
    const rawUserId = stripTypeIdPrefix(userId);
    const { count, error } = await this.supabase
      .from('contract_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', rawUserId);

    if (error) {
      return 'Mi Contrato 1';
    }

    return `Mi Contrato ${(count || 0) + 1}`;
  }
}
