
const features = [
  {
    icon: "📦",
    title: "Smart Inventory",
    description: "Track filled and empty cylinders with accurate stock management.",
    color: "green",
  },
  {
    icon: "🚚",
    title: "Delivery Management",
    description: "Manage daily trips, delivery teams and cylinder movements.",
    color: "blue",
  },
  {
    icon: "👥",
    title: "Customer Management",
    description: "Manage customer profiles, cylinder custody and outstanding balances.",
    color: "purple",
  },
  {
    icon: "💳",
    title: "Billing & Payments",
    description: "Simplify GST invoices, collections and digital payments.",
    color: "orange",
  },
];

export default function Home() {
  return (
    <main className="welcome-page">
      <nav className="navbar">
        <a href="/" className="brand">
          <span className="brand-icon">🔥</span>
          GAS<span>Flow</span>
        </a>
        <span className="nav-status">
          <span className="status-dot" />
          Platform Initializing
        </span>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <span>✦</span> BUILT FOR COMMERCIAL LPG AGENCIES
          </div>

          <h1>
            Your Agency.
            <br />
            Your Operations.
            <br />
            <span>One Platform.</span>
          </h1>

          <p className="hero-description">
            Simplify your daily LPG agency operations with smarter
            inventory, seamless deliveries, customer management
            and transparent accounting.
          </p>

          <div className="hero-actions">
            <a href="#features" className="primary-btn">
              Explore Platform <span>→</span>
            </a>
            <span className="coming-soon">🚀 Building something powerful</span>
          </div>

          <div className="hero-trust">
            <span>✓</span> Designed for real commercial LPG workflows
          </div>
        </div>

        <div className="hero-visual">
          <div className="glow glow-one" />
          <div className="glow glow-two" />

          <div className="dashboard-card">
            <div className="dashboard-top">
              <div>
                <span className="mini-label">GASFLOW OVERVIEW</span>
                <h3>Agency Dashboard</h3>
              </div>
              <span className="live-badge">● LIVE CONCEPT</span>
            </div>

            <div className="dashboard-highlight">
              <span>Welcome to smarter operations</span>
              <div className="cylinder-visual">♨️</div>
              <strong>Everything connected.</strong>
              <small>One platform for your entire agency.</small>
            </div>

            <div className="dashboard-stats">
              <div className="stat-box">
                <span>📦</span>
                <strong>Inventory</strong>
                <small>Stock tracking</small>
              </div>
              <div className="stat-box">
                <span>🚚</span>
                <strong>Deliveries</strong>
                <small>Trip management</small>
              </div>
              <div className="stat-box">
                <span>💰</span>
                <strong>Accounts</strong>
                <small>Financial tracking</small>
              </div>
              <div className="stat-box">
                <span>👥</span>
                <strong>Customers</strong>
                <small>Customer records</small>
              </div>
            </div>

            <div className="dashboard-footer">
              <span className="status-dot" />
              GASFlow · Your business, organized.
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <span>THE GASFlow ECOSYSTEM</span>
          <h2>Everything your agency needs.</h2>
          <p>Four essential pillars. One connected experience.</p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <article
              className={`feature-card ${feature.color}`}
              key={feature.title}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="feature-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        <a href="/" className="brand">
          <span className="brand-icon">🔥</span>
          GAS<span>Flow</span>
        </a>
        <p>Powering smarter commercial LPG operations.</p>
        <span>© 2026 GASFlow. All rights reserved.</span>
      </footer>
    </main>
  );
}