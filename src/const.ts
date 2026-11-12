/** Replaced at build time with the version in package.json. */
declare const __CARD_VERSION__: string;

export const CARD_VERSION = __CARD_VERSION__;

/** How many items a feed's list shows before the rest go behind a button. */
export const DEFAULT_ITEMS = 5;

/** In the automatic mode, an item is seen once this much of it has been on screen this long. */
export const SEEN_RATIO = 0.6;
export const SEEN_AFTER_MS = 1500;

/** Marks made close together go to Home Assistant in one write, as its user store writes its file on every change. */
export const SAVE_DELAY_MS = 1000;

/**
 * At most this many seen items are kept per feed: the feed's own and, after them, the latest that have left it, so an
 * item that drops out of a feed for a while isn't new again when it comes back.
 */
export const SEEN_KEPT = 300;

/** The key in the user's store that holds a feed's seen items. */
export const STORE_PREFIX = "feeds-card.";

/** A colour per feed, in the order the feeds are given, unless a feed sets its own. */
export const FEED_COLORS = [
    "var(--orange-color, #ff9800)",
    "var(--light-blue-color, #03a9f4)",
    "var(--green-color, #4caf50)",
    "var(--purple-color, #926bc7)",
    "var(--red-color, #f44336)",
    "var(--teal-color, #009688)",
    "var(--amber-color, #ffc107)",
    "var(--indigo-color, #3f51b5)",
];
