// One Word, First Thought.
// Writes exactly one word to <output>/entry.txt: no newline, no caption, no second line.
// The word is a fixed constant, so every run writes the same bytes: no clock, no randomness.

// This repo ships no node_modules, so declare the few Node globals the file uses.
// Node strips these declarations at run time; they only keep editors quiet.
declare const require: (id: string) => any;
declare const process: { env: Record<string, string | undefined> };
declare const Buffer: { byteLength(input: string, encoding?: string): number };

const { mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const WORD = "gudgeon";

const letters = [...WORD];
if (letters.length < 1 || letters.length > 22) {
  throw new Error(`entry must be 1..22 characters, got ${letters.length}`);
}
if (!/^[A-Za-z]+$/.test(WORD)) {
  throw new Error("entry must be a single token of ASCII letters");
}

const dir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const out = join(dir, "entry.txt");

mkdirSync(dir, { recursive: true });
writeFileSync(out, WORD, "utf8");

// Read it back as bytes: the file must be the word and nothing else, so no trailing
// newline, no BOM and no caption can slip in. Byte length is the strict check.
const written = readFileSync(out);
const expected = Buffer.byteLength(WORD, "utf8");
if (written.toString() !== WORD || written.length !== expected) {
  throw new Error(`round-trip mismatch: ${JSON.stringify(written.toString())}`);
}

console.log(`wrote ${JSON.stringify(WORD)} to ${out} (${expected} bytes)`);
