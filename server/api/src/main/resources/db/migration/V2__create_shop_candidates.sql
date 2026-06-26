CREATE TABLE shop_candidates (
  id UUID PRIMARY KEY,
  promoted_shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  source_place_id TEXT,
  raw_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  category TEXT,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  confidence_score NUMERIC(5, 4) CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'rejected', 'promoted')),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status <> 'promoted' OR promoted_shop_id IS NOT NULL)
);

CREATE UNIQUE INDEX shop_candidates_source_place_id_key
  ON shop_candidates(source, source_place_id)
  WHERE source_place_id IS NOT NULL;

CREATE INDEX shop_candidates_status_idx ON shop_candidates(status);
CREATE INDEX shop_candidates_normalized_name_address_idx ON shop_candidates(normalized_name, address);
