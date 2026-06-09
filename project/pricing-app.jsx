/* global React, ReactDOM, Topbar, Sidebar, RightRail, PlanModal, MeterModal, ConfirmDelete, IcPlus, IcEdit, IcTrash, IcCheck, PublishedPricing, PricingDraftView, SharedPlansCard, SharedMetersCard, TweaksPanel, TweakSection, TweakToggle, TweakRadio, useTweaks */
// pricing-app.jsx — the Pricing page itself + state

const { useState, useMemo } = React;

// Allow ?view=live|setup|draft to set the initial view (used by the Preview button)
const _urlView = new URLSearchParams(window.location.search).get('view');
const _isPreviewMode = !!_urlView;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "viewState": "setup",
  "showMandatorySteps": true,
  "priceDisplay": "stacked",
  "subsDisplay": "inline",
  "firstPublish": false
}/*EDITMODE-END*/;

// Override viewState from URL if present
if (_urlView) TWEAK_DEFAULTS.viewState = _urlView;

const initialPlans = [
  { id: "p1", name: "Free Plan",                          charge: "Free",    agency: "Free",    subacct: "—",     subs: "—", status: "draft" },
  { id: "p2", name: "Starter",                            charge: "Monthly", agency: "$100.00", subacct: "Free",  subs: "—", status: "draft" },
  { id: "p3", name: "Pro",                                charge: "Monthly", agency: "$197.00", subacct: "$5.00", subs: "—", status: "draft" },
];

const initialMeters = [
  { id: "m1", name: "Phone Validation Meter", module: "Phone Validation",   kind: "Workflow Action",       unit: "per execution",        priceRaw: "0.005", price: "$0.005", subs: 142, status: "draft" },
  { id: "m2", name: "iMessage meter",         module: "iMessage Integration", kind: "Conversation Provider", unit: "per outbound message", priceRaw: "0.002", price: "$0.002", subs: 142, status: "draft" },
  { id: "m3", name: "AI Content API Meter",   module: "AI Content Generation", kind: "Custom Meter (API)",   unit: "per 1000 tokens",      priceRaw: "5",     price: "$5",     subs: 89,  status: "draft" },
];

const ChargeChip = ({ charge }) => {
  // Always render as plain text per the source design; could chip later if needed
  return <span>{charge}</span>;
};

const PlansTable = ({ plans, onEdit, onDelete }) => {
  if (!plans.length) {
    return <div className="empty">No plans yet. Add one to get started.</div>;
  }
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>Plan name</th>
          <th>Charge type</th>
          <th>Agency amount</th>
          <th>Sub account amount</th>
          <th className="actions"></th>
        </tr>
      </thead>
      <tbody>
        {plans.map(p => (
          <tr key={p.id}>
            <td>{p.name}</td>
            <td><ChargeChip charge={p.charge}/></td>
            <td>{p.agency}</td>
            <td>{p.subacct}</td>
            <td className="actions">
              <div className="row-actions">
                <button className="edit" aria-label="Edit plan" onClick={() => onEdit(p)}><IcEdit/></button>
                <button className="del"  aria-label="Delete plan" onClick={() => onDelete(p)}><IcTrash/></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const IcMeter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="14" r="8"/><path d="M12 14l4-4"/><path d="M9 2h6"/></svg>
);

const MetersList = ({ meters, onEdit, onDelete }) => {
  if (!meters.length) {
    return <div className="empty">No meters configured.</div>;
  }
  return (
    <div className="meter-list">
      {meters.map(m => (
        <div key={m.id} className="meter-row">
          <span className="ic"><IcMeter/></span>
          <div className="info">
            <div className="name">{m.name}</div>
            <div className="desc">{m.module} · {m.kind}</div>
          </div>
          <div className="price-cell">
            <span className="price">{m.price}</span>
            <span className="unit">{m.unit}</span>
          </div>
          <div className="row-actions">
            <button className="edit" aria-label="Edit meter" onClick={() => onEdit(m)}><IcEdit/></button>
            <button className="del"  aria-label="Delete meter" onClick={() => onDelete(m)}><IcTrash/></button>
          </div>
        </div>
      ))}
    </div>
  );
};

const Toast = ({ msg, kind = "success", onDone }) => {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`toast ${kind}`}>
      {kind === "success" ? <IcCheck/> : null}
      <span>{msg}</span>
    </div>
  );
};

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [model, setModel] = useState("freemium"); // free | freemium | paid
  const [plans, setPlans]   = useState(initialPlans);
  const [meters, setMeters] = useState(initialMeters);
  const [trialOn, setTrialOn] = useState(true);
  const [trialDays, setTrialDays] = useState(14);

  // Modal state
  const [planModal,  setPlanModal]  = useState(null); // { mode, target }
  const [meterModal, setMeterModal] = useState(null);
  const [confirm,    setConfirm]    = useState(null); // { kind, target }

  // Toast
  const [toast, setToast] = useState(null);
  const ping = (msg, kind = "success") => setToast({ id: Date.now(), msg, kind });

  // ── Plan ops
  const onSavePlan = (next) => {
    if (next.id) {
      setPlans(ps => ps.map(p => p.id === next.id ? { ...p, ...next } : p));
      ping("Plan updated.");
    } else {
      setPlans(ps => [...ps, { ...next, id: `p${Date.now()}` }]);
      ping("Plan added.");
    }
    setPlanModal(null);
  };
  const onSaveMeter = (next) => {
    if (next.id) {
      setMeters(ms => ms.map(m => m.id === next.id ? { ...m, ...next } : m));
      ping("Meter updated.");
    } else {
      setMeters(ms => [...ms, { ...next, id: `m${Date.now()}` }]);
      ping("Meter added.");
    }
    setMeterModal(null);
  };
  const confirmDelete = () => {
    if (!confirm) return;
    if (confirm.kind === "plan") {
      setPlans(ps => ps.filter(p => p.id !== confirm.target.id));
      ping("Plan deleted.", "success");
    } else if (confirm.kind === "meter") {
      setMeters(ms => ms.filter(m => m.id !== confirm.target.id));
      ping("Meter deleted.", "success");
    }
    setConfirm(null);
  };

  // Right-rail completion logic
  const steps = useMemo(() => ([
    { label: "Basic info",     done: false },
    { label: "Profile details", done: false },
    { label: "Support details", done: false },
    { label: "Pricing details", done: true },
    { label: "Review details",  done: false },
  ]), []);

  // Match the source design — pricing is in draft, so it carries an attention dot.
  const pricingHasWarning = true;

  const [saved, setSaved] = useState(false);
  const onSave = () => {
    setSaved(true);
    ping("Changes saved.");
    setTimeout(() => setSaved(false), 2400);
  };

  const tweaksPanel = (
    <TweaksPanel>
      <TweakSection label="State"/>
      <TweakRadio
        label="View"
        value={tweaks.viewState}
        onChange={(v) => setTweak('viewState', v)}
        options={[
          { value: "setup", label: "Setup" },
          { value: "live",  label: "Live"  },
          { value: "draft", label: "Draft" },
        ]}
      />
      <TweakToggle
        label="Mandatory steps"
        value={tweaks.showMandatorySteps}
        onChange={(v) => setTweak('showMandatorySteps', v)}
      />
      <TweakToggle
        label="First-time publish"
        value={tweaks.firstPublish}
        onChange={(v) => setTweak('firstPublish', v)}
      />
      <TweakSection label="Meter pricing display"/>
      <TweakRadio
        label="Style"
        value={tweaks.priceDisplay}
        onChange={(v) => setTweak('priceDisplay', v)}
        options={[
          { value: "stacked", label: "Stacked" },
          { value: "inline",  label: "Inline"  },
          { value: "slash",   label: "Slash"   },
          { value: "pill",    label: "Pill"    },
          { value: "hero",    label: "Hero"    },
          { value: "bracket", label: "Bracket" },
          { value: "code",    label: "Code"    },
          { value: "field",   label: "Field"   },
          { value: "field-filled", label: "Field · Filled" },
          { value: "field-dashed", label: "Field · Dashed" },
          { value: "field-lock",   label: "Field · Lock"   },
        ]}
      />
      <TweakSection label="Subscribers display"/>
      <TweakRadio
        label="Style"
        value={tweaks.subsDisplay}
        onChange={(v) => setTweak('subsDisplay', v)}
        options={[
          { value: "chip",   label: "Chip"   },
          { value: "inline", label: "Inline" },
          { value: "stat",   label: "Stat"   },
          { value: "badge",  label: "Badge"  },
          { value: "avatar", label: "Avatars"},
        ]}
      />
    </TweaksPanel>
  );

  if (tweaks.viewState === "live") {
    return (
      <>
        <PublishedPricing
          showMandatorySteps={tweaks.showMandatorySteps}
          priceDisplay={tweaks.priceDisplay}
          subsDisplay={tweaks.subsDisplay}
          onCreateDraft={() => setTweak('viewState', 'draft')}
        />
        {tweaksPanel}
      </>
    );
  }

  if (tweaks.viewState === "draft") {
    return (
      <>
        <PricingDraftView
          priceDisplay={tweaks.priceDisplay}
          subsDisplay={tweaks.subsDisplay}
          isFirstPublish={tweaks.firstPublish}
          onCancel={() => setTweak('viewState', 'live')}
          onPublish={() => setTweak('viewState', 'live')}
        />
        {tweaksPanel}
      </>
    );
  }

  return (
    <>
      <Topbar/>
      <div className={`page${!tweaks.showMandatorySteps ? " page--published" : ""}`}>
        <Sidebar pricingHasWarning={pricingHasWarning}/>
        <main className="main-card">
          <div className="page-title-row">
            <h1 className="page-title">Pricing</h1>
            <span className="draft-pill">Draft</span>
          </div>
          <p className="page-sub">Tell us about your app's business model and pricing plans, then set up a pricing page</p>

          <p className="field-label">Is your app free or paid?</p>
          <div className="radio-row" role="radiogroup" aria-label="Pricing model">
            {["free", "freemium", "paid"].map(v => (
              <label key={v} className={`radio${model === v ? " checked" : ""}`}>
                <input type="radio" name="model" value={v} checked={model === v} onChange={() => setModel(v)}/>
                <span className="dot"/>
                <span>{v[0].toUpperCase() + v.slice(1)}</span>
              </label>
            ))}
          </div>

          {/* ── Plans card (hidden when model is Free) ── */}
          {model !== "free" && (
            <SharedPlansCard
              mode="draft"
              plans={plans}
              onAdd={() => setPlanModal({ initial: null })}
              onEdit={p => setPlanModal({ initial: p })}
              onDelete={p => setConfirm({ kind: "plan", target: p })}
            />
          )}

          {/* ── Free trial (standalone card) — only when plans are shown ── */}
          {model !== "free" && (
            <div className="trial-bar standalone">
              <div className="row">
                <div>
                  <h4>Provide a free trial for your app</h4>
                  <p>Installers get full access to paid plans for a limited time before billing starts.</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={trialOn} onChange={e => setTrialOn(e.target.checked)}/>
                  <span className="track"/>
                </label>
              </div>
              {trialOn && (
                <>
                  <div className="divider"/>
                  <div className="days">
                    <span style={{ color: "var(--hr-gray-800)" }}>Days of free trial</span>
                    <input
                      type="number" min="1" max="365"
                      value={trialDays}
                      onChange={e => setTrialDays(Math.max(1, Math.min(365, Number(e.target.value) || 0)))}
                    />
                    <span style={{ color: "var(--hr-gray-500)" }}>days</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Billing meter card ── */}
          <SharedMetersCard
            mode="draft"
            meters={meters}
            priceDisplay={tweaks.priceDisplay}
            subsDisplay={tweaks.subsDisplay}
            onAdd={() => setMeterModal({ initial: null })}
            onEdit={m => setMeterModal({ initial: m })}
            onDelete={m => setConfirm({ kind: "meter", target: m })}
          />

          {/* ── Footer actions ── */}
          <div className="page-footer">
            {saved && (
              <span className="saved-badge"><IcCheck/>Saved</span>
            )}
            <button className="btn btn-secondary">Cancel</button>
            <button className="btn btn-primary" onClick={onSave}>Save</button>
          </div>
        </main>

        {tweaks.showMandatorySteps && <RightRail steps={steps}/>}
      </div>

      {planModal && (
        <PlanModal
          initial={planModal.initial}
          onSave={onSavePlan}
          onClose={() => setPlanModal(null)}
        />
      )}
      {meterModal && (
        <MeterModal
          initial={meterModal.initial}
          onSave={onSaveMeter}
          onClose={() => setMeterModal(null)}
        />
      )}
      {confirm && (
        <ConfirmDelete
          title={confirm.kind === "plan" ? "Delete plan?" : "Delete meter?"}
          body={confirm.kind === "plan"
            ? `${confirm.target.name} will be removed from this pricing page. This can't be undone.`
            : `${confirm.target.name} meter will be removed. This can't be undone.`}
          onConfirm={confirmDelete}
          onClose={() => setConfirm(null)}
        />
      )}

      {toast && <Toast key={toast.id} msg={toast.msg} kind={toast.kind} onDone={() => setToast(null)}/>}

      {tweaksPanel}
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
