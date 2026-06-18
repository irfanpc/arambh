CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username   VARCHAR(50) UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Images
CREATE TABLE IF NOT EXISTS gallery_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(200) NOT NULL DEFAULT 'Untitled',
  category      VARCHAR(50) NOT NULL DEFAULT 'classroom'
                CHECK (category IN ('classroom','activity','event')),
  cloudinary_id TEXT NOT NULL,
  url           TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery_images(sort_order);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(300) NOT NULL,
  message       TEXT NOT NULL,
  ann_date      DATE NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'New'
                CHECK (status IN ('New','Event','Alert','Holiday')),
  pinned        BOOLEAN NOT NULL DEFAULT FALSE,
  btn_text      VARCHAR(100),
  btn_link      VARCHAR(500),
  image_url     TEXT,
  cloudinary_id TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ann_pinned ON announcements(pinned DESC, ann_date DESC);

-- Tour Media
CREATE TABLE IF NOT EXISTS tour_media (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(200) NOT NULL DEFAULT 'School Tour',
  description   TEXT,
  media_type    VARCHAR(10) NOT NULL DEFAULT 'video'
                CHECK (media_type IN ('video','audio')),
  src_type      VARCHAR(20) NOT NULL DEFAULT 'youtube'
                CHECK (src_type IN ('youtube','mp4','audio-url','cloudinary')),
  src           TEXT NOT NULL,
  thumbnail_url TEXT,
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$ BEGIN
  NEW.updated_at = NOW(); RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_gallery_updated
  BEFORE UPDATE ON gallery_images
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_ann_updated
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_media_updated
  BEFORE UPDATE ON tour_media
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
