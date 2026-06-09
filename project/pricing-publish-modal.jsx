/* global React */
// pricing-publish-modal.jsx — final-gate confirmation modal for publishing
// a draft pricing config to Live, PLUS the draft Preview modal (read-only
// customer-facing preview + the same impact summary the publish gate shows).
// Used by PricingDraftView.

const { useState, useEffect, useMemo } = React;

const IcCheck2 = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IcArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>
  </svg>
);
const IcAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IcInfo2 = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const IcXs = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IcEye2 = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IcCheckMini = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const fmtMoney = (raw) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
};

// ─────────────────────────────────────────────────────────
// Shared impact-summary blocks — rendered identically by the
// Publish gate and the draft Preview, so they always match.
// ─────────────────────────────────────────────────────────
const ChangeSummary = ({ newPlans = [], deprecatedPlans = [], meterChanges = [] }) => {
  const totalChanges = newPlans.length + deprecatedPlans.length + meterChanges.length;
  return (
    <section className="publish-section">
      <header className="publish-section-head">
        <h4>What's changing</h4>
        {totalChanges > 0 && (
          <span className="publish-section-count">
            {totalChanges} change{totalChanges === 1 ? "" : "s"}
          </span>
        )}
      </header>

      <ul className="publish-change-list">
        {newPlans.length > 0 && (
          <li className="publish-change publish-change--new">
            <span className="publish-change-pip" aria-hidden>+</span>
            <div className="publish-change-body">
              <div className="publish-change-title">
                {newPlans.length} new plan{newPlans.length === 1 ? "" : "s"} added
              </div>
              <div className="publish-change-detail">
                {newPlans.map((p) => (
                  <span key={p.name} className="publish-pill publish-pill--new">{p.name}</span>
                ))}
              </div>
            </div>
          </li>
        )}

        {deprecatedPlans.length > 0 && (
          <li className="publish-change publish-change--dep">
            <span className="publish-change-pip" aria-hidden>−</span>
            <div className="publish-change-body">
              <div className="publish-change-title">
                {deprecatedPlans.length} plan{deprecatedPlans.length === 1 ? "" : "s"} deprecated
              </div>
              <div className="publish-change-detail">
                {deprecatedPlans.map((p) => (
                  <span key={p.name} className="publish-pill publish-pill--dep">
                    <span className="publish-pill-name">{p.name}</span>
                    <span className="publish-pill-policy">
                      {p.policy === "grandfather" ? "Grandfather forever" : "T+30 notice"}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </li>
        )}

        {meterChanges.length > 0 && (
          <li className="publish-change publish-change--rate">
            <span className="publish-change-pip" aria-hidden>$</span>
            <div className="publish-change-body">
              <div className="publish-change-title">
                {meterChanges.length} meter rate change{meterChanges.length === 1 ? "" : "s"}
              </div>
              <div className="publish-change-detail publish-change-detail--rates">
                {meterChanges.map((m) => (
                  <div key={m.name} className="publish-rate">
                    <span className="publish-rate-name">{m.name}</span>
                    <span className="publish-rate-track">
                      <span className="publish-rate-from">{fmtMoney(m.fromRaw)}</span>
                      <IcArrow/>
                      <span className="publish-rate-to">{fmtMoney(m.toRaw)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </li>
        )}

        {totalChanges === 0 && (
          <li className="publish-change publish-change--empty">
            <div className="publish-change-body">No detected changes since the last published config.</div>
          </li>
        )}
      </ul>
    </section>
  );
};

const SubscriberImpact = ({ newPlans = [], deprecatedPlans = [] }) => {
  const subsByPolicy = deprecatedPlans.reduce((acc, p) => {
    const k = p.policy === "grandfather" ? "grandfather" : "notify";
    acc[k] = (acc[k] || 0) + (p.subs || 0);
    return acc;
  }, {});
  const t30Plans = deprecatedPlans.filter((p) => p.policy !== "grandfather" && (p.subs || 0) > 0);
  const gfPlans  = deprecatedPlans.filter((p) => p.policy === "grandfather" && (p.subs || 0) > 0);

  const PlanList = ({ plans }) => (
    <ul className="publish-impact-plans">
      {plans.map((p) => (
        <li key={p.name}>
          <span className="publish-impact-plan-name">{p.name}</span>
          <span className="publish-impact-plan-subs">
            <strong>{p.subs}</strong> subscriber{p.subs === 1 ? "" : "s"}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="publish-section">
      <header className="publish-section-head">
        <h4>Subscriber impact</h4>
      </header>

      <div className="publish-impact">
        {t30Plans.length > 0 && (
          <div className="publish-impact-row">
            <div className="publish-impact-num">{subsByPolicy.notify}</div>
            <div className="publish-impact-meta">
              <div className="publish-impact-label">subscribers on T+30 notice</div>
              <div className="publish-impact-sub">Notified at publish · auto-migrated 30 days later</div>
              <PlanList plans={t30Plans}/>
            </div>
            <span className="policy-chip publish-policy-chip publish-policy-chip--t30">T+30 notice</span>
          </div>
        )}
        {gfPlans.length > 0 && (
          <div className="publish-impact-row">
            <div className="publish-impact-num">{subsByPolicy.grandfather}</div>
            <div className="publish-impact-meta">
              <div className="publish-impact-label">subscribers grandfathered</div>
              <div className="publish-impact-sub">Keep their plan and price indefinitely · no migration notice</div>
              <PlanList plans={gfPlans}/>
            </div>
            <span className="policy-chip publish-policy-chip publish-policy-chip--gf">Grandfather forever</span>
          </div>
        )}

        {newPlans.length > 0 && (
          <div className="publish-impact-note">
            <IcInfo2/>
            <span>Default markup auto-applied to agency reselling prices for new plans.</span>
          </div>
        )}
      </div>
    </section>
  );
};

const PublishPricingModal = ({
  isFirstPublish = false,
  version = "v3 pricing",
  newPlans = [],
  deprecatedPlans = [],
  meterChanges = [],
  onConfirm,
  onClose,
}) => {
  const [stage, setStage] = useState("review");   // "review" | "success"

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") {
        if (stage === "review") onClose();
        else onConfirm && onConfirm({ configId });
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // configId is recomputed each render; intentionally not in deps to keep
    // the listener stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, onClose, onConfirm]);

  const hasT30 = deprecatedPlans.some((p) => p.policy !== "grandfather");
  const showImpact = !isFirstPublish && (deprecatedPlans.length > 0 || newPlans.length > 0);

  // Deterministic config id — yyyymmdd-hhmm so it sorts.
  const pad = (n) => String(n).padStart(2, "0");
  const configId = useMemo(() => {
    const d = new Date();
    return `v3-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  }, [stage]);

  // ── Success state ──────────────────────────────────
  if (stage === "success") {
    const done = () => onConfirm && onConfirm({ configId });
    return (
      <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) done(); }}>
        <div className="bm publish-modal publish-modal--success" style={{ width: 460 }} role="dialog" aria-modal="true" aria-label="Publish confirmation">
          <div className="publish-success">
            <div className="publish-success-ic" aria-hidden><IcCheck2/></div>
            <h2 className="publish-success-title">Pricing published</h2>
            <p className="publish-success-sub">
              {version} is now the live config.{" "}
              {hasT30
                ? "Subscribers on deprecated plans have been notified."
                : "No subscriber notifications were required."}
            </p>
            <dl className="publish-success-meta">
              <div>
                <dt>Config ID</dt>
                <dd><code>{configId}</code></dd>
              </div>
            </dl>
            <div className="publish-success-actions">
              <a className="publish-history-link" href="#pricing-history" onClick={(e) => { e.preventDefault(); done(); }}>
                View in pricing history
                <IcArrow/>
              </a>
              <button className="btn pub-cta" onClick={done}>Done</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Review state ───────────────────────────────────
  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bm publish-modal" style={{ width: 640 }} role="dialog" aria-modal="true" aria-label={`Publish ${version}`}>
        <div className="hd">
          <div className="title-block">
            <span className="head-icon publish-head-icon"><IcUpload/></span>
            <div>
              <h2>Publish {version}</h2>
              <p>
                {isFirstPublish
                  ? "First publish. This becomes the live config installers and agencies will see."
                  : "Review what's changing. This replaces the current live config."}
              </p>
            </div>
          </div>
          <button className="x" onClick={onClose} aria-label="Close"><IcXs/></button>
        </div>

        <div className="body publish-modal-body">

          {/* T+30 warning */}
          {!isFirstPublish && hasT30 && (
            <div className="publish-warn notice notice--warn" role="note">
              <span className="notice-ic" aria-hidden><IcAlert/></span>
              <div className="notice-body">
                <strong>Subscribers on deprecated plans will be notified at publish.</strong>
              </div>
            </div>
          )}

          {/* What's changing */}
          <ChangeSummary
            newPlans={newPlans}
            deprecatedPlans={deprecatedPlans}
            meterChanges={meterChanges}
          />

          {/* Subscriber impact — hidden on first publish */}
          {showImpact && (
            <SubscriberImpact newPlans={newPlans} deprecatedPlans={deprecatedPlans} />
          )}

          {isFirstPublish && (
            <section className="publish-section">
              <header className="publish-section-head">
                <h4>Going live</h4>
              </header>
              <p className="publish-firstpub-note">
                This is the first publish of this pricing config. No existing subscribers, so no notification clock starts and no agency reseller defaults will change.
              </p>
            </section>
          )}
        </div>

        <div className="publish-foot">
          <button className="btn" onClick={onClose}>Go back</button>
          <button className="btn pub-cta" onClick={() => setStage("success")}>Confirm publish</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// DraftPagePreview — renders the REAL draft data (plans +
// meters) as the customer-facing pricing page. No static
// image; everything below reflects the current draft.
// ─────────────────────────────────────────────────────────
const IcCheckSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const parseAmount = (s) => {
  if (s == null) return null;
  const n = Number(String(s).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const isFreeAmount = (s) => s == null || s === "" || s === "—" || /free/i.test(String(s));

const DraftPagePreview = ({ appName = "Resource Center", appTagline = "Centralize your knowledge, empower your team.", plans = [], meters = [] }) => {
  // Customers only see sellable plans — deprecated ones are being sunset.
  const sellable = plans.filter((p) => p.status !== "deprecated");
  // Highlight the highest agency-priced paid plan as "Most popular".
  const popularName = sellable
    .filter((p) => !isFreeAmount(p.agency))
    .sort((a, b) => (parseAmount(b.agency) || 0) - (parseAmount(a.agency) || 0))[0]?.name;

  return (
    <div className="pvpage">
      {/* App header */}
      <header className="pvpage-head">
        <span className="pvpage-logo" aria-hidden>{appName.charAt(0)}</span>
        <div>
          <h1 className="pvpage-title">{appName}</h1>
          <p className="pvpage-tagline">{appTagline}</p>
          <p className="pvpage-by">By HighLevel</p>
        </div>
      </header>

      {/* Plans */}
      <section className="pvpage-plans-wrap">
        <div className="pvpage-billing-toggle" role="tablist" aria-label="Billing period">
          <button role="tab" aria-selected="false" className="pvbt">Monthly</button>
          <button role="tab" aria-selected="true" className="pvbt active">
            Yearly <span className="pvbt-save">Save 10%</span>
          </button>
        </div>

        <div className="pvpage-plans">
          {sellable.map((p) => {
            const free = isFreeAmount(p.agency) && isFreeAmount(p.subacct);
            const popular = p.name === popularName;
            const subFree = isFreeAmount(p.subacct);
            return (
              <div key={p.id || p.name} className={`pvplan${popular ? " pvplan--popular" : ""}`}>
                {popular && <span className="pvplan-badge">Most popular</span>}
                <h3 className="pvplan-name">{p.name}</h3>

                {free ? (
                  <>
                    <p className="pvplan-for">For Agency and sub-account</p>
                    <div className="pvplan-price"><span className="pvplan-amt">Free</span></div>
                  </>
                ) : (
                  <div className="pvplan-price-split">
                    <div className="pvplan-col">
                      <p className="pvplan-for">For Agency</p>
                      <div className="pvplan-price">
                        <span className="pvplan-amt">{p.agency}</span>
                        <span className="pvplan-per">/ month</span>
                      </div>
                      <p className="pvplan-billed">Billed annually</p>
                    </div>
                    <div className="pvplan-col">
                      <p className="pvplan-for">Per sub-account</p>
                      <div className="pvplan-price">
                        <span className="pvplan-amt">{subFree ? "Free" : p.subacct}</span>
                        {!subFree && <span className="pvplan-per">/ month</span>}
                      </div>
                      <p className="pvplan-billed">{subFree ? "Included" : "Billed annually"}</p>
                    </div>
                  </div>
                )}

                <ul className="pvplan-feats">
                  <li><IcCheckSm/> {p.charge === "Free" ? "Free forever" : `${p.charge} billing`}</li>
                  <li><IcCheckSm/> {isFreeAmount(p.subacct) ? "Sub-accounts included" : `Sub-accounts at ${p.subacct}/mo`}</li>
                  <li><IcCheckSm/> Usage-based add-ons available</li>
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Usage-based meters */}
      {meters.length > 0 && (
        <section className="pvpage-usage">
          <h2 className="pvpage-usage-title">Usage-based pricing</h2>
          <div className="pvpage-meters">
            {meters.map((m) => (
              <div key={m.id || m.name} className="pvmeter">
                <h4 className="pvmeter-name">{m.module || m.name}</h4>
                <div className="pvmeter-rule" />
                <div className="pvmeter-price">
                  <span className="pvmeter-amt">{m.price}</span>
                  <span className="pvmeter-unit">{m.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Draft Preview modal — customer-facing preview of the page
// (left) + the same impact summary the publish gate shows
// (right), contextualised to this draft.
// ─────────────────────────────────────────────────────────
const PreviewDraftModal = ({
  version = "v3 pricing",
  plans = [],
  meters = [],
  newPlans = [],
  deprecatedPlans = [],
  meterChanges = [],
  onClose,
  onPublish,
}) => {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const [copied, setCopied] = useState(false);
  const shareLink = `https://app.gohighlevel.com/marketplace/resource-center/pricing/preview/${version.replace(/\s+/g, "-").toLowerCase()}`;
  const onShare = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareLink).then(done).catch(done);
    } else {
      done();
    }
  };

  const totalChanges = newPlans.length + deprecatedPlans.length + meterChanges.length;

  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bm preview-modal" role="dialog" aria-modal="true" aria-label={`Preview ${version}`}>
        <div className="hd preview-hd">
          <div className="title-block">
            <span className="head-icon preview-head-icon"><IcEye2/></span>
            <div>
              <h2>Preview · {version}</h2>
              <p>How your pricing page will look to customers once published.</p>
            </div>
          </div>
          <span className="preview-draft-tag">Draft preview</span>
          <button className="x" onClick={onClose} aria-label="Close"><IcXs/></button>
        </div>

        <div className="preview-body">
          {/* Customer-facing page render — REAL draft data */}
          <div className="preview-canvas">
            <div className="preview-browser">
              <div className="preview-browser-bar">
                <span className="preview-dots"><i/><i/><i/></span>
                <span className="preview-url">app.gohighlevel.com/marketplace/resource-center/pricing</span>
              </div>
              <div className="preview-browser-viewport">
                <DraftPagePreview plans={plans} meters={meters} />
              </div>
            </div>
          </div>

          {/* Impact summary — same layout as the publish gate */}
          <aside className="preview-impact" aria-label="Impact summary">
            <div className="preview-impact-head">
              <h3>Impact summary</h3>
              <span className="preview-impact-count">
                {totalChanges} change{totalChanges === 1 ? "" : "s"} vs. live
              </span>
            </div>
            <div className="preview-impact-scroll">
              <ChangeSummary
                newPlans={newPlans}
                deprecatedPlans={deprecatedPlans}
                meterChanges={meterChanges}
              />
              {(deprecatedPlans.length > 0 || newPlans.length > 0) && (
                <SubscriberImpact newPlans={newPlans} deprecatedPlans={deprecatedPlans} />
              )}
            </div>
          </aside>
        </div>

        <div className="publish-foot">
          <button
            className={`btn preview-share-btn${copied ? " is-copied" : ""}`}
            onClick={onShare}
            title="Copy a shareable read-only link to this preview">
            {copied ? <IcCheckMini/> : <IcLink/>}
            {copied ? "Link copied" : "Share preview link"}
          </button>
          <span className="preview-foot-hint">
            This preview reflects your unsaved draft. Nothing is live until you publish.
          </span>
          <button className="btn" onClick={onClose}>Close preview</button>
          <button className="btn pub-cta" onClick={onPublish}>Publish draft</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// SaveImpactModal — shown when the user clicks Save on the
// setup page. Same layout as the publish impact summary, but
// summarises the setup context: business model, pricing
// plans, free trial, and billing meters.
// ─────────────────────────────────────────────────────────
const IcSaveDisk = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IcModelGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcClockGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>
  </svg>
);

const MODEL_LABELS = { free: "Free", freemium: "Freemium", paid: "Paid" };
const MODEL_SUBS = {
  free: "No paid plans — free for everyone",
  freemium: "Free plan plus paid upgrades",
  paid: "All plans are paid",
};

const SaveImpactModal = ({
  model = "freemium",
  plans = [],
  meters = [],
  trialOn = false,
  trialDays = 14,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose && onClose();
      if (e.key === "Enter") onConfirm && onConfirm();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, onConfirm]);

  const showPlans = model !== "free";
  const planList = showPlans ? plans : [];
  const showTrial = showPlans && trialOn;
  const totalItems = 1 + planList.length + (showTrial ? 1 : 0) + meters.length;

  const planPrice = (p) => (isFreeAmount(p.agency) ? "Free" : `${p.agency}${/month/i.test(p.charge) || p.charge === "Monthly" ? " / mo" : ""}`);

  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bm publish-modal" style={{ width: 640 }} role="dialog" aria-modal="true" aria-label="Save pricing">
        <div className="hd">
          <div className="title-block">
            <span className="head-icon save-head-icon"><IcSaveDisk/></span>
            <div>
              <h2>Save pricing</h2>
              <p>Review what you've set up. Saving stores this as a draft — nothing goes live until you publish.</p>
            </div>
          </div>
          <button className="x" onClick={onClose} aria-label="Close"><IcXs/></button>
        </div>

        <div className="body publish-modal-body">
          <section className="publish-section">
            <header className="publish-section-head">
              <h4>What you're saving</h4>
              <span className="publish-section-count">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </span>
            </header>

            <ul className="publish-change-list">
              {/* Business model */}
              <li className="publish-change publish-change--rate">
                <span className="publish-change-pip" aria-hidden><IcModelGlyph/></span>
                <div className="publish-change-body">
                  <div className="publish-change-title">Business model</div>
                  <div className="publish-change-detail">
                    <span className="publish-pill">{MODEL_LABELS[model] || model}</span>
                    <span className="save-change-note">{MODEL_SUBS[model]}</span>
                  </div>
                </div>
              </li>

              {/* Pricing plans */}
              {showPlans && (
                <li className="publish-change publish-change--new">
                  <span className="publish-change-pip" aria-hidden>+</span>
                  <div className="publish-change-body">
                    <div className="publish-change-title">
                      {planList.length} pricing plan{planList.length === 1 ? "" : "s"}
                    </div>
                    <div className="publish-change-detail publish-change-detail--rates">
                      {planList.map((p) => (
                        <div key={p.id || p.name} className="publish-rate">
                          <span className="publish-rate-name">{p.name}</span>
                          <span className="publish-rate-track">
                            <span className="publish-rate-to">{planPrice(p)}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
              )}

              {/* Free trial */}
              {showPlans && (
                <li className="publish-change publish-change--rate">
                  <span className="publish-change-pip" aria-hidden><IcClockGlyph/></span>
                  <div className="publish-change-body">
                    <div className="publish-change-title">Free trial</div>
                    <div className="publish-change-detail">
                      {trialOn ? (
                        <span className="publish-pill publish-pill--new">
                          <span className="publish-pill-name">On</span>
                          <span className="publish-pill-policy">{trialDays} days</span>
                        </span>
                      ) : (
                        <span className="publish-pill">Off</span>
                      )}
                      <span className="save-change-note">
                        {trialOn
                          ? "Installers get full access before billing starts."
                          : "Installers are billed from day one."}
                      </span>
                    </div>
                  </div>
                </li>
              )}

              {/* Billing meters */}
              {meters.length > 0 && (
                <li className="publish-change publish-change--rate">
                  <span className="publish-change-pip" aria-hidden>$</span>
                  <div className="publish-change-body">
                    <div className="publish-change-title">
                      {meters.length} billing meter{meters.length === 1 ? "" : "s"}
                    </div>
                    <div className="publish-change-detail publish-change-detail--rates">
                      {meters.map((m) => (
                        <div key={m.id || m.name} className="publish-rate">
                          <span className="publish-rate-name">{m.module || m.name}</span>
                          <span className="publish-rate-track">
                            <span className="publish-rate-to">{m.price}</span>
                            <span className="save-rate-unit">{m.unit}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </section>

          <div className="publish-impact-note save-impact-note">
            <IcInfo2/>
            <span>This saves as a draft. Publish it from the draft view when you're ready to go live for installers.</span>
          </div>
        </div>

        <div className="publish-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn pub-cta" onClick={onConfirm}>Save pricing</button>
        </div>
      </div>
    </div>
  );
};

window.PublishPricingModal = PublishPricingModal;
window.PreviewDraftModal = PreviewDraftModal;
window.SaveImpactModal = SaveImpactModal;
