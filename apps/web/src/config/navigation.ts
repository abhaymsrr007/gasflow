// import { LayoutDashboard, Users, Truck, FileText, Settings, Shield } from 'lucide-react';

// export interface NavItem {
//     name: string;
//     href: string;
//     icon: any;
//     permission: string;
// }

// export interface NavGroup {
//     title: string;
//     items: NavItem[];
// }

// export const navigationConfig: NavGroup[] = [
//     {
//         title: 'Operations',
//         items: [
//             { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'dashboard:view' },
//             { name: 'Customers', href: '/customers', icon: Users, permission: 'customer:view' },
//             { name: 'Trips & Deliveries', href: '/trips', icon: Truck, permission: 'delivery:view' },
//         ],
//     },
//     {
//         title: 'Finance',
//         items: [
//             { name: 'Invoices', href: '/invoices', icon: FileText, permission: 'invoice:view' },
//         ],
//     },
//     {
//         title: 'Administration',
//         items: [
//             { name: 'Staff & Roles', href: '/settings/roles', icon: Shield, permission: 'staff:manage' },
//             { name: 'Settings', href: '/settings', icon: Settings, permission: 'settings:manage' },
//         ],
//     },
// ];




import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permission: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navigationConfig: NavGroup[] = [
  {
    title: "Operations",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard:view",
      },
      {
        name: "Customers",
        href: "/customers",
        icon: Users,
        permission: "customer:view",
      },
      {
        name: "Trips & Deliveries",
        href: "/trips",
        icon: Truck,
        permission: "delivery:view",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        name: "Invoices",
        href: "/invoices",
        icon: FileText,
        permission: "invoice:view",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        name: "Staff & Roles",
        href: "/settings/roles",
        icon: Shield,
        permission: "staff:manage",
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        permission: "settings:manage",
      },
    ],
  },
];
