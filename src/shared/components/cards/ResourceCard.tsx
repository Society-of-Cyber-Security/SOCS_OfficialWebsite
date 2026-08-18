import React from "react";
import { Resource } from "@/core/config/resources";
import { ExternalLink, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";

export function ResourceCard({ resource, onEdit, onDelete }: { resource: any; onEdit?: (r: any) => void; onDelete?: (id: string) => void }) {
  const { isAuthenticated, role } = useAuth();
  return (
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block group h-full">
      <div className="stealth-card p-8 flex flex-col h-full relative overflow-hidden transition-all duration-300">
        
        <div className="flex justify-between items-start mb-6">
          <span className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest border border-[var(--color-cyber-gray)] text-[var(--color-cyber-white)] bg-[var(--color-cyber-dark)] rounded-sm z-10">
            {resource.category}
          </span>
          
          <div className="flex gap-2 relative z-20">
            {/* Admin Controls */}
            {isAuthenticated && (role === 'admin' || role === 'superadmin') && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(resource); }} 
                    className="p-1.5 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] hover:border-cyber-blue text-[var(--color-cyber-muted)] hover:text-cyber-blue rounded-sm transition-colors cursor-pointer"
                    title="Edit Resource"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(resource._id); }} 
                    className="p-1.5 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] hover:border-red-500 text-[var(--color-cyber-muted)] hover:text-red-500 rounded-sm transition-colors cursor-pointer"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            <div className="text-[var(--color-cyber-muted)] group-hover:text-[var(--color-cyber-neon)] transition-colors p-1.5">
              <ExternalLink className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-heading font-bold text-cyber-yellow tracking-tighter mb-3 group-hover:scale-[1.02] origin-left transition-transform leading-tight">
          {resource.title}
        </h3>
        
        <p className="text-sm font-body text-[var(--color-cyber-light)] mb-8 flex-grow leading-relaxed">
          {resource.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-[var(--color-cyber-gray)]">
          {(resource.tags || []).map((tag: string) => (
            <span key={tag} className="text-[var(--color-cyber-muted)] font-mono text-[10px] uppercase tracking-wider bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] px-2 py-1 rounded-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
