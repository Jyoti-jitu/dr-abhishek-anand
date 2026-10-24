"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ShieldCheck, ChevronRight, Lock } from "lucide-react";
import DoctorApprovalModal from "./DoctorApprovalModal";
import Phase2RoadmapModal from "./Phase2RoadmapModal";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isPhase2Open, setIsPhase2Open] = useState(false);

  // Close mobile menu whenever pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Surgical Services", href: "/services" },
    { label: "Parent Information", href: "/parent-information" },
    { label: "New Life Clinic", href: "/clinic" },
    { label: "Appointments", href: "/appointments" },
    { label: "Contact", href: "/contact" }
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Discreet Doctor & Concept Review Top Ribbon */}
      <aside aria-label="Review banner" className="bg-navy-dark text-slate-300 text-xs border-b border-navy-light/60 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-teal animate-pulse" />
            <span className="font-semibold text-white tracking-wide">
              JOVIX Review Concept
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline text-[11px]">
              Prepared for Dr. Abhishek Anand, Paediatric Surgeon
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            <button
              onClick={() => setIsChecklistOpen(true)}
              className="inline-flex items-center gap-1 text-teal-light hover:text-white font-medium transition-colors cursor-pointer"
              title="View verification status of credentials and clinic details"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal" />
              <span>Doctor Verification Checklist</span>
            </button>
            <span className="text-slate-600 hidden md:inline">|</span>
            <button
              onClick={() => setIsPhase2Open(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors hidden md:inline cursor-pointer"
            >
              Phase 2 CMS Roadmap
            </button>
          </div>
        </div>
      </aside>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-warm-white/95 backdrop-blur-md border-b border-border-subtle shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          {/* Identity */}
          <Link 
            href="/" 
            className="flex flex-col shrink-0 group focus-visible:outline-hidden"
            aria-label="Dr. Abhishek Anand Home"
          >
            <span className="text-lg sm:text-xl xl:text-2xl font-bold tracking-tight text-navy group-hover:text-medical transition-colors">
              Dr. Abhishek Anand
            </span>
            <span className="text-xs sm:text-xs xl:text-sm font-medium text-charcoal-muted tracking-wide flex items-center gap-1.5">
              <span className="text-teal font-semibold">Paediatric Surgeon</span>
              <span className="text-border-subtle hidden sm:inline">•</span>
              <span className="text-charcoal-muted hidden sm:inline">New Life Clinic, Bhubaneswar</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 xl:px-3.5 py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all duration-150 ${
                    active
                      ? "text-medical bg-medical-light font-bold shadow-xs border border-medical/15"
                      : "text-charcoal hover:text-navy hover:bg-slate-100/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Header Action Buttons */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            <Link
              href="/clinic-login"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-navy bg-light-bg hover:bg-slate-200 border border-border-subtle transition-all"
              title="Access Clinic Management System"
            >
              <Lock className="w-3.5 h-3.5 text-medical" />
              <span className="hidden xl:inline">Staff Portal</span>
              <span className="xl:hidden">Staff</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-3.5 xl:px-4 py-2 rounded-lg text-xs xl:text-sm font-semibold text-white bg-medical hover:bg-medical-hover shadow-xs hover:shadow-editorial transition-all"
            >
              <Phone className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
              <span>Contact Clinic</span>
            </Link>
          </div>

          {/* Mobile / Tablet Actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href="tel:+919124616273"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-medical bg-medical-light border border-medical/20 hover:bg-medical/10 transition-colors"
              title="Call Clinic Helpline"
            >
              <Phone className="w-3.5 h-3.5 text-medical" />
              <span className="hidden xs:inline font-bold">Call</span>
            </a>
            <Link
              href="/clinic-login"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-navy bg-light-bg border border-border-subtle hover:bg-slate-200 transition-colors"
              title="Clinic Staff Login"
            >
              <Lock className="w-3.5 h-3.5 text-medical" />
              <span>Portal</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal hover:text-navy hover:bg-light-bg border border-transparent hover:border-border-subtle transition-colors focus:outline-hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-navy" /> : <Menu className="w-6 h-6 text-navy" />}
            </button>
          </div>
        </div>

        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 top-[113px] sm:top-[113px] bg-navy-dark/40 backdrop-blur-xs z-30 lg:hidden transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div 
            id="mobile-navigation"
            className="lg:hidden absolute top-full left-0 w-full border-t border-border-subtle bg-warm-white px-4 pt-3 pb-6 space-y-3 shadow-xl max-h-[calc(100dvh-5rem)] overflow-y-auto z-40 transition-all"
          >
            <nav className="space-y-1" aria-label="Mobile navigation">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "text-medical bg-medical-light font-bold border-l-4 border-medical"
                        : "text-charcoal hover:bg-slate-50 hover:text-navy"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className={`w-4 h-4 ${active ? "text-medical" : "text-slate-400"}`} />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-border-subtle space-y-2.5">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-medical hover:bg-medical-hover shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Contact New Life Clinic</span>
              </Link>
              <Link
                href="/clinic-login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-navy bg-light-bg hover:bg-slate-200 border border-border-subtle transition-colors"
              >
                <Lock className="w-4 h-4 text-medical" />
                <span>Clinic Staff Login (CMS)</span>
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-2 text-xs border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsChecklistOpen(true);
                  }}
                  className="text-teal font-medium hover:underline inline-flex items-center gap-1 cursor-pointer text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Doctor Verification Checklist</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsPhase2Open(true);
                  }}
                  className="text-charcoal-muted hover:text-navy cursor-pointer text-left"
                >
                  Phase 2 CMS Roadmap
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <DoctorApprovalModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
      />
      <Phase2RoadmapModal
        isOpen={isPhase2Open}
        onClose={() => setIsPhase2Open(false)}
      />
    </>
  );
}

