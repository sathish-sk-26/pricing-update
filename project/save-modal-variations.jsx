/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard, PublishVariations */
// save-modal-variations.jsx — 5 design variations of the "Save pricing" modal,
// triggered from the Setup view's Save button. Same chrome as publish modal,
// but content driven by setup context: model + plans + meters + free trial.

const { useState: useSavState } = React;

const { V1: PubV1, V2: PubV2, V3: PubV3, V4: PubV4, V5: PubV5, PageChrome } = window.PublishVariations;

// ── Setup-mode sample data (mirrors pricing-app.jsx defaults) ──
const SETUP = {
  model: "Freemium",
  plans: [
    { name: "Free Plan", charge: "Free",    agency: "Free",    subacct: "—" },
    { name: "Starter",   charge: "Monthly", agency: "$100.00", subacct: "Free" },
    { name: "Pro",       charge: "Monthly", agency: "$197.00", subacct: "$5.00" },
  ],
  meters: [
    { name: "Phone Validation Meter", module: "Phone Validation",   price: "$0.005", unit: "per execution" },
    { name: "iMessage meter",         module: "iMessage Integration", price: "$0.002", unit: "per outbound message" },
    { name: "AI Content API Meter",   module: "AI Content Generation", price: "$5",    unit: "per 1000 tokens" },
  ],
  trial: { on: true, days: 14 },
};

// ── Local icons for save context ──
const IcSave = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IcLayersSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);
const IcMeterSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <circle cx="12" cy="14" r="8"/><path d="M12 14l4-4"/><path d="M9 2h6"/>
  </svg>
);
const IcClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcModelSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcInfoCirc = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const IcCloseSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const closeBtnStyle = {
  width: 32, height: 32,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  border: "none", background: "transparent", borderRadius: 8,
  color: "var(--hr-gray-500)", cursor: "pointer",
};

const PLAN_COUNT = SETUP.plans.length;
const METER_COUNT = SETUP.meters.length;

// ════════════════════════════════════════════════════════
// SV1 — Current-baseline shape (Save mode)
// ════════════════════════════════════════════════════════
const SV1 = () => (
  <div className="pmv-stage">
    <PageChrome crumb="Pricing"/>
    <div className="bm publish-modal" style={{ width: 640, boxShadow: "0 20px 48px rgba(16,24,40,0.2)", borderRadius: 12, overflow: "hidden", background: "#fff" }} role="dialog" aria-modal="true">
      <div className="hd">
        <div className="title-block">
          <span className="head-icon publish-head-icon"><IcSave/></span>
          <div>
            <h2>Save pricing</h2>
            <p>Review what you've set up. Saving stores this as your initial draft.</p>
          </div>
        </div>
        <button className="x" aria-label="Close"><IcCloseSm/></button>
      </div>

      <div className="body publish-modal-body">
        <div className="pmv-save-info" role="note">
          <IcInfoCirc/>
          <div>
            <strong>Not live yet.</strong>{" "}
            Your pricing stays internal until you publish it from the draft view.
          </div>
        </div>

        <section className="publish-section">
          <header className="publish-section-head">
            <h4>What you've set up</h4>
            <span className="publish-section-count">
              {PLAN_COUNT + METER_COUNT + 1} items
            </span>
          </header>

          <ul className="pmv-save-list">
            <li>
              <span className="ic"><IcModelSm/></span>
              <div>
                <div className="label">Business model</div>
                <div className="val">{SETUP.model}</div>
              </div>
              <span className="meta">free + paid plans</span>
            </li>

            <li>
              <span className="ic"><IcLayersSm/></span>
              <div>
                <div className="label">{PLAN_COUNT} plans</div>
                <div className="pmv-save-chips">
                  {SETUP.plans.map((p) => (
                    <span key={p.name} className="pmv-save-chip">
                      {p.name}
                      <span className="px">
                        {p.charge === "Free" ? "Free" : `${p.agency}/mo agency`}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <span className="meta">{PLAN_COUNT} of 10</span>
            </li>

            <li>
              <span className="ic"><IcMeterSm/></span>
              <div>
                <div className="label">{METER_COUNT} billing meters</div>
                <div className="pmv-save-chips">
                  {SETUP.meters.map((m) => (
                    <span key={m.name} className="pmv-save-chip">
                      {m.module}
                      <span className="px">{m.price} {m.unit.replace(/^per /, "/ ")}</span>
                    </span>
                  ))}
                </div>
              </div>
              <span className="meta"/>
            </li>

            <li>
              <span className="ic"><IcClock/></span>
              <div>
                <div className="label">Free trial</div>
                <div className="val">{SETUP.trial.days} days, then bills installer</div>
              </div>
              <span className="meta" style={{ color: "var(--hr-success-700)", fontWeight: 600 }}>On</span>
            </li>
          </ul>
        </section>
      </div>

      <div className="publish-foot">
        <button className="btn">Cancel</button>
        <button className="btn pub-cta">Save pricing</button>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════
// SV2 — Compact summary-first (Save mode)
// ════════════════════════════════════════════════════════
const SV2 = () => (
  <div className="pmv-stage">
    <PageChrome crumb="Pricing"/>
    <div className="pmv-modal pmv-v2">
      <div className="pmv-v2-head">
        <div>
          <h2>Save pricing</h2>
          <span className="ver">Initial draft</span>
        </div>
        <button style={closeBtnStyle} aria-label="Close"><IcCloseSm/></button>
      </div>

      <div className="pmv-v2-body">
        <div className="pmv-v2-stats">
          <div className="pmv-v2-stat is-neutral">
            <span className="num">{PLAN_COUNT}</span>
            <span className="lbl">Plans</span>
          </div>
          <div className="pmv-v2-stat is-neutral">
            <span className="num">{METER_COUNT}</span>
            <span className="lbl">Meters</span>
          </div>
          <div className="pmv-v2-stat is-neutral">
            <span className="num">{SETUP.trial.days}d</span>
            <span className="lbl">Trial</span>
          </div>
        </div>

        <ul className="pmv-v2-list">
          <li>
            <span className="glyph glyph--rate" style={{ background: "var(--hr-gray-100)", color: "var(--hr-gray-700)" }}>M</span>
            <span>Model · <strong style={{ fontWeight: 600 }}>{SETUP.model}</strong></span>
            <span className="meta">free + paid</span>
          </li>
          {SETUP.plans.map((p) => (
            <li key={p.name}>
              <span className="glyph glyph--new" style={{ background: "var(--hr-primary-50)", color: "var(--hr-primary-700)" }}>
                <IcLayersSm/>
              </span>
              <span><strong style={{ fontWeight: 600 }}>{p.name}</strong> · {p.charge.toLowerCase()}</span>
              <span className="meta">{p.charge === "Free" ? "—" : `${p.agency}/mo`}</span>
            </li>
          ))}
          {SETUP.meters.map((m) => (
            <li key={m.name}>
              <span className="glyph glyph--rate"><IcMeterSm/></span>
              <span><strong style={{ fontWeight: 600 }}>{m.module}</strong></span>
              <span className="rate"><span className="to">{m.price}</span> {m.unit}</span>
            </li>
          ))}
          <li>
            <span className="glyph glyph--new" style={{ background: "var(--hr-success-50)", color: "var(--hr-success-700)" }}>
              <IcClock/>
            </span>
            <span>Free trial · <strong style={{ fontWeight: 600 }}>{SETUP.trial.days} days</strong></span>
            <span className="meta">on</span>
          </li>
        </ul>

        <div className="pmv-v2-impact" style={{ background: "var(--hr-primary-25)", borderColor: "var(--hr-primary-200)", color: "var(--hr-primary-900)" }}>
          <IcInfoCirc/>
          <div>
            <strong>Saves as a draft.</strong> Nothing goes live until you publish from the draft view.
          </div>
        </div>
      </div>

      <div className="pmv-foot">
        <button className="btn">Cancel</button>
        <button className="btn pub-cta">Save pricing</button>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════
// SV3 — Snapshot two-column (Plans | Meters), Save mode
// ════════════════════════════════════════════════════════
const SV3SnapshotRow = ({ title, sub, right }) => (
  <div className="pmv-v3-row pmv-v3-row--kept" style={{ alignItems: "flex-start" }}>
    <span className="nm" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span>{title}</span>
      {sub && <span style={{ fontSize: 11, color: "var(--hr-gray-500)", fontWeight: 400 }}>{sub}</span>}
    </span>
    <span className="px">{right}</span>
  </div>
);

const SV3 = () => (
  <div className="pmv-stage">
    <PageChrome crumb="Pricing"/>
    <div className="pmv-modal pmv-v3">
      <div className="pmv-v3-head">
        <div>
          <h2>Save pricing</h2>
          <div className="sub">Snapshot of your draft · model is {SETUP.model.toLowerCase()}</div>
        </div>
        <button style={closeBtnStyle} aria-label="Close"><IcCloseSm/></button>
      </div>

      <div className="pmv-v3-body">
        <div className="pmv-v3-snapshot">
          <div>
            <div className="col-head">
              <span>Plans</span><span className="count">{PLAN_COUNT}</span>
            </div>
            <div className="col-body">
              {SETUP.plans.map((p) => (
                <SV3SnapshotRow
                  key={p.name}
                  title={p.name}
                  sub={p.charge === "Free" ? "Free, forever" : `${p.charge} · sub-account ${p.subacct}`}
                  right={p.charge === "Free" ? "Free" : `${p.agency} / mo`}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="col-head">
              <span>Billing meters</span><span className="count">{METER_COUNT}</span>
            </div>
            <div className="col-body">
              {SETUP.meters.map((m) => (
                <SV3SnapshotRow
                  key={m.name}
                  title={m.module}
                  sub={m.name}
                  right={`${m.price} / ${m.unit.replace(/^per /, "")}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pmv-v3-trial-bar">
          <span className="ic"><IcClock/></span>
          <div>
            <div className="t">Free trial · <span className="num">{SETUP.trial.days}</span> days</div>
            <div className="d">Installers get full access to paid plans before billing starts.</div>
          </div>
          <span className="on">{SETUP.trial.on ? "On" : "Off"}</span>
        </div>
      </div>

      <div className="pmv-foot">
        <span className="pmv-v3-footer-note pmv-foot-left">
          <IcInfoCirc/>
          <span>Saves as draft · publish from the draft view when ready.</span>
        </span>
        <button className="btn">Cancel</button>
        <button className="btn pub-cta">Save pricing</button>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════
// SV4 — Two-step (Save & continue OR Save & publish later)
// ════════════════════════════════════════════════════════
const SV4 = () => {
  const [mode, setMode] = useSavState("draft"); // draft | publishNow

  return (
    <div className="pmv-stage">
      <PageChrome crumb="Pricing"/>
      <div className="pmv-modal pmv-v4">
        <div className="pmv-v4-stepbar">
          <span className="pmv-v4-step is-done">
            <span className="n"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg></span>
            Review setup
          </span>
          <span className="bar is-done"/>
          <span className="pmv-v4-step is-active">
            <span className="n">2</span>
            Save
          </span>
          <button style={{ ...closeBtnStyle, marginLeft: "auto", width: 28, height: 28 }} aria-label="Close"><IcCloseSm/></button>
        </div>

        <div className="pmv-v4-body">
          <div className="pmv-v4-review-mini">
            <span className="ver">Initial draft</span>
            <span>{SETUP.model} · {PLAN_COUNT} plans · {METER_COUNT} meters · {SETUP.trial.days}-day trial</span>
            <button className="back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="11 6 5 12 11 18"/></svg>
              Review again
            </button>
          </div>

          <div>
            <div className="pmv-v4-section-label" style={{ marginBottom: 8 }}>What happens next?</div>
            <div className="pmv-v4-seg">
              <button className={`pmv-v4-seg-opt${mode === "draft" ? " is-active" : ""}`} onClick={() => setMode("draft")}>
                <span className="t">Save as draft</span>
                <span className="d">Keep tuning before going live · nothing visible to installers</span>
              </button>
              <button className={`pmv-v4-seg-opt${mode === "publishNow" ? " is-active" : ""}`} onClick={() => setMode("publishNow")}>
                <span className="t">Save &amp; publish now</span>
                <span className="d">Makes pricing live for installers immediately</span>
              </button>
            </div>
          </div>

          <div>
            <div className="pmv-v4-section-label" style={{ marginBottom: 8 }}>Timeline</div>
            <div className="pmv-v4-timeline">
              {mode === "draft" ? (
                <>
                  <div className="pmv-v4-tl-row is-now"><span className="when">Now</span><span className="what">Pricing saved as draft · only you can see it</span></div>
                  <div className="pmv-v4-tl-row"><span className="when">Later</span><span className="what">Publish from the draft view to make it live</span></div>
                </>
              ) : (
                <>
                  <div className="pmv-v4-tl-row is-now"><span className="when">Now</span><span className="what">Pricing saved &amp; published as v1 · live for installers</span></div>
                  <div className="pmv-v4-tl-row is-now"><span className="when">Now</span><span className="what">{SETUP.trial.days}-day free trial active on paid plans</span></div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pmv-foot">
          <button className="btn pmv-foot-left">← Back</button>
          <button className="btn">Cancel</button>
          <button className="btn pub-cta">
            {mode === "draft" ? "Save as draft" : "Save & publish"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// SV5 — Impact-led (reframed as "you're about to save v1")
// ════════════════════════════════════════════════════════
const SV5 = () => {
  return (
    <div className="pmv-stage">
      <PageChrome crumb="Pricing"/>
      <div className="pmv-modal pmv-v5">
        <div className="pmv-v5-top pmv-v5-top--save">
          <span className="ic"><IcSave/></span>
          <h2>Save your <span className="num">v1</span> pricing</h2>
          <p className="sub">
            This becomes the initial draft for your app. Nothing is billed to installers
            until you publish — saving is reversible.
          </p>
        </div>

        <div className="pmv-v5-mid">
          <div className="pmv-v5-breakdown" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="pmv-v5-bd pmv-v5-bd--neutral">
              <div className="num">{PLAN_COUNT}</div>
              <div className="lbl">plans</div>
              <div className="meta">1 free · 2 paid</div>
            </div>
            <div className="pmv-v5-bd pmv-v5-bd--neutral">
              <div className="num">{METER_COUNT}</div>
              <div className="lbl">meters</div>
              <div className="meta">usage-based</div>
            </div>
            <div className="pmv-v5-bd pmv-v5-bd--neutral">
              <div className="num">{SETUP.trial.days}</div>
              <div className="lbl">trial days</div>
              <div className="meta">on paid plans</div>
            </div>
          </div>

          <details className="pmv-v5-details" open>
            <summary>
              <span>What gets saved · {PLAN_COUNT + METER_COUNT + 1} items</span>
              <span className="chev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </summary>
            <ul className="pmv-v5-details-list">
              <li>
                <span className="glyph glyph--rate"><IcModelSm/></span>
                <span>Business model · {SETUP.model}</span>
                <span className="meta">free + paid</span>
              </li>
              {SETUP.plans.map((p) => (
                <li key={p.name}>
                  <span className="glyph glyph--new"><IcLayersSm/></span>
                  <span>{p.name} · {p.charge.toLowerCase()}</span>
                  <span className="meta">{p.charge === "Free" ? "—" : `${p.agency}/mo`}</span>
                </li>
              ))}
              {SETUP.meters.map((m) => (
                <li key={m.name}>
                  <span className="glyph glyph--rate"><IcMeterSm/></span>
                  <span>{m.module} · {m.price} {m.unit}</span>
                  <span className="meta">meter</span>
                </li>
              ))}
              <li>
                <span className="glyph glyph--new" style={{ background: "var(--hr-success-50)", color: "var(--hr-success-700)" }}><IcClock/></span>
                <span>Free trial · {SETUP.trial.days} days</span>
                <span className="meta">on</span>
              </li>
            </ul>
          </details>
        </div>

        <div className="pmv-foot">
          <button className="btn">Cancel</button>
          <button className="btn pub-cta">Save pricing</button>
        </div>
      </div>
    </div>
  );
};

// ─── Canvas ─────────────────────────────────────────────
const App = () => (
  <DesignCanvas>
    <DCSection
      id="publish-modal"
      title="Publish-draft modal · 5 variations"
      subtitle="Same data, same intent — different framings. v3 scenario: 1 new plan (Trial), 1 deprecated (Starter, 38 subs on T+30), 1 meter rate change ($5 → $7)."
    >
      <DCArtboard id="v1" label="01 · Current baseline"            width={920}  height={780}><PubV1/></DCArtboard>
      <DCArtboard id="v2" label="02 · Compact summary-first"       width={920}  height={660}><PubV2/></DCArtboard>
      <DCArtboard id="v3" label="03 · Side-by-side diff (v2 → v3)" width={1100} height={680}><PubV3/></DCArtboard>
      <DCArtboard id="v4" label="04 · Two-step · Schedule"          width={920}  height={680}><PubV4/></DCArtboard>
      <DCArtboard id="v5" label="05 · Impact-led · type to confirm" width={920}  height={780}><PubV5/></DCArtboard>
    </DCSection>

    <DCSection
      id="save-modal"
      title="Save modal (from Setup) · same 5 variations, setup context"
      subtitle="Triggered from the Setup view's Save button. No diff to show — content comes from business model, plans, billing meters, and free trial. Saves as a draft; doesn't go live."
    >
      <DCArtboard id="sv1" label="01 · Current baseline shape"      width={920}  height={780}><SV1/></DCArtboard>
      <DCArtboard id="sv2" label="02 · Compact summary-first"       width={920}  height={760}><SV2/></DCArtboard>
      <DCArtboard id="sv3" label="03 · Snapshot two-column"         width={1100} height={620}><SV3/></DCArtboard>
      <DCArtboard id="sv4" label="04 · Two-step · Save · publish"   width={920}  height={680}><SV4/></DCArtboard>
      <DCArtboard id="sv5" label="05 · Hero · what gets saved"      width={920}  height={820}><SV5/></DCArtboard>
    </DCSection>
  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
