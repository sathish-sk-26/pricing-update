/* global React, IcX, IcAlertTri, IcLayers, IcPlus, IcEdit, IcCopy */
// pricing-modals.jsx — Add/Edit Plan, Add/Edit Meter, Confirm-delete

const { useState, useEffect, useRef } = React;

const useEsc = (onClose) => {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
};

const ModalShell = ({ title, sub, onClose, children, footer, confirm }) => {
  useEsc(onClose);
  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal${confirm ? " confirm" : ""}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          {confirm && (
            <span className="icon-wrap"><IcAlertTri/></span>
          )}
          <div style={{ flex: 1 }}>
            <h3>{title}</h3>
            {sub && <p>{sub}</p>}
          </div>
          <button className="x" onClick={onClose} aria-label="Close"><IcX/></button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">{footer}</div>
      </div>
    </div>
  );
};

// ─── Add / Edit Plan ────────────────────────────
// Charge keys: "free" | "monthly" | "yearly" | "once"
const CHARGE_LABEL  = { free: "Free", monthly: "Monthly", yearly: "Yearly", once: "One-time" };
const CHARGE_SUFFIX = { free: "",     monthly: "/mo",     yearly: "/yr",    once: ""         };

const inferChargeKey = (initial) => {
  if (!initial) return "monthly";
  if (initial.chargeKey) return initial.chargeKey;
  const c = (initial.charge || "").toLowerCase();
  if (c === "free")       return "free";
  if (c === "monthly")    return "monthly";
  if (c === "yearly")     return "yearly";
  if (c === "one-time")   return "once";
  if (c === "recurring")  return "monthly"; // legacy
  return "monthly";
};

const PlanModal = ({ initial, mode, onSave, onClose }) => {
  // "edit" = update existing (has id). "copy" = new plan pre-filled from another.
  // "add"  = brand new plan.
  const resolvedMode = mode || (initial?.id ? "edit" : initial ? "copy" : "add");
  const isEdit = resolvedMode === "edit";
  const isCopy = resolvedMode === "copy";
  const [name, setName]         = useState(initial?.name ?? "");
  const [charge, setCharge]     = useState(inferChargeKey(initial));
  const [agency, setAgency]     = useState(initial?.agencyRaw ?? "");
  const [dual, setDual]         = useState(initial?.dual ?? false);
  const [subacct, setSubacct]   = useState(initial?.subacctRaw ?? "");
  const [features, setFeatures] = useState(() => {
    const src = initial?.features ?? [];
    return [0, 1, 2, 3, 4].map(i => src[i] ?? "");
  });
  const nameRef = useRef(null);
  useEsc(onClose);
  useEffect(() => { nameRef.current?.focus(); }, []);

  const isFree = charge === "free";
  const suffix = CHARGE_SUFFIX[charge];
  const canSave = name.trim().length > 0 && (isFree || agency.length > 0) && (!dual || isFree || subacct.length > 0);

  const fmtPrice = (v) => {
    if (v === "" || v == null) return "";
    const n = Number(v);
    if (!Number.isFinite(n)) return "";
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`;
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id,
      name: name.trim(),
      charge: CHARGE_LABEL[charge],
      chargeKey: charge,
      dual,
      features: features.map(f => f.trim()).filter(Boolean),
      agencyRaw:  isFree ? "" : agency,
      subacctRaw: isFree ? "" : (dual ? subacct : agency),
      agency:  isFree ? "Free" : fmtPrice(agency),
      subacct: isFree ? "Free" : (dual ? fmtPrice(subacct) : fmtPrice(agency)),
    });
  };

  const updateFeature = (i, v) =>
    setFeatures(fs => fs.map((f, idx) => (idx === i ? v : f)));

  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bm plan-modal" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit plan" : isCopy ? "Duplicate plan" : "Add new plan"}>
        <div className="hd">
          <div className="title-block">
            <span className="head-icon">{isCopy ? <IcCopy/> : <IcLayers/>}</span>
            <div>
              <h2>{isEdit ? "Edit plan" : isCopy ? "Duplicate plan" : "Add new plan"}</h2>
              <p>{isCopy
                ? "Pre-filled from the original. Rename and adjust pricing or features before saving."
                : "New plans are draft until publish. Existing subscribers are unaffected."}</p>
            </div>
          </div>
          <button className="x" onClick={onClose} aria-label="Close"><IcX/></button>
        </div>

        <div className="body">
          <div className="field">
            <label>Plan name</label>
            <input ref={nameRef} className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pro Max"/>
          </div>

          <div className="field" style={{ marginTop: 14 }}>
            <label>Charge type</label>
            <div className="seg" role="tablist">
              {Object.entries(CHARGE_LABEL).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={charge === key}
                  className={charge === key ? "active" : ""}
                  onClick={() => setCharge(key)}
                >{label}</button>
              ))}
            </div>
          </div>

          {!isFree && (
            <div className="grid-2" style={{ marginTop: 14, alignItems: "start" }}>
              <div className="field">
                <label>Agency amount</label>
                <div className="price-row">
                  <div style={{ display: "flex" }}>
                    <span className="prefix-wrap">$</span>
                    <input inputMode="decimal" value={agency} onChange={e => setAgency(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0"/>
                  </div>
                  {suffix && <span className="suffix">{suffix}</span>}
                </div>
              </div>
              <div className="field">
                <label className="dual-label">
                  Dual pricing
                  <span className="toggle">
                    <input type="checkbox" checked={dual} onChange={e => setDual(e.target.checked)}/>
                    <span className="track"/>
                  </span>
                </label>
                <div className="price-row" data-disabled={!dual}>
                  <div style={{ display: "flex" }}>
                    <span className="prefix-wrap">$</span>
                    <input inputMode="decimal" value={subacct} onChange={e => setSubacct(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" disabled={!dual}/>
                  </div>
                  <span className="suffix">/sub-acct</span>
                </div>
              </div>
            </div>
          )}

          <div className="field" style={{ marginTop: 18 }}>
            <label>Features (up to 5)</label>
            <div className="feature-list">
              {features.map((f, i) => (
                <input
                  key={i}
                  className="input"
                  value={f}
                  onChange={e => updateFeature(i, e.target.value)}
                  placeholder={`Feature ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="ft">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!canSave}>
            {isCopy ? <IcCopy/> : <IcPlus/>} {isEdit ? "Save changes" : isCopy ? "Create duplicate" : "Add plan"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Small info icon (V1 form)
const InfoIcon = () => (
  <svg className="info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

// Strip a leading "per " from existing rows so the unit field shows just the noun.
const stripPer = (s = "") => s.replace(/^per\s+/i, "").trim();

// ─── Add / Edit Meter (V1 · Grouped & compact  ↔  V2 · Form + live preview) ──
const MeterModal = ({ initial, context, onSave, onClose }) => {
  const isEdit = !!initial;
  // Only the draft-state edit shows the simplified price-change form with T+30 notice.
  // The setup-state edit keeps the original full editor (no live subscribers yet).
  const isDraftEdit = isEdit && context === "draft";
  const [name, setName]           = useState(initial?.name ?? "");
  const [moduleType, setModType]  = useState(initial?.kind ?? "Custom Meter (API)");
  const [moduleName, setModName]  = useState(initial?.module ?? "");
  const [unit, setUnit]           = useState(stripPer(initial?.unit ?? "message"));
  const [maxPerDay, setMaxPerDay] = useState(initial?.maxPerDay ?? "1000");
  const [priceType, setPriceType] = useState(initial?.priceType ?? "fixed");
  const [price, setPrice]         = useState(initial?.priceRaw ?? "");
  // Edit-only: "new price" is what we'll schedule to take effect at T+30.
  // Starts empty so the % change badge only shows once the user enters one.
  const [newPrice, setNewPrice]   = useState("");
  const [layout, setLayout]       = useState("compact"); // "compact" | "preview"

  const nameRef = useRef(null);
  useEsc(onClose);
  useEffect(() => { nameRef.current?.focus(); }, []);

  const exampleUnits = ["message", "token", "phone validation", "minute", "run"];
  const canSave = name.trim() && moduleName.trim() && unit.trim() && price.length > 0;

  // Edit-mode-only derived values
  const currentPriceN = Number(initial?.priceRaw) || 0;
  const newPriceN     = Number(newPrice) || 0;
  const hasNewPrice   = newPrice !== "" && Number.isFinite(newPriceN);
  const pctDelta      = hasNewPrice && currentPriceN > 0
    ? ((newPriceN - currentPriceN) / currentPriceN) * 100
    : null;
  const editDirty = (
    hasNewPrice && newPriceN !== currentPriceN
  ) || (
    isEdit && (maxPerDay !== (initial?.maxPerDay ?? "1000") || priceType !== (initial?.priceType ?? "fixed"))
  ) || (
    isEdit && name.trim() !== (initial?.name ?? "")
  );
  const canSaveEdit = isEdit && editDirty && name.trim().length > 0;
  const fmtMoney = (n) =>
    `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
  const effectiveDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  })();

  const handleSave = () => {
    if (isDraftEdit) {
      if (!canSaveEdit) return;
      const finalPriceRaw = hasNewPrice ? newPrice : (initial?.priceRaw ?? price);
      onSave({
        id: initial?.id,
        name: name.trim(),
        module: moduleName.trim(),
        kind: moduleType,
        unit: initial?.unit || `per ${unit.trim()}`,
        maxPerDay,
        priceType,
        priceRaw: finalPriceRaw,
        price: `$${Number(finalPriceRaw).toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
        pendingChange: hasNewPrice && newPriceN !== currentPriceN
          ? { effectiveDate, fromRaw: initial?.priceRaw, toRaw: newPrice }
          : undefined,
      });
      return;
    }
    if (!canSave) return;
    onSave({
      id: initial?.id,
      name: name.trim(),
      module: moduleName.trim(),
      kind: moduleType,
      unit: `per ${unit.trim()}`,
      maxPerDay,
      priceType,
      priceRaw: price,
      price: `$${Number(price).toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
    });
  };

  const setMaxDelta = (d) =>
    setMaxPerDay(String(Math.max(0, (Number(maxPerDay) || 0) + d)));

  // ── Reusable field groups (so both layouts share the same source of truth) ──
  const IdentityFieldset = (
    <fieldset>
      <p className="group-label"><span>Identity</span><span className="line"/></p>
      <div className="field">
        <label>Meter name<span className="req">*</span></label>
        <input ref={nameRef} className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. AI workflow runs"/>
        {layout === "compact" && <span className="hint">Shown to you on the developer portal — not to installers.</span>}
      </div>
      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="field">
          <label>Module type<span className="req">*</span></label>
          <select className="select" value={moduleType} onChange={e => setModType(e.target.value)}>
            <option>Custom Meter (API)</option>
            <option>Custom Event (API)</option>
            <option>Workflow Action</option>
            <option>Workflow Trigger</option>
            <option>Conversation Provider</option>
          </select>
        </div>
        <div className="field">
          <label>Module name <InfoIcon/></label>
          <input className="input" value={moduleName} onChange={e => setModName(e.target.value)} placeholder="e.g. workflow"/>
        </div>
      </div>
    </fieldset>
  );

  const PricingFieldset = (
    <fieldset>
      <p className="group-label"><span>Pricing</span><span className="line"/></p>
      <div className="field">
        <label>Price type</label>
        <div className="seg" role="tablist">
          <button type="button" className={priceType === "fixed"   ? "active" : ""} onClick={() => setPriceType("fixed")}>Fixed</button>
          <button type="button" className={priceType === "dynamic" ? "active" : ""} onClick={() => setPriceType("dynamic")}>Dynamic</button>
        </div>
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <label>Price per unit <InfoIcon/><span className="req">*</span></label>
        <div className="price-row">
          <div style={{ display: "flex" }}>
            <span className="prefix-wrap">$</span>
            <input inputMode="decimal" value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00"/>
          </div>
          <span className="suffix">per {unit || "unit"}</span>
        </div>
        {layout === "compact" && (
          <span className="hint">e.g. $0.01 per SMS, $0.50 per phone validation.</span>
        )}
      </div>
    </fieldset>
  );

  // V1 usage block — chip suggestions + number stepper
  const UsageCompact = (
    <fieldset>
      <p className="group-label"><span>Usage</span><span className="line"/></p>
      <div className="field">
        <label>Usage unit<span className="req">*</span></label>
        <input className="input" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. message"/>
        <div className="chip-row" aria-label="Common units">
          {exampleUnits.map(u => (
            <button key={u} type="button" className={`chip${unit === u ? " selected" : ""}`} onClick={() => setUnit(u)}>{u}</button>
          ))}
        </div>
        <span className="hint">Singular, no prefixes — we add "per" automatically.</span>
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <label>Max usage per day<span className="req">*</span></label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="num-stepper">
            <button type="button" onClick={() => setMaxDelta(-1)} aria-label="Decrease">−</button>
            <input value={maxPerDay} onChange={e => setMaxPerDay(e.target.value.replace(/[^0-9]/g, ""))}/>
            <button type="button" onClick={() => setMaxDelta(1)} aria-label="Increase">+</button>
          </div>
          <span className="hint" style={{ margin: 0 }}>Caps daily charges per sub-account · fraud guardrail</span>
        </div>
      </div>
    </fieldset>
  );

  // V2 usage block — simpler two-column (preview pane on the right does the explaining)
  const UsagePreview = (
    <fieldset>
      <p className="group-label"><span>Usage &amp; limits</span><span className="line"/></p>
      <div className="grid-2">
        <div className="field">
          <label>Usage unit<span className="req">*</span></label>
          <input className="input" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. message"/>
        </div>
        <div className="field">
          <label>Max per day<span className="req">*</span></label>
          <input className="input" value={maxPerDay} onChange={e => setMaxPerDay(e.target.value.replace(/[^0-9]/g, ""))}/>
        </div>
      </div>
    </fieldset>
  );

  // Layout toggle (header)
  const LayoutToggle = (
    <div className="seg layout-toggle" role="tablist" aria-label="Form layout">
      <button type="button" className={layout === "compact" ? "active" : ""} onClick={() => setLayout("compact")}>Compact</button>
      <button type="button" className={layout === "preview" ? "active" : ""} onClick={() => setLayout("preview")}>With preview</button>
    </div>
  );

  // ── Preview pane (V2 only) ──
  const priceN = Number(price) || 0;
  const fmtUSD = (n) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const projected1k  = fmtUSD(1000 * priceN);
  const projectedMax = fmtUSD((Number(maxPerDay) || 0) * priceN);
  const PreviewPane = (
    <aside className="preview-pane">
      <h4>Installer view · preview</h4>
      <div className="preview-card">
        <div className="name">
          <strong>{name || "Meter name"}</strong>
          <br/>
          <span>{moduleType} · {moduleName || "module"}</span>
        </div>
        <div className="price">
          ${priceN ? priceN.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0.00"}
          <small>/ {unit || "unit"}</small>
        </div>
        <div className="meta">
          <span className="pill">Capped at {Number(maxPerDay || 0).toLocaleString()}/day</span>
          <span className="pill">{priceType[0].toUpperCase() + priceType.slice(1)} pricing</span>
        </div>
      </div>
      <div className="calc">
        <h5>Estimated charges</h5>
        <div className="row"><span>1,000 {unit || "units"}</span><span className="v">{projected1k}</span></div>
        <div className="row"><span>At daily cap ({Number(maxPerDay || 0).toLocaleString()})</span><span className="v">{projectedMax}</span></div>
        <hr/>
        <div className="row total"><span>Max billed / day</span><span className="v">{projectedMax}</span></div>
      </div>
    </aside>
  );

  const isPreview = layout === "preview";
  const modalClass = `bm${isPreview && !isDraftEdit ? " v2" : ""}`;
  const modalStyle = isDraftEdit ? { width: 560 } : isPreview ? undefined : { width: 600 };

  // ── Edit-mode body: simplified price-change form with T+30 notice ──
  const deltaClass = pctDelta == null ? "" : pctDelta > 0 ? "is-up" : pctDelta < 0 ? "is-down" : "is-flat";
  const deltaLabel = pctDelta == null
    ? null
    : pctDelta === 0
      ? "No change"
      : `${pctDelta > 0 ? "+" : ""}${pctDelta.toFixed(pctDelta % 1 === 0 ? 0 : 1)}%`;

  const EditBody = (
    <div className="body">
      <div className="notice notice--info" role="note">
        <span className="notice-ic" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </span>
        <div className="notice-body">
          <strong>All meter changes have a 30-day notice window.</strong>
          <span> This change will be scheduled automatically and become effective <strong>T+30 days</strong> from publish ({effectiveDate}). Existing subscribers will be notified.</span>
        </div>
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label>Meter name</label>
        <input ref={nameRef} className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. AI workflow runs"/>
      </div>

      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="field">
          <label>Max usage per day</label>
          <div className="num-stepper">
            <button type="button" onClick={() => setMaxDelta(-1)} aria-label="Decrease">−</button>
            <input value={maxPerDay} onChange={e => setMaxPerDay(e.target.value.replace(/[^0-9]/g, ""))}/>
            <button type="button" onClick={() => setMaxDelta(1)} aria-label="Increase">+</button>
          </div>
        </div>
        <div className="field">
          <label>Price type</label>
          <div className="seg" role="tablist">
            <button type="button" className={priceType === "fixed"   ? "active" : ""} onClick={() => setPriceType("fixed")}>Fixed</button>
            <button type="button" className={priceType === "dynamic" ? "active" : ""} onClick={() => setPriceType("dynamic")}>Dynamic</button>
          </div>
        </div>
      </div>

      <p className="group-label" style={{ marginTop: 22 }}><span>Price per {stripPer(initial?.unit) || "unit"}</span><span className="line"/></p>

      <div className="price-compare">
        <div className="price-compare-current">
          <span className="pc-label">Current</span>
          <div className="pc-value">
            {fmtMoney(currentPriceN)}
            <small>/ {stripPer(initial?.unit) || "unit"}</small>
          </div>
          <span className="pc-meta">Live since publish</span>
        </div>

        <div className="price-compare-arrow" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>
          </svg>
        </div>

        <div className="price-compare-new">
          <div className="pc-new-head">
            <span className="pc-label">New</span>
            {deltaLabel && (
              <span className={`pc-delta ${deltaClass}`}>{deltaLabel}</span>
            )}
          </div>
          <div className="price-row pc-input-row">
            <div style={{ display: "flex" }}>
              <span className="prefix-wrap">$</span>
              <input
                inputMode="decimal"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder={currentPriceN ? currentPriceN.toString() : "0.00"}
                autoFocus
              />
            </div>
            <span className="suffix">per {stripPer(initial?.unit) || "unit"}</span>
          </div>
          <span className="pc-meta">Effective {effectiveDate}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={modalClass} style={modalStyle} role="dialog" aria-modal="true" aria-label={isEdit ? "Edit billing meter" : "Add billing meter"}>
        <div className="hd">
          <div>
            <h2>{isEdit ? "Edit billing meter" : "Add billing meter"}</h2>
            <p>{isDraftEdit
              ? "Adjust pricing or limits. Price changes follow the 30-day notice policy."
              : "Configure per-usage pricing for workflow actions/triggers, conversation providers, or any custom event (API)."}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!isDraftEdit && LayoutToggle}
            <button className="x" onClick={onClose} aria-label="Close"><IcX/></button>
          </div>
        </div>

        {isDraftEdit ? EditBody : isPreview ? (
          <div className="layout">
            <div className="body">
              {IdentityFieldset}
              {UsagePreview}
              {PricingFieldset}
            </div>
            {PreviewPane}
          </div>
        ) : (
          <div className="body">
            {IdentityFieldset}
            {UsageCompact}
            {PricingFieldset}
          </div>
        )}

        <div className="ft">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isDraftEdit ? !canSaveEdit : !canSave}
          >
            {isDraftEdit ? "Schedule changes" : isEdit ? "Update billing meter" : "Add billing meter"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Confirm delete ─────────────────────────────
const ConfirmDelete = ({ title, body, onConfirm, onClose }) => (
  <ModalShell
    title={title}
    sub={body}
    onClose={onClose}
    confirm
    footer={<>
      <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
    </>}
  >
    <></>
  </ModalShell>
);

// ─── Rename plan (lightweight — name only) ──────
const RenamePlanModal = ({ plan, onSave, onClose }) => {
  const [name, setName] = useState(plan?.name ?? "");
  const inputRef = useRef(null);
  useEsc(onClose);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && trimmed !== plan?.name;

  const submit = (e) => {
    e?.preventDefault?.();
    if (!canSave) return;
    onSave({ ...plan, name: trimmed });
  };

  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bm plan-modal rename-modal" style={{ width: 460 }} role="dialog" aria-modal="true" aria-label="Rename plan">
        <div className="hd">
          <div className="title-block">
            <span className="head-icon"><IcEdit/></span>
            <div>
              <h2>Rename plan</h2>
              <p>Only the name changes. Pricing, features, and subscribers stay the same.</p>
            </div>
          </div>
          <button className="x" onClick={onClose} aria-label="Close"><IcX/></button>
        </div>
        <form className="body" onSubmit={submit}>
          <div className="field">
            <label>Plan name</label>
            <input
              ref={inputRef}
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pro Max"
            />
          </div>
        </form>
        <div className="ft">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={!canSave}>Save name</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { PlanModal, RenamePlanModal, MeterModal, ConfirmDelete, DeprecatePlanModal });

// ─── Deprecate plan ──────────────────
function DeprecatePlanModal({ plan, onConfirm, onClose }) {
  const [policy, setPolicy] = useState("notify"); // "grandfather" | "notify"

  const sub = (
    <>Existing subscribers will be notified according to your chosen policy.</>
  );

  const Option = ({ value, title, body }) => (
    <label className={`dep-option${policy === value ? " is-selected" : ""}`}>
      <input
        type="radio"
        name="deprecate-policy"
        value={value}
        checked={policy === value}
        onChange={() => setPolicy(value)}
      />
      <span className="dep-option-radio" aria-hidden="true"/>
      <span className="dep-option-text">
        <span className="dep-option-title">{title}</span>
        <span className="dep-option-body">{body}</span>
      </span>
    </label>
  );

  return (
    <ModalShell
      title={`Deprecate ${plan?.name || "plan"}?`}
      sub={sub}
      onClose={onClose}
      confirm
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={() => onConfirm({ policy })}>Deprecate</button>
      </>}
    >
      <div className="dep-body">
        <div className="dep-section-label">
          <span>How should existing subscribers be handled?</span>
        </div>
        <div className="dep-options">
          <Option
            value="grandfather"
            title="Grandfather existing subscribers forever"
            body="Subscribers on deprecated plans keep their plan and price indefinitely. No migration notices are sent. You continue serving them at old pricing, or uninstall them manually at any time. No T+30 window applies."
          />
          <Option
            value="notify"
            title="Notify and let subscribers choose (T+30 window)"
            body="Subscribers on deprecated plans get a notice at T+0 (publish) and a reminder at T+30. If they don’t switch by T+30, no auto-migration occurs. You decide whether to continue service or uninstall. Subscribers can’t be forced to any plan."
          />
        </div>
      </div>
    </ModalShell>
  );
}
