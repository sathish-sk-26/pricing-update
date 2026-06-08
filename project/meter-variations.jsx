/* global React, ReactDOM, IcX, IcInfo, IcCheck, IcPlus */
// Three redesigned variations of the "Edit billing meter" form.

const { useState } = React;

// Small info icon (uses .info class from CSS)
const Info = () => (
  <svg className="info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const ChevDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ModalHead = ({ title, sub, onClose }) => (
  <div className="hd">
    <div>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
    <button className="x" onClick={onClose} aria-label="Close"><IcX/></button>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// V1 — Grouped & compact
//   • Groups fields into IDENTITY · USAGE · PRICING
//   • Pairs related fields side-by-side
//   • Replaces verbose helper text with chips & short hints
//   • Adds a live preview pill in the price row
// ═══════════════════════════════════════════════════════════════════
const V1 = () => {
  const [unit, setUnit]       = useState("phone");
  const [price, setPrice]     = useState("12");
  const [priceType, setType]  = useState("fixed");
  const [name, setName]       = useState("rtaew");
  const [moduleType, setMod]  = useState("Custom Event (API)");
  const [moduleName, setModN] = useState("sd");
  const [maxPerDay, setMax]   = useState("123");

  const exampleUnits = ["message", "token", "phone validation", "minute", "run"];

  return (
    <div className="bm" style={{ width: 600 }}>
      <ModalHead
        title="Edit billing meter"
        sub="Configure per-usage pricing for workflow actions/triggers, conversation providers, or any custom event (API)."
        onClose={() => {}}
      />
      <div className="body">
        <fieldset>
          <p className="group-label"><span>Identity</span><span className="line"/></p>
          <div className="field">
            <label>Meter name<span className="req">*</span></label>
            <input className="input" value={name} onChange={e => setName(e.target.value)}/>
            <span className="hint">Shown to you on the developer portal — not to installers.</span>
          </div>
          <div className="grid-2" style={{ marginTop: 14 }}>
            <div className="field">
              <label>Module type<span className="req">*</span></label>
              <select className="select" value={moduleType} onChange={e => setMod(e.target.value)}>
                <option>Custom Event (API)</option>
                <option>Workflow Action</option>
                <option>Workflow Trigger</option>
                <option>Conversation Provider</option>
              </select>
            </div>
            <div className="field">
              <label>Module name <Info/></label>
              <input className="input" value={moduleName} onChange={e => setModN(e.target.value)}/>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <p className="group-label"><span>Usage</span><span className="line"/></p>
          <div className="field">
            <label>Usage unit<span className="req">*</span></label>
            <input className="input" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. message"/>
            <div className="chip-row" aria-label="Common units">
              {exampleUnits.map(u => (
                <button key={u} className={`chip${unit === u ? " selected" : ""}`} onClick={() => setUnit(u)}>{u}</button>
              ))}
            </div>
            <span className="hint">Singular, no prefixes — we add "per" automatically.</span>
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Max usage per day<span className="req">*</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="num-stepper">
                <button onClick={() => setMax(Math.max(0, +maxPerDay - 1))}>−</button>
                <input value={maxPerDay} onChange={e => setMax(e.target.value.replace(/[^0-9]/g, ""))}/>
                <button onClick={() => setMax(+maxPerDay + 1)}>+</button>
              </div>
              <span className="hint" style={{ margin: 0 }}>Caps daily charges per sub-account · fraud guardrail</span>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <p className="group-label"><span>Pricing</span><span className="line"/></p>
          <div className="field">
            <label>Price type</label>
            <div className="seg" role="tablist">
              <button className={priceType === "fixed"   ? "active" : ""} onClick={() => setType("fixed")}>Fixed</button>
              <button className={priceType === "dynamic" ? "active" : ""} onClick={() => setType("dynamic")}>Dynamic</button>
            </div>
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Price per unit <Info/></label>
            <div className="price-row">
              <div style={{ display: "flex" }}>
                <span className="prefix-wrap">$</span>
                <input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00"/>
              </div>
              <span className="suffix">per {unit || "unit"}</span>
            </div>
            <span className="hint">e.g. $0.01 per SMS, $0.50 per phone validation.</span>
          </div>
        </fieldset>
      </div>
      <div className="ft">
        <button className="btn btn-secondary">Cancel</button>
        <button className="btn btn-primary">Update billing meter</button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// V2 — Form + live preview pane
//   • Form on the left, preview card on the right showing the
//     meter exactly as installers will see it
//   • Live "what 1k units costs" calculation
//   • Forces shorter helper text since the preview clarifies intent
// ═══════════════════════════════════════════════════════════════════
const V2 = () => {
  const [unit, setUnit]   = useState("phone");
  const [price, setPrice] = useState("12");
  const [name, setName]   = useState("rtaew");
  const [mod, setMod]     = useState("Custom Event (API)");
  const [modN, setModN]   = useState("sd");
  const [maxD, setMaxD]   = useState("123");
  const [pType, setPType] = useState("fixed");

  const pn = Number(price) || 0;
  const projected1k = (1000 * pn).toLocaleString(undefined, { style: "currency", currency: "USD" });
  const projectedMax = (Number(maxD || 0) * pn).toLocaleString(undefined, { style: "currency", currency: "USD" });

  return (
    <div className="bm v2">
      <ModalHead
        title="Edit billing meter"
        sub="Configure per-usage pricing for workflow actions, conversation providers, or custom API events."
        onClose={() => {}}
      />
      <div className="layout">
        <div className="body">
          <fieldset>
            <p className="group-label"><span>Identity</span><span className="line"/></p>
            <div className="field">
              <label>Meter name<span className="req">*</span></label>
              <input className="input" value={name} onChange={e => setName(e.target.value)}/>
            </div>
            <div className="grid-2" style={{ marginTop: 14 }}>
              <div className="field">
                <label>Module type<span className="req">*</span></label>
                <select className="select" value={mod} onChange={e => setMod(e.target.value)}>
                  <option>Custom Event (API)</option>
                  <option>Workflow Action</option>
                  <option>Workflow Trigger</option>
                </select>
              </div>
              <div className="field">
                <label>Module name <Info/></label>
                <input className="input" value={modN} onChange={e => setModN(e.target.value)}/>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <p className="group-label"><span>Usage & limits</span><span className="line"/></p>
            <div className="grid-2">
              <div className="field">
                <label>Usage unit<span className="req">*</span></label>
                <input className="input" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. message"/>
              </div>
              <div className="field">
                <label>Max per day<span className="req">*</span></label>
                <input className="input" value={maxD} onChange={e => setMaxD(e.target.value.replace(/[^0-9]/g, ""))}/>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <p className="group-label"><span>Pricing</span><span className="line"/></p>
            <div className="field">
              <label>Price type</label>
              <div className="seg">
                <button className={pType === "fixed"   ? "active" : ""} onClick={() => setPType("fixed")}>Fixed</button>
                <button className={pType === "dynamic" ? "active" : ""} onClick={() => setPType("dynamic")}>Dynamic</button>
              </div>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Price per unit<span className="req">*</span></label>
              <div className="price-row">
                <div style={{ display: "flex" }}>
                  <span className="prefix-wrap">$</span>
                  <input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00"/>
                </div>
                <span className="suffix">per {unit || "unit"}</span>
              </div>
            </div>
          </fieldset>
        </div>

        <aside className="preview-pane">
          <h4>Installer view · preview</h4>
          <div className="preview-card">
            <div className="name">
              <strong>{name || "Meter name"}</strong>
              <br/>
              <span>{mod} · {modN || "module"}</span>
            </div>
            <div className="price">
              ${pn ? pn.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0.00"}
              <small>/ {unit || "unit"}</small>
            </div>
            <div className="meta">
              <span className="pill">Capped at {Number(maxD || 0).toLocaleString()}/day</span>
              <span className="pill">{pType[0].toUpperCase() + pType.slice(1)} pricing</span>
            </div>
          </div>

          <div className="calc">
            <h5>Estimated charges</h5>
            <div className="row"><span>1,000 {unit || "units"}</span><span className="v">{projected1k}</span></div>
            <div className="row"><span>At daily cap ({Number(maxD || 0).toLocaleString()})</span><span className="v">{projectedMax}</span></div>
            <hr/>
            <div className="row total"><span>Max billed / day</span><span className="v">{projectedMax}</span></div>
          </div>
        </aside>
      </div>
      <div className="ft">
        <button className="btn btn-secondary">Cancel</button>
        <button className="btn btn-primary">Update billing meter</button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// V3 — Stepped accordion
//   • Three numbered steps, only one expanded at a time
//   • Collapsed steps show a one-line summary of saved values
//   • Less cognitive load, great for first-time setup AND quick edits
//     because every step has an inline Edit button
// ═══════════════════════════════════════════════════════════════════
const V3 = () => {
  const [open, setOpen]   = useState(2); // currently editing "Usage"
  const [unit, setUnit]   = useState("phone");
  const [maxD, setMaxD]   = useState("123");
  const [price, setPrice] = useState("12");
  const [name, setName]   = useState("rtaew");
  const [mod, setMod]     = useState("Custom Event (API)");
  const [modN, setModN]   = useState("sd");

  const Step = ({ n, title, summary, done, children }) => {
    const isOpen = open === n;
    return (
      <div className={`step${isOpen ? " open" : ""}${done && !isOpen ? " done" : ""}`}>
        <div className="step-head" onClick={() => setOpen(isOpen ? -1 : n)}>
          <span className="num">{done && !isOpen ? <IcCheck/> : n}</span>
          <div className="meta">
            <div className="title">{title}</div>
            <div className="summary">{summary}</div>
          </div>
          {!isOpen && done && <button className="step-edit-btn" onClick={(e) => { e.stopPropagation(); setOpen(n); }}>Edit</button>}
          <span className="chev"><ChevDownIcon/></span>
        </div>
        <div className="step-body">{children}</div>
      </div>
    );
  };

  return (
    <div className="bm v3" style={{ width: 640 }}>
      <ModalHead
        title="Edit billing meter"
        sub="Three steps — name it, define what to count, then set the price."
        onClose={() => {}}
      />
      <div className="body">
        <Step n={1} title="Name & module" done summary={`${name} · ${mod} · ${modN}`}>
          <div className="field">
            <label>Meter name<span className="req">*</span></label>
            <input className="input" value={name} onChange={e => setName(e.target.value)}/>
          </div>
          <div className="grid-2" style={{ marginTop: 14 }}>
            <div className="field">
              <label>Module type<span className="req">*</span></label>
              <select className="select" value={mod} onChange={e => setMod(e.target.value)}>
                <option>Custom Event (API)</option>
                <option>Workflow Action</option>
                <option>Workflow Trigger</option>
              </select>
            </div>
            <div className="field">
              <label>Module name <Info/></label>
              <input className="input" value={modN} onChange={e => setModN(e.target.value)}/>
            </div>
          </div>
        </Step>

        <Step n={2} title="What to count" summary={`Per ${unit} · capped at ${maxD}/day`}>
          <div className="field">
            <label>Usage unit<span className="req">*</span></label>
            <input className="input focused" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. message"/>
            <span className="hint">Singular, no prefixes — we add "per" automatically.</span>
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Max usage per day<span className="req">*</span></label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="num-stepper">
                <button onClick={() => setMaxD(Math.max(0, +maxD - 1))}>−</button>
                <input value={maxD} onChange={e => setMaxD(e.target.value.replace(/[^0-9]/g, ""))}/>
                <button onClick={() => setMaxD(+maxD + 1)}>+</button>
              </div>
              <span className="hint" style={{ margin: 0 }}>Per sub-account · fraud guardrail.</span>
            </div>
          </div>
        </Step>

        <Step n={3} title="Pricing" summary={`Fixed · $${price} per ${unit}`}>
          <div className="field">
            <label>Price type</label>
            <div className="seg">
              <button className="active">Fixed</button>
              <button>Dynamic</button>
            </div>
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Price per unit<span className="req">*</span></label>
            <div className="price-row">
              <div style={{ display: "flex" }}>
                <span className="prefix-wrap">$</span>
                <input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00"/>
              </div>
              <span className="suffix">per {unit || "unit"}</span>
            </div>
          </div>
        </Step>

        <div className="summary-line">
          <span className="ico"><IcCheck/></span>
          <span>
            This meter will charge <strong>${price} per {unit}</strong>, up to <strong>{Number(maxD || 0).toLocaleString()} {unit}{Number(maxD) === 1 ? "" : "s"}/day</strong> per sub-account.
          </span>
        </div>
      </div>
      <div className="ft">
        <button className="btn btn-secondary">Cancel</button>
        <button className="btn btn-primary">Update billing meter</button>
      </div>
    </div>
  );
};

// ─── Canvas ────────────────────────────────────────────────────────
const Stage = ({ children }) => <div className="bm-stage">{children}</div>;

const App = () => (
  <DesignCanvas>
    <DCSection
      id="meter-form"
      title="Edit billing meter · 3 redesigned variations"
      subtitle="Same fields, redesigned for faster scanning and better feedback. Click an artboard to focus."
    >
      <DCArtboard id="v1" label="01 · Grouped & compact"            width={680} height={920}><Stage><V1/></Stage></DCArtboard>
      <DCArtboard id="v2" label="02 · Form + live preview"          width={1020} height={760}><Stage><V2/></Stage></DCArtboard>
      <DCArtboard id="v3" label="03 · Stepped (collapsed summaries)" width={720} height={900}><Stage><V3/></Stage></DCArtboard>
    </DCSection>
  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
