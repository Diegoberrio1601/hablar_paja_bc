"use client";

import { useAuth } from "@/context/AuthContext";
import { AlertCircle, LogOut, Clock, Calendar } from "lucide-react";

export default function BannedNotice() {
  const { banNotice, logout, clearBanNotice } = useAuth();

  if (!banNotice?.isActive) return null;

  const untilDate = banNotice.until;
  const isPermanent = !untilDate;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
      
      {/* Modal content */}
      <div className="relative w-full max-w-lg bg-background border border-border rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-8">
            <AlertCircle className="text-red-500" size={40} />
          </div>
          
          <h2 className="text-3xl font-bold mb-4 serif tracking-tight">Acceso Restringido</h2>
          
          <div className="bg-muted/30 border border-border/50 p-6 rounded-3xl mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Motivo de la suspensión</p>
            <p className="text-lg italic text-foreground tracking-tight leading-relaxed">
              "{banNotice.reason}"
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <p className="text-sm text-muted-foreground leading-relaxed px-6">
              Tu cuenta ha sido suspendida por incumplir las normas de convivencia de Hablar Paja BC.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-xs font-bold">
                {isPermanent ? (
                  <><AlertCircle size={14} className="text-red-500" /> Permanente</>
                ) : (
                  <><Clock size={14} className="text-orange-500" /> Temporal</>
                )}
              </div>
              {!isPermanent && untilDate && (
                <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-xs font-bold">
                  <Calendar size={14} className="text-blue-500" />
                  Expira el {untilDate.toLocaleDateString()} a las {untilDate.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              clearBanNotice();
            }}
            className="w-full py-4 rounded-full bg-foreground text-background font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-foreground/10"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
