import { createSignal } from "solid-js";

import { Config, getConfig } from "../config/store";
import { isTestActive } from "../states/test";
import {
  englishPersian,
  spanishPersian,
  type TranslationPair,
} from "./translation-dictionaries";

export type TranslationLanguage = "en" | "es";

export type TranslationStats = {
  /** +3 per correct answer, -1 per wrong answer or reveal */
  score: number;
  correct: number;
  wrong: number;
};

const STORAGE_KEY = "translationScores";
// v2: the first version marked words seen while auto-reveal was on trial
const SEEN_KEY = "translationSeenWords2";
const WORD_STATS_KEY = "translationWordStats";

/** Per-word history, used by the offline statistics page. */
export type TranslationWordStats = {
  answer: string;
  correct: number;
  wrong: number;
};

type WordStatsRecord = Record<
  TranslationLanguage,
  Record<string, TranslationWordStats>
>;

function emptyStats(): TranslationStats {
  return { score: 0, correct: 0, wrong: 0 };
}

function emptyRecord(): Record<TranslationLanguage, TranslationStats> {
  return { en: emptyStats(), es: emptyStats() };
}

/** Reactive: reads the config store, so labels update on language change. */
export function getTranslationLanguage(): TranslationLanguage {
  return getConfig.language.split("_")[0] === "spanish" ? "es" : "en";
}

function loadTotals(): Record<TranslationLanguage, TranslationStats> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return emptyRecord();
    const parsed = JSON.parse(raw) as Partial<
      Record<TranslationLanguage, Partial<TranslationStats>>
    >;
    return {
      en: { ...emptyStats(), ...parsed.en },
      es: { ...emptyStats(), ...parsed.es },
    };
  } catch {
    return emptyRecord();
  }
}

function persistTotals(
  totals: Record<TranslationLanguage, TranslationStats>,
): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(totals));
  } catch {
    // storage full or blocked: scores stay in memory for this session
  }
}

/**
 * Source words whose translation the user has already been shown, keyed
 * `language:source`. Unseen translations reveal themselves once; after that
 * they stay hidden.
 */
function loadSeenWords(): Set<string> {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    if (raw === null) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

const seenWords = loadSeenWords();

function markWordSeen(key: string): void {
  if (seenWords.has(key)) return;
  seenWords.add(key);
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...seenWords]));
  } catch {
    // storage blocked: the word may be shown again next session
  }
}

function emptyWordStats(): WordStatsRecord {
  return { en: {}, es: {} };
}

function loadWordStats(): WordStatsRecord {
  try {
    const raw = window.localStorage.getItem(WORD_STATS_KEY);
    if (raw === null) return emptyWordStats();
    const parsed = JSON.parse(raw) as Partial<WordStatsRecord>;
    return {
      en: parsed.en ?? {},
      es: parsed.es ?? {},
    };
  } catch {
    return emptyWordStats();
  }
}

function persistWordStats(stats: WordStatsRecord): void {
  try {
    window.localStorage.setItem(WORD_STATS_KEY, JSON.stringify(stats));
  } catch {
    // storage blocked: stats stay in memory for this session
  }
}

/** Lifetime score per language, kept separate for english and spanish. */
const [totals, setTotals] = createSignal(loadTotals());
/** Per-word correct/wrong history, used by the account statistics. */
const [wordStats, setWordStats] =
  createSignal<WordStatsRecord>(loadWordStats());
/** Score of the current test, per language. */
const [session, setSession] = createSignal(emptyRecord());
const [revealed, setRevealed] = createSignal<ReadonlySet<number>>(new Set());
/** Unseen answers shown automatically when they first come up. */
const [autoRevealed, setAutoRevealed] = createSignal<ReadonlySet<number>>(
  new Set(),
);

export {
  session as translationSession,
  totals as translationTotals,
  wordStats as translationWordStats,
};

/** Words alternate source, answer, source, answer... */
export function isAnswerWord(wordIndex: number): boolean {
  return wordIndex % 2 === 1;
}

/** Quotes and custom text are not replaced, so the funbox does nothing there. */
export function isTranslationActive(): boolean {
  return Config.mode === "words" || Config.mode === "time";
}

/** A dictionary entry resolved to the answer picked for this test. */
type ResolvedPair = {
  source: string;
  answer: string;
  answers: string[];
};

let pairs: ResolvedPair[] = [];
let deck: TranslationPair[] = [];
let scored = new Set<number>();
/** Language the words on screen were generated with. */
let testLanguage: TranslationLanguage = "en";

function dictionary(language: TranslationLanguage): TranslationPair[] {
  return language === "es" ? spanishPersian : englishPersian;
}

function refillDeck(): void {
  deck = [...dictionary(testLanguage)];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [
      deck[j] as TranslationPair,
      deck[i] as TranslationPair,
    ];
  }
}

function nextPair(): TranslationPair {
  if (deck.length === 0) refillDeck();
  return deck.pop() as TranslationPair;
}

/**
 * The language can change between two generations, and generation runs before
 * the funbox `start` hook: drop the stale pairs as soon as they no longer match
 * the configured language, or spanish tests would show english words.
 */
function ensureTestLanguage(): void {
  const language = getTranslationLanguage();
  if (language === testLanguage) return;
  testLanguage = language;
  pairs = [];
  deck = [];
  scored = new Set();
  setRevealed(new Set<number>());
  setAutoRevealed(new Set<number>());
  setSession(emptyRecord());
}

/** New words are about to be generated (index 0 of a generation). */
export function beginTranslationGeneration(): void {
  ensureTestLanguage();
  if (isTestActive()) return;
  // a fresh test (or a restart while idle) gets a fresh shuffle, and no
  // answer stays revealed from the previous test
  pairs = [];
  deck = [];
  scored = new Set();
  setRevealed(new Set<number>());
  setAutoRevealed(new Set<number>());
}

function getPair(wordIndex: number): ResolvedPair {
  ensureTestLanguage();
  const pairIndex = Math.floor(wordIndex / 2);
  if (pairs[pairIndex] === undefined) {
    const [source, answers] = nextPair();
    // multiple meanings: pick one per test so the same word varies
    const answer =
      answers[Math.floor(Math.random() * answers.length)] ?? source;
    const pair: ResolvedPair = {
      source,
      answer,
      answers,
    };
    pairs[pairIndex] = pair;

    // never-seen translation: show it once so it can be learned, then hide it
    // on later tests
    const key = `${testLanguage}:${pair.source}`;
    if (!seenWords.has(key)) {
      markWordSeen(key);
      setAutoRevealed((prev) => {
        const next = new Set(prev);
        next.add(pairIndex * 2 + 1);
        return next;
      });
    }
  }
  return pairs[pairIndex] as ResolvedPair;
}

/** The word to type for the given test word index. */
export function getTranslationWord(wordIndex: number): string {
  const pair = getPair(wordIndex);
  return isAnswerWord(wordIndex) ? pair.answer : pair.source;
}

/**
 * Words with no direct Persian equivalent: a short note is shown above the
 * translation instead of stuffing the explanation into the answer itself.
 */
const NOTES: Record<TranslationLanguage, Record<string, string>> = {
  en: {
    the: "no direct equivalent (definite article)",
    a: "no direct equivalent (indefinite article)",
    of: "context-dependent",
    to: "context-dependent",
    as: "context-dependent",
    it: "context-dependent pronoun",
    do: "context-dependent",
  },
  es: {
    la: "no direct equivalent (definite article)",
    un: "no direct equivalent (indefinite article)",
    lo: "neuter article / pronoun",
    que: "context-dependent",
  },
};

/** Extra explanation for an answer word, shown on hover. */
export type TranslationHint = {
  /** Short note for words without a direct Persian equivalent. */
  text?: string;
  /** Every valid meaning when the word has several. */
  meanings?: string[];
  /** The meaning picked for this test. */
  active?: string;
};

/** Hint for the answer at `wordIndex`, if the word needs one. */
export function getTranslationHint(
  wordIndex: number,
): TranslationHint | undefined {
  if (!isAnswerWord(wordIndex)) return undefined;
  const pair = pairs[Math.floor(wordIndex / 2)];
  if (pair === undefined) return undefined;
  const note = NOTES[testLanguage][pair.source];
  if (note !== undefined) return { text: note };
  if (pair.answers.length > 1) {
    return { meanings: pair.answers, active: pair.answer };
  }
  return undefined;
}

export function isTranslationAnswerRevealed(wordIndex: number): boolean {
  return revealed().has(wordIndex) || autoRevealed().has(wordIndex);
}

export function revealTranslationAnswer(wordIndex: number): void {
  setRevealed((prev) => {
    if (prev.has(wordIndex)) return prev;
    const next = new Set(prev);
    next.add(wordIndex);
    return next;
  });
}

/** Normalize away invisible/arabic-vs-persian letter variants. */
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\u064a/g, "\u06cc") // arabic yeh -> persian yeh
    .replace(/\u0643/g, "\u06a9") // arabic kaf -> persian kaf
    .replace(/[\u200c\u200e\u200f]/g, "");
}

function addAnswer(
  record: Record<TranslationLanguage, TranslationStats>,
  language: TranslationLanguage,
  correct: boolean,
): Record<TranslationLanguage, TranslationStats> {
  const current = record[language];
  return {
    ...record,
    [language]: {
      score: current.score + (correct ? 3 : -1),
      correct: current.correct + (correct ? 1 : 0),
      wrong: current.wrong + (correct ? 0 : 1),
    },
  };
}

/**
 * Scores an answer word once. `typed` is what the user typed for the word,
 * `answer` the word they had to type. Reveals count as wrong.
 */
export function recordTranslationAnswer(
  wordIndex: number,
  typed: string,
  answer: string,
): void {
  if (scored.has(wordIndex)) return;
  scored.add(wordIndex);

  // score against the language the words were generated with, even if the
  // config changed mid-test
  const language = testLanguage;
  const correct = normalize(typed) === normalize(answer);

  const source = pairs[Math.floor(wordIndex / 2)]?.source;
  if (source !== undefined) {
    setWordStats((prev) => {
      const current = prev[language][source] ?? {
        answer,
        correct: 0,
        wrong: 0,
      };
      const next: WordStatsRecord = {
        ...prev,
        [language]: {
          ...prev[language],
          [source]: {
            answer,
            correct: current.correct + (correct ? 1 : 0),
            wrong: current.wrong + (correct ? 0 : 1),
          },
        },
      };
      persistWordStats(next);
      return next;
    });
  }

  setSession((prev) => addAnswer(prev, language, correct));
  setTotals((prev) => {
    const next = addAnswer(prev, language, correct);
    persistTotals(next);
    return next;
  });
}

export function isTranslationAnswerScored(wordIndex: number): boolean {
  return scored.has(wordIndex);
}

/**
 * Called when a test starts. Pairs/deck are left alone: the words on screen
 * were already generated with them (a restart regenerates and reshuffles).
 */
export function resetTranslationTest(): void {
  ensureTestLanguage();
  scored = new Set();
  setRevealed(new Set<number>());
  setSession(emptyRecord());
}

/** Explicit language switch (kept for callers outside word generation). */
export function refreshTranslationLanguage(): void {
  ensureTestLanguage();
}

/** Language of the test that was just finished. */
export function getTranslationTestLanguage(): TranslationLanguage {
  return testLanguage;
}

/** Result label for the current language, e.g. `en:12`. */
export function getTranslationResultContent(): string {
  const language = testLanguage;
  return `${language}:${totals()[language].score}`;
}
