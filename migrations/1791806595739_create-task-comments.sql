-- Up Migration
CREATE TABLE IF NOT EXISTS task_comments (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id    integer NOT NULL,
  author_id  integer NOT NULL,
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_task_comments_task
    FOREIGN KEY (task_id)
    REFERENCES tasks(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_task_comments_author
    FOREIGN KEY (author_id)
    REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments (task_id);

-- Down Migration
DROP TABLE IF EXISTS task_comments;
