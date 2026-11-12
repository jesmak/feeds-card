/**
 * The card's visual editor: the title and its icon, the feeds with their names and colours, how items are marked seen,
 * how many items a feed's list shows, the attribute holding the entries, and how the card rounds its height to the rows of
 * a sections view. Its height mode is set in YAML only.
 */
import { LitElement, css, html, nothing } from "lit";
import type { CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { DEFAULT_ITEMS } from "./const";
import { feedConfigs, feedSensors } from "./feeds";
import type { HomeAssistant } from "./hass";
import { browserLanguage, translate } from "./localize/localize";
import { rowStepData, rowStepSchema, tidyRowStep } from "./rows";
import type { FeedConfig, FeedsCardConfig } from "./types";

interface SchemaEntry {
    name: string;
}

const DEFAULTS: Record<string, unknown> = { mark: "auto", items: DEFAULT_ITEMS, attribute: "entries" };

/** The title and the feeds. A field inside the object selector takes its helper from `description`, as ha-form's computeHelper doesn't reach it. */
function feedsSchema(hass: HomeAssistant, attribute: string, text: (key: string) => string) {
    return [
        {
            type: "grid",
            name: "",
            schema: [
                { name: "title", selector: { text: {} } },
                { name: "icon", selector: { icon: {} } },
            ],
        },
        {
            name: "entities",
            required: true,
            selector: {
                object: {
                    multiple: true,
                    label_field: "entity",
                    description_field: "name",
                    fields: {
                        entity: {
                            label: text("editor.entity"),
                            required: true,
                            selector: { entity: { include_entities: feedSensors(hass, attribute) } },
                        },
                        name: { label: text("editor.name"), description: text("editor.name_helper"), selector: { text: {} } },
                        color: { label: text("editor.color"), description: text("editor.color_helper"), selector: { text: {} } },
                    },
                },
            },
        },
    ];
}

function optionsSchema(config: FeedsCardConfig, text: (key: string) => string) {
    return [
        {
            name: "mark",
            selector: {
                select: { mode: "dropdown", options: ["auto", "manual"].map((value) => ({ value, label: text(`editor.mark_${value}`) })) },
            },
        },
        {
            type: "grid",
            name: "",
            schema: [
                { name: "items", selector: { number: { min: 1, max: 100, step: 1, mode: "box" } } },
                { name: "attribute", selector: { text: {} } },
            ],
        },
        ...rowStepSchema(config, text),
    ];
}

/** The form's values: the config over the defaults, every feed as an object. An option left empty in YAML is null, and shows its default. */
export function formData(config: FeedsCardConfig): Record<string, unknown> {
    const set = Object.fromEntries(Object.entries(config).filter(([, value]) => value != null));
    return { ...DEFAULTS, ...set, entities: feedConfigs(config.entities) };
}

/** A feed with nothing but its sensor is written as the plain entity id, so the configuration stays short. */
export function compactFeeds(feeds: FeedConfig[]): Array<string | FeedConfig> {
    return feedConfigs(feeds).map((feed) => {
        const entry: FeedConfig = { entity: feed.entity };
        if (feed.name) {
            entry.name = feed.name;
        }
        if (feed.color) {
            entry.color = feed.color;
        }
        return entry.name || entry.color ? entry : entry.entity;
    });
}

/** The form's values as the card's configuration, with the feeds compacted and empty values and defaults left out. */
export function configFromForm(value: FeedsCardConfig): FeedsCardConfig {
    const config: FeedsCardConfig = tidyRowStep(value);
    config.entities = compactFeeds((config.entities ?? []) as FeedConfig[]);
    for (const key of ["title", "icon"]) {
        if (!config[key]) {
            delete config[key];
        }
    }
    for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
        if (config[key] === defaultValue || config[key] === undefined || config[key] === null || config[key] === "") {
            delete config[key];
        }
    }
    return config;
}

@customElement("feeds-card-editor")
export class FeedsCardEditor extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    @state() private config: FeedsCardConfig = { type: "custom:feeds-card", entities: [] };

    public setConfig(config: FeedsCardConfig): void {
        this.config = { ...config };
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass) {
            return nothing;
        }
        const data = formData(rowStepData(this.config));
        return html`
            <ha-form
                .hass=${this.hass}
                .data=${data}
                .schema=${feedsSchema(this.hass, this.config.attribute || "entries", (key) => this.text(key))}
                .computeLabel=${(entry: SchemaEntry) => this.text(`editor.${entry.name}`)}
                .computeHelper=${(entry: SchemaEntry) => this.helper(entry.name)}
                @value-changed=${this.valueChanged}
            ></ha-form>
            <p class="helper">${this.text("editor.entities_helper")}</p>
            <ha-form
                .hass=${this.hass}
                .data=${data}
                .schema=${optionsSchema(this.config, (key) => this.text(key))}
                .computeLabel=${(entry: SchemaEntry) => this.text(`editor.${entry.name}`)}
                .computeHelper=${(entry: SchemaEntry) => this.helper(entry.name)}
                @value-changed=${this.valueChanged}
            ></ha-form>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            .helper {
                margin: 8px 0 16px;
                padding: 0 16px;
                color: var(--secondary-text-color);
                font-size: 12px;
            }
        `;
    }

    private valueChanged(event: CustomEvent<{ value: FeedsCardConfig }>): void {
        const config = configFromForm({ ...this.config, ...event.detail.value });
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
    }

    private text(key: string): string {
        return translate(this.language(), key);
    }

    private helper(name: string): string | undefined {
        const key = `editor.${name}_helper`;
        const helper = translate(this.language(), key);
        return helper === key ? undefined : helper;
    }

    private language(): string {
        return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "feeds-card-editor": FeedsCardEditor;
    }
}
