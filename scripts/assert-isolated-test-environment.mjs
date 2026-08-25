#!/usr/bin/env node

const productionReference = "fpoviccitrraonvvgont";
const unsafeName = Object.entries(process.env).find(([, value]) =>
  (value ?? "").includes(productionReference),
)?.[0];
if (unsafeName) {
  process.stderr.write(
    `Refusing test execution: ${unsafeName} targets the production project.\n`,
  );
  process.exit(1);
}
process.stdout.write("Environment safety guard passed.\n");
