/**
 * Reading a feed sensor's entries, in the shape the feedparser integration writes them: a list of objects with the
 * feed's own fields, of which the card uses `title`, `link`, `id` and `published` (or `updated`).
 */
import { SEEN_KEPT } from "./const";
import type { HassEntity, HomeAssistant } from "./hass";
import type { FeedConfig, FeedsCardConfig, Item } from "./types";

/** The feeds of a configuration as objects. One sensor may be written without a list around it. */
export function feedConfigs(entities: FeedsCardConfig["entities"] | string | undefined): FeedConfig[] {
    const list = typeof entities === "string" ? [entities] : Array.isArray(entities) ? entities : [];
    return list
        .map((entry) => (typeof entry === "string" ? { entity: entry } : entry))
        .filter((entry): entry is FeedConfig => typeof entry?.entity === "string" && entry.entity !== "");
}

/** The sensors whose attribute holds a list, the feeds a card can show. */
export function feedSensors(hass: HomeAssistant, attribute = "entries"): string[] {
    return Object.values(hass.states)
        .filter(
            (state): state is HassEntity => !!state && state.entity_id.startsWith("sensor.") && Array.isArray(state.attributes[attribute]),
        )
        .map((state) => state.entity_id)
        .sort();
}

const text = (value: unknown): string | undefined => (typeof value === "string" && value.trim() ? value.trim() : undefined);

/**
 * An entry's date in milliseconds, from epoch seconds or milliseconds, or a date string with its year in it, such as ISO
 * 8601 or the RFC 822 dates of RSS. A string without a four-digit year is left unread: feedparser's default format has
 * none, and the browser would give it a year of its own choosing (2001 in Chrome).
 */
export function parseTime(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        return value < 1e12 ? value * 1000 : value;
    }
    const string = text(value);
    if (!string) {
        return undefined;
    }
    if (/^\d+(\.\d+)?$/.test(string)) {
        return parseTime(Number(string));
    }
    if (!/(^|\D)\d{4}(\D|$)/.test(string)) {
        return undefined;
    }
    const time = Date.parse(string);
    return Number.isNaN(time) ? undefined : time;
}

/** The link when it is an absolute http or https address. A feed is outside data, and any other, such as `javascript:`, could run. */
function webLink(link: string | undefined): string | undefined {
    try {
        const protocol = link ? new URL(link).protocol : "";
        return protocol === "http:" || protocol === "https:" ? link : undefined;
    } catch {
        return undefined;
    }
}

/**
 * The feed's items, newest first when every one has a date and in the feed's own order otherwise, or undefined when the
 * sensor has no list of entries (it is missing, unavailable or not a feed). An entry with neither a title nor a link is
 * left out, and so is a second entry with the same key.
 */
export function readItems(state: HassEntity | undefined, attribute = "entries"): Item[] | undefined {
    const entries = state?.attributes[attribute];
    if (!Array.isArray(entries)) {
        return undefined;
    }
    const items: Item[] = [];
    const keys = new Set<string>();
    for (const entry of entries) {
        if (entry === null || typeof entry !== "object") {
            continue;
        }
        const fields = entry as Record<string, unknown>;
        const raw = text(fields.link);
        const title = text(fields.title) ?? raw;
        const key = text(fields.id) ?? raw ?? title;
        if (!title || !key || keys.has(key)) {
            continue;
        }
        keys.add(key);
        items.push({ key, title, link: webLink(raw), time: parseTime(fields.published) ?? parseTime(fields.updated) });
    }
    if (items.every((item) => item.time !== undefined)) {
        items.sort((a, b) => b.time! - a.time!);
    }
    return items;
}

/**
 * The seen keys to store for a feed: those of its current items that are seen, in the feed's order, then the latest of
 * those that have left it, up to `SEEN_KEPT` in all.
 */
export function keptSeen(stored: readonly string[], seen: ReadonlySet<string>, current: readonly Item[]): string[] {
    const inFeed = new Set(current.map((item) => item.key));
    const gone = stored.filter((key) => !inFeed.has(key));
    return [...current.filter((item) => seen.has(item.key)).map((item) => item.key), ...gone].slice(0, SEEN_KEPT);
}
