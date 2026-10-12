-- Up Migration
CREATE TABLE IF NOT EXISTS projects (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text NOT NULL,
  description text,
  owner_id    integer NOT NULL,

  CONSTRAINT fk_projects_owner
    FOREIGN KEY (owner_id)
    REFERENCES users(id),

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Down Migration
DROP TABLE IF EXISTS projects;