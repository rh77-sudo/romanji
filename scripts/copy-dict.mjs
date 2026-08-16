import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "node_modules", "kuromoji", "dict");
const to = join(root, "public", "dict");

mkdirSync(to, { recursive: true });
cpSync(from, to, { recursive: true });
console.log(`copied kuromoji dict → ${to}`);
