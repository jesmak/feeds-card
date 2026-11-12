/** The little of Home Assistant a card needs, so the unmaintained custom-card-helpers isn't a dependency. */

export interface HassEntity {
    entity_id: string;
    state: string;
    last_changed: string;
    attributes: Record<string, unknown>;
}

/** One part of an entity's name, as `formatEntityName` puts them together. */
export interface NamePart {
    type: "entity" | "device" | "area" | "floor";
}

export interface Connection {
    subscribeMessage<T>(callback: (message: T) => void, message: Record<string, unknown>): Promise<() => Promise<void>>;
}

export interface HomeAssistant {
    states: Record<string, HassEntity | undefined>;
    language?: string;
    /** `time_zone` is the user's choice between the browser's zone and the server's. */
    locale?: { language?: string; time_zone?: "local" | "server" };
    config?: { time_zone?: string };
    connection?: Connection;
    callWS?<T>(message: Record<string, unknown>): Promise<T>;
    formatEntityName?(state: HassEntity, parts: NamePart[]): string;
}

export interface LovelaceCardConfig {
    type: string;
    [key: string]: unknown;
}
