/**
 * feeds-card: RSS and Atom feeds, each a list of its own, with the items the user hasn't seen gathered into one list
 * above them. What a user has seen is kept in Home Assistant per user, so it follows them from device to device. One
 * section is open at a time, and held to a height, the open one takes the room left and scrolls in it.
 *
 * An item is seen once it has been on screen for a moment (the automatic mode) or once it is marked read (the manual
 * mode), and in both once its link is opened. In the automatic mode a seen item stays in the unseen list, marked as seen,
 * until the card is next loaded, so the list doesn't move under the reader.
 */
import { LitElement, css, html, nothing } from "lit";
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { CARD_VERSION, DEFAULT_ITEMS, FEED_COLORS, SEEN_AFTER_MS, SEEN_RATIO } from "./const";
import "./editor";
import { ScrollFade, fadeStyles } from "./fade";
import { feedConfigs, feedSensors, readItems } from "./feeds";
import type { HomeAssistant } from "./hass";
import { gridMinRows, heightCardSize, heightStyle, validHeight } from "./height";
import { browserLanguage, translate } from "./localize/localize";
import { drawnScale, fillLimit, filledHeight, filledStyle, spareRoom, validRowStep } from "./rows";
import { SeenStore } from "./seen";
import type { Feed, FeedsCardConfig, Item } from "./types";

interface CardRegistration {
    type: string;
    name: string;
    description: string;
    documentationURL?: string;
    preview?: boolean;
}

/** The open section: the unseen list, a feed by its entity id, or none. */
type Section = string;
const UNSEEN = "unseen";
const NONE = "none";

/** An unseen item with the feed it came from. */
interface Unseen {
    feed: Feed;
    item: Item;
    /** Seen since the card was loaded, in the automatic mode, and kept in the list until the next load. */
    seen: boolean;
}

/**
 * The parts of a held card besides its first item: the header, the card's border, and per section line its 40 px and
 * the 1 px border above it.
 */
const HEADER_PX = 44;
const LINE_PX = 41;
const BORDER_PX = 2;
/** The first item of the open section with its padding, its title on two lines, and the room kept under the section. */
const FIRST_ITEM_PX = 64;

const px = (value: string) => parseFloat(value) || 0;

/** The list's own room at its top, above which the spare room of a filled row goes. */
const LIST_TOP_PX = 6;

/** The parts the card itself puts in its ha-card, one after another. */
const CARD_PARTS = [".hd", ".list"].map((part) => `:scope > ${part}`).join(", ");

/**
 * The list's height once its folds have slid open or shut, so the card is on its rows as a slide begins. A shut fold ends
 * at nothing, an open one at its content, measured from where its last part ends, as its box is clipped while it slides.
 * Drawn sizes are divided by the card's `scale`, as its paddings and margins are in the layout's pixels.
 */
export function listEndHeight(list: HTMLElement, scale = 1): number {
    const style = getComputedStyle(list);
    let height = px(style.paddingTop) + px(style.paddingBottom);
    for (const child of list.children) {
        const part = child as HTMLElement;
        const partStyle = getComputedStyle(part);
        const margins = px(partStyle.marginTop) + px(partStyle.marginBottom);
        if (!part.classList.contains("fold")) {
            height += margins + part.getBoundingClientRect().height / scale;
            continue;
        }
        const inner = part.firstElementChild as HTMLElement | null;
        const content = inner?.firstElementChild as HTMLElement | null;
        const last = content?.lastElementChild as HTMLElement | null;
        if (!part.classList.contains("open") || !content || !last) {
            continue;
        }
        const contentStyle = getComputedStyle(content);
        height +=
            margins +
            (last.getBoundingClientRect().bottom - content.getBoundingClientRect().top) / scale +
            px(getComputedStyle(last).marginBottom) +
            px(contentStyle.paddingBottom);
    }
    return height;
}

export class FeedsCard extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    /** "grid" in a sections view, where the card's rows are set in its layout tab. */
    @property({ attribute: false }) public layout?: string;
    @state() private config?: FeedsCardConfig;
    @state() private open?: Section;
    @state() private showAll = new Set<string>();
    /** While a fold slides, the rows the card fills follow it. */
    @state() private sliding = false;
    @state() private filled = 0;
    @state() private spare = 0;

    private feeds: Feed[] = [];
    private unseen: Unseen[] = [];
    private hadUnseen = false;
    /** Per feed, the keys of the items that were unseen when the card was loaded, or came in after it. */
    private readonly loaded = new Map<string, Set<string>>();
    private readonly store = new SeenStore(() => this.requestUpdate());
    private seenObserver?: IntersectionObserver;
    private readonly seenTimers = new Map<Element, number>();
    private resizes?: ResizeObserver;
    private frame?: number;
    private slideTimer?: number;

    constructor() {
        super();
        // Fades the edges of the open section while the card is held to a height and it scrolls.
        new ScrollFade(this, () => (this.heightStyle() ? this.renderRoot.querySelectorAll<HTMLElement>(".fold.open .scroll") : []));
    }

    public static getConfigElement(): HTMLElement {
        return document.createElement("feeds-card-editor");
    }

    public static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
        return { entities: hass ? feedSensors(hass).slice(0, 2) : [] };
    }

    public setConfig(config: FeedsCardConfig): void {
        if (!config || feedConfigs(config.entities).length === 0) {
            throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
        }
        if (config.mark != null && config.mark !== "auto" && config.mark !== "manual") {
            throw new Error(translate(browserLanguage(), "common.invalid_mark"));
        }
        if (config.items != null && !(Number.isInteger(config.items) && config.items > 0)) {
            throw new Error(translate(browserLanguage(), "common.invalid_items"));
        }
        if (!validHeight(config)) {
            throw new Error(translate(browserLanguage(), "common.invalid_height"));
        }
        if (!validRowStep(config)) {
            throw new Error(translate(browserLanguage(), "common.invalid_row_step"));
        }
        this.config = config;
    }

    public getCardSize(): number {
        return heightCardSize(this.config ?? {}, 1 + this.lineCount() + Math.min(this.unseen.length, 4), this.minimumHeight());
    }

    public getGridOptions(): Record<string, unknown> {
        return { columns: 12, min_columns: 6, rows: "auto", min_rows: gridMinRows(this.minimumHeight()) };
    }

    /** One line for the unseen list, whether it has items or says there are none, and one per feed. */
    private lineCount(): number {
        return 1 + feedConfigs(this.config?.entities).length;
    }

    /** Held to a height, the header, every section line and the first item of the open section still fit. From the config alone. */
    private minimumHeight(): number {
        const header = this.hasHeader() ? HEADER_PX : 0;
        return header + this.lineCount() * LINE_PX + FIRST_ITEM_PX + BORDER_PX;
    }

    private heightStyle(): string {
        return heightStyle(this.config ?? {}, this.layout, this.minimumHeight());
    }

    private mode(): "auto" | "manual" {
        return this.config?.mark === "manual" ? "manual" : "auto";
    }

    public connectedCallback(): void {
        super.connectedCallback();
        // Coming back is a new load: what was seen meanwhile leaves the unseen list.
        this.loaded.clear();
        this.open = undefined;
        this.resizes = new ResizeObserver(() => this.measureSoon());
        if (this.hasUpdated) {
            this.requestUpdate();
        }
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this.store.close();
        this.seenObserver?.disconnect();
        this.seenObserver = undefined;
        this.seenTimers.forEach((timer) => window.clearTimeout(timer));
        this.seenTimers.clear();
        window.clearTimeout(this.slideTimer);
        this.sliding = false;
        this.resizes?.disconnect();
        cancelAnimationFrame(this.frame ?? 0);
    }

    protected shouldUpdate(changed: PropertyValues): boolean {
        if (!this.config || !changed.has("hass") || changed.size > 1) {
            return true;
        }
        const previous = changed.get("hass") as HomeAssistant | undefined;
        if (!previous || !this.hass) {
            return true;
        }
        if ((previous.locale?.language ?? previous.language) !== (this.hass.locale?.language ?? this.hass.language)) {
            return true;
        }
        return feedConfigs(this.config.entities).some(({ entity }) => previous.states[entity] !== this.hass?.states[entity]);
    }

    /**
     * Reads the feeds and works out the unseen list. A feed the user has never had stored is taken as seen as it is, so the
     * list starts empty instead of holding the whole feed. Until the store answers, a feed has no unseen items.
     */
    protected willUpdate(): void {
        if (!this.hass || !this.config) {
            return;
        }
        const configs = feedConfigs(this.config.entities);
        this.store.follow(
            this.hass,
            configs.map((c) => c.entity),
        );
        this.feeds = configs.map((c, index) => {
            const state = this.hass?.states[c.entity];
            const name =
                c.name ||
                (state && this.hass?.formatEntityName?.(state, [{ type: "device" }, { type: "entity" }])) ||
                (state?.attributes.friendly_name as string | undefined) ||
                c.entity;
            return {
                entity: c.entity,
                name,
                color: c.color || FEED_COLORS[index % FEED_COLORS.length],
                items: readItems(state, this.config?.attribute),
            };
        });

        const manual = this.mode() === "manual";
        const unseen: Unseen[] = [];
        for (const feed of this.feeds) {
            const seen = this.store.seen(feed.entity);
            if (!feed.items || !seen) {
                continue;
            }
            if (this.store.isNew(feed.entity)) {
                if (feed.items.length > 0) {
                    this.store.mark(
                        feed.entity,
                        feed.items.map((item) => item.key),
                        feed.items,
                    );
                }
                continue;
            }
            const loaded = this.loaded.get(feed.entity) ?? new Set<string>();
            const keys = new Set(feed.items.map((item) => item.key));
            for (const key of loaded) {
                if (!keys.has(key)) {
                    loaded.delete(key);
                }
            }
            for (const item of feed.items) {
                if (!seen.has(item.key)) {
                    loaded.add(item.key);
                }
            }
            this.loaded.set(feed.entity, loaded);
            for (const item of feed.items) {
                if (loaded.has(item.key) && !(manual && seen.has(item.key))) {
                    unseen.push({ feed, item, seen: seen.has(item.key) });
                }
            }
        }
        // Newest first, those without a date after them in their feeds' order.
        this.unseen = unseen
            .map((entry, index) => ({ entry, index }))
            .sort((a, b) => (b.entry.item.time ?? -Infinity) - (a.entry.item.time ?? -Infinity) || a.index - b.index)
            .map(({ entry }) => entry);

        // The first unseen item to come in opens the list, whichever section was open. Later ones leave it be.
        if (!this.hadUnseen && this.unseen.length > 0) {
            this.open = undefined;
        }
        this.hadUnseen = this.unseen.length > 0;
    }

    protected updated(): void {
        if (!this.isConnected) {
            return;
        }
        const card = this.renderRoot.querySelector("ha-card");
        if (card) {
            this.resizes?.observe(card);
        }
        this.watchSeen();
        this.measureSoon();
    }

    private openSection(): Section {
        if (this.open === undefined || (this.open === UNSEEN && this.unseen.length === 0)) {
            return this.unseen.length > 0 ? UNSEEN : NONE;
        }
        return this.open;
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass || !this.config) {
            return nothing;
        }
        const open = this.openSection();
        const title = this.config.title;
        return html`
            <ha-card style=${this.cardStyle()} class=${this.cardClass()} @transitionend=${this.slid}>
                ${
                    title || this.config.icon
                        ? html`<div class="hd">
                              ${this.config.icon ? html`<ha-icon class="hd-icon" icon=${this.config.icon}></ha-icon>` : nothing}
                              ${title ? html`<div class="hd-title" title=${title}>${title}</div>` : nothing}
                          </div>`
                        : nothing
                }
                <div class="list">
                    ${
                        this.unseen.length > 0
                            ? html`${this.unseenLine(open === UNSEEN)}
                              ${this.fold(
                                  open === UNSEEN,
                                  html`<div class="scroll">
                                      ${repeat(
                                          this.unseen,
                                          (u) => `${u.feed.entity} ${u.item.key}`,
                                          (u) => this.itemRow(u.feed, u.item, { from: true, seen: u.seen }),
                                      )}
                                  </div>`,
                              )}`
                            : this.nothingNew()
                    }
                    ${this.feeds.map((feed) => this.feedSection(feed, open === feed.entity))}
                </div>
            </ha-card>
        `;
    }

    private unseenLine(isOpen: boolean): TemplateResult {
        const label = this.unseen.length === 1 ? this.text("common.unseen_one") : this.text("common.unseen", { n: this.unseen.length });
        const markAll =
            this.mode() === "manual"
                ? html`<button class="mark-all" @click=${this.markAll}>${this.text("common.mark_all")}</button>`
                : nothing;
        return html`<div class="line unseen">
            <button class="switch" aria-expanded=${isOpen ? "true" : "false"} @click=${() => this.switchTo(isOpen ? NONE : UNSEEN)}>
                <span class="label" title=${label}>${label}</span>
                <ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
            </button>
            ${markAll}
        </div>`;
    }

    /** In place of the unseen list while it is empty: the date of the newest item of all. */
    private nothingNew(): TemplateResult {
        const times = this.feeds.flatMap((feed) => feed.items ?? []).flatMap((item) => (item.time === undefined ? [] : [item.time]));
        const text = times.length
            ? this.text("common.nothing_new_latest", { date: this.shortDate(Math.max(...times)) })
            : this.text("common.nothing_new");
        return html`<div class="line none"><span class="label" title=${text}>${text}</span></div>`;
    }

    private feedSection(feed: Feed, isOpen: boolean): TemplateResult {
        const unseenKeys = new Set(this.unseen.filter((u) => u.feed === feed).map((u) => u.item.key));
        const items = (feed.items ?? []).filter((item) => !unseenKeys.has(item.key));
        const limit = this.config?.items ?? DEFAULT_ITEMS;
        const all = this.showAll.has(feed.entity);
        const shown = all ? items : items.slice(0, limit);
        const count = !feed.items
            ? this.text("common.unavailable")
            : unseenKeys.size > 0
              ? this.text("common.count_unseen", { n: items.length, unseen: unseenKeys.size })
              : String(items.length);
        return html`
            <div class="line feed" style="--fc: ${feed.color}">
                <button
                    class="switch"
                    aria-expanded=${isOpen ? "true" : "false"}
                    @click=${() => this.switchTo(isOpen ? NONE : feed.entity)}
                >
                    <span class="swatch"></span>
                    <span class="label" title=${feed.name}>${feed.name}</span>
                    <span class="count">${count}</span>
                    <ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
                </button>
            </div>
            ${this.fold(
                isOpen,
                html`<div class="scroll">
                    ${
                        items.length === 0
                            ? html`<div class="empty">
                                  ${this.text(!feed.items ? "common.no_entries" : unseenKeys.size > 0 ? "common.all_unseen" : "common.no_items")}
                              </div>`
                            : repeat(
                                  shown,
                                  (item) => item.key,
                                  (item) => this.itemRow(feed, item, { from: false, seen: true }),
                              )
                    }
                    ${
                        items.length > limit
                            ? html`<button class="more" @click=${() => this.toggleAll(feed.entity)}>
                                  ${all ? this.text("common.show_less") : this.text("common.show_all", { n: items.length })}
                              </button>`
                            : nothing
                    }
                </div>`,
            )}
        `;
    }

    private itemRow(feed: Feed, item: Item, { from, seen }: { from: boolean; seen: boolean }): TemplateResult {
        const classes = ["item", from && "new", from && seen && "seen"].filter(Boolean).join(" ");
        const title = item.link
            ? html`<a class="title" href=${item.link} target="_blank" rel="noreferrer" @click=${() => this.markSeen(feed, [item.key])}
                  >${item.title}</a
              >`
            : html`<span class="title">${item.title}</span>`;
        return html`<div class=${classes} style="--fc: ${feed.color}" data-feed=${feed.entity} data-key=${item.key}>
            ${this.badge(item.time)}
            <div class="body">
                ${from ? html`<div class="from"><span class="swatch"></span><span>${feed.name}</span></div>` : nothing} ${title}
            </div>
            ${
                from && this.mode() === "manual"
                    ? html`<button class="mark" title=${this.text("common.mark_read")} @click=${() => this.markSeen(feed, [item.key])}>
                          <ha-icon icon="mdi:check"></ha-icon>
                      </button>`
                    : nothing
            }
        </div>`;
    }

    /** The day large, the month under it, and the year only when it isn't this year's. */
    private badge(time: number | undefined): TemplateResult {
        if (time === undefined) {
            return html`<div class="badge"><div class="day">–</div></div>`;
        }
        const part = (options: Intl.DateTimeFormatOptions, date = new Date(time)) =>
            new Intl.DateTimeFormat(this.language(), { ...options, timeZone: this.timeZone() }).format(date);
        const year = part({ year: "numeric" });
        return html`<div class="badge" title=${this.longDate(time)}>
            <div class="day">${part({ day: "numeric" })}</div>
            <div class="month">${part({ month: "short" })}</div>
            ${year === part({ year: "numeric" }, new Date()) ? nothing : html`<div class="year">${year}</div>`}
        </div>`;
    }

    private shortDate(time: number): string {
        return new Intl.DateTimeFormat(this.language(), { day: "numeric", month: "numeric", timeZone: this.timeZone() }).format(
            new Date(time),
        );
    }

    private longDate(time: number): string {
        return new Intl.DateTimeFormat(this.language(), { dateStyle: "medium", timeStyle: "short", timeZone: this.timeZone() }).format(
            new Date(time),
        );
    }

    private timeZone(): string | undefined {
        return this.hass?.locale?.time_zone === "server" ? this.hass.config?.time_zone : undefined;
    }

    private markSeen(feed: Feed, keys: string[]): void {
        if (feed.items) {
            this.store.mark(feed.entity, keys, feed.items);
        }
    }

    private readonly markAll = (): void => {
        for (const feed of this.feeds) {
            const keys = this.unseen.filter((u) => u.feed === feed).map((u) => u.item.key);
            if (keys.length > 0) {
                this.markSeen(feed, keys);
            }
        }
    };

    private toggleAll(entity: string): void {
        const showAll = new Set(this.showAll);
        if (!showAll.delete(entity)) {
            showAll.add(entity);
        }
        this.showAll = showAll;
    }

    /**
     * In the automatic mode, an unseen item is seen once enough of it has been on screen long enough, while the page is in
     * view. An item scrolled away inside the card or in a shut section isn't on screen.
     */
    private watchSeen(): void {
        if (this.mode() !== "auto" || typeof IntersectionObserver === "undefined") {
            return;
        }
        this.seenObserver ??= new IntersectionObserver(
            (entries) => {
                for (const { target, intersectionRatio } of entries) {
                    const timer = this.seenTimers.get(target);
                    if (intersectionRatio >= SEEN_RATIO && timer === undefined) {
                        this.seenTimers.set(
                            target,
                            window.setTimeout(() => this.seenOnScreen(target as HTMLElement), SEEN_AFTER_MS),
                        );
                    } else if (intersectionRatio < SEEN_RATIO && timer !== undefined) {
                        window.clearTimeout(timer);
                        this.seenTimers.delete(target);
                    }
                }
            },
            { threshold: [0, SEEN_RATIO] },
        );
        for (const element of this.renderRoot.querySelectorAll(".item.new:not(.seen)")) {
            this.seenObserver.observe(element);
        }
    }

    private seenOnScreen(element: HTMLElement): void {
        this.seenTimers.delete(element);
        this.seenObserver?.unobserve(element);
        if (document.visibilityState !== "visible" || !element.isConnected) {
            // Not seen after all. Watched again from the start at the next render.
            this.requestUpdate();
            return;
        }
        const feed = this.feeds.find((f) => f.entity === element.dataset.feed);
        if (feed && element.dataset.key) {
            this.markSeen(feed, [element.dataset.key]);
        }
    }

    private switchTo(target: Section): void {
        this.open = target;
        this.sliding = true;
        window.clearTimeout(this.slideTimer);
        // The slide's end lifts it. Without a slide, as with reduced motion, there is no end to wait for.
        this.slideTimer = window.setTimeout(() => (this.sliding = false), 1000);
    }

    private readonly slid = (event: TransitionEvent): void => {
        const fold = event.target as HTMLElement;
        if (event.propertyName !== "grid-template-rows" || !fold.classList?.contains("fold")) {
            return;
        }
        // Another section may still be sliding, as one reversed halfway ends before the one opening beside it.
        const moving = [...this.renderRoot.querySelectorAll(".fold")].some((f) => f !== fold && (f.getAnimations?.().length ?? 0) > 0);
        if (!moving) {
            window.clearTimeout(this.slideTimer);
            this.sliding = false;
        }
    };

    /** Content that slides open and shut. A shut one stays in the page, so the change can be animated. */
    private fold(isOpen: boolean, content: TemplateResult): TemplateResult {
        return html`<div class="fold ${isOpen ? "open" : ""}" ?inert=${!isOpen}>
            <div class="fold-in">${content}</div>
        </div>`;
    }

    private measureSoon(): void {
        cancelAnimationFrame(this.frame ?? 0);
        this.frame = requestAnimationFrame(() => this.fillRows());
    }

    private fillRows(): void {
        const card = this.renderRoot.querySelector<HTMLElement>("ha-card");
        if (!card || !card.clientWidth) {
            return;
        }
        const limit = fillLimit(this.config ?? {}, this.layout, this.minimumHeight());
        if (!limit) {
            if (this.filled) this.filled = 0;
            if (this.spare) this.spare = 0;
            return;
        }
        const scale = drawnScale(card);
        // The card's parts one after another, never the card's own height, which is the min-height set here, and only its
        // own parts, never an element a theme adds to it. The list counts as its folds will end.
        const style = getComputedStyle(card);
        let content = px(style.borderTopWidth) + px(style.borderBottomWidth) + px(style.paddingTop) + px(style.paddingBottom);
        for (const part of card.querySelectorAll<HTMLElement>(CARD_PARTS)) {
            const partStyle = getComputedStyle(part);
            const height = part.classList.contains("list") ? listEndHeight(part, scale) : part.getBoundingClientRect().height / scale;
            content += px(partStyle.marginTop) + height + px(partStyle.marginBottom);
        }
        // The spare room as drawn now, which while a slide goes on is somewhere between the old and the new.
        const list = card.querySelector<HTMLElement>(":scope > .list");
        if (list) {
            const listStyle = getComputedStyle(list);
            content -= Math.max(0, px(listStyle.paddingTop) - LIST_TOP_PX) + px(listStyle.paddingBottom);
        }
        const filled = filledHeight(content, this.config ?? {}, limit);
        const spare = spareRoom(filled, content);
        if (filled !== this.filled) {
            this.filled = filled;
        }
        if (spare !== this.spare) {
            this.spare = spare;
        }
    }

    /**
     * The card's inline style: the height it is held to, or the rows it fills up to any limit, with their spare room under
     * the header, or with no header split above and below the list, as room on one side only looks misplaced.
     */
    private cardStyle(): string {
        const style = filledStyle(this.config ?? {}, this.layout, this.minimumHeight(), this.filled);
        if (!this.filled) {
            return style;
        }
        const top = this.hasHeader() ? this.spare : this.spare / 2;
        return `${style}; --fc-spare-top: ${top}px; --fc-spare-bottom: ${this.spare - top}px`;
    }

    private hasHeader(): boolean {
        return !!(this.config?.title || this.config?.icon);
    }

    private cardClass(): string {
        return [this.heightStyle() && "held", this.sliding && "sliding"].filter(Boolean).join(" ");
    }

    private text(key: string, values: Record<string, string | number> = {}): string {
        return Object.entries(values).reduce(
            (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
            translate(this.language(), key),
        );
    }

    private language(): string {
        return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
    }

    static get styles(): CSSResultGroup {
        return [
            css`
                /*
                 * A column, so that with a height of its own, given in the options or by the dashboard's grid, the
                 * title and the section lines keep their place and the open section scrolls in what is left.
                 */
                ha-card {
                    /* ha-card's own transition covers every property, so a change in the rows filled would animate. Only a slide does. */
                    transition: none;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    container-type: inline-size;
                }

                .hd {
                    flex: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px 0;
                    min-height: 32px;
                }

                .hd-icon {
                    flex: none;
                    color: var(--state-icon-color);
                }

                .hd-title {
                    flex: 1 1 auto;
                    min-width: 0;
                    font-size: var(--ha-card-header-font-size, 18px);
                    line-height: 1.4;
                }

                /* The room a whole row leaves over goes under the header, or with none above and below the list. */
                .list {
                    flex: 1 1 auto;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                    padding-top: calc(6px + var(--fc-spare-top, 0px));
                    padding-bottom: var(--fc-spare-bottom, 0px);
                }

                .list > * {
                    flex: none;
                }

                .list > .fold.open {
                    flex: 1 1 auto;
                    min-height: 0;
                }

                .line {
                    display: flex;
                    align-items: center;
                    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
                }

                .list > .line:first-child {
                    border-top: 0;
                }

                .switch {
                    flex: 1 1 auto;
                    min-width: 0;
                    min-height: 40px;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font: inherit;
                    color: var(--primary-text-color);
                    background: none;
                    border: 0;
                    padding: 0 12px 0 16px;
                    text-align: start;
                    cursor: pointer;
                }

                .label {
                    flex: 1 1 auto;
                    min-width: 0;
                    font-weight: 500;
                    overflow-wrap: anywhere;
                }

                .line.none {
                    min-height: 40px;
                    padding: 0 16px;
                    color: var(--secondary-text-color);
                    font-size: 13px;
                }

                .line.none .label {
                    font-weight: 400;
                }

                .count {
                    flex: none;
                    font-size: 12px;
                    color: var(--secondary-text-color);
                }

                .chev {
                    flex: none;
                    --mdc-icon-size: 20px;
                    color: var(--secondary-text-color);
                    transition: transform var(--ha-animation-duration-normal, 250ms) ease;
                }

                .switch[aria-expanded="false"] .chev {
                    transform: rotate(-90deg);
                }

                .swatch {
                    flex: none;
                    width: 10px;
                    height: 10px;
                    border-radius: 3px;
                    background: var(--fc);
                }

                .mark-all,
                .more {
                    flex: none;
                    font: inherit;
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--primary-color);
                    background: none;
                    border: 0;
                    border-radius: 4px;
                    padding: 6px 8px;
                    cursor: pointer;
                }

                .mark-all {
                    margin-right: 8px;
                }

                .more {
                    margin: 0 0 6px 66px;
                }

                .fold {
                    display: grid;
                    grid-template-rows: 0fr;
                    transition: grid-template-rows var(--ha-animation-duration-normal, 250ms) ease;
                }

                .fold.open {
                    grid-template-rows: 1fr;
                }

                .fold-in {
                    min-height: 0;
                    overflow: hidden;
                }

                .scroll {
                    height: 100%;
                    box-sizing: border-box;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    padding: 2px 0 8px;
                }

                .sliding .scroll {
                    overflow-y: hidden;
                }

                .item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 5px 12px 5px 16px;
                }

                .badge {
                    flex: none;
                    width: 42px;
                    box-sizing: border-box;
                    text-align: center;
                    border-radius: 6px;
                    padding: 3px 0 2px;
                    line-height: 1.1;
                    background: rgba(var(--rgb-primary-text-color, 33, 33, 33), 0.08);
                }

                .day {
                    font-size: 17px;
                    font-weight: 500;
                }

                .month,
                .year {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: var(--secondary-text-color);
                }

                .year {
                    color: var(--warning-color, #ffa600);
                }

                .new .badge {
                    background: var(--primary-color);
                    color: var(--text-primary-color, #fff);
                }

                .new .badge .month {
                    color: inherit;
                }

                /* Seen since the card was loaded: an outline, until the next load moves it to its feed. */
                .new.seen .badge {
                    background: none;
                    color: var(--primary-text-color);
                    box-shadow: inset 0 0 0 1.5px var(--primary-color);
                }

                .new.seen .badge .month {
                    color: var(--secondary-text-color);
                }

                .body {
                    flex: 1 1 auto;
                    min-width: 0;
                    padding-top: 1px;
                }

                .from {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 12px;
                    color: var(--secondary-text-color);
                }

                .from .swatch {
                    width: 7px;
                    height: 7px;
                    border-radius: 2px;
                }

                .title {
                    color: var(--primary-text-color);
                    text-decoration: none;
                    overflow-wrap: anywhere;
                }

                a.title:hover {
                    text-decoration: underline;
                }

                .mark {
                    flex: none;
                    width: 32px;
                    height: 32px;
                    margin: -2px -6px 0 0;
                    display: grid;
                    place-items: center;
                    border: 0;
                    border-radius: 50%;
                    background: none;
                    color: var(--secondary-text-color);
                    --mdc-icon-size: 20px;
                    cursor: pointer;
                }

                .mark:hover,
                .mark-all:hover,
                .more:hover {
                    background: rgba(var(--rgb-primary-text-color, 33, 33, 33), 0.06);
                }

                .empty {
                    padding: 4px 16px 6px;
                    color: var(--secondary-text-color);
                    font-size: 13px;
                }

                /* Held to a height, the texts above the open section keep to one line, cut short with their text as a tooltip. */
                .held .hd-title,
                .held .line .label {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Held, the open section scrolls, so its scrollbar and, as the card's last part, its end keep off the card's edges. */
                .held .list > .fold.open {
                    margin-right: 4px;
                }

                .held .list > .fold.open:last-child {
                    margin-bottom: 8px;
                }

                /* Its rows are measured the same whether it scrolls or not. */
                .held .scroll {
                    scrollbar-gutter: stable;
                }

                /* The rows the card fills, and the spare room above the list, change along with a slide, not on ha-card's own timing. */
                ha-card.sliding {
                    transition: min-height var(--ha-animation-duration-normal, 250ms) ease;
                }

                ha-card.sliding > .list {
                    transition: padding var(--ha-animation-duration-normal, 250ms) ease;
                }

                @media (prefers-reduced-motion: reduce) {
                    .fold,
                    .chev,
                    ha-card.sliding,
                    ha-card.sliding > .list {
                        transition: none;
                    }
                }
            `,
            fadeStyles,
        ];
    }
}

// Registered only once, as another copy of the card may already be loaded.
if (!customElements.get("feeds-card")) {
    customElements.define("feeds-card", FeedsCard);
    console.info(
        `%c  FEEDS-CARD \n%c  ${CARD_VERSION}    `,
        "color: orange; font-weight: bold; background: black",
        "color: white; font-weight: bold; background: dimgray",
    );
    const registry = window as unknown as { customCards?: CardRegistration[] };
    registry.customCards = registry.customCards ?? [];
    registry.customCards.push({
        type: "feeds-card",
        name: translate(browserLanguage(), "common.name"),
        description: translate(browserLanguage(), "common.description"),
        documentationURL: "https://github.com/jesmak/feeds-card",
        preview: true,
    });
}

declare global {
    interface HTMLElementTagNameMap {
        "feeds-card": FeedsCard;
    }
}
