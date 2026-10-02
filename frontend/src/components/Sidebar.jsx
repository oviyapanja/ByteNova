function Sidebar({
  activePage,
  setActivePage,
  onLogout
}) {

  const menuItems = [
    {
      id: "dashboard",
      icon: "🏠",
      label: "Dashboard"
    },
    {
      id: "upload",
      icon: "📤",
      label: "Upload Data"
    },
    {
      id: "analytics",
      icon: "📊",
      label: "Analytics"
    },
    {
      id: "industries",
      icon: "🏭",
      label: "Industries"
    },
    {
      id: "inspections",
      icon: "🔎",
      label: "Inspections"
    },
    {
      id: "satellite",
      icon: "🛰️",
      label: "Satellite"
    },
    {
      id: "reports",
      icon: "📄",
      label: "Reports"
    }
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-brand">

        <div className="sidebar-logo">
          🌱
        </div>

        <div>
          <h2>ByteNova</h2>
          <span>AI Compliance</span>
        </div>

      </div>

      <nav className="sidebar-nav">

        <p className="sidebar-section-title">
          MAIN MENU
        </p>

        {menuItems.map((item) => (

          <button
            key={item.id}
            className={
              activePage === item.id
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              setActivePage(item.id)
            }
          >

            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>

          </button>

        ))}

      </nav>

      <div className="sidebar-status">

        <div className="status-dot"></div>

        <div>
          <strong>System Online</strong>
          <span>AI Engine Active</span>
        </div>

      </div>

      <button
        className="sidebar-logout"
        onClick={onLogout}
      >
        🚪
        <span>Logout</span>
      </button>

    </aside>
  );
}

export default Sidebar;