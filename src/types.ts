import type { LovelaceCardConfig } from "./hass";
import type { RowStepConfig } from "./rows";

/** One feed of the card: a sensor with a list of entries, and how it is shown. */
export interface FeedConfig {
    entity: string;
    /** Replaces the sensor's own name. */
    name?: string;
    /** The feed's colour, any CSS colour. */
    color?: string;
}

export type MarkMode = "auto" | "manual";

export interface FeedsCardConfig extends LovelaceCardConfig, RowStepConfig {
    /** Feed sensors, each a list of its own: an entity id, or one with its name and colour. */
    entities: Array<string | FeedConfig>;
    title?: string;
    /** An icon before the title. */
    icon?: string;
    /** `auto`: an item is seen once it has been on screen for a moment. `manual`: a button marks it read. */
    mark?: MarkMode;
    /** How many items a feed's list shows before the rest go behind a button. */
    items?: number;
    /** The sensor's attribute that holds the entries. */
    attribute?: string;
}

/** A feed as the card shows it, with its settings filled in. */
export interface Feed {
    entity: string;
    name: string;
    color: string;
    /** The feed's items, newest first, or undefined while its sensor has no list of entries. */
    items?: Item[];
}

/** One entry of a feed. */
export interface Item {
    /** Unique within its feed: the entry's id, else its link, else its title. */
    key: string;
    title: string;
    link?: string;
    /** Milliseconds since the epoch, when the entry has a date the card can read. */
    time?: number;
}
