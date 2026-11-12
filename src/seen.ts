/**
 * What the user has seen, per feed, kept in Home Assistant's own store for the user (`frontend/*_user_data`), so it
 * follows the user from one device to another. Each feed sensor has a key of its own, holding the seen items' keys.
 * A key that has never been written is null: the feed is new to the user, and the card takes its baseline.
 */
import { SAVE_DELAY_MS, STORE_PREFIX } from "./const";
import { keptSeen } from "./feeds";
import type { HomeAssistant } from "./hass";
import type { Item } from "./types";

interface Subscription {
    live: boolean;
    unsubscribe?: Promise<() => Promise<void>>;
}

export class SeenStore {
    /** Each followed feed's stored keys: null for none ever stored, missing until the store has answered. */
    private readonly stored = new Map<string, string[] | null>();
    /** Each followed feed's subscription, live until it is let go, as an answer can still arrive after that. */
    private readonly subscriptions = new Map<string, Subscription>();
    /** Marks not yet written, with the feed's items to keep them in order. */
    private readonly pending = new Map<string, { keys: Set<string>; items: readonly Item[] }>();
    private timer?: number;
    private hass?: HomeAssistant;

    constructor(private readonly changed: () => void) {}

    /** Follows these feeds' keys, and lets go of any others. */
    public follow(hass: HomeAssistant, entities: readonly string[]): void {
        this.hass = hass;
        const connection = hass.connection;
        if (!connection) {
            return;
        }
        for (const entity of entities) {
            if (this.subscriptions.has(entity)) {
                continue;
            }
            // In the map before subscribing, as the first answer can come at once.
            const subscription: Subscription = { live: true };
            this.subscriptions.set(entity, subscription);
            subscription.unsubscribe = connection.subscribeMessage<{ value: unknown }>(
                ({ value }) => {
                    if (!subscription.live) {
                        return;
                    }
                    this.stored.set(entity, Array.isArray(value) ? value.filter((key): key is string => typeof key === "string") : null);
                    this.changed();
                },
                { type: "frontend/subscribe_user_data", key: STORE_PREFIX + entity },
            );
            // A failed subscription (an older Home Assistant, a dropped connection) leaves the feed unloaded, and nothing is marked.
            subscription.unsubscribe.catch((error: unknown) => console.warn("feeds-card: no stored seen items for", entity, error));
        }
        for (const entity of [...this.subscriptions.keys()]) {
            if (!entities.includes(entity)) {
                this.release(entity);
            }
        }
    }

    /** Writes what is pending and lets go of every feed. */
    public close(): void {
        for (const entity of [...this.subscriptions.keys()]) {
            this.release(entity);
        }
    }

    /** The feed's seen keys, marks not yet written included, or undefined while the store hasn't answered. */
    public seen(entity: string): Set<string> | undefined {
        const stored = this.stored.get(entity);
        if (stored === undefined) {
            return undefined;
        }
        return new Set([...(stored ?? []), ...(this.pending.get(entity)?.keys ?? [])]);
    }

    /** Whether the user has never had anything stored for the feed. */
    public isNew(entity: string): boolean {
        return this.stored.get(entity) === null && !this.pending.has(entity);
    }

    /** Marks the items seen, written to Home Assistant a moment later together with any other marks. */
    public mark(entity: string, keys: Iterable<string>, items: readonly Item[]): void {
        const pending = this.pending.get(entity) ?? { keys: new Set<string>(), items };
        for (const key of keys) {
            pending.keys.add(key);
        }
        pending.items = items;
        this.pending.set(entity, pending);
        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(() => this.save(), SAVE_DELAY_MS);
        this.changed();
    }

    private save(): void {
        window.clearTimeout(this.timer);
        this.timer = undefined;
        const callWS = this.hass?.callWS?.bind(this.hass);
        for (const [entity, { keys, items }] of this.pending) {
            const stored = this.stored.get(entity) ?? [];
            const value = keptSeen(stored, new Set([...stored, ...keys]), items);
            // The store's answer to the write comes back through the subscription. Until then, the card's own copy holds it.
            this.stored.set(entity, value);
            callWS?.({ type: "frontend/set_user_data", key: STORE_PREFIX + entity, value }).catch((error: unknown) =>
                console.warn("feeds-card: seen items not saved for", entity, error),
            );
        }
        this.pending.clear();
    }

    /** Writes the feed's pending marks, which merge with what is stored, before letting go of both. */
    private release(entity: string): void {
        if (this.pending.has(entity)) {
            this.save();
        }
        const subscription = this.subscriptions.get(entity);
        this.subscriptions.delete(entity);
        this.stored.delete(entity);
        if (subscription) {
            subscription.live = false;
            subscription.unsubscribe?.then((unsubscribe) => unsubscribe()).catch(() => undefined);
        }
    }
}
