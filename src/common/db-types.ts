// Utility to pick a cross-driver datetime column type for TypeORM entities.
// - For Postgres: use 'timestamptz'
// - For SQLite: use 'datetime'
// - For others: fall back to 'timestamp'
// This is evaluated at module load, using env vars set by start scripts.

export const dateTimeColumnType: string = (() => {
  const driver = (process.env.DB_DRIVER || '').toLowerCase();
  const url = process.env.DATABASE_URL || '';
  // Prefer explicit driver selection first
  if (driver.includes('sqlite')) return 'datetime';
  if (driver.includes('pg') || driver.includes('postgres')) return 'timestamptz';
  // Infer from URL when driver not set
  if (url.startsWith('postgres')) return 'timestamptz';
  if (url.startsWith('sqlite')) return 'datetime';
  // Fallback to a cross-driver friendly type
  return 'timestamp';
})();
