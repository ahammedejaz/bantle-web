#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const allowedExtensions = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".cjs", ".sql", ".md", ".json", ".yml", ".yaml",
]);
const ignored = new Set([
  ".git", "node_modules", ".next", "build", "dist", "coverage",
]);
const patterns = [
  { name: "JWT-like value", regex: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g },
  { name: "private key block", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "Supabase service key literal", regex: /(?:service[_-]?role[_-]?key)\s*[:=]\s*["'][A-Za-z0-9._-]{40,}["']/gi },
];

const findings = [];
await walk(root);
if (findings.length > 0) {
  for (const finding of findings) {
    process.stderr.write(`${finding.file}:${finding.line}: ${finding.kind}\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write("Secret scan passed (content values are never printed).\n");
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    if (!allowedExtensions.has(extname(entry.name))) continue;
    const text = await readFile(path, "utf8").catch(() => null);
    if (text === null || text.length > 2_000_000) continue;
    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0;
      for (const match of text.matchAll(pattern.regex)) {
        findings.push({
          file: relative(root, path),
          line: text.slice(0, match.index).split("\n").length,
          kind: pattern.name,
        });
      }
    }
  }
}
