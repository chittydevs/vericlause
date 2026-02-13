
-- Create table for storing contract analyses
CREATE TABLE public.contract_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contract_text TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_analyses ENABLE ROW LEVEL SECURITY;

-- Users can view their own non-deleted analyses
CREATE POLICY "Users can view own analyses"
  ON public.contract_analyses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own analyses
CREATE POLICY "Users can insert own analyses"
  ON public.contract_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own analyses (for soft-delete/restore)
CREATE POLICY "Users can update own analyses"
  ON public.contract_analyses FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can hard-delete their own analyses
CREATE POLICY "Users can delete own analyses"
  ON public.contract_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_contract_analyses_updated_at
  BEFORE UPDATE ON public.contract_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable pg_cron and pg_net for scheduled cleanup
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
