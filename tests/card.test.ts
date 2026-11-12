import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SAVE_DELAY_MS, STORE_PREFIX } from "../src/const";
import "../src/feeds-card";
import type { FeedsCard } from "../src/feeds-card";
import type { HassEntity, HomeAssistant } from "../src/hass";
import type { FeedsCardConfig } from "../src/types";

/** A feed sensor in feedparser's shape: the entries newest first, with ISO dates. */
function feed(entityId: string, name: string, entries: Array<[string, string]>): HassEntity {
    return {
        entity_id: entityId,
        state: String(entries.length),
        last_changed: "",
        attributes: {
            friendly_name: name,
            entries: entries.map(([id, date]) => ({ id, title: `Title ${id}`, link: `https://example.com/${id}`, published: date })),
        },
    };
}

/** Home Assistant with the user's store in memory, answering the card's subscriptions and writes as core does. */
function fakeHass(states: HassEntity[], stored: Record<string, unknown> = {}) {
    const data: Record<string, unknown> = { ...stored };
    const listeners = new Map<string, Array<(message: { value: unknown }) => void>>();
    const writes: Array<{ key: string; value: unknown }> = [];
    const hass: HomeAssistant = {
        states: Object.fromEntries(states.map((s) => [s.entity_id, s])),
        language: "en",
        connection: {
            subscribeMessage: <T>(callback: (message: T) => void, message: Record<string, unknown>) => {
                const key = message.key as string;
                const own = callback as unknown as (message: { value: unknown }) => void;
                listeners.set(key, [...(listeners.get(key) ?? []), own]);
                own({ value: data[key] ?? null });
                return Promise.resolve(async () => {
                    listeners.set(
                        key,
                        (listeners.get(key) ?? []).filter((l) => l !== own),
                    );
                });
            },
        },
        callWS: async <T>(message: Record<string, unknown>) => {
            const key = message.key as string;
            data[key] = message.value;
            writes.push({ key, value: message.value });
            for (const listener of listeners.get(key) ?? []) {
                listener({ value: message.value });
            }
            return undefined as T;
        },
    };
    return { hass, data, writes };
}

async function card(hass: HomeAssistant, config: Partial<FeedsCardConfig> = {}): Promise<FeedsCard> {
    const element = document.createElement("feeds-card") as FeedsCard;
    element.setConfig({ type: "custom:feeds-card", entities: ["sensor.warnings", "sensor.bulletins"], ...config });
    element.hass = hass;
    document.body.append(element);
    await settle(element);
    return element;
}

/** Lets the card update until it stops asking, as reading the store asks for another update. */
async function settle(element: FeedsCard): Promise<void> {
    for (let i = 0; i < 5; i++) {
        await element.updateComplete;
    }
}

function root(element: FeedsCard): ShadowRoot {
    return element.shadowRoot!;
}

/** The titles in the open section. */
function openTitles(element: FeedsCard): string[] {
    return [...root(element).querySelectorAll(".fold.open .item .title")].map((t) => t.textContent?.trim() ?? "");
}

function lines(element: FeedsCard): string[] {
    return [...root(element).querySelectorAll(".line")].map((l) => l.textContent?.replace(/\s+/g, " ").trim() ?? "");
}

const WARNINGS = feed("sensor.warnings", "Warnings", [
    ["w2", "2026-10-01T09:00:00Z"],
    ["w1", "2025-09-09T08:00:00Z"],
]);
const BULLETINS = feed("sensor.bulletins", "Bulletins", [
    ["b3", "2026-10-21T07:00:00Z"],
    ["b2", "2026-10-14T18:00:00Z"],
    ["b1", "2026-10-13T18:00:00Z"],
]);

beforeEach(() => {
    document.body.innerHTML = "";
});

afterEach(() => {
    vi.useRealTimers();
});

describe("a user's first load", () => {
    it("takes every item as seen, so nothing is new and every feed is folded", async () => {
        vi.useFakeTimers();
        const { hass, data } = fakeHass([WARNINGS, BULLETINS]);
        const element = await card(hass);
        expect(lines(element)[0]).toBe("Nothing new. Latest 10/21");
        expect(root(element).querySelectorAll(".fold.open")).toHaveLength(0);
        vi.advanceTimersByTime(SAVE_DELAY_MS);
        expect(data[`${STORE_PREFIX}sensor.warnings`]).toEqual(["w2", "w1"]);
        expect(data[`${STORE_PREFIX}sensor.bulletins`]).toEqual(["b3", "b2", "b1"]);
    });
});

describe("the unseen list", () => {
    const stored = { [`${STORE_PREFIX}sensor.warnings`]: ["w1"], [`${STORE_PREFIX}sensor.bulletins`]: ["b1"] };

    it("gathers the unseen items of every feed, newest first, and is the open section", async () => {
        const { hass } = fakeHass([WARNINGS, BULLETINS], stored);
        const element = await card(hass);
        expect(lines(element)[0]).toBe("3 new");
        expect(openTitles(element)).toEqual(["Title b3", "Title b2", "Title w2"]);
        expect([...root(element).querySelectorAll(".fold.open .from")].map((f) => f.textContent?.trim())).toEqual([
            "Bulletins",
            "Bulletins",
            "Warnings",
        ]);
    });

    it("leaves the unseen items out of their feeds' lists, and counts them on the feed's line", async () => {
        const { hass } = fakeHass([WARNINGS, BULLETINS], stored);
        const element = await card(hass);
        expect(lines(element)).toContain("Bulletins 1 · 2 new");
        root(element).querySelectorAll<HTMLButtonElement>(".line.feed .switch")[1].click();
        await settle(element);
        expect(openTitles(element)).toEqual(["Title b1"]);
    });

    it("shows a year only on an item from another year", async () => {
        const { hass } = fakeHass([WARNINGS, BULLETINS], {
            [`${STORE_PREFIX}sensor.bulletins`]: [],
            [`${STORE_PREFIX}sensor.warnings`]: [],
        });
        vi.useFakeTimers({ now: Date.UTC(2026, 10, 12), toFake: ["Date"] });
        const element = await card(hass);
        const years = [...root(element).querySelectorAll(".fold.open .item")].map((i) => i.querySelector(".year")?.textContent ?? "");
        expect(years).toEqual(["", "", "", "", "2025"]);
    });
});

describe("one section open at a time", () => {
    it("folds the open section when another opens, and all of them when the open one is tapped", async () => {
        const { hass } = fakeHass([WARNINGS, BULLETINS], {
            [`${STORE_PREFIX}sensor.warnings`]: [],
            [`${STORE_PREFIX}sensor.bulletins`]: ["b1", "b2", "b3"],
        });
        const element = await card(hass);
        const switches = () => root(element).querySelectorAll<HTMLButtonElement>(".switch");
        expect(openTitles(element)).toEqual(["Title w2", "Title w1"]);
        switches()[2].click();
        await settle(element);
        expect(openTitles(element)).toEqual(["Title b3", "Title b2", "Title b1"]);
        expect(root(element).querySelectorAll(".fold.open")).toHaveLength(1);
        switches()[2].click();
        await settle(element);
        expect(root(element).querySelectorAll(".fold.open")).toHaveLength(0);
    });

    it("puts the rest of a long feed behind a button", async () => {
        const { hass } = fakeHass([WARNINGS, BULLETINS], {
            [`${STORE_PREFIX}sensor.warnings`]: ["w1", "w2"],
            [`${STORE_PREFIX}sensor.bulletins`]: ["b1", "b2", "b3"],
        });
        const element = await card(hass, { items: 2 });
        root(element).querySelectorAll<HTMLButtonElement>(".switch")[1].click();
        await settle(element);
        expect(openTitles(element)).toEqual(["Title b3", "Title b2"]);
        root(element).querySelector<HTMLButtonElement>(".fold.open .more")!.click();
        await settle(element);
        expect(openTitles(element)).toEqual(["Title b3", "Title b2", "Title b1"]);
    });
});

describe("marking by hand", () => {
    const stored = { [`${STORE_PREFIX}sensor.warnings`]: ["w1"], [`${STORE_PREFIX}sensor.bulletins`]: ["b1"] };

    it("moves an item to its feed at once, and saves it a moment later", async () => {
        vi.useFakeTimers();
        const { hass, data } = fakeHass([WARNINGS, BULLETINS], stored);
        const element = await card(hass, { mark: "manual" });
        root(element).querySelector<HTMLButtonElement>(".fold.open .item .mark")!.click();
        await settle(element);
        expect(openTitles(element)).toEqual(["Title b2", "Title w2"]);
        expect(data[`${STORE_PREFIX}sensor.bulletins`]).toEqual(["b1"]);
        vi.advanceTimersByTime(SAVE_DELAY_MS);
        expect(data[`${STORE_PREFIX}sensor.bulletins`]).toEqual(["b3", "b1"]);
    });

    it("marks every item read in one write per feed, and folds everything when nothing is left", async () => {
        vi.useFakeTimers();
        const { hass, writes } = fakeHass([WARNINGS, BULLETINS], stored);
        const element = await card(hass, { mark: "manual" });
        root(element).querySelector<HTMLButtonElement>(".mark-all")!.click();
        vi.advanceTimersByTime(SAVE_DELAY_MS);
        await settle(element);
        expect(writes.map((w) => w.key).sort()).toEqual([`${STORE_PREFIX}sensor.bulletins`, `${STORE_PREFIX}sensor.warnings`]);
        expect(lines(element)[0]).toBe("Nothing new. Latest 10/21");
        expect(root(element).querySelectorAll(".fold.open")).toHaveLength(0);
    });
});

describe("the automatic mode", () => {
    const stored = { [`${STORE_PREFIX}sensor.warnings`]: ["w1", "w2"], [`${STORE_PREFIX}sensor.bulletins`]: ["b1", "b2"] };

    it("keeps an item marked by opening its link in the unseen list, as seen, until the next load", async () => {
        vi.useFakeTimers();
        const { hass } = fakeHass([WARNINGS, BULLETINS], stored);
        const element = await card(hass);
        const link = root(element).querySelector<HTMLAnchorElement>(".fold.open .item a.title")!;
        link.addEventListener("click", (event) => event.preventDefault());
        link.click();
        vi.advanceTimersByTime(SAVE_DELAY_MS);
        await settle(element);
        expect(openTitles(element)).toEqual(["Title b3"]);
        expect(root(element).querySelector(".fold.open .item")!.classList.contains("seen")).toBe(true);

        element.remove();
        document.body.append(element);
        await settle(element);
        expect(lines(element)[0]).toBe("Nothing new. Latest 10/21");
    });

    it("brings a new item into the unseen list while the card is open", async () => {
        const { hass } = fakeHass([WARNINGS, BULLETINS], { ...stored, [`${STORE_PREFIX}sensor.bulletins`]: ["b1", "b2", "b3"] });
        const element = await card(hass);
        expect(lines(element)[0]).toBe("Nothing new. Latest 10/21");
        const newer = feed("sensor.bulletins", "Bulletins", [
            ["b4", "2026-11-01T07:00:00Z"],
            ...([["b3", "2026-10-21T07:00:00Z"]] as Array<[string, string]>),
        ]);
        element.hass = { ...hass, states: { ...hass.states, "sensor.bulletins": newer } };
        await settle(element);
        expect(lines(element)[0]).toBe("1 new");
        expect(openTitles(element)).toEqual(["Title b4"]);
    });
});

describe("the configuration", () => {
    it("needs at least one feed", () => {
        const element = document.createElement("feeds-card") as FeedsCard;
        expect(() => element.setConfig({ type: "custom:feeds-card", entities: [] })).toThrow();
        expect(() => element.setConfig({ type: "custom:feeds-card", entities: ["sensor.a"], mark: "never" as "auto" })).toThrow();
        expect(() => element.setConfig({ type: "custom:feeds-card", entities: ["sensor.a"], items: 0 })).toThrow();
    });

    it("says a feed's sensor is unavailable when it has no entries", async () => {
        const { hass } = fakeHass([WARNINGS]);
        const element = await card(hass);
        expect(lines(element)).toContain("sensor.bulletins Unavailable");
    });
});
