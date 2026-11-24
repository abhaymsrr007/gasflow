import Link from "next/link";

const features = [
  {
    icon: "📦",
    title: "Smart Inventory",
    description: "Track filled and empty cylinders with accurate stock management.",
    hoverBorder: "hover:border-green-500/50",
    arrowColor: "text-green-400",
  },
  {
    icon: "🚚",
    title: "Delivery Management",
    description: "Manage daily trips, delivery teams and cylinder movements.",
    hoverBorder: "hover:border-blue-500/50",
    arrowColor: "text-blue-400",
  },
  {
    icon: "👥",
    title: "Customer Management",
    description: "Manage customer profiles, cylinder custody and outstanding balances.",
    hoverBorder: "hover:border-purple-500/50",
    arrowColor: "text-purple-400",
  },
  {
    icon: "💳",
    title: "Billing & Payments",
    description: "Simplify GST invoices, collections and digital payments.",
    hoverBorder: "hover:border-orange-500/50",
    arrowColor: "text-orange-400",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080e19] text-[#f4f7fc] font-sans relative">
      {/* Background Glows (Custom CSS Class) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 h-[82px] px-[8%] flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-[Space_Grotesk]">
          <span className="text-2xl">🔥</span>
          <span>GAS<span className="text-[#a3f36b]">Flow</span></span>
        </Link>
        <div className="flex items-center gap-2 text-[12px] text-[#929fb3]">
          <span className="w-2 h-2 bg-[#a3f36b] rounded-full shadow-[0_0_12px_#a3f36b80] inline-block" />
          Platform Initializing
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-[8%] pt-[95px] pb-[100px] grid lg:grid-cols-2 items-center gap-16 max-w-[1600px] mx-auto">
        {/* Hero Content */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#a3f36b]/20 bg-[#a3f36b]/5 text-[#a3f36b] text-[10px] font-bold tracking-widest">
            <span>✦</span> BUILT FOR COMMERCIAL LPG AGENCIES
          </div>

          <h1 className="mt-7 text-[clamp(43px,5.4vw,72px)] leading-[1.12] font-bold tracking-tighter font-[Space_Grotesk]">
            Your Agency.<br />
            Your Operations.<br />
            <span className="bg-gradient-to-r from-[#a3f36b] via-[#43d8c0] to-[#69a9ff] bg-clip-text text-transparent">
              One Platform.
            </span>
          </h1>

          <p className="mt-6 max-w-[510px] text-[#929fb3] text-[15px] leading-relaxed">
            Simplify your daily LPG agency operations with smarter inventory, seamless deliveries, customer management and transparent accounting.
          </p>

          <div className="mt-9 flex items-center flex-wrap gap-5">
            <a href="#features" className="bg-[#a3f36b] text-[#102012] px-6 py-3.5 rounded-lg font-extrabold text-[13px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_35px_#a3f36b35]">
              Explore Platform <span className="ml-2">→</span>
            </a>
            <span className="text-[11px] text-[#929fb3]">🚀 Building something powerful</span>
          </div>

          <div className="mt-10 text-[#a6b3c3] text-[12px]">
            <span className="text-[#a3f36b] mr-2">✓</span>
            Designed for real commercial LPG workflows
          </div>
        </div>

        {/* Hero Visual (Dashboard Mockup) */}
        <div className="relative flex items-center justify-center min-h-[420px]">
          <div className="absolute w-[250px] h-[250px] bg-teal-500/20 rounded-full blur-[90px] top-0 left-[15%]" />
          <div className="absolute w-[250px] h-[250px] bg-blue-500/20 rounded-full blur-[90px] bottom-0 right-[5%]" />

          <div className="relative w-full max-w-[490px] p-6 bg-gradient-to-br from-[#17263b] to-[#101a2a] border border-white/10 rounded-[20px] shadow-[0_35px_100px_#0008] -rotate-2 hover:rotate-0 hover:-translate-y-1 transition-transform duration-300 z-10">
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[#a3f36b] text-[9px] font-bold tracking-[1.5px]">GASFLOW OVERVIEW</span>
                <h3 className="text-[19px] font-semibold font-[Space_Grotesk] mt-1">Agency Dashboard</h3>
              </div>
              <span className="text-[#a3f36b] text-[9px] bg-[#a3f36b]/10 px-2 py-1.5 rounded">● LIVE CONCEPT</span>
            </div>

            <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-[#1d483b] via-[#173b42] to-[#1d3151] border border-white/5 relative overflow-hidden">
              <span className="text-[11px] text-[#b6c9c8] block">Welcome to smarter operations</span>
              <div className="absolute right-6 top-5 text-[47px]">♨️</div>
              <strong className="block text-[20px] font-semibold font-[Space_Grotesk] mt-3">Everything connected.</strong>
              <small className="block text-[11px] text-[#b6c9c8] mt-1">One platform for your entire agency.</small>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { icon: "📦", title: "Inventory", desc: "Stock tracking" },
                { icon: "🚚", title: "Deliveries", desc: "Trip management" },
                { icon: "💰", title: "Accounts", desc: "Financial tracking" },
                { icon: "👥", title: "Customers", desc: "Customer records" },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-lg">
                  <span className="text-[19px]">{item.icon}</span>
                  <strong className="block text-[12px] mt-2">{item.title}</strong>
                  <small className="block text-[10px] text-[#929fb3] mt-1">{item.desc}</small>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2.5 text-[10px] text-[#929fb3]">
              <span className="w-1.5 h-1.5 bg-[#a3f36b] rounded-full shadow-[0_0_8px_#a3f36b]" />
              GASFlow · Your business, organized.
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-[8%] py-20 bg-[#0c1421] border-t border-white/5">
        <div className="text-center">
          <span className="text-[#a3f36b] text-[10px] font-bold tracking-[2px]">THE GASFlow ECOSYSTEM</span>
          <h2 className="mt-3 text-[clamp(26px,4vw,38px)] font-bold font-[Space_Grotesk]">Everything your agency needs.</h2>
          <p className="mt-3 text-[13px] text-[#929fb3]">Four essential pillars. One connected experience.</p>
        </div>

        <div className="max-w-[1200px] mx-auto mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, idx) => (
            <article key={idx} className={`relative p-6 min-h-[205px] rounded-xl border border-white/10 bg-[#142034] hover:-translate-y-2 transition-transform duration-300 group ${feature.hoverBorder}`}>
              <div className="text-[28px]">{feature.icon}</div>
              <h3 className="mt-5 text-[15px] font-semibold font-[Space_Grotesk]">{feature.title}</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-[#929fb3]">{feature.description}</p>
              <span className={`absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity ${feature.arrowColor}`}>↗</span>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-[8%] py-6 border-t border-white/10 flex flex-wrap justify-between items-center gap-5 min-h-[100px]">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-[Space_Grotesk]">
          <span>🔥</span>
          <span>GAS<span className="text-[#a3f36b]">Flow</span></span>
        </Link>
        <p className="text-[11px] text-[#929fb3]">Powering smarter commercial LPG operations.</p>
        <span className="text-[11px] text-[#929fb3]">© 2026 GASFlow. All rights reserved.</span>
      </footer>
    </main>
  );
}