import { getDb } from './client';
import { SCHEMA_SQL, SCHEMA_VERSION } from './schema';

/**
 * Idempotent migration runner. Uses SQLite's `user_version` pragma to track the
 * applied schema version. On first run it creates everything; future versions
 * add `if (version < N)` branches here.
 */
export function migrate(): void {
  const db = getDb();
  const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version;');
  const version = row?.user_version ?? 0;

  if (version < 1) {
    db.execSync(SCHEMA_SQL);
  }

  // Future migrations:
  // if (version < 2) { db.execSync(`ALTER TABLE ...`); }

  if (version !== SCHEMA_VERSION) {
    db.execSync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }
}
