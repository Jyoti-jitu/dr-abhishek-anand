"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Stethoscope, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function ClinicLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Login failed. Please verify credentials.");
        setIsLoading(false);
        return;
      }

      // Redirect based on role (Two consolidated roles: Doctor & Admin vs Reception & Billing)
      if (data.user.role === "DOCTOR" || data.user.role === "ADMIN") {
        router.push("/portal/doctor");
      } else {
        router.push("/portal/appointments");
      }
      router.refresh();
    } catch {
      setErrorMessage("Network error connecting to clinic auth server.");
      setIsLoading(false);
    }
  };

  const setDemoRole = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-navy-dark via-navy to-navy-dark text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-teal-light text-xs font-medium transition-colors"
        >
          <span>← Return to Public Website</span>
        </Link>
        
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-medical to-teal flex items-center justify-center shadow-lg border border-white/20">
            <Building2 className="w-7 h-7 text-white" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          New Life Clinic
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Clinical Management System • Dr. Abhishek Anand Practice
        </p>
        <p className="text-[11px] text-teal-light/80">
          Soubhagya Nagar, Bhubaneswar, Odisha — 751003
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-warm-white text-charcoal py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-border-subtle space-y-6">
          <div>
            <h2 className="text-lg font-bold text-navy">
              Staff Portal Authentication
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Role-based access for authorised clinical and administrative personnel.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-charcoal mb-1">
                Username or Staff Email
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. dr.anand or reception"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-border-subtle bg-white text-sm text-charcoal focus:border-medical focus:ring-1 focus:ring-medical transition-all placeholder:text-slate-400"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-charcoal mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter staff password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border-subtle bg-white text-sm text-charcoal focus:border-medical focus:ring-1 focus:ring-medical transition-all placeholder:text-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-navy hover:bg-navy-light text-white text-sm font-semibold shadow-md transition-all disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoading ? "Authenticating..." : "Sign In to Clinic CMS"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Review Helper / Role Switcher for 2-Role System */}
          <div className="pt-4 border-t border-border-subtle space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted">
                Role-Based Demo Access (2 Roles):
              </span>
              <span className="text-[10px] text-teal-dark bg-teal-light px-2 py-0.5 rounded font-medium">
                Tap to Autofill
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setDemoRole("dr.anand", "Doctor@2026")}
                className="p-3 text-left rounded-xl border border-border-subtle bg-light-bg hover:bg-teal-light/50 hover:border-teal/50 transition-all flex flex-col group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy flex items-center gap-1.5 text-xs">
                    <Stethoscope className="w-4 h-4 text-medical" />
                    Doctor & Admin
                  </span>
                  <span className="text-[9px] bg-teal-light text-teal-dark font-bold px-1.5 py-0.5 rounded">All Access</span>
                </div>
                <span className="text-[11px] text-charcoal font-medium mt-1">Dr. Abhishek Anand</span>
                <span className="text-[10px] text-charcoal-muted mt-0.5">Clinical EMR, Rx, Admin Settings & Audit Trail</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole("reception", "Reception@2026")}
                className="p-3 text-left rounded-xl border border-border-subtle bg-light-bg hover:bg-teal-light/50 hover:border-teal/50 transition-all flex flex-col group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy flex items-center gap-1.5 text-xs">
                    <User className="w-4 h-4 text-teal" />
                    Reception & Billing
                  </span>
                  <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">Front Desk</span>
                </div>
                <span className="text-[11px] text-charcoal font-medium mt-1">Priyanka Nayak</span>
                <span className="text-[10px] text-charcoal-muted mt-0.5">Patient Reg, Appointments, Queue & Invoicing</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 space-y-1">
          <p>Protected Healthcare Information System • New Life Clinic</p>
          <p>© 2026 JOVIX Technologies • Built for Dr. Abhishek Anand</p>
        </div>
      </div>
    </div>
  );
}
