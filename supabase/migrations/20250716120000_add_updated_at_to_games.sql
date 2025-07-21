-- Add updated_at column to games table
ALTER TABLE public.games ADD COLUMN updated_at timestamptz DEFAULT now();

-- Create or replace the trigger function to update updated_at on row update
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for games table
DROP TRIGGER IF EXISTS set_updated_at_trigger ON public.games;
CREATE TRIGGER set_updated_at_trigger
BEFORE UPDATE ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at(); 