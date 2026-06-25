import * as SQLite from 'expo-sqlite';

/**
 * Single shared SQLite connection for the whole app. We use the synchronous
 * API: the dataset is local and small, calls are fast, and it keeps the store
 * layer simple (no async fan-out on every read).
 */
let _db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync('vaultboard.db');
    _db.execSync('PRAGMA journal_mode = WAL;');
    _db.execSync('PRAGMA foreign_keys = ON;');
  }
  return _db;
}

// --- thin typed helpers -----------------------------------------------------

export function all<T>(sql: string, params: SQLite.SQLiteBindValue[] = []): T[] {
  return getDb().getAllSync<T>(sql, params);
}

export function first<T>(
  sql: string,
  params: SQLite.SQLiteBindValue[] = []
): T | null {
  return getDb().getFirstSync<T>(sql, params);
}

export function run(sql: string, params: SQLite.SQLiteBindValue[] = []): void {
  getDb().runSync(sql, params);
}

// Reentrant transaction guard. SQLite does not allow nested BEGIN, but several
// query helpers (createNote -> syncLinks, setNoteTags, setCardLabels…) call tx()
// internally and may themselves run inside a larger tx() (e.g. the first-launch
// seed). When already inside a transaction we run the body inline so it joins
// the outer one instead of starting a forbidden nested transaction.
let _inTx = false;
export function tx(fn: () => void): void {
  if (_inTx) {
    fn();
    return;
  }
  _inTx = true;
  try {
    getDb().withTransactionSync(fn);
  } finally {
    _inTx = false;
  }
}

/** SQLite stores booleans as 0/1; normalise to JS booleans. */
export const bool = (n: number | null | undefined): boolean => n === 1;
export const intBool = (b: boolean): number => (b ? 1 : 0);
