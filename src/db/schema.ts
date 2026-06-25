/**
 * Schema DDL. Applied once by migrate.ts. Bump SCHEMA_VERSION and add a branch
 * in migrate.ts when evolving the schema.
 */
export const SCHEMA_VERSION = 1;

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
  color TEXT,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  color TEXT
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body_md TEXT NOT NULL DEFAULT '',
  folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
  cover_uri TEXT,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder_id);

CREATE TABLE IF NOT EXISTS note_tags (
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

CREATE TABLE IF NOT EXISTS note_links (
  source_note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  target_note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  PRIMARY KEY (source_note_id, target_note_id)
);
CREATE INDEX IF NOT EXISTS idx_links_target ON note_links(target_note_id);

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS columns (
  id TEXT PRIMARY KEY NOT NULL,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_columns_board ON columns(board_id, sort);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY NOT NULL,
  column_id TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_at INTEGER,
  priority INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cards_column ON cards(column_id, sort);

CREATE TABLE IF NOT EXISTS card_labels (
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  PRIMARY KEY (card_id, label)
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id TEXT PRIMARY KEY NOT NULL,
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_checklist_card ON checklist_items(card_id, sort);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  note_id TEXT REFERENCES notes(id) ON DELETE SET NULL,
  card_id TEXT REFERENCES cards(id) ON DELETE SET NULL,
  due_at INTEGER,
  priority INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'todo',
  recurrence TEXT NOT NULL DEFAULT 'none',
  completed_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY NOT NULL,
  owner_type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  uri TEXT NOT NULL,
  kind TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attach_owner ON attachments(owner_type, owner_id);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

-- Standalone FTS5 index over notes. note_id is UNINDEXED so it round-trips but
-- isn't tokenised. Kept in sync by triggers below.
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  note_id UNINDEXED,
  title,
  body,
  tokenize = 'porter unicode61'
);

CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(note_id, title, body) VALUES (new.id, new.title, new.body_md);
END;
CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
  DELETE FROM notes_fts WHERE note_id = old.id;
END;
CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
  UPDATE notes_fts SET title = new.title, body = new.body_md WHERE note_id = old.id;
END;
`;
