import { randomBytes } from "node:crypto";

console.log(`DATA_ENCRYPTION_KEY=${randomBytes(32).toString("hex")}`);
console.log(`POSTGRES_PASSWORD=${randomBytes(24).toString("base64url")}`);
console.log(`DEMO_API_KEY=pg_${randomBytes(24).toString("base64url")}`);
console.log(`COOKIE_SECRET=${randomBytes(32).toString("base64url")}`);
console.log(`WEBHOOK_SIGNING_SECRET=${randomBytes(32).toString("base64url")}`);
