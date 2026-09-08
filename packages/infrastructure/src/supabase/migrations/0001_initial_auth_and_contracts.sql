-- 0001_initial_auth_and_contracts.sql
-- Initial migration for user profiles and multi-tenant contract generations with RLS

-- 1. Create public.user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    auth_providers TEXT[] NOT NULL DEFAULT ARRAY['email_password'::TEXT],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. Create public.contract_generations table
CREATE TABLE IF NOT EXISTS public.contract_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Mi Contrato 1',
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
    current_question_index INTEGER NOT NULL DEFAULT 0,
    answers JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contract_generations_user_id ON public.contract_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_generations_updated_at ON public.contract_generations(updated_at DESC);

-- RLS for contract_generations (strict multi-tenant isolation)
ALTER TABLE public.contract_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read own contract generations"
    ON public.contract_generations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own contract generations"
    ON public.contract_generations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update own contract generations"
    ON public.contract_generations FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete own contract generations"
    ON public.contract_generations FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
