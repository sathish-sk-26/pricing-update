/* global React */
// pricing-publish-modal.jsx — final-gate confirmation modal for publishing
// a draft pricing config to Live. Used by PricingDraftView.

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
  const subsByPolicy = deprecatedPlans.reduce((acc, p) => {
    const k = p.policy === "grandfather" ? "grandfather" : "notify";
    acc[k] = (acc[k] || 0) + (p.subs || 0);
    return acc;
  }, {});
  const totalChanges = newPlans.length + deprecatedPlans.length + meterChanges.length;

  const fmtMoney = (raw) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return raw;
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
  };

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

          {/* Subscriber impact — hidden on first publish */}
          {!isFirstPublish && (deprecatedPlans.length > 0 || newPlans.length > 0) && (
            <section className="publish-section">
              <header className="publish-section-head">
                <h4>Subscriber impact</h4>
              </header>

              <div className="publish-impact">
                {(() => {
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
                    <>
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
                    </>
                  );
                })()}
              </div>
            </section>
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

window.PublishPricingModal = PublishPricingModal;
