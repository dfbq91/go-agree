import type {
  CompleteQuestionnaireInput,
  ContractDashboardItemDTO,
  ContractGenerationDTO,
  ContractGenerationSummaryDTO,
  ContractProgressPort,
  ContractRepositoryPort,
  DocumentFormat,
  LoggerPort,
  UpdateProgressInput,
  UpdateTitleInput,
} from '@go-agree/application';
import {
  ContractNotFoundError,
  EmptyTitleError,
  TYPE_ID_PREFIXES,
  calculateAnsweredQuestionsCount,
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
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly logger?: LoggerPort
  ) {}

  async listByUserId(userId: string): Promise<ContractGenerationSummaryDTO[]> {
    const rawUserId = stripTypeIdPrefix(userId);
    const { data, error } = await this.supabase
      .from('contract_generations')
      .select('id, user_id, title, status, current_question_index, updated_at')
      .eq('user_id', rawUserId)
      .order('updated_at', { ascending: false });

    if (error) {
      this.logger?.error('Supabase query failed on contract_generations.select', {
        userId,
        error: error.message,
        code: error.code,
      });
      return [];
    }

    if (!data) {
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

  async listDashboardItemsByUserId(userId: string): Promise<ContractDashboardItemDTO[]> {
    const rawUserId = stripTypeIdPrefix(userId);
    const { data, error } = await this.supabase
      .from('contract_generations')
      .select('id, user_id, title, status, current_question_index, answers, created_at, updated_at')
      .eq('user_id', rawUserId)
      .order('updated_at', { ascending: false });

    if (error) {
      this.logger?.error('Supabase query failed on contract_generations.listDashboardItems', {
        userId,
        error: error.message,
        code: error.code,
      });
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    let documentsMap = new Map<string, DocumentFormat[]>();
    try {
      const contractIds = data.map((row: any) => row.id);
      const { data: docsData, error: docsError } = await this.supabase
        .from('contract_documents')
        .select('contract_id, file_format')
        .in('contract_id', contractIds);

      if (!docsError && docsData) {
        for (const doc of docsData) {
          const list = documentsMap.get(doc.contract_id) || [];
          if (!list.includes(doc.file_format as DocumentFormat)) {
            list.push(doc.file_format as DocumentFormat);
          }
          documentsMap.set(doc.contract_id, list);
        }
      }
    } catch {
      documentsMap = new Map();
    }

    return data.map((row: any) => {
      const answeredCount = calculateAnsweredQuestionsCount(row.answers);
      const formats = documentsMap.get(row.id) || [];

      return {
        id: formatContractId(row.id),
        userId: formatUserId(row.user_id),
        title: row.title,
        status: row.status,
        currentQuestionIndex: row.current_question_index,
        questionsAnsweredCount: answeredCount,
        hasGeneratedDocument: formats.length > 0,
        availableFormats: formats,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    });
  }

  async deleteByIdAndUserId(id: string, userId: string): Promise<void> {
    const rawId = stripTypeIdPrefix(id);
    const rawUserId = stripTypeIdPrefix(userId);

    const { error } = await this.supabase
      .from('contract_generations')
      .delete()
      .eq('id', rawId)
      .eq('user_id', rawUserId);

    if (error) {
      this.logger?.error('Supabase delete failed on contract_generations.deleteByIdAndUserId', {
        id,
        userId,
        error: error.message,
        code: error.code,
      });
      throw new Error(`Failed to delete contract: ${error.message}`);
    }
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

    if (error) {
      this.logger?.error('Supabase query failed on contract_generations.getById', {
        id,
        userId,
        error: error.message,
        code: error.code,
      });
      return null;
    }

    if (!data) {
      return null;
    }

    if (data.user_id !== rawUserId && data.user_id !== userId) {
      this.logger?.warn('Supabase contract query tenant mismatch', {
        id,
        expectedUserId: rawUserId,
        rowUserId: data.user_id,
      });
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
      this.logger?.error('Supabase update failed on contract_generations.save', {
        id: contract.id,
        userId: contract.userId,
        error: error.message,
        code: error.code,
      });
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
      this.logger?.error('Supabase insert failed on contract_generations.create', {
        id: contract.id,
        userId: contract.userId,
        error: error?.message,
        code: error?.code,
      });
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
      this.logger?.error('Supabase update failed on contract_generations.updateProgress', {
        id: input.contractId,
        userId: input.userId,
        error: error.message,
        code: error.code,
      });
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
      this.logger?.error('Supabase update failed on contract_generations.updateTitle', {
        id: input.contractId,
        userId: input.userId,
        error: error.message,
        code: error.code,
      });
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
      this.logger?.error('Supabase update failed on contract_generations.completeQuestionnaire', {
        id: input.contractId,
        userId: input.userId,
        error: error.message,
        code: error.code,
      });
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
      this.logger?.warn('Supabase count query failed on contract_generations.getNextDefaultTitle', {
        userId,
        error: error.message,
        code: error.code,
      });
      return 'Mi Contrato 1';
    }

    return `Mi Contrato ${(count || 0) + 1}`;
  }
}
