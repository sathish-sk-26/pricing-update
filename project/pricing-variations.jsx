/* global React, IcLock, IcHelp, IcBell, IcUser, IcChevDown, IcPlus, IcEdit, IcTrash, IcCheck, IcSettings, IcGrid, IcUser01, IcLayers */
// Static shell + 5 layout variations for the Pricing page center card.

const { useState } = React;

// ─── Shared shell (topbar, sidebar, right rail) ─────────────────────
const StaticTopbar = () => (
  <header className="topbar">
    <a className="brand"><IcLock/>Marketplace</a>
    <nav className="nav">
      <a>App dashboard</a>
      <a>Testing</a>
      <a>My apps</a>
      <a>Product updates <span className="dot"/></a>
      <div className="group">
        <button className="icon-btn"><IcHelp/></button>
        <button className="icon-btn"><IcBell/></button>
        <button className="user">
          <span className="avatar"><IcUser/></span>
          <IcChevDown style={{ width: 16, height: 16 }}/>
        </button>
      </div>
    </nav>
  </header>
);

const StaticSidebar = () => (
  <aside className="side">
    <div className="section open">
      <div className="section-head">
        <span className="left"><IcSettings style={{ width: 16, height: 16 }}/>Build</span>
        <IcChevDown style={{ width: 16, height: 16, color: "var(--hr-gray-500)" }}/>
      </div>
      <div className="section-body">
        <div className="app-select">
          <span className="left">vdraft</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span className="draft"><span className="dot"/>Draft</span>
            <IcChevDown style={{ width: 14, height: 14, color: "var(--hr-gray-500)" }}/>
          </span>
        </div>
        <div className="nav-item"><IcUser01 style={{ width: 16, height: 16 }}/>Profile<IcChevDown className="chev" style={{ width: 14, height: 14 }}/></div>
        <div className="nav-item active">
          <IcGrid style={{ width: 16, height: 16 }}/>Pricing
          <span className="warn-dot" aria-hidden>!</span>
        </div>
        <div className="nav-item"><IcLayers style={{ width: 16, height: 16 }}/>Modules<IcChevDown className="chev" style={{ width: 14, height: 14 }}/></div>
        <div className="nav-item"><IcSettings style={{ width: 16, height: 16 }}/>Advanced Settings<IcChevDown className="chev" style={{ width: 14, height: 14 }}/></div>
      </div>
    </div>
    <div className="section">
      <div className="section-head muted">
        <span className="left"><IcSettings style={{ width: 16, height: 16 }}/>Manage</span>
        <IcChevDown style={{ width: 16, height: 16, color: "var(--hr-gray-500)" }}/>
      </div>
    </div>
    <div className="section">
      <div className="section-head muted">
        <span className="left"><IcGrid style={{ width: 16, height: 16 }}/>Insights</span>
        <IcChevDown style={{ width: 16, height: 16, color: "var(--hr-gray-500)" }}/>
      </div>
    </div>
  </aside>
);

const StaticRail = () => {
  const steps = [
    { label: "Basic info",      done: false },
    { label: "Profile details", done: false },
    { label: "Support details", done: false },
    { label: "Pricing details", done: true  },
    { label: "Review details",  done: false },
  ];
  return (
    <aside className="rail">
      <h4>Mandatory steps (1/5)</h4>
      <ul>
        {steps.map((s, i) => (
          <li key={i} className={s.done ? "done" : ""}>
            {s.done
              ? <span className="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
              : <span className="bullet"/>}
            <span>{s.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

const Screen = ({ main }) => (
  <div className="screen">
    <StaticTopbar/>
    <div className="page" style={{ display: "grid" }}>
      <StaticSidebar/>
      <main className="main-card">{main}</main>
      <StaticRail/>
    </div>
  </div>
);

// ─── Shared bits used across variations ─────────────────────────────
const PageTitle = () => (
  <>
    <div className="page-title-row">
      <h1 className="page-title">Pricing</h1>
      <span className="draft-pill">Draft</span>
    </div>
    <p className="page-sub">Tell us about your app's business model and pricing plans, then set up a pricing page</p>
  </>
);
const ModelRadio = ({ value = "freemium" }) => (
  <>
    <p className="field-label">Is your app free or paid?</p>
    <div className="radio-row">
      {["free", "freemium", "paid"].map(v => (
        <span key={v} className={`radio${value === v ? " checked" : ""}`}>
          <span className="dot"/>
          <span>{v[0].toUpperCase() + v.slice(1)}</span>
        </span>
      ))}
    </div>
  </>
);
const Actions = () => (
  <div className="row-actions">
    <button className="edit"><IcEdit/></button>
    <button className="del"><IcTrash/></button>
  </div>
);
const PageFooter = ({ left = null, right = (
  <>
    <button className="btn btn-secondary">Cancel</button>
    <button className="btn btn-primary">Save</button>
  </>
) }) => (
  <div className="page-footer" style={{ justifyContent: left ? "space-between" : "flex-end" }}>
    {left}
    <span style={{ display: "inline-flex", gap: 12 }}>{right}</span>
  </div>
);

// Standard data
const PLANS = [
  { id: 1, name: "Free",    charge: "Free",      agency: "Free",      subacct: "Free"      },
  { id: 2, name: "Starter", charge: "Recurring", agency: "$29 / mo",  subacct: "$49 / mo"  },
  { id: 3, name: "Pro",     charge: "Recurring", agency: "$99 / mo",  subacct: "$149 / mo" },
];
const METERS = [
  { id: 1, name: "Workflow runs",  module: "workflow",      kind: "Custom Meter (API)", unit: "per message", price: "$0.02" },
  { id: 2, name: "AI agent calls", module: "conversations", kind: "Custom Meter (API)", unit: "per minute",  price: "$0.05" },
];

// Reusable tables
const PlansTbl = () => (
  <table className="tbl">
    <thead><tr>
      <th>Plan name</th><th>Charge type</th><th>Agency amount</th><th>Sub account amount</th><th className="actions"></th>
    </tr></thead>
    <tbody>
      {PLANS.map(p => (
        <tr key={p.id}>
          <td>{p.name}</td>
          <td>{p.charge}</td>
          <td>{p.agency}</td>
          <td>{p.subacct}</td>
          <td className="actions"><Actions/></td>
        </tr>
      ))}
    </tbody>
  </table>
);
const MetersTbl = () => (
  <table className="tbl">
    <thead><tr>
      <th>Meter name</th><th>Module</th><th>Unit</th><th>Price per unit</th><th className="actions"></th>
    </tr></thead>
    <tbody>
      {METERS.map(m => (
        <tr key={m.id}>
          <td>{m.name}</td>
          <td>
            <div className="mod-cell">
              <div className="name">{m.module}</div>
              <span className="chip">{m.kind}</span>
            </div>
          </td>
          <td>{m.unit}</td>
          <td>{m.price}</td>
          <td className="actions"><Actions/></td>
        </tr>
      ))}
    </tbody>
  </table>
);
const TrialInset = () => (
  <div style={{ padding: "16px 24px 20px" }}>
    <div className="trial-bar">
      <div className="row">
        <div>
          <h4>Provide a free trial for your app</h4>
          <p>Installers get full access to paid plans for a limited time before billing starts.</p>
        </div>
        <span className="toggle"><input type="checkbox" defaultChecked/><span className="track"/></span>
      </div>
      <div className="divider"/>
      <div className="days">
        <span style={{ color: "var(--hr-gray-800)" }}>Days of free trial</span>
        <input defaultValue={14}/>
        <span style={{ color: "var(--hr-gray-500)" }}>days</span>
      </div>
    </div>
  </div>
);
const AddBtn = ({ label = "Add Plan" }) => (
  <button className="btn-add"><IcPlus/> {label}</button>
);

// ════════════════════════════════════════════════════════════════════
// V1 — Current baseline (stacked section cards)
// ════════════════════════════════════════════════════════════════════
const V1Main = () => (
  <>
    <PageTitle/>
    <ModelRadio/>
    <div className="section-card">
      <div className="head">
        <div className="meta">
          <h3>Plans</h3>
          <p>We support a combination of free and paid plans to help you strategize better.</p>
        </div>
        <AddBtn/>
      </div>
      <PlansTbl/>
      <TrialInset/>
    </div>
    <div className="section-card">
      <div className="head">
        <div className="meta">
          <h3>Billing meter</h3>
          <p>Set up one billing meter for every module you'd like to monetise in your app.</p>
        </div>
        <AddBtn label="Add meter"/>
      </div>
      <MetersTbl/>
    </div>
    <PageFooter/>
  </>
);

// ════════════════════════════════════════════════════════════════════
// V2 — Tabbed (Plans · Billing meter · Free trial)
// ════════════════════════════════════════════════════════════════════
const V2Main = () => (
  <>
    <PageTitle/>
    <ModelRadio/>
    <div className="v-tabs">
      <button className="tab active">Plans<span className="count">3</span></button>
      <button className="tab">Billing meter<span className="count">2</span></button>
      <button className="tab">Free trial</button>
      <span className="v-tabs-action"><AddBtn/></span>
    </div>
    <div className="v2-block-head">
      <div className="meta">
        <h3>Plans</h3>
        <p>We support a combination of free and paid plans to help you strategize better.</p>
      </div>
    </div>
    <div className="v2-tbl-wrap"><PlansTbl/></div>
    <PageFooter/>
  </>
);

// ════════════════════════════════════════════════════════════════════
// V3 — Two-column (Plans + Billing meter side-by-side)
// ════════════════════════════════════════════════════════════════════
const V3Main = () => (
  <>
    <PageTitle/>
    <ModelRadio/>
    <div className="v3-grid">
      <div className="section-card">
        <div className="head">
          <div className="meta">
            <h3>Plans</h3>
            <p>Free and paid plans your installers will see.</p>
          </div>
          <AddBtn/>
        </div>
        {/* Compact table — drop one column to fit */}
        <table className="tbl">
          <thead><tr>
            <th>Plan</th><th>Charge</th><th>Agency</th><th className="actions"></th>
          </tr></thead>
          <tbody>
            {PLANS.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.charge}</td>
                <td>{p.agency}</td>
                <td className="actions"><Actions/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="section-card">
        <div className="head">
          <div className="meta">
            <h3>Billing meter</h3>
            <p>One meter per monetised module.</p>
          </div>
          <AddBtn label="Add meter"/>
        </div>
        <table className="tbl">
          <thead><tr>
            <th>Meter</th><th>Unit</th><th>Price</th><th className="actions"></th>
          </tr></thead>
          <tbody>
            {METERS.map(m => (
              <tr key={m.id}>
                <td>
                  <div className="mod-cell">
                    <div className="name">{m.name}</div>
                    <span className="chip">{m.module}</span>
                  </div>
                </td>
                <td>{m.unit}</td>
                <td>{m.price}</td>
                <td className="actions"><Actions/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <div className="v3-trial-strip">
      <div>
        <h4>Provide a free trial for your app</h4>
        <p>Installers get full access to paid plans before billing starts.</p>
      </div>
      <div className="days">
        <span style={{ color: "var(--hr-gray-800)" }}>Days of free trial</span>
        <input defaultValue={14}/>
        <span style={{ color: "var(--hr-gray-500)" }}>days</span>
        <span className="toggle" style={{ marginLeft: 12 }}><input type="checkbox" defaultChecked/><span className="track"/></span>
      </div>
    </div>
    <PageFooter/>
  </>
);

// ════════════════════════════════════════════════════════════════════
// V4 — Guided stepper
// ════════════════════════════════════════════════════════════════════
const StepperStep = ({ n, label, done, active }) => (
  <div className={`v4-step${done ? " done" : ""}${active ? " active" : ""}`}>
    <span className="num">{done ? <IcCheck/> : n}</span>
    <span>{label}</span>
  </div>
);
const V4Main = () => (
  <>
    <PageTitle/>
    <div className="v4-stepper">
      <StepperStep n={1} label="Business model" done/>
      <span className="v4-step-divider done"/>
      <StepperStep n={2} label="Plans" active/>
      <span className="v4-step-divider"/>
      <StepperStep n={3} label="Billing meter"/>
      <span className="v4-step-divider"/>
      <StepperStep n={4} label="Free trial"/>
    </div>
    <div className="v4-step-current-label">
      <span className="pill">Step 2 of 4</span>
      <h2>Set up your plans</h2>
      <p>Free plans don't bill — at least one is required.</p>
    </div>
    <div className="section-card">
      <div className="head">
        <div className="meta">
          <h3>Plans</h3>
          <p>We support a combination of free and paid plans to help you strategize better.</p>
        </div>
        <AddBtn/>
      </div>
      <PlansTbl/>
    </div>
    <PageFooter
      left={<button className="btn btn-secondary">← Back</button>}
      right={<>
        <button className="btn btn-secondary">Save draft</button>
        <button className="btn btn-primary">Continue →</button>
      </>}
    />
  </>
);

// ════════════════════════════════════════════════════════════════════
// V5 — Plan tiles (visual cards instead of table)
// ════════════════════════════════════════════════════════════════════
const PlanTile = ({ name, price, cy, charge, agency, sub, featured }) => (
  <div className={`v5-tile${featured ? " featured" : ""}`}>
    {featured && <span className="pin">Most installed</span>}
    <div className="top">
      <div>
        <h4>{name}</h4>
        <span className="badge"><span style={{ width: 6, height: 6, borderRadius: 999, background: featured ? "var(--hr-primary-500)" : "var(--hr-gray-400)" }}/>{charge}</span>
      </div>
      <div className="actions">
        <button><IcEdit/></button>
        <button className="del"><IcTrash/></button>
      </div>
    </div>
    <div className="price">
      <span className="amt">{price}</span>
      <span className="cy">{cy}</span>
    </div>
    <dl>
      <dt>Agency</dt><dd>{agency}</dd>
      <dt>Sub-account</dt><dd>{sub}</dd>
    </dl>
  </div>
);
const IcMeter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="14" r="8"/><path d="M12 14l4-4"/><path d="M9 2h6"/></svg>
);
const V5Main = () => (
  <>
    <PageTitle/>
    <ModelRadio/>
    <div className="section-card">
      <div className="head">
        <div className="meta">
          <h3>Plans</h3>
          <p>We support a combination of free and paid plans to help you strategize better.</p>
        </div>
      </div>
      <div className="v5-tile-grid">
        <PlanTile name="Free"    price="$0"  cy="forever"   charge="Free"      agency="Free"  sub="Free"/>
        <PlanTile name="Starter" price="$29" cy="per month" charge="Recurring" agency="$29"   sub="$49"   featured/>
        <PlanTile name="Pro"     price="$99" cy="per month" charge="Recurring" agency="$99"   sub="$149"/>
      </div>
      <div style={{ padding: "0 24px 20px 24px" }}>
        <button className="v5-add-tile" style={{ width: "100%", height: 56, minHeight: 0, flexDirection: "row" }}>
          <IcPlus/> Add another plan
        </button>
      </div>
      <TrialInset/>
    </div>
    <div className="section-card">
      <div className="head">
        <div className="meta">
          <h3>Billing meter</h3>
          <p>Set up one billing meter for every module you'd like to monetise in your app.</p>
        </div>
        <AddBtn label="Add meter"/>
      </div>
      <div className="v5-meter-list">
        {METERS.map(m => (
          <div key={m.id} className="v5-meter-row">
            <span className="ic"><IcMeter/></span>
            <div>
              <div className="name">{m.name}</div>
              <div className="desc">{m.module} · {m.kind}</div>
            </div>
            <div className="price-cell">
              <span className="price">{m.price}</span>
              <span className="unit">{m.unit}</span>
            </div>
            <div className="actions">
              <button className="edit" style={{ width: 28, height: 28, border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "var(--hr-gray-500)" }}><IcEdit/></button>
              <button className="del"  style={{ width: 28, height: 28, border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "var(--hr-error-500)" }}><IcTrash/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
    <PageFooter/>
  </>
);

// ─── Canvas ──────────────────────────────────────────────────────────
const App = () => (
  <DesignCanvas>
    <DCSection
      id="pricing-screens"
      title="Pricing screen · 5 layout variations"
      subtitle="Same data, same nav and right rail — only the center card changes. Click an artboard to focus."
    >
      <DCArtboard id="v1" label="01 · Stacked cards (baseline)"  width={1440} height={1100}><Screen main={<V1Main/>}/></DCArtboard>
      <DCArtboard id="v2" label="02 · Tabbed sections"           width={1440} height={820}><Screen main={<V2Main/>}/></DCArtboard>
      <DCArtboard id="v3" label="03 · Two-column"                width={1440} height={820}><Screen main={<V3Main/>}/></DCArtboard>
      <DCArtboard id="v4" label="04 · Guided stepper"            width={1440} height={820}><Screen main={<V4Main/>}/></DCArtboard>
      <DCArtboard id="v5" label="05 · Plan tiles + meter list"   width={1440} height={1180}><Screen main={<V5Main/>}/></DCArtboard>
    </DCSection>
  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
