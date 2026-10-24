import React from "react";

export default function PortalLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-10 h-10 border-3 border-teal/20 border-t-teal rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-500 tracking-wide">
        Loading New Life Clinic Portal...
      </p>
    </div>
  );
}
