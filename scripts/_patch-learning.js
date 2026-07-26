const fs = require("fs");
const path = "services/learning/service.ts";
let s = fs.readFileSync(path, "utf8");
const start = s.indexOf("/** Placeholder continue-learning cards");
const end = s.indexOf("export async function listSavedContent");
console.log({ start, end });
if (start < 0 || end < 0) process.exit(1);
const replacement = fs.readFileSync(
  "services/learning/_progress_insert.ts.txt",
  "utf8",
);
s = s.slice(0, start) + replacement + "\n\n" + s.slice(end);
fs.writeFileSync(path, s);
console.log("patched ok");
