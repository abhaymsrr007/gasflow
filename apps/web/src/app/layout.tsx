// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { Providers } from "./providers";
// import Link from "next/link";
// import { LayoutDashboard, Users, Truck, FileText, Settings, LogOut } from "lucide-react";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "GASFlow | LPG Distribution SaaS",
// };

// const navItems = [
//   { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//   { name: "Customers", href: "/customers", icon: Users },
//   { name: "Trips & Deliveries", href: "/trips", icon: Truck },
//   { name: "Invoices", href: "/invoices", icon: FileText },
//   { name: "Settings", href: "/settings", icon: Settings },
// ];

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} flex h-screen bg-slate-50 text-slate-900 overflow-hidden`}>
//         {/* 👇 Providers ke andar sab kuch wrap karo */}
//         <Providers>
//           <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col justify-between shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-20">
//             <div>
//               <div className="h-16 flex items-center px-6 border-b border-slate-100">
//                 <div className="flex items-center gap-2 text-blue-700 font-extrabold text-xl tracking-tight">
//                   <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">G</div>
//                   GASFlow
//                 </div>
//               </div>
//               <nav className="p-4 space-y-1 mt-4">
//                 {navItems.map((item) => (
//                   <Link
//                     key={item.name}
//                     href={item.href}
//                     className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
//                   >
//                     <item.icon className="w-5 h-5 text-slate-400" />
//                     {item.name}
//                   </Link>
//                 ))}
//               </nav>
//             </div>
//             <div className="p-4 border-t border-slate-100">
//               <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
//                 <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
//                   OS
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-slate-900 truncate">Owner Sharma</p>
//                   <p className="text-xs text-slate-500 truncate">owner@sharmagas.com</p>
//                 </div>
//               </div>
//               <button className="flex items-center gap-3 px-3 py-2.5 w-full mt-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200">
//                 <LogOut className="w-5 h-5" />
//                 Sign Out
//               </button>
//             </div>
//           </aside>

//           <div className="flex-1 flex flex-col min-w-0">
//             <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
//               <div className="flex items-center gap-4">
//                 <h2 className="text-sm font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-md">Agency: Sharma Gas</h2>
//               </div>
//               <div className="flex items-center gap-4">
//                 <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
//                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
//                   Trial Active
//                 </span>
//               </div>
//             </header>

//             <main className="flex-1 overflow-auto p-8">
//               <div className="max-w-6xl mx-auto">
//                 {children}
//               </div>
//             </main>
//           </div>
//         </Providers>
//       </body>
//     </html>
//   );
// }






import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GASFlow | LPG Distribution SaaS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}