import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://pushgiant:pushgiant@localhost:5432/pushgiant";

function findRepoMigrationsDir(start: string): string {
  let current = resolve(start);
  while (current !== dirname(current)) {
    const candidate = join(current, "migrations");
    if (existsSync(candidate)) {
      return candidate;
    }
    current = dirname(current);
  }
  throw new Error("Could not find migrations directory");
}

const migrationsDir = findRepoMigrationsDir(process.cwd());
const pool = new pg.Pool({ connectionString: databaseUrl });

await pool.query(`
  create table if not exists schema_migrations (
    version text primary key,
    applied_at timestamptz not null default now()
  )
`);

const files = (await readdir(migrationsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

for (const file of files) {
  const version = file.replace(/\.sql$/, "");
  const existing = await pool.query("select version from schema_migrations where version = $1", [version]);
  if (existing.rowCount) {
    console.log(`Skipping ${file}`);
    continue;
  }

  const sql = await readFile(join(migrationsDir, file), "utf8");
  await pool.query("begin");
  try {
    await pool.query(sql);
    await pool.query("insert into schema_migrations(version) values ($1)", [version]);
    await pool.query("commit");
    console.log(`Applied ${file}`);
  } catch (error) {
    await pool.query("rollback");
    throw error;
  }
}

await pool.end();
