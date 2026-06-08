/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard, PublishPricingModal,
   IcX, IcAlertTri, IcInfo, IcCheck, IcChevDown, IcChevRight */
// publish-modal-variations.jsx — 5 design variations of the "Publish v3" confirmation modal.

const { useState } = React;

// ── Shared sample scenario ──────────────────────────────
// Same data feeds every artboard so the user can compare like-for-like.
const VERSION = "v3 pricing";
const NEW_PLANS        = [{ name: "Trial" }];
const DEPRECATED_PLANS = [{ name: "Starter", subs: 38, policy: "notify" }];
const METER_CHANGES    = [
  { name: "AI Content API Meter", fromRaw: "5", toRaw: "7" }
];
const T30_TOTAL = 38;   // sum of T+30 subs
const GF_TOTAL  = 0;    // no grandfather here
const TOTAL_AFFECTED = T30_TOTAL + GF_TOTAL;
const TOTAL_CHANGES = NEW_PLANS.length + DEPRECATED_PLANS.length + METER_CHANGES.length;

const fmtMoney = (raw) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
};

// Local arrow icon (slimmer than IcChevRight for inline diff use)
const IcArrowR = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>
  </svg>
);
const IcUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Page chrome stub used inside each artboard ──────────
const PageChrome = ({ crumb = "v3 pricing" }) => (
  <div className="pmv-pagechrome">
    <span className="brand">Marketplace</span>
    <span className="crumb">vdraft</span>
    <span className="crumb">Pricing</span>
    <span className="crumb cur">{crumb}</span>
  </div>
);

// ════════════════════════════════════════════════════════
// V1 — Current baseline (renders the existing PublishPricingModal)
// ════════════════════════════════════════════════════════
const V1 = () => (
  <div className="pmv-stage">
    <PageChrome/>
    {/* Render the production modal directly so it stays a faithful baseline. */}
    {/* Wrap to prevent its built-in scrim from re-darkening (we already dim). */}
    <div style={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: 12 }}>
      <div style={{ position: "relative" }}>
        <PublishPricingModalStatic/>
      </div>
    </div>
  </div>
);

// Static, scrim-less wrapper around the existing PublishPricingModal so it can sit
// inside the design canvas without its own full-screen overlay swallowing layout.
const PublishPricingModalStatic = () => {
  // Re-implementing the visual structure of the existing modal here keeps the
  // canvas free of stacking-context conflicts. Same classnames → identical styling.
  return (
    <div className="bm publish-modal" style={{ width: 640, boxShadow: "0 20px 48px rgba(16,24,40,0.2)", borderRadius: 12, overflow: "hidden", background: "#fff" }} role="dialog" aria-modal="true">
      <div className="hd">
        <div className="title-block">
          <span className="head-icon publish-head-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </span>
          <div>
            <h2>Publish {VERSION}</h2>
            <p>Review what's changing. This replaces the current live config.</p>
          </div>
        </div>
        <button className="x" aria-label="Close"><IcClose/></button>
      </div>

      <div className="body publish-modal-body">
        <div className="publish-warn notice notice--warn" role="note">
          <span className="notice-ic" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>
          <div className="notice-body">
            <strong>Subscribers on deprecated plans will be notified at publish.</strong>
          </div>
        </div>

        <section className="publish-section">
          <header className="publish-section-head">
            <h4>What's changing</h4>
            <span className="publish-section-count">{TOTAL_CHANGES} changes</span>
          </header>
          <ul className="publish-change-list">
            <li className="publish-change publish-change--new">
              <span className="publish-change-pip" aria-hidden>+</span>
              <div className="publish-change-body">
                <div className="publish-change-title">1 new plan added</div>
                <div className="publish-change-detail">
                  <span className="publish-pill publish-pill--new">Trial</span>
                </div>
              </div>
            </li>
            <li className="publish-change publish-change--dep">
              <span className="publish-change-pip" aria-hidden>−</span>
              <div className="publish-change-body">
                <div className="publish-change-title">1 plan deprecated</div>
                <div className="publish-change-detail">
                  <span className="publish-pill publish-pill--dep">
                    <span className="publish-pill-name">Starter</span>
                    <span className="publish-pill-policy">T+30 notice</span>
                  </span>
                </div>
              </div>
            </li>
            <li className="publish-change publish-change--rate">
              <span className="publish-change-pip" aria-hidden>$</span>
              <div className="publish-change-body">
                <div className="publish-change-title">1 meter rate change</div>
                <div className="publish-change-detail publish-change-detail--rates">
                  <div className="publish-rate">
                    <span className="publish-rate-name">AI Content API Meter</span>
                    <span className="publish-rate-track">
                      <span className="publish-rate-from">$5</span>
                      <IcArrowR/>
                      <span className="publish-rate-to">$7</span>
                    </span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <section className="publish-section">
          <header className="publish-section-head"><h4>Subscriber impact</h4></header>
          <div className="publish-impact">
            <div className="publish-impact-row">
              <div className="publish-impact-num">{T30_TOTAL}</div>
              <div className="publish-impact-meta">
                <div className="publish-impact-label">subscribers on T+30 notice</div>
                <div className="publish-impact-sub">Notified at publish · auto-migrated 30 days later</div>
                <ul className="publish-impact-plans">
                  <li>
                    <span className="publish-impact-plan-name">Starter</span>
                    <span className="publish-impact-plan-subs"><strong>38</strong> subscribers</span>
                  </li>
                </ul>
              </div>
              <span className="policy-chip publish-policy-chip publish-policy-chip--t30">T+30 notice</span>
            </div>
          </div>
        </section>
      </div>

      <div className="publish-foot">
        <button className="btn">Go back</button>
        <button className="btn pub-cta">Confirm publish</button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// V2 — Compact summary-first
// ════════════════════════════════════════════════════════
const V2 = () => (
  <div className="pmv-stage">
    <PageChrome/>
    <div className="pmv-modal pmv-v2">
      <div className="pmv-v2-head">
        <div>
          <h2>Publish draft</h2>
          <span className="ver">{VERSION}</span>
        </div>
        <button className="x" aria-label="Close" style={{ width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", borderRadius: 8, color: "var(--hr-gray-500)", cursor: "pointer" }}><IcClose/></button>
      </div>

      <div className="pmv-v2-body">
        <div className="pmv-v2-stats">
          <div className="pmv-v2-stat is-new">
            <span className="num">+1</span>
            <span className="lbl">New plan</span>
          </div>
          <div className="pmv-v2-stat is-dep">
            <span className="num">−1</span>
            <span className="lbl">Deprecated</span>
          </div>
          <div className="pmv-v2-stat is-rate">
            <span className="num">1</span>
            <span className="lbl">Rate change</span>
          </div>
        </div>

        <ul className="pmv-v2-list">
          <li>
            <span className="glyph glyph--new">+</span>
            <span><strong style={{ fontWeight: 600 }}>Trial</strong> plan added · $49 / mo</span>
            <span className="meta">no subscribers yet</span>
          </li>
          <li>
            <span className="glyph glyph--dep">−</span>
            <span><strong style={{ fontWeight: 600 }}>Starter</strong> deprecated · T+30 notice</span>
            <span className="meta">38 subscribers</span>
          </li>
          <li>
            <span className="glyph glyph--rate">$</span>
            <span><strong style={{ fontWeight: 600 }}>AI Content API Meter</strong></span>
            <span className="rate">
              <s>$5</s> <IcArrowR/> <span className="to">$7</span> / 1k tokens
            </span>
          </li>
        </ul>

        <div className="pmv-v2-impact">
          <IcUsers/>
          <div>
            <strong>38 subscribers</strong> will be notified at publish and auto-migrated in 30 days.
          </div>
        </div>
      </div>

      <div className="pmv-foot">
        <button className="btn">Cancel</button>
        <button className="btn pub-cta">Publish {VERSION}</button>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════
// V3 — Side-by-side diff
// ════════════════════════════════════════════════════════
const V3DiffRow = ({ kind, name, price, tag }) => {
  if (kind === "ghost") return <div className="pmv-v3-row pmv-v3-row--ghost">— not in this version —</div>;
  return (
    <div className={`pmv-v3-row pmv-v3-row--${kind}`}>
      <span className="nm">
        {name}
        {tag && <span className={`pmv-v3-tag pmv-v3-tag--${tag.k}`}>{tag.t}</span>}
      </span>
      <span className="px">{price}</span>
    </div>
  );
};

const V3 = () => (
  <div className="pmv-stage">
    <PageChrome/>
    <div className="pmv-modal pmv-v3">
      <div className="pmv-v3-head">
        <div>
          <h2>Review changes</h2>
          <div className="sub">Side-by-side · this replaces the current live config</div>
        </div>
        <button className="x" aria-label="Close" style={{ width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", borderRadius: 8, color: "var(--hr-gray-500)", cursor: "pointer" }}><IcClose/></button>
      </div>

      <div className="pmv-v3-body">
        {/* Plans */}
        <section>
          <div className="pmv-v3-sec-head"><span>Plans</span><span>4 → 4 · 1 added · 1 deprecated</span></div>
          <div className="pmv-v3-cols">
            <div className="pmv-v3-col pmv-v3-col--live">
              <div className="pmv-v3-col-head">
                <span className="live-dot"/>Live <span className="vtag">v2</span>
              </div>
              <V3DiffRow kind="kept" name="Free Plan" price="Free"/>
              <V3DiffRow kind="kept"    name="Pro" price="$197 / mo"/>
              <V3DiffRow kind="gone"    name="Starter" price="$100 / mo"/>
              <V3DiffRow kind="ghost"/>
            </div>
            <div className="pmv-v3-arrow"><IcArrowR/></div>
            <div className="pmv-v3-col pmv-v3-col--draft">
              <div className="pmv-v3-col-head">
                Draft <span className="vtag">{VERSION}</span>
              </div>
              <V3DiffRow kind="kept" name="Free Plan" price="Free"/>
              <V3DiffRow kind="kept"    name="Pro" price="$197 / mo"/>
              <V3DiffRow kind="kept"   name="Starter" price="$100 / mo" tag={{ k: "dep", t: "Deprecated · T+30" }}/>
              <V3DiffRow kind="new"     name="Trial" price="$49 / mo" tag={{ k: "new", t: "New" }}/>
            </div>
          </div>
        </section>

        {/* Meters */}
        <section>
          <div className="pmv-v3-sec-head"><span>Billing meters</span><span>3 · 1 rate change</span></div>
          <div className="pmv-v3-cols">
            <div className="pmv-v3-col pmv-v3-col--live">
              <V3DiffRow kind="kept" name="Phone Validation Meter" price="$0.005 / exec"/>
              <V3DiffRow kind="kept" name="iMessage meter" price="$0.002 / msg"/>
              <V3DiffRow kind="changed" name="AI Content API Meter" price="$5 / 1k tokens"/>
            </div>
            <div className="pmv-v3-arrow"><IcArrowR/></div>
            <div className="pmv-v3-col pmv-v3-col--draft">
              <V3DiffRow kind="kept" name="Phone Validation Meter" price="$0.005 / exec"/>
              <V3DiffRow kind="kept" name="iMessage meter" price="$0.002 / msg"/>
              <V3DiffRow kind="changed" name="AI Content API Meter" price="$7 / 1k tokens" tag={{ k: "changed", t: "+40%" }}/>
            </div>
          </div>
        </section>
      </div>

      <div className="pmv-foot">
        <span className="pmv-v3-footer-note pmv-foot-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span><strong style={{ color: "var(--hr-gray-900)" }}>38</strong> subscribers will be notified at publish.</span>
        </span>
        <button className="btn">Cancel</button>
        <button className="btn pub-cta">Publish {VERSION}</button>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════
// V4 — Two-step (Review → Schedule)
// ════════════════════════════════════════════════════════
const V4 = () => {
  const [mode, setMode] = useState("now"); // "now" | "later"

  return (
    <div className="pmv-stage">
      <PageChrome/>
      <div className="pmv-modal pmv-v4">
        {/* Stepper */}
        <div className="pmv-v4-stepbar">
          <span className="pmv-v4-step is-done">
            <span className="n"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg></span>
            Review
          </span>
          <span className="bar is-done"/>
          <span className="pmv-v4-step is-active">
            <span className="n">2</span>
            Schedule
          </span>
          <button className="x" aria-label="Close" style={{ marginLeft: "auto", width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", borderRadius: 8, color: "var(--hr-gray-500)", cursor: "pointer" }}><IcClose/></button>
        </div>

        <div className="pmv-v4-body">
          <div className="pmv-v4-review-mini">
            <span className="ver">{VERSION}</span>
            <span>3 changes · 38 subscribers affected</span>
            <button className="back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="11 6 5 12 11 18"/></svg>
              Review again
            </button>
          </div>

          <div>
            <div className="pmv-v4-section-label" style={{ marginBottom: 8 }}>When should this go live?</div>
            <div className="pmv-v4-seg">
              <button className={`pmv-v4-seg-opt${mode === "now" ? " is-active" : ""}`} onClick={() => setMode("now")}>
                <span className="t">Publish now</span>
                <span className="d">Live immediately · notifications send today</span>
              </button>
              <button className={`pmv-v4-seg-opt${mode === "later" ? " is-active" : ""}`} onClick={() => setMode("later")}>
                <span className="t">Schedule</span>
                <span className="d">Goes live at a chosen date · notice clock starts then</span>
              </button>
            </div>
          </div>

          {mode === "later" && (
            <div className="pmv-v4-when">
              <div className="field">
                <label>Publish date</label>
                <input type="text" defaultValue="Jun 22, 2026" readOnly/>
              </div>
              <div className="field">
                <label>Time</label>
                <input type="text" defaultValue="9:00 AM" readOnly/>
              </div>
              <div className="field">
                <label>Time zone</label>
                <select defaultValue="UTC-8">
                  <option>UTC-8 · Pacific</option>
                  <option>UTC-5 · Eastern</option>
                  <option>UTC+0 · GMT</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <div className="pmv-v4-section-label" style={{ marginBottom: 8 }}>Timeline</div>
            <div className="pmv-v4-timeline">
              {mode === "now" ? (
                <>
                  <div className="pmv-v4-tl-row is-now"><span className="when">Today</span><span className="what">{VERSION} replaces v2 as live config</span></div>
                  <div className="pmv-v4-tl-row is-now"><span className="when">Today</span><span className="what">38 Starter subscribers get T+30 notice email</span></div>
                  <div className="pmv-v4-tl-row"><span className="when">Day +30</span><span className="what">Starter subscribers auto-migrate · plan archives</span></div>
                </>
              ) : (
                <>
                  <div className="pmv-v4-tl-row"><span className="when">Jun 22</span><span className="what">{VERSION} goes live · notice emails send</span></div>
                  <div className="pmv-v4-tl-row"><span className="when">Jul 22</span><span className="what">Starter subscribers auto-migrate</span></div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pmv-foot">
          <button className="btn pmv-foot-left">← Back</button>
          <button className="btn">Cancel</button>
          <button className="btn pub-cta">
            {mode === "now" ? "Publish now" : "Schedule publish"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// V5 — Impact-led + type-to-confirm
// ════════════════════════════════════════════════════════
const V5 = () => {
  const [text, setText] = useState("");
  const isMatch = text.trim() === VERSION;

  return (
    <div className="pmv-stage">
      <PageChrome/>
      <div className="pmv-modal pmv-v5">
        <div className="pmv-v5-top">
          <span className="ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>
          <h2><span className="num">{TOTAL_AFFECTED}</span> subscribers will be affected</h2>
          <p className="sub">Publishing <strong style={{ color: "var(--hr-gray-900)" }}>{VERSION}</strong> sends notice emails today and starts the 30-day migration clock. Existing billing isn't disrupted.</p>
        </div>

        <div className="pmv-v5-mid">
          <div className="pmv-v5-breakdown">
            <div className="pmv-v5-bd pmv-v5-bd--t30">
              <div className="num">38</div>
              <div className="lbl">on T+30 notice</div>
              <div className="meta">Starter</div>
            </div>
            <div className="pmv-v5-bd pmv-v5-bd--gf">
              <div className="num">0</div>
              <div className="lbl">grandfathered</div>
              <div className="meta">— none —</div>
            </div>
          </div>

          <details className="pmv-v5-details">
            <summary>
              <span>What's changing · {TOTAL_CHANGES} items</span>
              <span className="chev"><IcChevDown style={{ width: 16, height: 16 }}/></span>
            </summary>
            <ul className="pmv-v5-details-list">
              <li>
                <span className="glyph glyph--new">+</span>
                <span>Trial plan added · $49 / mo</span>
                <span className="meta">new</span>
              </li>
              <li>
                <span className="glyph glyph--dep">−</span>
                <span>Starter deprecated · T+30 notice</span>
                <span className="meta">38 subs</span>
              </li>
              <li>
                <span className="glyph glyph--rate">$</span>
                <span>AI Content API Meter · $5 → $7 / 1k tokens</span>
                <span className="meta">+40%</span>
              </li>
            </ul>
          </details>
        </div>

        <div className="pmv-v5-confirm">
          <label>Type <code>{VERSION}</code> to confirm:</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={VERSION}
            className={isMatch ? "is-match" : ""}
          />
        </div>

        <div className="pmv-foot">
          <button className="btn">Cancel</button>
          <button className="btn-danger" disabled={!isMatch}>
            Publish &amp; notify {TOTAL_AFFECTED}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Export variations so save-modal-variations.jsx can mount them ───
window.PublishVariations = { V1, V2, V3, V4, V5, PageChrome, VERSION };
