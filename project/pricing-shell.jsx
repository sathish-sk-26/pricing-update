/* global React, IcPlus, IcChevDown, IcChevUp, IcLock, IcHelp, IcBell, IcUser, IcUserCirc, IcSettings, IcGrid, IcUser01, IcLayers, IcChevRight */
// pricing-shell.jsx — Topbar, Sidebar, Right rail

const { useState } = React;

const Topbar = () => (
  <header className="topbar">
    <a className="brand"><IcLock/>Marketplace</a>
    <nav className="nav">
      <a>App dashboard</a>
      <a>Testing</a>
      <a>My apps</a>
      <a>Product updates <span className="dot" aria-hidden="true"/></a>
      <div className="group">
        <button className="icon-btn" aria-label="Help"><IcHelp/></button>
        <button className="icon-btn" aria-label="Notifications"><IcBell/></button>
        <button className="user" aria-label="Account">
          <span className="avatar"><IcUser/></span>
          <IcChevDown className="chev"/>
        </button>
      </div>
    </nav>
  </header>
);

const SectionAccordion = ({ title, icon, defaultOpen = false, muted = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`section${open ? " open" : ""}`}>
      <div className={`section-head${muted ? " muted" : ""}`} onClick={() => setOpen(o => !o)}>
        <span className="left">{icon}{title}</span>
        <IcChevDown className="chev"/>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
};

const NavItem = ({ icon, label, active, warn }) => (
  <div className={`nav-item${active ? " active" : ""}`}>
    {icon}
    <span>{label}</span>
    {warn ? <span className="warn-dot" aria-label="Needs attention">!</span> : <IcChevDown className="chev"/>}
  </div>
);

const Sidebar = ({ pricingHasWarning, published }) => (
  <aside className="side">
    <SectionAccordion title="Build" icon={<IcSettings/>} defaultOpen>
      <div className="app-select">
        <span className="left">vdraft</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {published ? (
            <span className="draft live">
              <span className="dot"/>Live
            </span>
          ) : (
            <span className="draft">
              <span className="dot"/>Draft
            </span>
          )}
          <IcChevDown className="chev" style={{ width: 14, height: 14, color: "var(--hr-gray-500)" }}/>
        </span>
      </div>
      <NavItem icon={<IcUser01/>}  label="Profile"/>
      <NavItem icon={<IcGrid/>}    label="Pricing" active warn={pricingHasWarning}/>
      <NavItem icon={<IcLayers/>}  label="Modules"/>
      <NavItem icon={<IcSettings/>} label="Advanced Settings"/>
    </SectionAccordion>
    <SectionAccordion title="Manage" icon={<IcSettings/>} muted/>
    <SectionAccordion title="Insights" icon={<IcGrid/>} muted/>
  </aside>
);

const RightRail = ({ steps }) => {
  const doneCount = steps.filter(s => s.done).length;
  return (
    <aside className="rail">
      <h4>Mandatory steps ({doneCount}/{steps.length})</h4>
      <ul>
        {steps.map((s, i) => (
          <li key={i} className={s.done ? "done" : ""}>
            {s.done
              ? <span className="check"><IcCheckSmall/></span>
              : <span className="bullet"/>}
            <span>{s.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

const IcCheckSmall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

Object.assign(window, { Topbar, Sidebar, RightRail });
