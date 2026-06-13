-- Remove coluna banca da tabela concurso (idempotente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'concurso'
      AND column_name = 'banca'
  ) THEN
    ALTER TABLE concurso DROP COLUMN banca;
  END IF;
END $$;
