// One Word, First Thought.
// Writes exactly one word to <output>/entry.txt: no newline, no caption, no second line.
// The word is a fixed constant, so every run writes the same bytes: no clock, no randomness.

// This repo ships no node_modules, so declare the few Node globals the file uses.
// Node strips these declarations at run time; they only keep editors quiet.
declare const require: (id: string) => any;
declare const process: { env: Record<string, string | undefined> };
declare const Buffer: {
  from(input: string, encoding?: string): Uint8Array & { equals(other: unknown): boolean };
};

const { mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

// One homely word, six letters. A bodger was the skilled woodland turner who made
// chair legs on a pole lathe; the same word now means a botcher. The trade meaning
// is the opposite of the insult, and that is the whole joke.
const WORD = "bodger";

const letters = [...WORD];
if (letters.length < 1 || letters.length > 22) {
  throw new Error(`entry must be 1..22 characters, got ${letters.length}`);
}
if (!/^[a-z]+$/.test(WORD)) {
  throw new Error("entry must be one token of lowercase ASCII letters, with no caption");
}
if (WORD.trim() !== WORD || WORD.length === 0) {
  throw new Error("entry must be one non-empty token with no surrounding space");
}

const dir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const out = join(dir, "entry.txt");

mkdirSync(dir, { recursive: true });
// Write the UTF-8 bytes explicitly: the file is the word, with no encoding surprises.
writeFileSync(out, Buffer.from(WORD, "utf8"));

// Read it back as bytes: the file must be the word and nothing else, so no trailing
// newline, no BOM and no caption can slip in. Byte length is the strict check.
const written = readFileSync(out);
const expected = Buffer.from(WORD, "utf8");
if (written.length !== expected.length || !expected.equals(written)) {
  throw new Error(`round-trip mismatch: ${JSON.stringify(written.toString())}`);
}
// The gate wants a bare token: no byte may be a newline, a carriage return or a BOM.
for (const byte of written) {
  if (byte === 0x0a || byte === 0x0d || byte === 0xef || byte === 0xbb || byte === 0xbf) {
    throw new Error(`entry.txt holds a stray control/encoding byte 0x${byte.toString(16)}`);
  }
}

console.log(`wrote ${JSON.stringify(WORD)} to ${out} (${written.length} bytes, ${letters.length} code points)`);
