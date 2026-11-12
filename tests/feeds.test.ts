import { describe, expect, it } from "vitest";

import { SEEN_KEPT } from "../src/const";
import { feedConfigs, keptSeen, parseTime, readItems } from "../src/feeds";
import type { HassEntity } from "../src/hass";
import type { Item } from "../src/types";

function sensor(entries: unknown, attribute = "entries"): HassEntity {
    return { entity_id: "sensor.example_news", state: "3", last_changed: "", attributes: { [attribute]: entries } };
}

describe("parseTime", () => {
    it("reads ISO 8601 and the RFC 822 dates of RSS", () => {
        expect(parseTime("2026-10-21T10:06:08+03:00")).toBe(Date.UTC(2026, 9, 21, 7, 6, 8));
        expect(parseTime("2026-10-21T10:06:08+0300")).toBe(Date.UTC(2026, 9, 21, 7, 6, 8));
        expect(parseTime("Wed, 21 Oct 2026 07:06:08 GMT")).toBe(Date.UTC(2026, 9, 21, 7, 6, 8));
        expect(parseTime("Wed, 21 Oct 2026 10:06:08 +0300")).toBe(Date.UTC(2026, 9, 21, 7, 6, 8));
    });

    it("reads epoch seconds and milliseconds, as numbers or strings", () => {
        expect(parseTime(1792566368)).toBe(1792566368000);
        expect(parseTime(1792566368000)).toBe(1792566368000);
        expect(parseTime("1792566368")).toBe(1792566368000);
    });

    // feedparser's default date_format, which a browser would read as a day in 2001.
    it("leaves a date without a year unread", () => {
        expect(parseTime("Wed, Oct 21 07:06 AM")).toBeUndefined();
    });

    it("leaves what isn't a date unread", () => {
        expect(parseTime("")).toBeUndefined();
        expect(parseTime(null)).toBeUndefined();
        expect(parseTime(-5)).toBeUndefined();
    });
});

describe("readItems", () => {
    it("is undefined for a sensor without a list of entries", () => {
        expect(readItems(undefined)).toBeUndefined();
        expect(readItems(sensor("not a list"))).toBeUndefined();
    });

    it("keeps a link only when it is an http or https address", () => {
        const items = readItems(
            sensor([
                { id: "a", title: "Script", link: "javascript:alert(1)" },
                { id: "b", title: "Relative", link: "/news/2" },
                { id: "c", title: "Web", link: "http://example.com/3" },
            ]),
        );
        expect(items?.map((item) => item.link)).toEqual([undefined, undefined, "http://example.com/3"]);
    });

    it("keys an entry by its id, else its link, else its title", () => {
        const items = readItems(
            sensor([
                { id: "a1", title: "With an id", link: "https://example.com/1" },
                { title: "With a link", link: "https://example.com/2" },
                { title: "With a title only" },
            ]),
        );
        expect(items?.map((item) => item.key)).toEqual(["a1", "https://example.com/2", "With a title only"]);
    });

    it("leaves out entries with neither a title nor a link, and a second one with the same key", () => {
        const items = readItems(sensor([{ id: "x" }, null, "text", { id: "a", title: "First" }, { id: "a", title: "Again" }]));
        expect(items?.map((item) => item.title)).toEqual(["First"]);
    });

    it("titles an entry without a title by its link", () => {
        expect(readItems(sensor([{ link: "https://example.com/3" }]))?.[0].title).toBe("https://example.com/3");
    });

    it("puts the items newest first when every one has a date", () => {
        const items = readItems(
            sensor([
                { title: "Old", published: "2026-09-01T12:00:00Z" },
                { title: "New", published: "2026-10-01T12:00:00Z" },
                { title: "Updated", updated: "2026-09-15T12:00:00Z" },
            ]),
        );
        expect(items?.map((item) => item.title)).toEqual(["New", "Updated", "Old"]);
    });

    it("keeps the feed's own order when a date is missing", () => {
        const items = readItems(
            sensor([
                { title: "Old", published: "2026-09-01T12:00:00Z" },
                { title: "Undated", published: "Wed, Oct 21 07:06 AM" },
                { title: "New", published: "2026-10-01T12:00:00Z" },
            ]),
        );
        expect(items?.map((item) => item.title)).toEqual(["Old", "Undated", "New"]);
    });

    it("reads another attribute when told to", () => {
        expect(readItems(sensor([{ title: "Elsewhere" }], "items"), "items")?.[0].title).toBe("Elsewhere");
    });
});

describe("keptSeen", () => {
    const items = (keys: string[]): Item[] => keys.map((key) => ({ key, title: key }));

    it("keeps the current seen items in the feed's order, then those that have left it", () => {
        expect(keptSeen(["gone", "b"], new Set(["gone", "b", "a"]), items(["a", "b", "c"]))).toEqual(["a", "b", "gone"]);
    });

    it("keeps no more than its limit, dropping the oldest of those that have left", () => {
        const stored = Array.from({ length: SEEN_KEPT + 10 }, (_, i) => `old${i}`);
        const kept = keptSeen(stored, new Set([...stored, "a"]), items(["a"]));
        expect(kept).toHaveLength(SEEN_KEPT);
        expect(kept[0]).toBe("a");
        expect(kept.at(-1)).toBe(`old${SEEN_KEPT - 2}`);
    });
});

describe("feedConfigs", () => {
    it("takes plain entity ids, objects and one id without a list", () => {
        expect(feedConfigs(["sensor.a", { entity: "sensor.b", name: "B" }])).toEqual([
            { entity: "sensor.a" },
            { entity: "sensor.b", name: "B" },
        ]);
        expect(feedConfigs("sensor.a")).toEqual([{ entity: "sensor.a" }]);
        expect(feedConfigs(undefined)).toEqual([]);
    });
});
