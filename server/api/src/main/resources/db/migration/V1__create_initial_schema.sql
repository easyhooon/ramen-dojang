CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE shops (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  phone TEXT,
  place_url TEXT,
  thumbnail_url TEXT NOT NULL DEFAULT '/assets/default-ramen.svg',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX shops_location_idx ON shops USING gist (location);

CREATE TABLE tags (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE shop_tags (
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (shop_id, tag_id)
);

CREATE TABLE visits (
  id UUID PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  visited_at DATE NOT NULL,
  menu_name TEXT NOT NULL,
  broth_rating INTEGER NOT NULL CHECK (broth_rating BETWEEN 1 AND 5),
  noodle_rating INTEGER NOT NULL CHECK (noodle_rating BETWEEN 1 AND 5),
  topping_rating INTEGER NOT NULL CHECK (topping_rating BETWEEN 1 AND 5),
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  revisit_intention BOOLEAN NOT NULL,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX visits_shop_id_idx ON visits(shop_id);
CREATE INDEX visits_visited_at_idx ON visits(visited_at);

CREATE TABLE wishlist (
  id UUID PRIMARY KEY,
  shop_id UUID NOT NULL UNIQUE REFERENCES shops(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
