import React from "react";
import { Event } from "@/core/config/events";
import { Calendar, Trophy, Mic, Code2, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/core/context/AuthContext";

const MODE_MAP = {
  workshop: { label: "Workshop", icon: <Code2 className="w-4 h-4" /> },
  ctf: { label: "CTF Battle", icon: <Trophy className="w-4 h-4" /> },
  talk: { label: "Tech Talk", icon: <Mic className="w-4 h-4" /> },
  hackathon: { label: "Hackathon", icon: <Calendar className="w-4 h-4" /> },
};

export function EventCard({ event, onEdit, onDelete }: { event: any; onEdit?: (e: any) => void; onDelete?: (id: string) => void }) {
  const { isAuthenticated, role } = useAuth();
  const isUpcoming = event.status === "upcoming";
  const mode = MODE_MAP[event.type as keyof typeof MODE_MAP] || MODE_MAP.workshop;

  return (
    <Link href={`/events/${event.slug}`} className="block h-full group">
      <div className="stealth-card flex flex-col h-full p-8 relative overflow-hidden transition-all duration-300">

        {/* Top Header Row */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest border border-[var(--color-cyber-gray)] text-[var(--color-cyber-white)] bg-[var(--color-cyber-dark)] flex items-center gap-2">
            {mode.icon}
            {mode.label}
          </div>
          {isUpcoming && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-cyber-neon)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-cyber-neon)]"></span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[var(--color-cyber-neon)] uppercase tracking-widest">Live</span>
            </div>
          )}
        </div>

        {/* Admin Controls */}
        {isAuthenticated && (role === 'admin' || role === 'superadmin') && (
          <div className="absolute top-2 left-2 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(event); }} 
                className="p-1.5 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] hover:border-cyber-blue text-[var(--color-cyber-muted)] hover:text-cyber-blue rounded-sm transition-colors cursor-pointer"
                title="Edit Event"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(event._id); }} 
                className="p-1.5 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] hover:border-red-500 text-[var(--color-cyber-muted)] hover:text-red-500 rounded-sm transition-colors cursor-pointer"
                title="Delete Event"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-grow relative z-10">
          <h3 className="text-2xl font-heading font-bold text-cyber-green tracking-tighter mb-3 group-hover:scale-[1.02] origin-left transition-transform leading-tight">
            {event.title}
          </h3>
          <p className="text-sm font-body text-[var(--color-cyber-light)] mb-6 leading-relaxed line-clamp-3">
            {event.description}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="mt-auto pt-6 border-t border-[var(--color-cyber-gray)] flex items-center justify-between relative z-10">
          <div className="text-[11px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[var(--color-cyber-muted)] rounded-full" />
            {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
          <span className="text-[var(--color-cyber-muted)] group-hover:text-[var(--color-cyber-neon)] group-hover:translate-x-1 transition-all">→</span>
        </div>
      </div>
    </Link>
  );
}
