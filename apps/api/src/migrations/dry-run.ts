import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

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

const migrationPath = join(findRepoMigrationsDir(process.cwd()), "0001_product_foundation.sql");
const sql = await readFile(migrationPath, "utf8");

console.log(`Loaded migration ${migrationPath}`);
console.log(`${sql.split("\n").length} lines`);
console.log("Dry run only: no database changes were applied.");
