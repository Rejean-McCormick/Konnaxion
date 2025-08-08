/* --------------------------------------------------------------------
   ekoh-smartvote  —  Monthly Partition Helper
   --------------------------------------------------------------------
   • Creates next-month partitions for high-volume tables.
   • Detaches + optionally drops partitions older than RETENTION_MONTHS.
   • Safe to run multiple times; existing partitions are skipped.
   ------------------------------------------------------------------ */

DO $$
DECLARE
    schema_name        CONSTANT text := 'ekoh_smartvote';
    tables             CONSTANT text[] := ARRAY['vote', 'vote_ledger', 'score_history'];
    retention_months   CONSTANT int   := 24;  -- keep 2 years of live data
    today              date := current_date;
    first_next         date := (date_trunc('month', today) + interval '1 month')::date;
    first_old          date := (date_trunc('month', today) - (retention_months || ' months')::interval)::date;
    tbl                text;
    part_name_new      text;
    part_name_old      text;
BEGIN
    ------------------------------------------------------------------
    -- create partitions for NEXT month
    ------------------------------------------------------------------
    FOREACH tbl IN ARRAY tables LOOP
        part_name_new := format('%I.%I_%s', schema_name, tbl,
                                to_char(first_next, 'YYYY_MM'));
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %s
               PARTITION OF %I.%I
               FOR VALUES FROM (%L) TO (%L);',
            part_name_new, schema_name, tbl, first_next, first_next + interval '1 month'
        );
    END LOOP;

    ------------------------------------------------------------------
    -- detach (and optionally DROP) partitions older than retention
    ------------------------------------------------------------------
    FOREACH tbl IN ARRAY tables LOOP
        part_name_old := format('%I_%s', tbl,
                                to_char(first_old, 'YYYY_MM'));
        IF EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = part_name_old
              AND n.nspname = schema_name
        ) THEN
            RAISE NOTICE 'Detaching old partition %.%', schema_name, part_name_old;
            EXECUTE format(
                'ALTER TABLE %I.%I DETACH PARTITION %I.%I;',
                schema_name, tbl, schema_name, part_name_old
            );
            -- uncomment next line to drop instead of detach:
            -- EXECUTE format('DROP TABLE IF EXISTS %I.%I;', schema_name, part_name_old);
        END IF;
    END LOOP;
END $$;
