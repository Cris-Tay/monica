"use client";

import { LogoutButton } from "@/components/logout-button";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-blue-200/40">
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* Logo + sección */}
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
         
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Preu PAES
            </p>
            <p className="text-xs text-blue-600/70">
              Dashboard de estudio
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/50">
            
            <span className="text-xs font-medium text-blue-700">
              Sesión activa
            </span>
          </div>

          {/* Logout */}
          <div className="hidden sm:block">
            <LogoutButton />
          </div>

          {/* Avatar */}
          <button className="relative h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <span className="text-sm font-bold text-white">C</span>
          </button>
        </div>
      </div>
    </header>
  );
}
