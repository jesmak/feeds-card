/*! feeds-card 1.0.0 | MIT License */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i7 = decorators.length - 1, decorator; i7 >= 0; i7--)
    if (decorator = decorators[i7])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t6, e6, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t6, this.t = e6;
  }
  get styleSheet() {
    let t6 = this.o;
    const s5 = this.t;
    if (e && void 0 === t6) {
      const e6 = void 0 !== s5 && 1 === s5.length;
      e6 && (t6 = o.get(s5)), void 0 === t6 && ((this.o = t6 = new CSSStyleSheet()).replaceSync(this.cssText), e6 && o.set(s5, t6));
    }
    return t6;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t6) => new n("string" == typeof t6 ? t6 : t6 + "", void 0, s);
var i = (t6, ...e6) => {
  const o6 = 1 === t6.length ? t6[0] : e6.reduce((e7, s5, o7) => e7 + ((t7) => {
    if (true === t7._$cssResult$) return t7.cssText;
    if ("number" == typeof t7) return t7;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t7 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s5) + t6[o7 + 1], t6[0]);
  return new n(o6, t6, s);
};
var S = (s5, o6) => {
  if (e) s5.adoptedStyleSheets = o6.map((t6) => t6 instanceof CSSStyleSheet ? t6 : t6.styleSheet);
  else for (const e6 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e6.cssText, s5.appendChild(o7);
  }
};
var c = e ? (t6) => t6 : (t6) => t6 instanceof CSSStyleSheet ? ((t7) => {
  let e6 = "";
  for (const s5 of t7.cssRules) e6 += s5.cssText;
  return r(e6);
})(t6) : t6;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t6, s5) => t6;
var u = { toAttribute(t6, s5) {
  switch (s5) {
    case Boolean:
      t6 = t6 ? l : null;
      break;
    case Object:
    case Array:
      t6 = null == t6 ? t6 : JSON.stringify(t6);
  }
  return t6;
}, fromAttribute(t6, s5) {
  let i7 = t6;
  switch (s5) {
    case Boolean:
      i7 = null !== t6;
      break;
    case Number:
      i7 = null === t6 ? null : Number(t6);
      break;
    case Object:
    case Array:
      try {
        i7 = JSON.parse(t6);
      } catch (t7) {
        i7 = null;
      }
  }
  return i7;
} };
var f = (t6, s5) => !i2(t6, s5);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var y = class extends HTMLElement {
  static addInitializer(t6) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t6);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t6, s5 = b) {
    if (s5.state && (s5.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t6) && ((s5 = Object.create(s5)).wrapped = true), this.elementProperties.set(t6, s5), !s5.noAccessor) {
      const i7 = /* @__PURE__ */ Symbol(), h4 = this.getPropertyDescriptor(t6, i7, s5);
      void 0 !== h4 && e2(this.prototype, t6, h4);
    }
  }
  static getPropertyDescriptor(t6, s5, i7) {
    const { get: e6, set: r6 } = h(this.prototype, t6) ?? { get() {
      return this[s5];
    }, set(t7) {
      this[s5] = t7;
    } };
    return { get: e6, set(s6) {
      const h4 = e6?.call(this);
      r6?.call(this, s6), this.requestUpdate(t6, h4, i7);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t6) {
    return this.elementProperties.get(t6) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t6 = n2(this);
    t6.finalize(), void 0 !== t6.l && (this.l = [...t6.l]), this.elementProperties = new Map(t6.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t7 = this.properties, s5 = [...r2(t7), ...o2(t7)];
      for (const i7 of s5) this.createProperty(i7, t7[i7]);
    }
    const t6 = this[Symbol.metadata];
    if (null !== t6) {
      const s5 = litPropertyMetadata.get(t6);
      if (void 0 !== s5) for (const [t7, i7] of s5) this.elementProperties.set(t7, i7);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t7, s5] of this.elementProperties) {
      const i7 = this._$Eu(t7, s5);
      void 0 !== i7 && this._$Eh.set(i7, t7);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s5) {
    const i7 = [];
    if (Array.isArray(s5)) {
      const e6 = new Set(s5.flat(1 / 0).reverse());
      for (const s6 of e6) i7.unshift(c(s6));
    } else void 0 !== s5 && i7.push(c(s5));
    return i7;
  }
  static _$Eu(t6, s5) {
    const i7 = s5.attribute;
    return false === i7 ? void 0 : "string" == typeof i7 ? i7 : "string" == typeof t6 ? t6.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t6) => this.enableUpdating = t6), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t6) => t6(this));
  }
  addController(t6) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t6), void 0 !== this.renderRoot && this.isConnected && t6.hostConnected?.();
  }
  removeController(t6) {
    this._$EO?.delete(t6);
  }
  _$E_() {
    const t6 = /* @__PURE__ */ new Map(), s5 = this.constructor.elementProperties;
    for (const i7 of s5.keys()) this.hasOwnProperty(i7) && (t6.set(i7, this[i7]), delete this[i7]);
    t6.size > 0 && (this._$Ep = t6);
  }
  createRenderRoot() {
    const t6 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t6, this.constructor.elementStyles), t6;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t6) => t6.hostConnected?.());
  }
  enableUpdating(t6) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t6) => t6.hostDisconnected?.());
  }
  attributeChangedCallback(t6, s5, i7) {
    this._$AK(t6, i7);
  }
  _$ET(t6, s5) {
    const i7 = this.constructor.elementProperties.get(t6), e6 = this.constructor._$Eu(t6, i7);
    if (void 0 !== e6 && true === i7.reflect) {
      const h4 = (void 0 !== i7.converter?.toAttribute ? i7.converter : u).toAttribute(s5, i7.type);
      this._$Em = t6, null == h4 ? this.removeAttribute(e6) : this.setAttribute(e6, h4), this._$Em = null;
    }
  }
  _$AK(t6, s5) {
    const i7 = this.constructor, e6 = i7._$Eh.get(t6);
    if (void 0 !== e6 && this._$Em !== e6) {
      const t7 = i7.getPropertyOptions(e6), h4 = "function" == typeof t7.converter ? { fromAttribute: t7.converter } : void 0 !== t7.converter?.fromAttribute ? t7.converter : u;
      this._$Em = e6;
      const r6 = h4.fromAttribute(s5, t7.type);
      this[e6] = r6 ?? this._$Ej?.get(e6) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t6, s5, i7, e6 = false, h4) {
    if (void 0 !== t6) {
      const r6 = this.constructor;
      if (false === e6 && (h4 = this[t6]), i7 ?? (i7 = r6.getPropertyOptions(t6)), !((i7.hasChanged ?? f)(h4, s5) || i7.useDefault && i7.reflect && h4 === this._$Ej?.get(t6) && !this.hasAttribute(r6._$Eu(t6, i7)))) return;
      this.C(t6, s5, i7);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t6, s5, { useDefault: i7, reflect: e6, wrapped: h4 }, r6) {
    i7 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t6) && (this._$Ej.set(t6, r6 ?? s5 ?? this[t6]), true !== h4 || void 0 !== r6) || (this._$AL.has(t6) || (this.hasUpdated || i7 || (s5 = void 0), this._$AL.set(t6, s5)), true === e6 && this._$Em !== t6 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t6));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t7) {
      Promise.reject(t7);
    }
    const t6 = this.scheduleUpdate();
    return null != t6 && await t6, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t8, s6] of this._$Ep) this[t8] = s6;
        this._$Ep = void 0;
      }
      const t7 = this.constructor.elementProperties;
      if (t7.size > 0) for (const [s6, i7] of t7) {
        const { wrapped: t8 } = i7, e6 = this[s6];
        true !== t8 || this._$AL.has(s6) || void 0 === e6 || this.C(s6, void 0, i7, e6);
      }
    }
    let t6 = false;
    const s5 = this._$AL;
    try {
      t6 = this.shouldUpdate(s5), t6 ? (this.willUpdate(s5), this._$EO?.forEach((t7) => t7.hostUpdate?.()), this.update(s5)) : this._$EM();
    } catch (s6) {
      throw t6 = false, this._$EM(), s6;
    }
    t6 && this._$AE(s5);
  }
  willUpdate(t6) {
  }
  _$AE(t6) {
    this._$EO?.forEach((t7) => t7.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t6)), this.updated(t6);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t6) {
    return true;
  }
  update(t6) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t7) => this._$ET(t7, this[t7]))), this._$EM();
  }
  updated(t6) {
  }
  firstUpdated(t6) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t6) => t6;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t6) => t6 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t6) => null === t6 || "object" != typeof t6 && "function" != typeof t6;
var u2 = Array.isArray;
var d2 = (t6) => u2(t6) || "function" == typeof t6?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t6) => (i7, ...s5) => ({ _$litType$: t6, strings: i7, values: s5 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t6, i7) {
  if (!u2(t6) || !t6.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i7) : i7;
}
var N = (t6, i7) => {
  const s5 = t6.length - 1, e6 = [];
  let n5, l3 = 2 === i7 ? "<svg>" : 3 === i7 ? "<math>" : "", c5 = v;
  for (let i8 = 0; i8 < s5; i8++) {
    const s6 = t6[i8];
    let a3, u5, d3 = -1, f3 = 0;
    for (; f3 < s6.length && (c5.lastIndex = f3, u5 = c5.exec(s6), null !== u5); ) f3 = c5.lastIndex, c5 === v ? "!--" === u5[1] ? c5 = _ : void 0 !== u5[1] ? c5 = m : void 0 !== u5[2] ? (y2.test(u5[2]) && (n5 = RegExp("</" + u5[2], "g")), c5 = p2) : void 0 !== u5[3] && (c5 = p2) : c5 === p2 ? ">" === u5[0] ? (c5 = n5 ?? v, d3 = -1) : void 0 === u5[1] ? d3 = -2 : (d3 = c5.lastIndex - u5[2].length, a3 = u5[1], c5 = void 0 === u5[3] ? p2 : '"' === u5[3] ? $ : g) : c5 === $ || c5 === g ? c5 = p2 : c5 === _ || c5 === m ? c5 = v : (c5 = p2, n5 = void 0);
    const x2 = c5 === p2 && t6[i8 + 1].startsWith("/>") ? " " : "";
    l3 += c5 === v ? s6 + r3 : d3 >= 0 ? (e6.push(a3), s6.slice(0, d3) + h2 + s6.slice(d3) + o3 + x2) : s6 + o3 + (-2 === d3 ? i8 : x2);
  }
  return [V(t6, l3 + (t6[s5] || "<?>") + (2 === i7 ? "</svg>" : 3 === i7 ? "</math>" : "")), e6];
};
var S2 = class _S {
  constructor({ strings: t6, _$litType$: i7 }, e6) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u5 = t6.length - 1, d3 = this.parts, [f3, v3] = N(t6, i7);
    if (this.el = _S.createElement(f3, e6), P.currentNode = this.el.content, 2 === i7 || 3 === i7) {
      const t7 = this.el.content.firstChild;
      t7.replaceWith(...t7.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u5; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t7 of r6.getAttributeNames()) if (t7.endsWith(h2)) {
          const i8 = v3[a3++], s5 = r6.getAttribute(t7).split(o3), e7 = /([.?@])?(.*)/.exec(i8);
          d3.push({ type: 1, index: l3, name: e7[2], strings: s5, ctor: "." === e7[1] ? I : "?" === e7[1] ? L : "@" === e7[1] ? z : H }), r6.removeAttribute(t7);
        } else t7.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t7));
        if (y2.test(r6.tagName)) {
          const t7 = r6.textContent.split(o3), i8 = t7.length - 1;
          if (i8 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s5 = 0; s5 < i8; s5++) r6.append(t7[s5], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t7[i8], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t7 = -1;
        for (; -1 !== (t7 = r6.data.indexOf(o3, t7 + 1)); ) d3.push({ type: 7, index: l3 }), t7 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t6, i7) {
    const s5 = l2.createElement("template");
    return s5.innerHTML = t6, s5;
  }
};
function M(t6, i7, s5 = t6, e6) {
  if (i7 === E) return i7;
  let h4 = void 0 !== e6 ? s5._$Co?.[e6] : s5._$Cl;
  const o6 = a2(i7) ? void 0 : i7._$litDirective$;
  return h4?.constructor !== o6 && (h4?._$AO?.(false), void 0 === o6 ? h4 = void 0 : (h4 = new o6(t6), h4._$AT(t6, s5, e6)), void 0 !== e6 ? (s5._$Co ?? (s5._$Co = []))[e6] = h4 : s5._$Cl = h4), void 0 !== h4 && (i7 = M(t6, h4._$AS(t6, i7.values), h4, e6)), i7;
}
var R = class {
  constructor(t6, i7) {
    this._$AV = [], this._$AN = void 0, this._$AD = t6, this._$AM = i7;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t6) {
    const { el: { content: i7 }, parts: s5 } = this._$AD, e6 = (t6?.creationScope ?? l2).importNode(i7, true);
    P.currentNode = e6;
    let h4 = P.nextNode(), o6 = 0, n5 = 0, r6 = s5[0];
    for (; void 0 !== r6; ) {
      if (o6 === r6.index) {
        let i8;
        2 === r6.type ? i8 = new k(h4, h4.nextSibling, this, t6) : 1 === r6.type ? i8 = new r6.ctor(h4, r6.name, r6.strings, this, t6) : 6 === r6.type && (i8 = new Z(h4, this, t6)), this._$AV.push(i8), r6 = s5[++n5];
      }
      o6 !== r6?.index && (h4 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e6;
  }
  p(t6) {
    let i7 = 0;
    for (const s5 of this._$AV) void 0 !== s5 && (void 0 !== s5.strings ? (s5._$AI(t6, s5, i7), i7 += s5.strings.length - 2) : s5._$AI(t6[i7])), i7++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t6, i7, s5, e6) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t6, this._$AB = i7, this._$AM = s5, this.options = e6, this._$Cv = e6?.isConnected ?? true;
  }
  get parentNode() {
    let t6 = this._$AA.parentNode;
    const i7 = this._$AM;
    return void 0 !== i7 && 11 === t6?.nodeType && (t6 = i7.parentNode), t6;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t6, i7 = this) {
    t6 = M(this, t6, i7), a2(t6) ? t6 === A || null == t6 || "" === t6 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t6 !== this._$AH && t6 !== E && this._(t6) : void 0 !== t6._$litType$ ? this.$(t6) : void 0 !== t6.nodeType ? this.T(t6) : d2(t6) ? this.k(t6) : this._(t6);
  }
  O(t6) {
    return this._$AA.parentNode.insertBefore(t6, this._$AB);
  }
  T(t6) {
    this._$AH !== t6 && (this._$AR(), this._$AH = this.O(t6));
  }
  _(t6) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t6 : this.T(l2.createTextNode(t6)), this._$AH = t6;
  }
  $(t6) {
    const { values: i7, _$litType$: s5 } = t6, e6 = "number" == typeof s5 ? this._$AC(t6) : (void 0 === s5.el && (s5.el = S2.createElement(V(s5.h, s5.h[0]), this.options)), s5);
    if (this._$AH?._$AD === e6) this._$AH.p(i7);
    else {
      const t7 = new R(e6, this), s6 = t7.u(this.options);
      t7.p(i7), this.T(s6), this._$AH = t7;
    }
  }
  _$AC(t6) {
    let i7 = C.get(t6.strings);
    return void 0 === i7 && C.set(t6.strings, i7 = new S2(t6)), i7;
  }
  k(t6) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i7 = this._$AH;
    let s5, e6 = 0;
    for (const h4 of t6) e6 === i7.length ? i7.push(s5 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s5 = i7[e6], s5._$AI(h4), e6++;
    e6 < i7.length && (this._$AR(s5 && s5._$AB.nextSibling, e6), i7.length = e6);
  }
  _$AR(t6 = this._$AA.nextSibling, s5) {
    for (this._$AP?.(false, true, s5); t6 !== this._$AB; ) {
      const s6 = i3(t6).nextSibling;
      i3(t6).remove(), t6 = s6;
    }
  }
  setConnected(t6) {
    void 0 === this._$AM && (this._$Cv = t6, this._$AP?.(t6));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t6, i7, s5, e6, h4) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t6, this.name = i7, this._$AM = e6, this.options = h4, s5.length > 2 || "" !== s5[0] || "" !== s5[1] ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = A;
  }
  _$AI(t6, i7 = this, s5, e6) {
    const h4 = this.strings;
    let o6 = false;
    if (void 0 === h4) t6 = M(this, t6, i7, 0), o6 = !a2(t6) || t6 !== this._$AH && t6 !== E, o6 && (this._$AH = t6);
    else {
      const e7 = t6;
      let n5, r6;
      for (t6 = h4[0], n5 = 0; n5 < h4.length - 1; n5++) r6 = M(this, e7[s5 + n5], i7, n5), r6 === E && (r6 = this._$AH[n5]), o6 || (o6 = !a2(r6) || r6 !== this._$AH[n5]), r6 === A ? t6 = A : t6 !== A && (t6 += (r6 ?? "") + h4[n5 + 1]), this._$AH[n5] = r6;
    }
    o6 && !e6 && this.j(t6);
  }
  j(t6) {
    t6 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t6 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t6) {
    this.element[this.name] = t6 === A ? void 0 : t6;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t6) {
    this.element.toggleAttribute(this.name, !!t6 && t6 !== A);
  }
};
var z = class extends H {
  constructor(t6, i7, s5, e6, h4) {
    super(t6, i7, s5, e6, h4), this.type = 5;
  }
  _$AI(t6, i7 = this) {
    if ((t6 = M(this, t6, i7, 0) ?? A) === E) return;
    const s5 = this._$AH, e6 = t6 === A && s5 !== A || t6.capture !== s5.capture || t6.once !== s5.once || t6.passive !== s5.passive, h4 = t6 !== A && (s5 === A || e6);
    e6 && this.element.removeEventListener(this.name, this, s5), h4 && this.element.addEventListener(this.name, this, t6), this._$AH = t6;
  }
  handleEvent(t6) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t6) : this._$AH.handleEvent(t6);
  }
};
var Z = class {
  constructor(t6, i7, s5) {
    this.element = t6, this.type = 6, this._$AN = void 0, this._$AM = i7, this.options = s5;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t6) {
    M(this, t6);
  }
};
var j = { M: h2, P: o3, A: n3, C: 1, L: N, R, D: d2, V: M, I: k, H, N: L, U: z, B: I, F: Z };
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.3");
var D = (t6, i7, s5) => {
  const e6 = s5?.renderBefore ?? i7;
  let h4 = e6._$litPart$;
  if (void 0 === h4) {
    const t7 = s5?.renderBefore ?? null;
    e6._$litPart$ = h4 = new k(i7.insertBefore(c3(), t7), t7, void 0, s5 ?? {});
  }
  return h4._$AI(t6), h4;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a;
    const t6 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t6.firstChild), t6;
  }
  update(t6) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t6), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t3 = (t6) => (e6, o6) => {
  void 0 !== o6 ? o6.addInitializer(() => {
    customElements.define(t6, e6);
  }) : customElements.define(t6, e6);
};

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t6 = o5, e6, r6) => {
  const { kind: n5, metadata: i7 } = r6;
  let s5 = globalThis.litPropertyMetadata.get(i7);
  if (void 0 === s5 && globalThis.litPropertyMetadata.set(i7, s5 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t6 = Object.create(t6)).wrapped = true), s5.set(r6.name, t6), "accessor" === n5) {
    const { name: o6 } = r6;
    return { set(r7) {
      const n6 = e6.get.call(this);
      e6.set.call(this, r7), this.requestUpdate(o6, n6, t6, true, r7);
    }, init(e7) {
      return void 0 !== e7 && this.C(o6, void 0, t6, e7), e7;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r6;
    return function(r7) {
      const n6 = this[o6];
      e6.call(this, r7), this.requestUpdate(o6, n6, t6, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t6) {
  return (e6, o6) => "object" == typeof o6 ? r4(t6, e6, o6) : ((t7, e7, o7) => {
    const r6 = e7.hasOwnProperty(o7);
    return e7.constructor.createProperty(o7, t7), r6 ? Object.getOwnPropertyDescriptor(e7, o7) : void 0;
  })(t6, e6, o6);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// node_modules/lit-html/directive.js
var t4 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var e5 = (t6) => (...e6) => ({ _$litDirective$: t6, values: e6 });
var i5 = class {
  constructor(t6) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t6, e6, i7) {
    this._$Ct = t6, this._$AM = e6, this._$Ci = i7;
  }
  _$AS(t6, e6) {
    return this.update(t6, e6);
  }
  update(t6, e6) {
    return this.render(...e6);
  }
};

// node_modules/lit-html/directive-helpers.js
var { I: t5 } = j;
var i6 = (o6) => o6;
var s4 = () => document.createComment("");
var v2 = (o6, n5, e6) => {
  const l3 = o6._$AA.parentNode, d3 = void 0 === n5 ? o6._$AB : n5._$AA;
  if (void 0 === e6) {
    const i7 = l3.insertBefore(s4(), d3), n6 = l3.insertBefore(s4(), d3);
    e6 = new t5(i7, n6, o6, o6.options);
  } else {
    const t6 = e6._$AB.nextSibling, n6 = e6._$AM, c5 = n6 !== o6;
    if (c5) {
      let t7;
      e6._$AQ?.(o6), e6._$AM = o6, void 0 !== e6._$AP && (t7 = o6._$AU) !== n6._$AU && e6._$AP(t7);
    }
    if (t6 !== d3 || c5) {
      let o7 = e6._$AA;
      for (; o7 !== t6; ) {
        const t7 = i6(o7).nextSibling;
        i6(l3).insertBefore(o7, d3), o7 = t7;
      }
    }
  }
  return e6;
};
var u3 = (o6, t6, i7 = o6) => (o6._$AI(t6, i7), o6);
var m2 = {};
var p3 = (o6, t6 = m2) => o6._$AH = t6;
var M2 = (o6) => o6._$AH;
var h3 = (o6) => {
  o6._$AR(), o6._$AA.remove();
};

// node_modules/lit-html/directives/repeat.js
var u4 = (e6, s5, t6) => {
  const r6 = /* @__PURE__ */ new Map();
  for (let l3 = s5; l3 <= t6; l3++) r6.set(e6[l3], l3);
  return r6;
};
var c4 = e5(class extends i5 {
  constructor(e6) {
    if (super(e6), e6.type !== t4.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(e6, s5, t6) {
    let r6;
    void 0 === t6 ? t6 = s5 : void 0 !== s5 && (r6 = s5);
    const l3 = [], o6 = [];
    let i7 = 0;
    for (const s6 of e6) l3[i7] = r6 ? r6(s6, i7) : i7, o6[i7] = t6(s6, i7), i7++;
    return { values: o6, keys: l3 };
  }
  render(e6, s5, t6) {
    return this.dt(e6, s5, t6).values;
  }
  update(s5, [t6, r6, c5]) {
    const d3 = M2(s5), { values: p4, keys: a3 } = this.dt(t6, r6, c5);
    if (!Array.isArray(d3)) return this.ut = a3, p4;
    const h4 = this.ut ?? (this.ut = []), v3 = [];
    let m3, y3, x2 = 0, j2 = d3.length - 1, k2 = 0, w2 = p4.length - 1;
    for (; x2 <= j2 && k2 <= w2; ) if (null === d3[x2]) x2++;
    else if (null === d3[j2]) j2--;
    else if (h4[x2] === a3[k2]) v3[k2] = u3(d3[x2], p4[k2]), x2++, k2++;
    else if (h4[j2] === a3[w2]) v3[w2] = u3(d3[j2], p4[w2]), j2--, w2--;
    else if (h4[x2] === a3[w2]) v3[w2] = u3(d3[x2], p4[w2]), v2(s5, v3[w2 + 1], d3[x2]), x2++, w2--;
    else if (h4[j2] === a3[k2]) v3[k2] = u3(d3[j2], p4[k2]), v2(s5, d3[x2], d3[j2]), j2--, k2++;
    else if (void 0 === m3 && (m3 = u4(a3, k2, w2), y3 = u4(h4, x2, j2)), m3.has(h4[x2])) if (m3.has(h4[j2])) {
      const e6 = y3.get(a3[k2]), t7 = void 0 !== e6 ? d3[e6] : null;
      if (null === t7) {
        const e7 = v2(s5, d3[x2]);
        u3(e7, p4[k2]), v3[k2] = e7;
      } else v3[k2] = u3(t7, p4[k2]), v2(s5, d3[x2], t7), d3[e6] = null;
      k2++;
    } else h3(d3[j2]), j2--;
    else h3(d3[x2]), x2++;
    for (; k2 <= w2; ) {
      const e6 = v2(s5, v3[w2 + 1]);
      u3(e6, p4[k2]), v3[k2++] = e6;
    }
    for (; x2 <= j2; ) {
      const e6 = d3[x2++];
      null !== e6 && h3(e6);
    }
    return this.ut = a3, p3(s5, v3), E;
  }
});

// src/const.ts
var CARD_VERSION = "1.0.0";
var DEFAULT_ITEMS = 5;
var SEEN_RATIO = 0.6;
var SEEN_AFTER_MS = 1500;
var SAVE_DELAY_MS = 1e3;
var SEEN_KEPT = 300;
var STORE_PREFIX = "feeds-card.";
var FEED_COLORS = [
  "var(--orange-color, #ff9800)",
  "var(--light-blue-color, #03a9f4)",
  "var(--green-color, #4caf50)",
  "var(--purple-color, #926bc7)",
  "var(--red-color, #f44336)",
  "var(--teal-color, #009688)",
  "var(--amber-color, #ffc107)",
  "var(--indigo-color, #3f51b5)"
];

// src/feeds.ts
function feedConfigs(entities) {
  const list = typeof entities === "string" ? [entities] : Array.isArray(entities) ? entities : [];
  return list.map((entry) => typeof entry === "string" ? { entity: entry } : entry).filter((entry) => typeof entry?.entity === "string" && entry.entity !== "");
}
function feedSensors(hass, attribute = "entries") {
  return Object.values(hass.states).filter(
    (state) => !!state && state.entity_id.startsWith("sensor.") && Array.isArray(state.attributes[attribute])
  ).map((state) => state.entity_id).sort();
}
var text = (value) => typeof value === "string" && value.trim() ? value.trim() : void 0;
function parseTime(value) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value < 1e12 ? value * 1e3 : value;
  }
  const string = text(value);
  if (!string) {
    return void 0;
  }
  if (/^\d+(\.\d+)?$/.test(string)) {
    return parseTime(Number(string));
  }
  if (!/(^|\D)\d{4}(\D|$)/.test(string)) {
    return void 0;
  }
  const time = Date.parse(string);
  return Number.isNaN(time) ? void 0 : time;
}
function readItems(state, attribute = "entries") {
  const entries = state?.attributes[attribute];
  if (!Array.isArray(entries)) {
    return void 0;
  }
  const items = [];
  const keys = /* @__PURE__ */ new Set();
  for (const entry of entries) {
    if (entry === null || typeof entry !== "object") {
      continue;
    }
    const fields = entry;
    const link = text(fields.link);
    const title = text(fields.title) ?? link;
    const key = text(fields.id) ?? link ?? title;
    if (!title || !key || keys.has(key)) {
      continue;
    }
    keys.add(key);
    items.push({ key, title, link, time: parseTime(fields.published) ?? parseTime(fields.updated) });
  }
  if (items.every((item) => item.time !== void 0)) {
    items.sort((a3, b3) => b3.time - a3.time);
  }
  return items;
}
function keptSeen(stored, seen, current) {
  const inFeed = new Set(current.map((item) => item.key));
  const gone = stored.filter((key) => !inFeed.has(key));
  return [...current.filter((item) => seen.has(item.key)).map((item) => item.key), ...gone].slice(0, SEEN_KEPT);
}

// src/localize/languages/en.json
var en_default = {
  common: {
    name: "Feeds card",
    description: "RSS and Atom feeds, each a list of its own, with what you haven't seen first",
    invalid_configuration: "Invalid configuration. Give at least one feed sensor in entities.",
    invalid_mark: "Invalid marking. mark must be auto or manual.",
    invalid_items: "Invalid number of items. items must be a positive whole number.",
    invalid_height: "Invalid height. height and max_height must be positive numbers of pixels, and height_mode auto, fixed or max.",
    invalid_row_step: "Invalid rounding. row_step must be full or half.",
    title: "Feeds",
    unseen_section: "New",
    unseen: "{n} new",
    unseen_one: "1 new",
    nothing_new: "Nothing new",
    nothing_new_latest: "Nothing new. Latest {date}",
    count_unseen: "{n} \xB7 {unseen} new",
    unavailable: "Unavailable",
    no_entries: "The sensor has no feed entries.",
    all_unseen: "All in the new list.",
    no_items: "No items.",
    show_all: "Show all {n}",
    show_less: "Show less",
    mark_read: "Mark read",
    mark_all: "Mark all read"
  },
  editor: {
    title: "Title",
    title_helper: "The card always has a title, with the number of new items beside it. Left empty, it is Feeds.",
    icon: "Icon",
    entities: "Feeds",
    entities_helper: "Sensors with a feed's entries in an attribute, such as those of the Feedparser integration.",
    entity: "Sensor",
    name: "Name",
    name_helper: "Replaces the sensor's own name.",
    color: "Colour",
    color_helper: "Any CSS colour, such as #d08770 or var(--red-color).",
    mark: "Marking items seen",
    mark_helper: "Opening an item's link marks it seen either way.",
    mark_auto: "Automatically, once on screen",
    mark_manual: "By hand, with a button",
    items: "Items per feed",
    items_helper: "The rest are behind Show all.",
    attribute: "Attribute",
    attribute_helper: "The sensor attribute that holds the entries.",
    row_step: "Rounding in a sections view",
    row_step_helper: "With automatic row height, the card's height is rounded up to whole rows, or to half rows to save space.",
    row_step_full: "Whole rows",
    row_step_half: "Half rows"
  }
};

// src/localize/languages/fi.json
var fi_default = {
  common: {
    name: "Sy\xF6tekortti",
    description: "RSS- ja Atom-sy\xF6tteet omina listoinaan, n\xE4kem\xE4tt\xF6m\xE4t ensimm\xE4isen\xE4",
    invalid_configuration: "Virheelliset asetukset. Anna v\xE4hint\xE4\xE4n yksi sy\xF6tteen sensori kohdassa entities.",
    invalid_mark: "Virheellinen merkint\xE4tapa. Merkint\xE4tavan (mark) on oltava auto tai manual.",
    invalid_items: "Virheellinen m\xE4\xE4r\xE4. M\xE4\xE4r\xE4n (items) on oltava positiivinen kokonaisluku.",
    invalid_height: "Virheellinen korkeus. Korkeuksien (height ja max_height) on oltava positiivisia lukuja pikselein\xE4, ja korkeustilan (height_mode) auto, fixed tai max.",
    invalid_row_step: "Virheellinen py\xF6ristys. Py\xF6ristyksen (row_step) on oltava full tai half.",
    title: "Sy\xF6tteet",
    unseen_section: "Uudet",
    unseen: "{n} uutta",
    unseen_one: "1 uusi",
    nothing_new: "Ei uutta",
    nothing_new_latest: "Ei uutta. Viimeisin {date}",
    count_unseen: "{n} \xB7 {unseen} uutta",
    unavailable: "Ei saatavilla",
    no_entries: "Sensorilla ei ole sy\xF6tteen merkint\xF6j\xE4.",
    all_unseen: "Kaikki uusien listalla.",
    no_items: "Ei merkint\xF6j\xE4.",
    show_all: "N\xE4yt\xE4 kaikki {n}",
    show_less: "N\xE4yt\xE4 v\xE4hemm\xE4n",
    mark_read: "Merkitse luetuksi",
    mark_all: "Merkitse kaikki luetuiksi"
  },
  editor: {
    title: "Otsikko",
    title_helper: "Kortilla on aina otsikko, jonka vieress\xE4 n\xE4kyy uusien m\xE4\xE4r\xE4. Tyhj\xE4n\xE4 otsikko on Sy\xF6tteet.",
    icon: "Kuvake",
    entities: "Sy\xF6tteet",
    entities_helper: "Sensorit, joiden attribuutissa on sy\xF6tteen merkinn\xE4t, kuten Feedparser-integraation sensorit.",
    entity: "Sensori",
    name: "Nimi",
    name_helper: "Korvaa sensorin oman nimen.",
    color: "V\xE4ri",
    color_helper: "Mik\xE4 tahansa CSS-v\xE4ri, esimerkiksi #d08770 tai var(--red-color).",
    mark: "Uusien merkitseminen n\xE4hdyiksi",
    mark_helper: "Linkin avaaminen merkitsee n\xE4hdyksi kummassakin tavassa.",
    mark_auto: "Automaattisesti, kun n\xE4kyy ruudulla",
    mark_manual: "K\xE4sin, napista",
    items: "Merkint\xF6j\xE4 sy\xF6tett\xE4 kohden",
    items_helper: "Loput ovat N\xE4yt\xE4 kaikki -napin takana.",
    attribute: "Attribuutti",
    attribute_helper: "Sensorin attribuutti, jossa merkinn\xE4t ovat.",
    row_step: "Py\xF6ristys osioihin jaetussa n\xE4kym\xE4ss\xE4",
    row_step_helper: "Automaattisella rivikorkeudella kortin korkeus py\xF6ristet\xE4\xE4n yl\xF6sp\xE4in kokonaisiin riveihin, tai tilan s\xE4\xE4st\xE4miseksi puolikkaisiin riveihin.",
    row_step_full: "Kokonaisiin riveihin",
    row_step_half: "Puolikkaisiin riveihin"
  }
};

// src/localize/localize.ts
var FILES = { "./languages/en.json": en_default, "./languages/fi.json": fi_default };
var LANGUAGES = Object.fromEntries(
  Object.entries(FILES).map(([path, table]) => [path.replace(/^.*\/|\.json$/g, "").toLowerCase(), table])
);
var LANGUAGE_CODES = Object.keys(LANGUAGES).sort();
function translate(language, key) {
  const code = (language ?? "en").split(/[-_]/)[0].toLowerCase();
  return read(LANGUAGES[code], key) ?? read(LANGUAGES.en, key) ?? key;
}
function read(table, key) {
  let value = table;
  for (const part of key.split(".")) {
    if (value === null || typeof value !== "object") {
      return void 0;
    }
    value = value[part];
  }
  return typeof value === "string" ? value : void 0;
}
function browserLanguage() {
  return document.documentElement.lang || navigator.language || "en";
}

// src/height.ts
var HEIGHT_MODES = ["auto", "fixed", "max"];
var pixels = (value) => value == null || typeof value === "number" && Number.isFinite(value) && value > 0;
function validHeight(config) {
  return (config.height_mode == null || HEIGHT_MODES.includes(config.height_mode)) && pixels(config.height) && pixels(config.max_height);
}
function heightMode(config) {
  return config.height_mode ?? (config.height ? "fixed" : config.max_height ? "max" : "auto");
}
var ROW_HEIGHT = 56;
var ROW_GAP = 8;
function heightStyle(config, layout, minimum = 0) {
  const rows = config.grid_options ? config.grid_options.rows : config.layout_options?.grid_rows;
  if (layout === "grid" && typeof rows === "number") {
    return "height: 100%";
  }
  const mode = heightMode(config);
  if (mode === "fixed" && config.height) {
    return `height: ${Math.max(config.height, minimum)}px`;
  }
  return mode === "max" && config.max_height ? `max-height: ${Math.max(config.max_height, minimum)}px` : "";
}
function gridMinRows(minimum) {
  return Math.max(1, Math.ceil((minimum + ROW_GAP) / (ROW_HEIGHT + ROW_GAP)));
}
function heightCardSize(config, content, minimum = 0) {
  const mode = heightMode(config);
  if (mode === "fixed" && config.height) {
    return Math.max(1, Math.round(Math.max(config.height, minimum) / 50));
  }
  return mode === "max" && config.max_height ? Math.max(1, Math.min(content, Math.round(Math.max(config.max_height, minimum) / 50))) : content;
}

// src/rows.ts
var ROW_STEPS = ["full", "half"];
var ROW_PX = 64;
var ROW_GAP_PX = 8;
function validRowStep(config) {
  return config.row_step === void 0 || config.row_step === null || ROW_STEPS.includes(config.row_step);
}
var step = (config) => config.row_step === "half" ? ROW_PX / 2 : ROW_PX;
var SLACK_PX = 0.01;
function drawnScale(card) {
  const layout = Number.parseFloat(getComputedStyle(card).width) || 0;
  const drawn = card.getBoundingClientRect().width;
  return layout > 0 && drawn > 0 ? drawn / layout : 1;
}
function filledHeight(content, config, limit = Infinity) {
  return Math.min(Math.max(1, Math.ceil((content - SLACK_PX + ROW_GAP_PX) / step(config))) * step(config) - ROW_GAP_PX, limit);
}
function spareRoom(filled, content) {
  return Math.max(0, Math.floor(filled - content + SLACK_PX));
}
function fillLimit(config, layout, minimum = 0) {
  const rows = config.grid_options ? config.grid_options.rows : config.layout_options?.grid_rows;
  if (layout !== "grid" || typeof rows === "number") {
    return 0;
  }
  const mode = heightMode(config);
  if (mode === "fixed" && config.height) {
    return 0;
  }
  if (mode !== "max" || !config.max_height) {
    return Infinity;
  }
  const down = Math.floor((config.max_height + ROW_GAP_PX) / step(config)) * step(config) - ROW_GAP_PX;
  return Math.max(down, filledHeight(minimum, config));
}
function filledStyle(config, layout, minimum, filled) {
  const limit = fillLimit(config, layout, minimum);
  if (!limit) {
    return heightStyle(config, layout, minimum);
  }
  return [limit < Infinity && `max-height: ${limit}px`, filled && `min-height: ${filled}px`].filter(Boolean).join("; ");
}
function rowStepSchema(config, text2) {
  if (heightMode(config) === "fixed" && config.height) {
    return [];
  }
  return [
    {
      name: "row_step",
      selector: {
        select: { mode: "dropdown", options: ROW_STEPS.map((value) => ({ value, label: text2(`editor.row_step_${value}`) })) }
      }
    }
  ];
}
function rowStepData(config) {
  return { ...config, row_step: config.row_step ?? "full" };
}
function tidyRowStep(config) {
  const tidied = { ...config };
  if (tidied.row_step !== "half" || heightMode(tidied) === "fixed" && tidied.height) {
    delete tidied.row_step;
  }
  return tidied;
}

// src/editor.ts
var DEFAULTS = { mark: "auto", items: DEFAULT_ITEMS, attribute: "entries" };
function feedsSchema(hass, attribute, text2) {
  return [
    {
      type: "grid",
      name: "",
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } }
      ]
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
              label: text2("editor.entity"),
              required: true,
              selector: { entity: { include_entities: feedSensors(hass, attribute) } }
            },
            name: { label: text2("editor.name"), description: text2("editor.name_helper"), selector: { text: {} } },
            color: { label: text2("editor.color"), description: text2("editor.color_helper"), selector: { text: {} } }
          }
        }
      }
    }
  ];
}
function optionsSchema(config, text2) {
  return [
    {
      name: "mark",
      selector: {
        select: { mode: "dropdown", options: ["auto", "manual"].map((value) => ({ value, label: text2(`editor.mark_${value}`) })) }
      }
    },
    {
      type: "grid",
      name: "",
      schema: [
        { name: "items", selector: { number: { min: 1, max: 100, step: 1, mode: "box" } } },
        { name: "attribute", selector: { text: {} } }
      ]
    },
    ...rowStepSchema(config, text2)
  ];
}
function formData(config) {
  const set = Object.fromEntries(Object.entries(config).filter(([, value]) => value != null));
  return { ...DEFAULTS, ...set, entities: feedConfigs(config.entities) };
}
function compactFeeds(feeds) {
  return feedConfigs(feeds).map((feed) => {
    const entry = { entity: feed.entity };
    if (feed.name) {
      entry.name = feed.name;
    }
    if (feed.color) {
      entry.color = feed.color;
    }
    return entry.name || entry.color ? entry : entry.entity;
  });
}
function configFromForm(value) {
  const config = tidyRowStep(value);
  config.entities = compactFeeds(config.entities ?? []);
  for (const key of ["title", "icon"]) {
    if (!config[key]) {
      delete config[key];
    }
  }
  for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
    if (config[key] === defaultValue || config[key] === void 0 || config[key] === null || config[key] === "") {
      delete config[key];
    }
  }
  return config;
}
var FeedsCardEditor = class extends i4 {
  constructor() {
    super(...arguments);
    this.config = { type: "custom:feeds-card", entities: [] };
  }
  setConfig(config) {
    this.config = { ...config };
  }
  render() {
    if (!this.hass) {
      return A;
    }
    const data = formData(rowStepData(this.config));
    return b2`
            <ha-form
                .hass=${this.hass}
                .data=${data}
                .schema=${feedsSchema(this.hass, this.config.attribute || "entries", (key) => this.text(key))}
                .computeLabel=${(entry) => this.text(`editor.${entry.name}`)}
                .computeHelper=${(entry) => this.helper(entry.name)}
                @value-changed=${this.valueChanged}
            ></ha-form>
            <p class="helper">${this.text("editor.entities_helper")}</p>
            <ha-form
                .hass=${this.hass}
                .data=${data}
                .schema=${optionsSchema(this.config, (key) => this.text(key))}
                .computeLabel=${(entry) => this.text(`editor.${entry.name}`)}
                .computeHelper=${(entry) => this.helper(entry.name)}
                @value-changed=${this.valueChanged}
            ></ha-form>
        `;
  }
  static get styles() {
    return i`
            .helper {
                margin: 8px 0 16px;
                padding: 0 16px;
                color: var(--secondary-text-color);
                font-size: 12px;
            }
        `;
  }
  valueChanged(event) {
    const config = configFromForm({ ...this.config, ...event.detail.value });
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
  text(key) {
    return translate(this.language(), key);
  }
  helper(name) {
    const key = `editor.${name}_helper`;
    const helper = translate(this.language(), key);
    return helper === key ? void 0 : helper;
  }
  language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
  }
};
__decorateClass([
  n4({ attribute: false })
], FeedsCardEditor.prototype, "hass", 2);
__decorateClass([
  r5()
], FeedsCardEditor.prototype, "config", 2);
FeedsCardEditor = __decorateClass([
  t3("feeds-card-editor")
], FeedsCardEditor);

// src/fade.ts
var fadeStyles = i`
    .fades {
        --fade-length: min(24px, 25%);
        scroll-padding-block: calc(var(--fade-top-offset, 0px) + var(--fade-length, 24px)) var(--fade-length, 24px);
    }

    .fade-top {
        mask-image: linear-gradient(
            to bottom,
            #000 var(--fade-top-offset, 0px),
            transparent var(--fade-top-offset, 0px),
            #000 calc(var(--fade-top-offset, 0px) + var(--fade-length, 24px))
        );
    }

    .fade-bottom {
        mask-image: linear-gradient(to top, transparent, #000 var(--fade-length, 24px));
    }

    .fade-top.fade-bottom {
        mask-image: linear-gradient(
            to bottom,
            #000 var(--fade-top-offset, 0px),
            transparent var(--fade-top-offset, 0px),
            #000 calc(var(--fade-top-offset, 0px) + var(--fade-length, 24px)),
            #000 calc(100% - var(--fade-length, 24px)),
            transparent
        );
    }
`;
function markFade(part) {
  const hidden = part.scrollHeight - part.clientHeight;
  part.classList.toggle("fade-top", hidden > 1 && part.scrollTop > 1);
  part.classList.toggle("fade-bottom", hidden > 1 && hidden - part.scrollTop > 1);
}
var onScroll = (event) => markFade(event.currentTarget);
var ScrollFade = class {
  constructor(host, parts) {
    this.host = host;
    this.parts = parts;
    /** Each followed part with the children whose size it watches. */
    this.followed = /* @__PURE__ */ new Map();
    this.resized = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver((entries) => {
      for (const { target } of entries) {
        const part = this.followed.has(target) ? target : target.parentElement;
        if (part && this.followed.has(part)) {
          markFade(part);
        }
      }
    });
    host.addController(this);
  }
  hostConnected() {
    if (this.host.hasUpdated) {
      this.follow();
    }
  }
  hostUpdated() {
    if (this.host.isConnected) {
      this.follow();
    }
  }
  hostDisconnected() {
    for (const part of [...this.followed.keys()]) {
      this.forget(part);
    }
  }
  follow() {
    const now = new Set(this.parts());
    for (const part of [...this.followed.keys()]) {
      if (!now.has(part)) {
        this.forget(part);
      }
    }
    for (const part of now) {
      if (!this.followed.has(part)) {
        part.addEventListener("scroll", onScroll, { passive: true });
        this.resized?.observe(part);
      }
      part.classList.add("fades");
      const before = this.followed.get(part) ?? [];
      const children = [...part.children];
      before.filter((child) => !children.includes(child)).forEach((child) => this.resized?.unobserve(child));
      children.filter((child) => !before.includes(child)).forEach((child) => this.resized?.observe(child));
      this.followed.set(part, children);
      markFade(part);
    }
  }
  forget(part) {
    this.followed.get(part)?.forEach((child) => this.resized?.unobserve(child));
    this.followed.delete(part);
    part.removeEventListener("scroll", onScroll);
    this.resized?.unobserve(part);
    part.classList.remove("fades", "fade-top", "fade-bottom");
  }
};

// src/seen.ts
var SeenStore = class {
  constructor(changed) {
    this.changed = changed;
    /** Each followed feed's stored keys: null for none ever stored, missing until the store has answered. */
    this.stored = /* @__PURE__ */ new Map();
    this.subscriptions = /* @__PURE__ */ new Map();
    /** Marks not yet written, with the feed's items to keep them in order. */
    this.pending = /* @__PURE__ */ new Map();
  }
  /** Follows these feeds' keys, and lets go of any others. */
  follow(hass, entities) {
    this.hass = hass;
    const connection = hass.connection;
    if (!connection) {
      return;
    }
    for (const entity of entities) {
      if (this.subscriptions.has(entity)) {
        continue;
      }
      const subscription = connection.subscribeMessage(
        ({ value }) => {
          this.stored.set(entity, Array.isArray(value) ? value.filter((key) => typeof key === "string") : null);
          this.changed();
        },
        { type: "frontend/subscribe_user_data", key: STORE_PREFIX + entity }
      );
      subscription.catch((error) => console.warn("feeds-card: no stored seen items for", entity, error));
      this.subscriptions.set(entity, subscription);
    }
    for (const [entity, subscription] of this.subscriptions) {
      if (!entities.includes(entity)) {
        this.release(entity, subscription);
      }
    }
  }
  /** Writes what is pending and lets go of every feed. */
  close() {
    this.save();
    for (const [entity, subscription] of this.subscriptions) {
      this.release(entity, subscription);
    }
  }
  /** The feed's seen keys, marks not yet written included, or undefined while the store hasn't answered. */
  seen(entity) {
    const stored = this.stored.get(entity);
    if (stored === void 0) {
      return void 0;
    }
    return /* @__PURE__ */ new Set([...stored ?? [], ...this.pending.get(entity)?.keys ?? []]);
  }
  /** Whether the user has never had anything stored for the feed. */
  isNew(entity) {
    return this.stored.get(entity) === null && !this.pending.has(entity);
  }
  /** Marks the items seen, written to Home Assistant a moment later together with any other marks. */
  mark(entity, keys, items) {
    const pending = this.pending.get(entity) ?? { keys: /* @__PURE__ */ new Set(), items };
    for (const key of keys) {
      pending.keys.add(key);
    }
    pending.items = items;
    this.pending.set(entity, pending);
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.save(), SAVE_DELAY_MS);
    this.changed();
  }
  save() {
    window.clearTimeout(this.timer);
    this.timer = void 0;
    const callWS = this.hass?.callWS?.bind(this.hass);
    for (const [entity, { keys, items }] of this.pending) {
      const stored = this.stored.get(entity) ?? [];
      const value = keptSeen(stored, /* @__PURE__ */ new Set([...stored, ...keys]), items);
      this.stored.set(entity, value);
      callWS?.({ type: "frontend/set_user_data", key: STORE_PREFIX + entity, value }).catch(
        (error) => console.warn("feeds-card: seen items not saved for", entity, error)
      );
    }
    this.pending.clear();
  }
  release(entity, subscription) {
    this.subscriptions.delete(entity);
    this.stored.delete(entity);
    subscription.then((unsubscribe) => unsubscribe()).catch(() => void 0);
  }
};

// src/feeds-card.ts
var UNSEEN = "unseen";
var NONE = "none";
var LIST_TOP_PX = 6;
var HEADER_PX = 44;
var LINE_PX = 41;
var BORDER_PX = 2;
var FIRST_ITEM_PX = [
  [350, 67],
  [284, 87],
  [252, 107],
  [222, 126],
  [194, 146],
  [164, 224],
  [0, 577]
];
var SECTION_ROOM_PX = 10;
var px = (value) => parseFloat(value) || 0;
var CARD_PARTS = [".hd", ".list"].map((part) => `:scope > ${part}`).join(", ");
function listEndHeight(list, scale = 1) {
  const style = getComputedStyle(list);
  let height = px(style.paddingTop) + px(style.paddingBottom);
  for (const child of list.children) {
    const part = child;
    const partStyle = getComputedStyle(part);
    const margins = px(partStyle.marginTop) + px(partStyle.marginBottom);
    if (!part.classList.contains("fold")) {
      height += margins + part.getBoundingClientRect().height / scale;
      continue;
    }
    const inner = part.firstElementChild;
    const content = inner?.firstElementChild;
    const last = content?.lastElementChild;
    if (!part.classList.contains("open") || !content || !last) {
      continue;
    }
    const contentStyle = getComputedStyle(content);
    height += margins + (last.getBoundingClientRect().bottom - content.getBoundingClientRect().top) / scale + px(getComputedStyle(last).marginBottom) + px(contentStyle.paddingBottom);
  }
  return height;
}
var FeedsCard = class extends i4 {
  constructor() {
    super();
    this.showAll = /* @__PURE__ */ new Set();
    this.sliding = false;
    this.filled = 0;
    this.spare = 0;
    this.width = 0;
    this.feeds = [];
    this.unseen = [];
    this.hadUnseen = false;
    /** Per feed, the keys of the items that were unseen when the card was loaded, or came in after it. */
    this.loaded = /* @__PURE__ */ new Map();
    this.store = new SeenStore(() => this.requestUpdate());
    this.seenTimers = /* @__PURE__ */ new Map();
    this.markAll = () => {
      for (const feed of this.feeds) {
        const keys = this.unseen.filter((u5) => u5.feed === feed).map((u5) => u5.item.key);
        if (keys.length > 0) {
          this.markSeen(feed, keys);
        }
      }
    };
    this.slid = (event) => {
      const fold = event.target;
      if (event.propertyName !== "grid-template-rows" || !fold.classList?.contains("fold")) {
        return;
      }
      const moving = [...this.renderRoot.querySelectorAll(".fold")].some((f3) => f3 !== fold && (f3.getAnimations?.().length ?? 0) > 0);
      if (!moving) {
        window.clearTimeout(this.slideTimer);
        this.sliding = false;
      }
    };
    new ScrollFade(this, () => this.heightStyle() ? this.renderRoot.querySelectorAll(".fold.open .scroll") : []);
  }
  static getConfigElement() {
    return document.createElement("feeds-card-editor");
  }
  static getStubConfig(hass) {
    return { entities: hass ? feedSensors(hass).slice(0, 2) : [] };
  }
  setConfig(config) {
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
  getCardSize() {
    return heightCardSize(this.config ?? {}, 1 + this.lineCount() + Math.min(this.unseen.length, 4), this.minimumHeight());
  }
  getGridOptions() {
    return { columns: 12, min_columns: 9, rows: "auto", min_rows: gridMinRows(this.minimumHeight()) };
  }
  /** One line for the unseen list, whether it has items or says there are none, and one per feed. */
  lineCount() {
    return 1 + feedConfigs(this.config?.entities).length;
  }
  /**
   * Held to a height, the header, every section line and the first item of the open section still fit, at any width the
   * card's 9 columns or more allow, or at its measured width if narrower. From the config and the width, never the data.
   */
  minimumHeight() {
    const width = this.width || Infinity;
    const firstItem = FIRST_ITEM_PX.find(([least]) => width >= least)[1];
    return HEADER_PX + LIST_TOP_PX + this.lineCount() * LINE_PX + firstItem + SECTION_ROOM_PX + BORDER_PX;
  }
  heightStyle() {
    return heightStyle(this.config ?? {}, this.layout, this.minimumHeight());
  }
  mode() {
    return this.config?.mark === "manual" ? "manual" : "auto";
  }
  connectedCallback() {
    super.connectedCallback();
    this.loaded.clear();
    this.open = void 0;
    this.resizes = new ResizeObserver(() => this.measureSoon());
    if (this.hasUpdated) {
      this.requestUpdate();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.store.close();
    this.seenObserver?.disconnect();
    this.seenObserver = void 0;
    this.seenTimers.forEach((timer) => window.clearTimeout(timer));
    this.seenTimers.clear();
    window.clearTimeout(this.slideTimer);
    this.sliding = false;
    this.resizes?.disconnect();
    cancelAnimationFrame(this.frame ?? 0);
  }
  shouldUpdate(changed) {
    if (!this.config || !changed.has("hass") || changed.size > 1) {
      return true;
    }
    const previous = changed.get("hass");
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
  willUpdate() {
    if (!this.hass || !this.config) {
      return;
    }
    const configs = feedConfigs(this.config.entities);
    this.store.follow(
      this.hass,
      configs.map((c5) => c5.entity)
    );
    this.feeds = configs.map((c5, index) => {
      const state = this.hass?.states[c5.entity];
      const name = c5.name || state && this.hass?.formatEntityName?.(state, [{ type: "device" }, { type: "entity" }]) || state?.attributes.friendly_name || c5.entity;
      return {
        entity: c5.entity,
        name,
        color: c5.color || FEED_COLORS[index % FEED_COLORS.length],
        items: readItems(state, this.config?.attribute)
      };
    });
    const manual = this.mode() === "manual";
    const unseen = [];
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
            feed.items
          );
        }
        continue;
      }
      const loaded = this.loaded.get(feed.entity) ?? /* @__PURE__ */ new Set();
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
    this.unseen = unseen.map((entry, index) => ({ entry, index })).sort((a3, b3) => (b3.entry.item.time ?? -Infinity) - (a3.entry.item.time ?? -Infinity) || a3.index - b3.index).map(({ entry }) => entry);
    if (!this.hadUnseen && this.unseen.length > 0) {
      this.open = void 0;
    }
    this.hadUnseen = this.unseen.length > 0;
  }
  updated() {
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
  openSection() {
    if (this.open === void 0 || this.open === UNSEEN && this.unseen.length === 0) {
      return this.unseen.length > 0 ? UNSEEN : NONE;
    }
    return this.open;
  }
  render() {
    if (!this.hass || !this.config) {
      return A;
    }
    const open = this.openSection();
    const title = this.config.title || this.text("common.title");
    const count = this.unseen.length === 1 ? this.text("common.unseen_one") : this.text("common.unseen", { n: this.unseen.length });
    return b2`
            <ha-card style=${this.cardStyle()} class=${this.cardClass()} @transitionend=${this.slid}>
                <div class="hd">
                    ${this.config.icon ? b2`<ha-icon class="hd-icon" icon=${this.config.icon}></ha-icon>` : A}
                    <div class="hd-title" title=${title}>${title}</div>
                    ${this.unseen.length > 0 ? b2`<span class="pill">${count}</span>` : A}
                </div>
                <div class="list">
                    ${this.unseen.length > 0 ? b2`${this.unseenLine(open === UNSEEN)}
                              ${this.fold(
      open === UNSEEN,
      b2`<div class="scroll">
                                      ${c4(
        this.unseen,
        (u5) => `${u5.feed.entity} ${u5.item.key}`,
        (u5) => this.itemRow(u5.feed, u5.item, { from: true, seen: u5.seen })
      )}
                                  </div>`
    )}` : this.nothingNew()}
                    ${this.feeds.map((feed) => this.feedSection(feed, open === feed.entity))}
                </div>
            </ha-card>
        `;
  }
  unseenLine(isOpen) {
    const label = this.text("common.unseen_section");
    const markAll = this.mode() === "manual" ? b2`<button class="mark-all" @click=${this.markAll}>${this.text("common.mark_all")}</button>` : A;
    return b2`<div class="line unseen">
            <button
                class="switch cover"
                aria-label=${label}
                aria-expanded=${isOpen ? "true" : "false"}
                @click=${() => this.switchTo(isOpen ? NONE : UNSEEN)}
            ></button>
            <span class="label" title=${label}>${label}</span>
            ${markAll}
            <ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
        </div>`;
  }
  /** In place of the unseen list while it is empty: the date of the newest item of all. */
  nothingNew() {
    const times = this.feeds.flatMap((feed) => feed.items ?? []).flatMap((item) => item.time === void 0 ? [] : [item.time]);
    const text2 = times.length ? this.text("common.nothing_new_latest", { date: this.shortDate(Math.max(...times)) }) : this.text("common.nothing_new");
    return b2`<div class="line none"><span class="label" title=${text2}>${text2}</span></div>`;
  }
  feedSection(feed, isOpen) {
    const unseenKeys = new Set(this.unseen.filter((u5) => u5.feed === feed).map((u5) => u5.item.key));
    const items = (feed.items ?? []).filter((item) => !unseenKeys.has(item.key));
    const limit = this.config?.items ?? DEFAULT_ITEMS;
    const all = this.showAll.has(feed.entity);
    const shown = all ? items : items.slice(0, limit);
    const count = !feed.items ? this.text("common.unavailable") : unseenKeys.size > 0 ? this.text("common.count_unseen", { n: items.length, unseen: unseenKeys.size }) : String(items.length);
    return b2`
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
      b2`<div class="scroll">
                    ${items.length === 0 ? b2`<div class="empty">
                                  ${this.text(!feed.items ? "common.no_entries" : unseenKeys.size > 0 ? "common.all_unseen" : "common.no_items")}
                              </div>` : c4(
        shown,
        (item) => item.key,
        (item) => this.itemRow(feed, item, { from: false, seen: true })
      )}
                    ${items.length > limit ? b2`<button class="more" @click=${() => this.toggleAll(feed.entity)}>
                                  ${all ? this.text("common.show_less") : this.text("common.show_all", { n: items.length })}
                              </button>` : A}
                </div>`
    )}
        `;
  }
  itemRow(feed, item, { from, seen }) {
    const classes = ["item", from && "new", from && seen && "seen"].filter(Boolean).join(" ");
    const title = item.link ? b2`<a class="title" href=${item.link} target="_blank" rel="noreferrer" @click=${() => this.markSeen(feed, [item.key])}
                  >${item.title}</a
              >` : b2`<span class="title">${item.title}</span>`;
    return b2`<div class=${classes} style="--fc: ${feed.color}" data-feed=${feed.entity} data-key=${item.key}>
            ${this.badge(item.time)}
            <div class="body">
                ${from ? b2`<div class="from"><span class="swatch"></span><span>${feed.name}</span></div>` : A} ${title}
            </div>
            ${from && this.mode() === "manual" ? b2`<button class="mark" title=${this.text("common.mark_read")} @click=${() => this.markSeen(feed, [item.key])}>
                          <ha-icon icon="mdi:check"></ha-icon>
                      </button>` : A}
        </div>`;
  }
  /** The day large, the month under it, and the year only when it isn't this year's. */
  badge(time) {
    if (time === void 0) {
      return b2`<div class="badge"><div class="day">–</div></div>`;
    }
    const part = (options, date = new Date(time)) => new Intl.DateTimeFormat(this.language(), { ...options, timeZone: this.timeZone() }).format(date);
    const year = part({ year: "numeric" });
    return b2`<div class="badge" title=${this.longDate(time)}>
            <div class="day">${part({ day: "numeric" })}</div>
            <div class="month">${part({ month: "short" })}</div>
            ${year === part({ year: "numeric" }, /* @__PURE__ */ new Date()) ? A : b2`<div class="year">${year}</div>`}
        </div>`;
  }
  shortDate(time) {
    return new Intl.DateTimeFormat(this.language(), { day: "numeric", month: "numeric", timeZone: this.timeZone() }).format(
      new Date(time)
    );
  }
  longDate(time) {
    return new Intl.DateTimeFormat(this.language(), { dateStyle: "medium", timeStyle: "short", timeZone: this.timeZone() }).format(
      new Date(time)
    );
  }
  timeZone() {
    return this.hass?.locale?.time_zone === "server" ? this.hass.config?.time_zone : void 0;
  }
  markSeen(feed, keys) {
    if (feed.items) {
      this.store.mark(feed.entity, keys, feed.items);
    }
  }
  toggleAll(entity) {
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
  watchSeen() {
    if (this.mode() !== "auto" || typeof IntersectionObserver === "undefined") {
      return;
    }
    this.seenObserver ?? (this.seenObserver = new IntersectionObserver(
      (entries) => {
        for (const { target, intersectionRatio } of entries) {
          const timer = this.seenTimers.get(target);
          if (intersectionRatio >= SEEN_RATIO && timer === void 0) {
            this.seenTimers.set(
              target,
              window.setTimeout(() => this.seenOnScreen(target), SEEN_AFTER_MS)
            );
          } else if (intersectionRatio < SEEN_RATIO && timer !== void 0) {
            window.clearTimeout(timer);
            this.seenTimers.delete(target);
          }
        }
      },
      { threshold: [0, SEEN_RATIO] }
    ));
    for (const element of this.renderRoot.querySelectorAll(".item.new:not(.seen)")) {
      this.seenObserver.observe(element);
    }
  }
  seenOnScreen(element) {
    this.seenTimers.delete(element);
    this.seenObserver?.unobserve(element);
    if (document.visibilityState !== "visible" || !element.isConnected) {
      this.requestUpdate();
      return;
    }
    const feed = this.feeds.find((f3) => f3.entity === element.dataset.feed);
    if (feed && element.dataset.key) {
      this.markSeen(feed, [element.dataset.key]);
    }
  }
  switchTo(target) {
    this.open = target;
    this.sliding = true;
    window.clearTimeout(this.slideTimer);
    this.slideTimer = window.setTimeout(() => this.sliding = false, 1e3);
  }
  /** Content that slides open and shut. A shut one stays in the page, so the change can be animated. */
  fold(isOpen, content) {
    return b2`<div class="fold ${isOpen ? "open" : ""}" ?inert=${!isOpen}>
            <div class="fold-in">${content}</div>
        </div>`;
  }
  measureSoon() {
    cancelAnimationFrame(this.frame ?? 0);
    this.frame = requestAnimationFrame(() => this.fillRows());
  }
  fillRows() {
    const card = this.renderRoot.querySelector("ha-card");
    if (!card || !card.clientWidth) {
      return;
    }
    const scale = drawnScale(card);
    const width = Math.round(card.getBoundingClientRect().width / scale);
    if (width !== this.width) {
      this.width = width;
    }
    const limit = fillLimit(this.config ?? {}, this.layout, this.minimumHeight());
    if (!limit) {
      if (this.filled) this.filled = 0;
      if (this.spare) this.spare = 0;
      return;
    }
    const style = getComputedStyle(card);
    let content = px(style.borderTopWidth) + px(style.borderBottomWidth) + px(style.paddingTop) + px(style.paddingBottom);
    for (const part of card.querySelectorAll(CARD_PARTS)) {
      const partStyle = getComputedStyle(part);
      const height = part.classList.contains("list") ? listEndHeight(part, scale) : part.getBoundingClientRect().height / scale;
      content += px(partStyle.marginTop) + height + px(partStyle.marginBottom);
    }
    const list = card.querySelector(":scope > .list");
    content -= list ? Math.max(0, px(getComputedStyle(list).paddingTop) - LIST_TOP_PX) : 0;
    const filled = filledHeight(content, this.config ?? {}, limit);
    const spare = spareRoom(filled, content);
    if (filled !== this.filled) {
      this.filled = filled;
    }
    if (spare !== this.spare) {
      this.spare = spare;
    }
  }
  /** The card's inline style: the height it is held to, or the rows it fills up to any limit, with their spare room under the header. */
  cardStyle() {
    const style = filledStyle(this.config ?? {}, this.layout, this.minimumHeight(), this.filled);
    return this.filled ? `${style}; --fc-spare: ${this.spare}px` : style;
  }
  cardClass() {
    return [this.heightStyle() && "held", this.sliding && "sliding"].filter(Boolean).join(" ");
  }
  text(key, values = {}) {
    return Object.entries(values).reduce(
      (text2, [name, value]) => text2.replaceAll(`{${name}}`, String(value)),
      translate(this.language(), key)
    );
  }
  language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
  }
  static get styles() {
    return [
      i`
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

                .pill {
                    flex: none;
                    font-size: 12px;
                    font-weight: 500;
                    white-space: nowrap;
                    border-radius: 10px;
                    padding: 1px 8px;
                    background: var(--primary-color);
                    color: var(--text-primary-color, #fff);
                }

                /* The room a whole row leaves over goes under the header, above the list. */
                .list {
                    flex: 1 1 auto;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                    padding-top: calc(6px + var(--fc-spare, 0px));
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

                .line.unseen {
                    position: relative;
                    min-height: 40px;
                    gap: 8px;
                    padding: 0 12px 0 16px;
                }

                .switch.cover {
                    position: absolute;
                    inset: 0;
                    min-height: 0;
                    padding: 0;
                }

                .line.unseen > .label,
                .line.unseen > .chev {
                    pointer-events: none;
                }

                .mark-all {
                    position: relative;
                }

                .switch[aria-expanded="false"] ~ .chev {
                    transform: rotate(-90deg);
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
      fadeStyles
    ];
  }
};
__decorateClass([
  n4({ attribute: false })
], FeedsCard.prototype, "hass", 2);
__decorateClass([
  n4({ attribute: false })
], FeedsCard.prototype, "layout", 2);
__decorateClass([
  r5()
], FeedsCard.prototype, "config", 2);
__decorateClass([
  r5()
], FeedsCard.prototype, "open", 2);
__decorateClass([
  r5()
], FeedsCard.prototype, "showAll", 2);
__decorateClass([
  r5()
], FeedsCard.prototype, "sliding", 2);
__decorateClass([
  r5()
], FeedsCard.prototype, "filled", 2);
__decorateClass([
  r5()
], FeedsCard.prototype, "spare", 2);
__decorateClass([
  r5()
], FeedsCard.prototype, "width", 2);
if (!customElements.get("feeds-card")) {
  customElements.define("feeds-card", FeedsCard);
  console.info(
    `%c  FEEDS-CARD 
%c  ${CARD_VERSION}    `,
    "color: orange; font-weight: bold; background: black",
    "color: white; font-weight: bold; background: dimgray"
  );
  const registry = window;
  registry.customCards = registry.customCards ?? [];
  registry.customCards.push({
    type: "feeds-card",
    name: translate(browserLanguage(), "common.name"),
    description: translate(browserLanguage(), "common.description"),
    documentationURL: "https://github.com/jesmak/feeds-card",
    preview: true
  });
}
export {
  FeedsCard,
  listEndHeight
};
