/* global React, Topbar, Sidebar, RightRail, IcEdit, IcChevDown, IcArchive, IcPower, IcTrash, PlanModal, RenamePlanModal, MeterModal, IcEye, DeprecatePlanModal, IcBell, IcShield, IcCopy */
// pricing-published.jsx — Live / published (read-only) state of the Pricing page

const { useState: usePubState } = React;

const IcDoc = (p) =>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <polyline points="14 3 14 8 19 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>;


const IcClock = (p) =>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>;


const StatusPill = ({ kind, label }) =>
<span className={`pub-status pub-status-${kind}`}>
    <span className="pub-dot" />
    {label}
  </span>;


const PUB_PLANS = [
{ name: "Free Plan", charge: "Free", agency: "Free", subacct: "—", subs: 52, status: "live" },
{ name: "Starter", charge: "Monthly", agency: "$100.00", subacct: "Free", subs: 38, status: "deprecating" },
{ name: "Pro", charge: "Monthly", agency: "$197.00", subacct: "$5.00", subs: 52, status: "live" }];


const PUB_METERS = [
{ id: "m1", name: "Phone Validation Meter", module: "Phone Validation", kind: "Workflow Action", unit: "per execution", priceRaw: "0.005", price: "$0.005", subs: 142, status: "live" },
{ id: "m2", name: "iMessage meter", module: "iMessage Integration", kind: "Conversation Provider", unit: "per outbound message", priceRaw: "0.002", price: "$0.002", subs: 142, status: "live" },
{ id: "m3", name: "AI Content API Meter", module: "AI Content Generation", kind: "Custom Meter (API)", unit: "per 1000 tokens", priceRaw: "5", price: "$5", subs: 89, status: "live" }];


// ── Shared Plans card — used in both draft and published modes
const SharedPlansCard = ({
  mode,
  plans,
  onAdd,
  onEdit,
  onDelete,
  showSubscribers, // explicit override — defaults: true in published, false in draft
  showStatus, // explicit override — defaults: true in published, false in draft
  renderActions // (plan) => ReactNode — defaults to edit/delete in draft, nothing in published
}) => {
  const isDraft = mode === "draft";
  const subsCol = showSubscribers ?? !isDraft;
  const statusCol = showStatus ?? !isDraft;
  const showActions = isDraft; // draft always has an actions column (custom or default)
  return (
    <div className="pub-card">
      <div className="pub-card-head">
        <h3>Pricing plans</h3>
        <span className="pub-count-pill">{plans.length} {plans.length === 1 ? "plan" : "plans"}</span>
        {isDraft && onAdd &&
        <button className="btn-add pub-head-action" onClick={onAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M12 5v14M5 12h14" /></svg>
            Add plan
          </button>
        }
      </div>
      {plans.length === 0 ?
      <div className="empty">No plans yet. Add one to get started.</div> :

      <table className="pub-table">
          <thead>
            <tr>
              <th>Plan name</th>
              <th>Charge type</th>
              <th className="num">Agency amount</th>
              <th className="num">Sub-account amount</th>
              {subsCol && <th className="num">Subscribers</th>}
              {statusCol && <th>Status</th>}
              {showActions && <th className="actions" aria-label="Actions"></th>}
            </tr>
          </thead>
          <tbody>
            {plans.map((p, i) =>
          <tr key={p.id || i}>
                <td>
                  <div className="pub-plan-name">{p.name}</div>
                  {p.subtitle && <div className="pub-plan-sub">{p.subtitle}</div>}
                </td>
                <td className="pub-charge">{p.charge}</td>
                <td className="num">{p.agency}</td>
                <td className="num">{p.subacct}</td>
                {subsCol && <td className="num">{p.subs ?? "—"}</td>}
                {statusCol &&
            <td>
                    <div className="status-cell">
                      <StatusPill
                  kind={p.status || "draft"}
                  label={
                  p.status === "live" ? "Live" :
                  p.status === "deprecating" ? "Deprecating" :
                  p.status === "deprecated" ? "Deprecated" :
                  "Draft"
                  } />
                      {p.status === "deprecated" && p.deprecationPolicy &&
                <span
                  className="policy-chip"
                  title={
                  p.deprecationPolicy === "grandfather" ?
                  "Existing subscribers keep their plan and price indefinitely. No migration notices." :
                  "Subscribers notified at T+0 and T+30; they choose their new plan. No auto-migration."
                  }>
                  
                          {p.deprecationPolicy === "grandfather" ? <IcShield /> : <IcBell />}
                          {p.deprecationPolicy === "grandfather" ? "Grandfathered" : "Notify · T+30"}
                        </span>
                }
                    </div>
                  </td>
            }
                {showActions &&
            <td className="actions">
                    {renderActions ? renderActions(p) :
              <div className="row-actions">
                        <button className="edit" aria-label="Edit plan" onClick={() => onEdit && onEdit(p)}><IcEdit /></button>
                        <button className="del" aria-label="Delete plan" onClick={() => onDelete && onDelete(p)}><IcTrash /></button>
                      </div>
              }
                  </td>
            }
              </tr>
          )}
          </tbody>
        </table>
      }
    </div>);

};

const PublishedPricing = ({ showMandatorySteps = false, priceDisplay = "stacked", subsDisplay = "chip", onCreateDraft, view, onView }) => {
  const [historyOpen, setHistoryOpen] = usePubState(false);

  return (
    <>
      <Topbar view={view} onView={onView} />
      <div className={`page${!showMandatorySteps ? " page--published" : ""}`}>
        <Sidebar pricingHasWarning={false} published={true} />
        <main className="main-card published-view">

          {/* Header row */}
          <div className="pub-header">
            <div className="pub-header-left">
              <div className="pub-title-row">
                <h1 className="page-title">Pricing</h1>
                <StatusPill kind="live" label="Live" />
                <span className="pub-version-tag">v2 pricing</span>
              </div>
              <div className="pub-meta">
                <span className="pub-meta-text">
                  Freemium <span className="pub-sep">·</span> 142 installs
                </span>
              </div>
            </div>
            <button className="btn pub-cta" onClick={onCreateDraft}>
              <IcDoc /> Create pricing draft
            </button>
          </div>

          {/* Pricing plans card */}
          <SharedPlansCard mode="published" plans={PUB_PLANS} />

          {/* Billing meters card */}
          <SharedMetersCard mode="published" meters={PUB_METERS} priceDisplay={priceDisplay} subsDisplay={subsDisplay} />

          {/* Pricing history accordion */}
          <div className={`pub-card pub-accordion${historyOpen ? " open" : ""}`}>
            <button className="pub-accordion-head" onClick={() => setHistoryOpen((o) => !o)}>
              <span className="pub-accordion-left">
                <IcClock />
                <span className="pub-accordion-title">Pricing history</span>
                <span className="pub-count-pill">1 archived</span>
              </span>
              <IcChevDown className="pub-accordion-chev" />
            </button>
            {historyOpen &&
            <div className="pub-accordion-body">
                <div className="pub-history-row">
                  <div>
                    <div className="pub-history-name">v1 pricing</div>
                    <div className="pub-history-sub">Archived May 14, 2026 · Replaced by v2</div>
                  </div>
                  <span className="pub-history-archived">Archived</span>
                </div>
              </div>
            }
          </div>
        </main>

        {showMandatorySteps &&
        <RightRail steps={[
        { label: "Basic info", done: true },
        { label: "Profile details", done: true },
        { label: "Support details", done: true },
        { label: "Pricing details", done: true },
        { label: "Review details", done: true }]
        } />
        }
      </div>
    </>);

};

window.PublishedPricing = PublishedPricing;
window.SharedPlansCard = SharedPlansCard;
window.StatusPill = StatusPill;
const SharedMetersIcon = () =>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="14" r="8" /><path d="M12 14l4-4" /><path d="M9 2h6" /></svg>;


const SharedMetersCard = ({ mode, meters, onAdd, onEdit, onDelete, priceDisplay = "stacked", subsDisplay = "chip" }) => {
  const isDraft = mode === "draft";
  const isInline = priceDisplay === "inline";
  const stripPer = (s) => (s || "").replace(/^per\s+/i, "");
  const fmtMoney = (raw) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return raw;
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
  };
  const pctChange = (fromRaw, toRaw) => {
    const from = Number(fromRaw);
    const to = Number(toRaw);
    if (!Number.isFinite(from) || !Number.isFinite(to) || from === 0) return null;
    return (to - from) / from * 100;
  };
  return (
    <div className="pub-card">
      <div className="pub-card-head">
        <h3>Billing meters</h3>
        <span className="pub-count-pill">{meters.length} {meters.length === 1 ? "meter" : "meters"}</span>
        {isDraft && onAdd &&
        <button className="btn-add pub-head-action" onClick={onAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M12 5v14M5 12h14" /></svg>
            Add meter
          </button>
        }
      </div>
      {meters.length === 0 ?
      <div className="empty">No meters configured.</div> :

      <div className={`meter-list shared-meter-list price-display-${priceDisplay} subs-display-${subsDisplay}`}>
          {meters.map((m, i) =>
        <div key={m.id || i} className="meter-row">
              <span className="ic"><SharedMetersIcon /></span>
              <div className="info">
                <div className="name-row">
                  <span className="name">{m.name}</span>
                  {m.subs != null && (subsDisplay === "chip" || subsDisplay === "badge") &&
              <span className={`subs-chip subs-chip--${subsDisplay}`} title={`${m.subs} subscribers`}>
                      {subsDisplay === "chip" &&
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                }
                      <strong>{m.subs}</strong>
                      <span className="subs-label">subscribers</span>
                    </span>
              }
                </div>
                <div className="desc">
                  {m.module} · {m.kind}
                  {m.subs != null && subsDisplay === "inline" && <> · {m.subs} subscribers</>}
                </div>
                {isDraft && m.pendingChange && (() => {
              const pct = pctChange(m.pendingChange.fromRaw, m.pendingChange.toRaw);
              const deltaClass = pct == null ? "" : pct > 0 ? "is-up" : pct < 0 ? "is-down" : "is-flat";
              const deltaLabel = pct == null ?
              null :
              pct === 0 ? "No change" : `${pct > 0 ? "+" : ""}${pct.toFixed(pct % 1 === 0 ? 0 : 1)}%`;
              return (
                <div className="pending-change-row" data-comment-anchor="9c44419d11-div-278-21">
                      <span className="pending-change-was">
                        Was {fmtMoney(m.pendingChange.fromRaw)}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></svg>
                      <span className="pending-change-new">
                        {fmtMoney(m.pendingChange.toRaw)}
                      </span>
                      {deltaLabel &&
                  <span className={`pending-change-delta ${deltaClass}`}>{deltaLabel}</span>
                  }
                      <span className="pending-change-eff">Effective {m.pendingChange.effectiveDate}</span>
                    </div>);

            })()}
              </div>
              {m.subs != null && subsDisplay === "stat" &&
          <div className="subs-stat">
                  <div className="subs-stat-num">{m.subs}</div>
                  <div className="subs-stat-label">subscribers</div>
                </div>
          }
              {m.subs != null && subsDisplay === "avatar" &&
          <div className="subs-avatars">
                  <div className="avatar-stack" aria-hidden>
                    {["#1c6dff", "#0a894e", "#b06907", "#7c3aed"].map((c, j) =>
              <span key={j} className="av" style={{ background: c }} />
              )}
                  </div>
                  <span className="subs-avatars-text">
                    <strong>{m.subs}</strong> subscribers
                  </span>
                </div>
          }
              <div className={`price-cell price-cell--${priceDisplay}`}>
                {priceDisplay === "slash" &&
            <span className="price-phrase">
                    <span className="price">{m.price}</span>
                    <span className="slash" aria-hidden>/</span>
                    <span className="unit">{stripPer(m.unit)}</span>
                  </span>
            }
                {priceDisplay === "pill" &&
            <>
                    <span className="price-chip">{m.price}</span>
                    <span className="unit">{m.unit}</span>
                  </>
            }
                {priceDisplay === "hero" &&
            <>
                    <span className="price">{m.price}</span>
                    <span className="unit">{m.unit}</span>
                  </>
            }
                {priceDisplay === "bracket" &&
            <span className="price-phrase">
                    <span className="price">{m.price}</span>
                    <span className="unit">({m.unit})</span>
                  </span>
            }
                {priceDisplay === "code" &&
            <span className="price-code">
                    <span className="price">{m.price}</span>
                    <span className="unit">{m.unit}</span>
                  </span>
            }
                {priceDisplay === "field" &&
            <>
                    <span className="price-field" aria-disabled="true">
                      <span className="prefix">$</span>
                      <span className="value">{(m.price || "").replace(/^\$/, "")}</span>
                    </span>
                    <span className="unit">{m.unit}</span>
                  </>
            }
                {(priceDisplay === "field-filled" || priceDisplay === "field-dashed") &&
            <>
                    <span className="price-field" aria-disabled="true">
                      <span className="prefix">$</span>
                      <span className="value" style={{ width: "129px" }}>{(m.price || "").replace(/^\$/, "")}</span>
                    </span>
                    <span className="unit">{m.unit}</span>
                  </>
            }
                {priceDisplay === "field-lock" &&
            <>
                    <span className="price-field" aria-disabled="true">
                      <span className="prefix">$</span>
                      <span className="value">{(m.price || "").replace(/^\$/, "")}</span>
                      <span className="suffix" aria-hidden>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                      </span>
                    </span>
                    <span className="unit">{m.unit}</span>
                  </>
            }
                {priceDisplay === "inline" &&
            <span className="price-phrase">
                    <span className="price">{m.price}</span>
                    <span className="unit">{m.unit}</span>
                  </span>
            }
                {priceDisplay === "stacked" &&
            <>
                    <span className="price">{m.price}</span>
                    <span className="unit">{m.unit}</span>
                  </>
            }
              </div>
              {isDraft &&
          <div className="row-actions">
                  <button className="edit" aria-label="Edit meter" onClick={() => onEdit && onEdit(m)}><IcEdit /></button>
                  {(m.subs || 0) === 0 &&
            <button className="del" aria-label="Delete meter" title="Delete meter" onClick={() => onDelete && onDelete(m)}><IcTrash /></button>
            }
                </div>
          }
            </div>
        )}
        </div>
      }
    </div>);

};

window.SharedMetersCard = SharedMetersCard;

// ── Pricing draft view — created when user clicks "Create pricing draft" from the live view.
// Pre-populated with the live plan/meter data; user can edit before publishing.

// 3-dots row menu for plans with zero subscribers
const RowMenu = ({ items }) => {
  const [open, setOpen] = usePubState(false);
  const [pos, setPos] = usePubState(null);
  const triggerRef = React.useRef(null);
  const popRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    const onDocClick = (e) => {
      if (
      triggerRef.current && !triggerRef.current.contains(e.target) &&
      popRef.current && !popRef.current.contains(e.target))
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);
  return (
    <span className="row-menu">
      <button
        ref={triggerRef}
        className="row-menu-trigger"
        aria-label="More actions"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}>
        
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
      </button>
      {open && pos && ReactDOM.createPortal(
        <div ref={popRef} className="row-menu-pop" role="menu" style={{ top: pos.top, right: pos.right }}>
          {items.map((it, i) =>
          <button
            key={i}
            role="menuitem"
            className={`row-menu-item${it.destructive ? " is-destructive" : ""}`}
            onClick={() => {setOpen(false);it.onSelect && it.onSelect();}}>
            
              {it.icon}
              <span>{it.label}</span>
            </button>
          )}
        </div>,
        document.body
      )}
    </span>);

};

const PricingDraftView = ({ priceDisplay = "stacked", subsDisplay = "chip", isFirstPublish = false, onCancel, onPublish, view, onView }) => {
  // Pre-populate from live data — keep status + subscribers so the user can
  // decide what to deprecate / keep live in the new version.
  const [draftPlans, setDraftPlans] = usePubState(() => [
  { id: "p1", name: "Free Plan", charge: "Free", agency: "Free", subacct: "—", subs: 52, status: "live" },
  { id: "p2", name: "Starter", charge: "Monthly", agency: "$100.00", subacct: "Free", subs: 38, status: "deprecated" },
  { id: "p3", name: "Pro", charge: "Monthly", agency: "$197.00", subacct: "$5.00", subs: 52, status: "live" },
  { id: "p4", name: "Trial", charge: "Monthly", agency: "$49.00", subacct: "Free", subs: 0, status: "live" }]
  );
  const [draftMeters, setDraftMeters] = usePubState(() =>
  PUB_METERS.map((m) => ({ ...m, status: "draft" }))
  );

  // Deprecate modal
  const [deprecateModal, setDeprecateModal] = usePubState(null); // null | { plan }
  const togglePlanStatus = (plan) => {
    if (plan.status === "live") {
      setDeprecateModal({ plan });
    } else {
      setDraftPlans((ps) => ps.map((p) => p === plan ? { ...p, status: "live" } : p));
    }
  };
  const confirmDeprecate = ({ policy }) => {
    const plan = deprecateModal?.plan;
    if (!plan) return;
    setDraftPlans((ps) => ps.map((p) =>
    p === plan ? { ...p, status: "deprecated", deprecationPolicy: policy } : p
    ));
    setDeprecateModal(null);
  };
  const updatePlan = (plan, patch) => setDraftPlans((ps) =>
  ps.map((p) => p === plan ? { ...p, ...patch } : p)
  );

  // Add / Edit / Copy plan modal (re-uses the setup PlanModal)
  const [planModal, setPlanModal] = usePubState(null); // null | { initial, mode }
  const onSavePlan = (next) => {
    if (next.id) {
      setDraftPlans((ps) => ps.map((p) => p.id === next.id ? { ...p, ...next } : p));
    } else {
      setDraftPlans((ps) => [
      ...ps,
      { ...next, id: `new-${Date.now()}`, subs: 0, status: "live" }]
      );
    }
    setPlanModal(null);
  };

  // Rename-only plan modal
  const [renameModal, setRenameModal] = usePubState(null); // null | { plan }
  const onSaveRename = (next) => {
    setDraftPlans((ps) => ps.map((p) => p.id === next.id ? { ...p, name: next.name } : p));
    setRenameModal(null);
  };

  // Add / Edit meter modal (re-uses the setup MeterModal)
  const [meterModal, setMeterModal] = usePubState(null); // null | { initial }
  const onSaveMeter = (next) => {
    if (next.id) {
      setDraftMeters((ms) => ms.map((m) => m.id === next.id ? { ...m, ...next } : m));
    } else {
      setDraftMeters((ms) => [
      ...ms,
      { ...next, id: `new-${Date.now()}`, subs: 0, status: "draft" }]
      );
    }
    setMeterModal(null);
  };

  // Publish-confirmation modal
  const [publishOpen, setPublishOpen] = usePubState(false);
  // Draft preview modal
  const [previewOpen, setPreviewOpen] = usePubState(false);

  // ── Diff vs. last published config ────────────────
  // Baseline = PUB_PLANS / PUB_METERS at the top of this file.
  const baselinePlanNames = new Set(PUB_PLANS.map((p) => p.name));
  const newPlans = draftPlans.
  filter((p) => !baselinePlanNames.has(p.name)).
  map((p) => ({ name: p.name }));
  const deprecatedPlans = draftPlans.
  filter((p) => p.status === "deprecated").
  map((p) => ({
    name: p.name,
    subs: p.subs || 0,
    policy: p.deprecationPolicy === "grandfather" ? "grandfather" : "notify"
  }));
  const meterChanges = draftMeters.
  filter((m) => m.pendingChange).
  map((m) => ({
    name: m.name,
    fromRaw: m.pendingChange.fromRaw,
    toRaw: m.pendingChange.toRaw
  }));

  return (
    <>
      <Topbar view={view} onView={onView} />
      <div className="page page--draft-focus">
        <main className="main-card published-view" style={{ borderColor: "rgb(229, 229, 229)" }}>

          {/* Header row */}
          <div className="pub-header">
            <div className="pub-header-left">
              <div className="pub-title-row">
                <h1 className="page-title">Pricing</h1>
                <span className="pub-status pub-status-draft">
                  <span className="pub-dot" />
                  Draft
                </span>
                <span className="pub-version-tag">v3 pricing</span>
              </div>
              <div className="pub-meta">
                <span className="pub-meta-text">
                  Based on v2 <span className="pub-sep">·</span> Not yet published
                </span>
              </div>
            </div>
            <div className="pub-header-actions">
              <button
                className="btn btn-ghost pub-preview-btn"
                onClick={() => setPreviewOpen(true)}
                title="Open a read-only preview of this draft">
                
                <IcEye /> Preview
              </button>
            </div>
          {/* primary actions moved to sticky footer below */}
        </div>

          {/* Plans card — draft mode, but exposes subscribers + status + custom actions */}
          <SharedPlansCard
            mode="draft"
            plans={draftPlans}
            showSubscribers
            showStatus
            onAdd={() => setPlanModal({ initial: null, mode: "add" })}
            renderActions={(plan) => {
              const hasSubs = (plan.subs || 0) > 0;
              const isLive = plan.status === "live";
              const toggleBtn =
              <button
                className={`status-action${isLive ? " status-action--deprecate" : " status-action--golive"}`}
                onClick={() => togglePlanStatus(plan)}>
                
                  {isLive ? <IcArchive /> : <IcPower />}
                  {isLive ? "Deprecate" : "Go live"}
                </button>;

              const menuItems = [
              { label: "Copy plan",
                icon: <IcCopy />,
                onSelect: () => setPlanModal({
                  mode: "copy",
                  initial: { ...plan, id: undefined, name: `${plan.name} (copy)` }
                }) },
              { label: "Edit plan name",
                icon: <IcEdit />,
                onSelect: () => setRenameModal({ plan }) }];

              if (!hasSubs) {
                menuItems.push({
                  label: "Delete plan",
                  icon: <IcTrash />,
                  destructive: true,
                  onSelect: () => setDraftPlans((ps) => ps.filter((x) => x !== plan))
                });
              }

              return (
                <div className="row-actions row-actions--draft-plan">
                  {toggleBtn}
                  <RowMenu items={menuItems} />
                </div>);

            }} />
          

          {/* Billing meters card — draft mode */}
          <SharedMetersCard
            mode="draft"
            meters={draftMeters}
            priceDisplay={priceDisplay}
            subsDisplay={subsDisplay}
            onAdd={() => setMeterModal({ initial: null })}
            onEdit={(m) => setMeterModal({ initial: m })}
            onDelete={(m) => setDraftMeters((ms) => ms.filter((x) => x !== m))} />
          

        </main>
      </div>

      <div className="draft-footer">
        <div className="draft-footer-inner">
          <span className="draft-footer-hint">
            Changes to <strong>v3 pricing</strong> won’t affect customers until you publish.
          </span>
          <div className="draft-footer-actions">
            <button className="btn" onClick={onCancel}>Discard</button>
            <button className="btn pub-cta" onClick={() => setPublishOpen(true)}>Publish draft</button>
          </div>
        </div>
      </div>

      {planModal &&
      <PlanModal
        initial={planModal.initial}
        mode={planModal.mode}
        onSave={onSavePlan}
        onClose={() => setPlanModal(null)} />

      }
      {renameModal &&
      <RenamePlanModal
        plan={renameModal.plan}
        onSave={onSaveRename}
        onClose={() => setRenameModal(null)} />

      }
      {meterModal &&
      <MeterModal
        initial={meterModal.initial}
        context="draft"
        onSave={onSaveMeter}
        onClose={() => setMeterModal(null)} />

      }
      {deprecateModal &&
      <DeprecatePlanModal
        plan={deprecateModal.plan}
        onConfirm={confirmDeprecate}
        onClose={() => setDeprecateModal(null)} />

      }
      {publishOpen &&
      <PublishPricingModal
        isFirstPublish={isFirstPublish}
        version="v3 pricing"
        newPlans={newPlans}
        deprecatedPlans={deprecatedPlans}
        meterChanges={meterChanges}
        onConfirm={() => {setPublishOpen(false);onPublish();}}
        onClose={() => setPublishOpen(false)} />

      }
      {previewOpen &&
      <PreviewDraftModal
        version="v3 pricing"
        plans={draftPlans}
        meters={draftMeters}
        newPlans={newPlans}
        deprecatedPlans={deprecatedPlans}
        meterChanges={meterChanges}
        onPublish={() => {setPreviewOpen(false);setPublishOpen(true);}}
        onClose={() => setPreviewOpen(false)} />

      }
    </>);

};

window.PricingDraftView = PricingDraftView;