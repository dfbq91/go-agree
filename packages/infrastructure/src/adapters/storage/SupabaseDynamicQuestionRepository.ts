import type {
  ConditionRuleDTO,
  DynamicQuestionDTO,
  DynamicQuestionRepositoryPort,
  QuestionOptionDTO,
  QuestionType,
  SaveDynamicQuestionsInput,
} from '@go-agree/application';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface DynamicQuestionRow {
  id: string;
  contract_id: string;
  user_id: string;
  stage: number;
  question_key: string;
  prompt: string;
  type: QuestionType;
  order_index: number;
  is_required: boolean;
  help_text: string | null;
  tooltip: string | null;
  options: QuestionOptionDTO[] | null;
  condition: ConditionRuleDTO | null;
  created_at: string;
}

export interface ContractSnapshotRow {
  analysis_snapshots?: Record<string, Record<string, unknown>> | null;
}

export class SupabaseDynamicQuestionRepository implements DynamicQuestionRepositoryPort {
  constructor(private readonly supabase: SupabaseClient) {}

  async saveQuestions(input: SaveDynamicQuestionsInput): Promise<DynamicQuestionDTO[]> {
    const { data: contract } = await this.supabase
      .from('contract_generations')
      .select('analysis_snapshots')
      .eq('id', input.contractId)
      .eq('user_id', input.userId)
      .single<ContractSnapshotRow>();

    const existingSnapshots = contract?.analysis_snapshots || {};
    const updatedSnapshots = {
      ...existingSnapshots,
      [`stage_${input.stage}`]: input.answersSnapshot,
    };

    await this.supabase
      .from('contract_generations')
      .update({ analysis_snapshots: updatedSnapshots })
      .eq('id', input.contractId)
      .eq('user_id', input.userId);

    const rowsToInsert = input.questions.map((q) => ({
      contract_id: input.contractId,
      user_id: input.userId,
      stage: q.stage,
      question_key: q.questionKey,
      prompt: q.prompt,
      type: q.type,
      order_index: q.orderIndex,
      is_required: q.isRequired,
      help_text: q.helpText ?? null,
      tooltip: q.tooltip ?? null,
      options: q.options ? JSON.parse(JSON.stringify(q.options)) : null,
      condition: q.condition ? JSON.parse(JSON.stringify(q.condition)) : null,
    }));

    const { data, error } = await this.supabase
      .from('contract_dynamic_questions')
      .insert(rowsToInsert)
      .select<string, DynamicQuestionRow>('*');

    if (error || !data) {
      throw new Error(`Failed to save dynamic questions: ${error?.message || 'Unknown error'}`);
    }

    return data.map((row: DynamicQuestionRow) => this.mapRowToDTO(row));
  }

  async getQuestionsByContractId(
    contractId: string,
    userId: string
  ): Promise<DynamicQuestionDTO[]> {
    const { data, error } = await this.supabase
      .from('contract_dynamic_questions')
      .select<string, DynamicQuestionRow>('*')
      .eq('contract_id', contractId)
      .eq('user_id', userId)
      .order('order_index', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((row: DynamicQuestionRow) => this.mapRowToDTO(row));
  }

  async getSnapshot(
    contractId: string,
    userId: string,
    stage: number
  ): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.supabase
      .from('contract_generations')
      .select('analysis_snapshots')
      .eq('id', contractId)
      .eq('user_id', userId)
      .single<ContractSnapshotRow>();

    if (error || !data || !data.analysis_snapshots) {
      return null;
    }

    return data.analysis_snapshots[`stage_${stage}`] || null;
  }

  async deleteQuestionsByStage(contractId: string, userId: string, stage: number): Promise<void> {
    const { error } = await this.supabase
      .from('contract_dynamic_questions')
      .delete()
      .eq('contract_id', contractId)
      .eq('user_id', userId)
      .eq('stage', stage);

    if (error) {
      throw new Error(`Failed to delete dynamic questions: ${error.message}`);
    }
  }

  // ✅ 3. Función auxiliar de mapeo para desacoplar y reutilizar
  private mapRowToDTO(row: DynamicQuestionRow): DynamicQuestionDTO {
    return {
      id: row.id,
      contractId: row.contract_id,
      userId: row.user_id,
      stage: row.stage,
      questionKey: row.question_key,
      prompt: row.prompt,
      type: row.type as QuestionType,
      orderIndex: row.order_index,
      isRequired: row.is_required,
      helpText: row.help_text ?? undefined,
      tooltip: row.tooltip ?? undefined,
      options: row.options as QuestionOptionDTO[] | undefined,
      condition: row.condition as ConditionRuleDTO | undefined,
      createdAt: new Date(row.created_at),
    };
  }
}
