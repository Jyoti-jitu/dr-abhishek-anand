"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/lib/db/types";
import { 
  Building2, 
  Stethoscope, 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  Pill, 
  CreditCard, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";

interface Props {
  user: Omit<User, "passwordHash" | "salt">;
  children: React.ReactNode;
}

export default function PortalClientLayout({ user, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/clinic-login");
      router.refresh();
    } catch {
      router.push("/clinic-login");
    }
  };

  const handleQuickSwitch = async (roleUsername: string, pass: string) => {
    setIsSwitching(true);
    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: roleUsername, password: pass })
      });
      router.refresh();
      window.location.reload();
    } catch {
      setIsSwitching(false);
    }
  };

  const isDoctorAdmin = user.role === "DOCTOR" || user.role === "ADMIN";
  const isReceptionBilling = user.role === "RECEPTIONIST" || user.role === "BILLING";

  const navLinks = [
    {
      label: "Doctor Dashboard",
      href: "/portal/doctor",
      icon: <Activity className="w-4 h-4" />,
      roles: ["DOCTOR", "ADMIN"]
    },
    {
      label: "Patient Management",
      href: "/portal/patients",
      icon: <Users className="w-4 h-4" />,
      roles: ["DOCTOR", "ADMIN", "RECEPTIONIST", "BILLING"]
    },
    {
      label: "Digital EMR & Notes",
      href: "/portal/consultations",
      icon: <FileText className="w-4 h-4" />,
      roles: ["DOCTOR", "ADMIN"]
    },
    {
      label: "Prescriptions (Rx)",
      href: "/portal/prescriptions",
      icon: <Pill className="w-4 h-4" />,
      roles: ["DOCTOR", "ADMIN"]
    },
    {
      label: "Appointments & Queue",
      href: "/portal/appointments",
      icon: <Calendar className="w-4 h-4" />,
      roles: ["DOCTOR", "ADMIN", "RECEPTIONIST", "BILLING"]
    },
    {
      label: "Billing & Reports",
      href: "/portal/billing",
      icon: <CreditCard className="w-4 h-4" />,
      roles: ["DOCTOR", "ADMIN", "RECEPTIONIST", "BILLING"]
    },
    {
      label: "Clinic Admin & Audit",
      href: "/portal/admin",
      icon: <ShieldCheck className="w-4 h-4" />,
      roles: ["DOCTOR", "ADMIN", "RECEPTIONIST", "BILLING"]
    }
  ];

  // Filter links authorized for current role (Two-Role Model)
  const authorizedLinks = navLinks.filter(link => {
    if (isDoctorAdmin) return true; // Doctor & Admin has access to all modules
    return link.roles.some(r => r === "RECEPTIONIST" || r === "BILLING");
  });

  const getRoleDisplayName = (role: string) => {
    if (role === "DOCTOR" || role === "ADMIN") {
      return "Doctor & Admin";
    }
    return "Reception & Billing";
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === "DOCTOR" || role === "ADMIN") {
      return "bg-teal-light text-teal-dark border-teal/30";
    }
    return "bg-blue-50 text-blue-800 border-blue-200";
  };

  return (
    <div className="min-h-screen bg-light-bg flex flex-col lg:flex-row text-charcoal">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-navy text-white px-4 py-3 flex items-center justify-between border-b border-navy-light sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal" />
          <span className="font-bold text-sm tracking-tight">New Life Clinic CMS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user.role)}`}>
            {getRoleDisplayName(user.role)}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-navy text-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-navy-light/60
        lg:static lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Sidebar Top: Clinic Brand & Clinician Identity */}
        <div className="p-5 border-b border-navy-light/60 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical to-teal flex items-center justify-center text-white shrink-0 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-white leading-tight">
                New Life Clinic
              </h2>
              <p className="text-[11px] text-teal-light font-medium">
                Soubhagya Nagar, Bhubaneswar
              </p>
            </div>
          </div>

          {/* Active Clinician Banner */}
          <div className="p-2.5 rounded-lg bg-navy-dark/80 border border-teal/20 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Practicing Specialist:</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-white">
              Dr. Abhishek Anand
            </p>
            <p className="text-[10px] text-slate-300">
              Paediatric & Neonatal Surgeon
            </p>
          </div>
        </div>

        {/* Sidebar Middle: Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Clinical Modules
          </div>

          <nav className="space-y-1" aria-label="Portal Navigation">
            {authorizedLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-medical text-white font-semibold shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {link.icon}
                    <span>{link.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </Link>
              );
            })}
          </nav>

          {/* Quick Role Switcher for 2-Role System */}
          <div className="pt-6 px-3 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Role (2 Roles):
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                disabled={isSwitching || isDoctorAdmin}
                onClick={() => handleQuickSwitch("dr.anand", "Doctor@2026")}
                className={`p-2.5 rounded-lg text-left transition-all cursor-pointer flex items-center justify-between border ${
                  isDoctorAdmin
                    ? "bg-teal text-white font-semibold border-teal/40 shadow-xs"
                    : "bg-navy-dark hover:bg-white/10 text-slate-300 border-transparent"
                }`}
              >
                <div>
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-light" />
                    Doctor & Admin
                  </div>
                  <div className="text-[10px] text-slate-300 opacity-80 mt-0.5">Dr. Abhishek Anand</div>
                </div>
                {isDoctorAdmin && (
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Active
                  </span>
                )}
              </button>

              <button
                disabled={isSwitching || isReceptionBilling}
                onClick={() => handleQuickSwitch("reception", "Reception@2026")}
                className={`p-2.5 rounded-lg text-left transition-all cursor-pointer flex items-center justify-between border ${
                  isReceptionBilling
                    ? "bg-medical text-white font-semibold border-teal/40 shadow-xs"
                    : "bg-navy-dark hover:bg-white/10 text-slate-300 border-transparent"
                }`}
              >
                <div>
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-light" />
                    Reception & Billing
                  </div>
                  <div className="text-[10px] text-slate-300 opacity-80 mt-0.5">Front Desk & Accounts</div>
                </div>
                {isReceptionBilling && (
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Active
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Bottom: User Profile & Actions */}
        <div className="p-4 border-t border-navy-light/60 space-y-3 bg-navy-dark/40">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {user.fullName}
              </p>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border mt-0.5 ${getRoleBadgeColor(user.role)}`}>
                {getRoleDisplayName(user.role)}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-navy-light/40 flex items-center justify-between text-[11px] text-slate-400">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <span>Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="text-slate-500">•</span>
            <span className="text-teal-light font-medium">OPD 5–9 PM</span>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Operational Status Bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-3 bg-white border-b border-border-subtle text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-charcoal">
              <Clock className="w-4 h-4 text-teal" />
              <span className="font-semibold">Evening OPD Session:</span>
              <span className="text-charcoal-muted">5:00 PM – 9:00 PM (Active)</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-charcoal">
              <Building2 className="w-4 h-4 text-medical" />
              <span>Location: Soubhagya Nagar, Bhubaneswar</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-charcoal-muted">Logged in as:</span>
              <span className="font-bold text-navy">{user.fullName}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user.role)}`}>
                {getRoleDisplayName(user.role)}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-charcoal-muted hover:text-red-600 transition-colors inline-flex items-center gap-1 ml-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Child Pages Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
