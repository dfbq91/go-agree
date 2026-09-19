-- 0002_dynamic_questions.sql
-- Migración para almacenamiento de preguntas dinámicas y snapshots de análisis con soporte Realtime y RLS

-- 1. Agregar columna para snapshots de análisis en contract_generations
ALTER TABLE public.contract_generations 
ADD COLUMN IF NOT EXISTS analysis_snapshots JSONB NOT NULL DEFAULT '{}'::JSONB;

-- 2. Crear tabla para las preguntas generadas dinámicamente por el LLM
CREATE TABLE IF NOT EXISTS public.contract_dynamic_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES public.contract_generations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage INTEGER NOT NULL DEFAULT 1,
    question_key VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'open_text' | 'single_choice' | 'multiple_choice'
    order_index INTEGER NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT true,
    help_text TEXT,
    tooltip TEXT,
    options JSONB, -- Array de objetos: [{ id, label, value, tooltip }]
    condition JSONB, -- Regla condicional opcional
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Índices para consultas de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_dynamic_questions_contract_id 
    ON public.contract_dynamic_questions(contract_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_questions_user_id 
    ON public.contract_dynamic_questions(user_id);

-- 4. Habilitar Row Level Security (RLS) - Seguridad Multi-inquilino
ALTER TABLE public.contract_dynamic_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only read own dynamic questions" ON public.contract_dynamic_questions;
CREATE POLICY "Users can only read own dynamic questions"
    ON public.contract_dynamic_questions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert own dynamic questions" ON public.contract_dynamic_questions;
CREATE POLICY "Users can only insert own dynamic questions"
    ON public.contract_dynamic_questions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete own dynamic questions" ON public.contract_dynamic_questions;
CREATE POLICY "Users can only delete own dynamic questions"
    ON public.contract_dynamic_questions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. Publicación en Supabase Realtime (Permite que el front reciba notificaciones push)
ALTER TABLE public.contract_dynamic_questions REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'contract_dynamic_questions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.contract_dynamic_questions;
    END IF;
END $$;
