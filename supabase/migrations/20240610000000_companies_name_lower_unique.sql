-- Ensure case-insensitive uniqueness on company names
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'companies_name_lower_uniq'
  ) THEN
    CREATE UNIQUE INDEX companies_name_lower_uniq ON public.companies (lower(name));
  END IF;
END$$;
