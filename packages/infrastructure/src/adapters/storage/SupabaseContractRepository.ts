import type {
  ContractRepositoryPort,
  ContractGenerationDTO,
  ContractGenerationSummaryDTO,
} from '@go-agree/application';

export class SupabaseContractRepository implements ContractRepositoryPort {
  constructor(private readonly supabase: any) {}

  async listByUserId(userId: string): Promise<ContractGenerationSummaryDTO[]> {
    const { data, error } = await this.supabase
      .from('contract_generations')
      .select('id, user_id, title, status, current_question_index, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      status: row.status,
      currentQuestionIndex: row.current_question_index,
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getByIdAndUserId(id: string, userId: string): Promise<ContractGenerationDTO | null> {
    const { data, error } = await this.supabase
      .from('contract_generations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      status: data.status,
      currentQuestionIndex: data.current_question_index,
      answers: data.answers || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async save(contract: ContractGenerationDTO): Promise<void> {
    const { error } = await this.supabase
      .from('contract_generations')
      .update({
        title: contract.title,
        status: contract.status,
        current_question_index: contract.currentQuestionIndex,
        answers: contract.answers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contract.id)
      .eq('user_id', contract.userId);

    if (error) {
      throw new Error(`Failed to save contract: ${error.message}`);
    }
  }

  async create(
    contract: Omit<ContractGenerationDTO, 'createdAt' | 'updatedAt'>
  ): Promise<ContractGenerationDTO> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('contract_generations')
      .insert({
        id: contract.id,
        user_id: contract.userId,
        title: contract.title,
        status: contract.status,
        current_question_index: contract.currentQuestionIndex,
        answers: contract.answers,
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to create contract: ${error?.message || 'Unknown error'}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      status: data.status,
      currentQuestionIndex: data.current_question_index,
      answers: data.answers || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
