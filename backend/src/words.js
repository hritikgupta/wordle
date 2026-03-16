import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load word lists from files
const RESOURCES_DIR = path.join(__dirname, '../resources');

let TARGET_WORDS = [];  // Words that can become the solution
let VALID_GUESSES = new Set();  // All valid words that can be guessed

function loadWordLists() {
  try {
    // Load target words (2315 official Wordle words)
    const targetWordsPath = path.join(RESOURCES_DIR, 'shuffled_real_wordles.txt');
    const targetWordsContent = fs.readFileSync(targetWordsPath, 'utf-8');
    const targetWordsLines = targetWordsContent.split('\n');

    // Skip first line (description) and filter empty lines
    for (let i = 1; i < targetWordsLines.length; i++) {
      const word = targetWordsLines[i].trim().toUpperCase();
      if (word.length === 5) {
        TARGET_WORDS.push(word);
      }
    }

    console.log(`✅ Loaded ${TARGET_WORDS.length} target words`);

    // Load valid guesses (all recognized words - 12,972 words from combined list)
    const validGuessesPath = path.join(RESOURCES_DIR, 'combined_wordlist.txt');
    const validGuessesContent = fs.readFileSync(validGuessesPath, 'utf-8');
    const validGuessesLines = validGuessesContent.split('\n');

    // Skip first line (description) and filter empty lines
    for (let i = 1; i < validGuessesLines.length; i++) {
      const word = validGuessesLines[i].trim().toUpperCase();
      if (word.length === 5) {
        VALID_GUESSES.add(word);
      }
    }

    console.log(`✅ Loaded ${VALID_GUESSES.size} valid guess words`);
  } catch (error) {
    console.error('Error loading word lists:', error.message);
    process.exit(1);
  }
}

// Initialize word lists on import
loadWordLists();

export function getRandomWord() {
  if (TARGET_WORDS.length === 0) {
    throw new Error('Target words list is empty');
  }
  return TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)];
}

export function isValidWord(word) {
  const normalized = word.toUpperCase().trim();
  return VALID_GUESSES.has(normalized);
}

export function normalizeWord(word) {
  return word.toUpperCase().trim();
}
