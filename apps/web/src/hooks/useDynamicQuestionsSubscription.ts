import type { QuestionDTO } from '@go-agree/application';
import { createSupabaseBrowserClient, DynamicQuestionRow } from '@go-agree/infrastructure';
import { useEffect, useRef } from 'react';

export interface UseDynamicQuestionsSubscriptionOptions {
  contractId: string;
  onNewQuestion: (question: QuestionDTO) => void;
}

export function useDynamicQuestionsSubscription({
  contractId,
  onNewQuestion,
}: UseDynamicQuestionsSubscriptionOptions) {
  const onNewQuestionRef = useRef(onNewQuestion);
  onNewQuestionRef.current = onNewQuestion;

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('<your-project-id>')) {
      return;
    }

    const supabase = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let isCancelled = false;

    async function subscribeToChanges() {
      try {
        const { data } = await supabase.auth.getSession();
        if (isCancelled) return;

        if (data.session?.access_token) {
          supabase.realtime.setAuth(data.session.access_token);
        }

        channel = supabase
          .channel(`dynamic-questions-${contractId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'contract_dynamic_questions',
              filter: `contract_id=eq.${contractId}`,
            },
            (payload) => {
              const row = payload.new as DynamicQuestionRow;
              if (row) {
                const questionDTO: QuestionDTO = {
                  id: row.question_key,
                  order: row.order_index,
                  prompt: row.prompt,
                  type: row.type as QuestionDTO['type'],
                  isRequired: row.is_required,
                  helpText: row.help_text || undefined,
                  tooltip: row.tooltip || undefined,
                  options: (row.options as any) || undefined,
                  condition: (row.condition as any) || undefined,
                };
                onNewQuestionRef.current(questionDTO);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Error initializing dynamic questions subscription:', err);
      }
    }

    subscribeToChanges();

    return () => {
      isCancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [contractId]);
}
