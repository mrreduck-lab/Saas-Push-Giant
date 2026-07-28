import pg from "pg";

export type Database = {
  pool: pg.Pool;
  health(): Promise<boolean>;
  close(): Promise<void>;
};

export function createDatabase(connectionString: string): Database {
  const pool = new pg.Pool({ connectionString });

  return {
    pool,
    async health() {
      const result = await pool.query("select 1 as ok");
      return result.rows[0]?.ok === 1;
    },
    async close() {
      await pool.end();
    }
  };
}
