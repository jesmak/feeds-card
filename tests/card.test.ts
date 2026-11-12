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

/**
 * Home Assistant with the user's store in memory, answering the card's subscriptions and writes as core does. With
 * `answer` false, the store holds its first answers back until `answerAll` sends them.
 */
function fakeHass(states: HassEntity[], stored: Record<string, unknown> = {}, { answer = true } = {}) {
    const data: Record<string, unknown> = { ...stored };
    const listeners = new Map<string, Array<(message: { value: unknown }) => void>>();
    const writes: Array<{ key: string; value: unknown }> = [];
    const held: Array<() => void> = [];
    const subscribed: string[] = [];
    const hass: HomeAssistant = {
        states: Object.fromEntries(states.map((s) => [s.entity_id, s])),
        language: "en",
        connection: {
            subscribeMessage: <T>(callback: (message: T) => void, message: Record<string, unknown>) => {
                const key = message.key as string;
                const own = callback as unknown as (message: { value: unknown }) => void;
                subscribed.push(key);
                listeners.set(key, [...(listeners.get(key) ?? []), own]);
                const first = () => own({ value: data[key] ?? null });
                if (answer) {
                    first();
                } else {
                    held.push(first);
                }
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
    const answerAll = () => held.splice(0).forEach((send) => send());
    return { hass, data, writes, subscribed, answerAll };
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

function pill(element: FeedsCard): string | undefined {
    return root(element).querySelector(".hd .pill")?.textContent?.trim();
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
        expect(pill(element)).toBe("3 new");
        expect(lines(element)[0]).toBe("New");
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
        expect(pill(element)).toBe("1 new");
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

    it("always has a title, its own or the default, and no pill while nothing is new", async () => {
        const { hass } = fakeHass([WARNINGS, BULLETINS]);
        const element = await card(hass);
        expect(root(element).querySelector(".hd-title")?.textContent).toBe("Feeds");
        expect(pill(element)).toBeUndefined();
        element.setConfig({ type: "custom:feeds-card", entities: ["sensor.warnings"], title: "Security" });
        await settle(element);
        expect(root(element).querySelector(".hd-title")?.textContent).toBe("Security");
    });

    it("says a feed's sensor is unavailable when it has no entries", async () => {
        const { hass } = fakeHass([WARNINGS]);
        const element = await card(hass);
        expect(lines(element)).toContain("sensor.bulletins Unavailable");
    });
});

/** Stands in for the browser's IntersectionObserver, which happy-dom lacks: a test says how much of an element shows. */
class FakeObserver {
    static last?: FakeObserver;
    readonly observed = new Set<Element>();

    constructor(private readonly callback: (entries: Array<{ target: Element; intersectionRatio: number }>) => void) {
        FakeObserver.last = this;
    }

    observe(element: Element): void {
        this.observed.add(element);
    }

    unobserve(element: Element): void {
        this.observed.delete(element);
    }

    disconnect(): void {
        this.observed.clear();
    }

    show(element: Element, ratio: number): void {
        this.callback([{ target: element, intersectionRatio: ratio }]);
    }
}

describe("marking items seen on screen", () => {
    const stored = { [`${STORE_PREFIX}sensor.warnings`]: ["w1", "w2"], [`${STORE_PREFIX}sensor.bulletins`]: ["b1", "b2"] };

    beforeEach(() => {
        vi.stubGlobal("IntersectionObserver", FakeObserver);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        FakeObserver.last = undefined;
    });

    const newItem = (element: FeedsCard) => root(element).querySelector<HTMLElement>(".fold.open .item.new")!;

    it("marks an item seen once most of it has been on screen for a second and a half, and keeps it in the list", async () => {
        const { hass, data } = fakeHass([WARNINGS, BULLETINS], stored);
        const element = await card(hass);
        const item = newItem(element);
        expect(FakeObserver.last?.observed.has(item)).toBe(true);

        FakeObserver.last!.show(item, 0.7);
        vi.advanceTimersByTime(1499);
        await settle(element);
        expect(item.classList.contains("seen")).toBe(false);

        vi.advanceTimersByTime(1);
        await settle(element);
        expect(newItem(element).classList.contains("seen")).toBe(true);
        expect(openTitles(element)).toEqual(["Title b3"]);
        vi.advanceTimersByTime(SAVE_DELAY_MS);
        expect(data[`${STORE_PREFIX}sensor.bulletins`]).toEqual(["b3", "b2", "b1"]);
    });

    it("doesn't mark an item that leaves the screen too soon, or one that barely shows", async () => {
        const { hass, writes } = fakeHass([WARNINGS, BULLETINS], stored);
        const element = await card(hass);
        const item = newItem(element);
        FakeObserver.last!.show(item, 0.7);
        vi.advanceTimersByTime(1000);
        FakeObserver.last!.show(item, 0.2);
        vi.advanceTimersByTime(5000);
        FakeObserver.last!.show(item, 0.5);
        vi.advanceTimersByTime(5000);
        await settle(element);
        expect(newItem(element).classList.contains("seen")).toBe(false);
        expect(writes).toEqual([]);
    });

    it("doesn't mark an item while the page is hidden", async () => {
        const { hass, writes } = fakeHass([WARNINGS, BULLETINS], stored);
        const element = await card(hass);
        vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
        FakeObserver.last!.show(newItem(element), 1);
        vi.advanceTimersByTime(1500 + SAVE_DELAY_MS);
        await settle(element);
        expect(newItem(element).classList.contains("seen")).toBe(false);
        expect(writes).toEqual([]);
    });
});

describe("the store", () => {
    it("shows nothing new until it has answered", async () => {
        vi.useFakeTimers();
        const { hass, writes, answerAll } = fakeHass(
            [WARNINGS, BULLETINS],
            { [`${STORE_PREFIX}sensor.bulletins`]: ["b1"] },
            { answer: false },
        );
        const element = await card(hass);
        expect(pill(element)).toBeUndefined();
        vi.advanceTimersByTime(SAVE_DELAY_MS);
        // Nor does it take a baseline for a feed it hasn't heard about.
        expect(writes).toEqual([]);

        answerAll();
        await settle(element);
        expect(pill(element)).toBe("2 new");
    });

    it("takes no baseline of a feed with no items", async () => {
        vi.useFakeTimers();
        const { hass, writes } = fakeHass([WARNINGS, feed("sensor.bulletins", "Bulletins", [])]);
        await card(hass);
        vi.advanceTimersByTime(SAVE_DELAY_MS);
        expect(writes.map((w) => w.key)).toEqual([`${STORE_PREFIX}sensor.warnings`]);
    });

    it("writes a feed's pending marks when the feed is taken out of the card", async () => {
        vi.useFakeTimers();
        const { hass, data } = fakeHass([WARNINGS, BULLETINS], {
            [`${STORE_PREFIX}sensor.warnings`]: ["w1", "w2"],
            [`${STORE_PREFIX}sensor.bulletins`]: ["b1"],
        });
        const element = await card(hass, { mark: "manual" });
        root(element).querySelector<HTMLButtonElement>(".fold.open .item .mark")!.click();
        element.setConfig({ type: "custom:feeds-card", entities: ["sensor.warnings"], mark: "manual" });
        await settle(element);
        vi.advanceTimersByTime(SAVE_DELAY_MS);
        expect(data[`${STORE_PREFIX}sensor.bulletins`]).toEqual(["b3", "b1"]);
    });

    it("doesn't subscribe again when an answer comes after the card was removed", async () => {
        const { hass, subscribed, answerAll } = fakeHass([WARNINGS, BULLETINS], {}, { answer: false });
        const element = await card(hass);
        expect(subscribed).toHaveLength(2);
        element.remove();
        answerAll();
        await settle(element);
        expect(subscribed).toHaveLength(2);
    });

    it("follows nothing while removed, even when it is handed a new hass", async () => {
        const { hass, subscribed } = fakeHass([WARNINGS, BULLETINS]);
        const element = await card(hass);
        element.remove();
        // A changed sensor, as an unchanged one doesn't update the card at all.
        element.hass = { ...hass, states: { ...hass.states, "sensor.warnings": { ...WARNINGS } } };
        await settle(element);
        expect(subscribed).toHaveLength(2);
    });
});

describe("opening a link", () => {
    const stored = { [`${STORE_PREFIX}sensor.warnings`]: ["w1", "w2"], [`${STORE_PREFIX}sensor.bulletins`]: ["b1", "b2"] };

    it("marks the item seen on a middle click, and not on a right click", async () => {
        vi.useFakeTimers();
        const { hass, data } = fakeHass([WARNINGS, BULLETINS], stored);
        const element = await card(hass, { mark: "manual" });
        const link = () => root(element).querySelector<HTMLAnchorElement>(".fold.open .item a.title")!;
        link().dispatchEvent(new MouseEvent("auxclick", { button: 2, bubbles: true }));
        vi.advanceTimersByTime(SAVE_DELAY_MS);
        expect(data[`${STORE_PREFIX}sensor.bulletins`]).toEqual(["b1", "b2"]);

        link().dispatchEvent(new MouseEvent("auxclick", { button: 1, bubbles: true }));
        vi.advanceTimersByTime(SAVE_DELAY_MS);
        expect(data[`${STORE_PREFIX}sensor.bulletins`]).toEqual(["b3", "b2", "b1"]);
    });
});

describe("the open section", () => {
    it("falls back to the new list when the open feed is taken out of the card", async () => {
        const { hass } = fakeHass([WARNINGS, BULLETINS], {
            [`${STORE_PREFIX}sensor.warnings`]: ["w1"],
            [`${STORE_PREFIX}sensor.bulletins`]: ["b1", "b2", "b3"],
        });
        const element = await card(hass);
        root(element).querySelectorAll<HTMLButtonElement>(".line.feed .switch")[1].click();
        await settle(element);
        expect(openTitles(element)).toEqual(["Title b3", "Title b2", "Title b1"]);
        element.setConfig({ type: "custom:feeds-card", entities: ["sensor.warnings"] });
        await settle(element);
        expect(openTitles(element)).toEqual(["Title w2"]);
    });
});
