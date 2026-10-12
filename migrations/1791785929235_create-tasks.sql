-- Up Migration
CREATE TABLE IF NOT EXISTS tasks (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id  integer NOT NULL,
  title       text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'TODO',
  assignee_id integer,
  due_date    timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_tasks_project
    FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_tasks_assignee
    FOREIGN KEY (assignee_id)
    REFERENCES users(id),

  CONSTRAINT chk_tasks_status
    CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks (project_id);

-- Down Migration
DROP TABLE IF EXISTS tasks;
