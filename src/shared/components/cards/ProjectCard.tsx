import Link from "next/link";
import { Project } from "@/core/config/projects";
import { GithubIcon } from "@/shared/components/ui/Icons";
import { ArrowRight, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";

export function ProjectCard({ project, onEdit, onDelete }: { project: any; onEdit?: (p: any) => void; onDelete?: (id: string) => void }) {
  const { isAuthenticated, role } = useAuth();
  return (
    <Link href={`/projects/${project._id || project.slug}`} className="block h-full group">
      <div className="stealth-card flex flex-col h-full p-8 relative overflow-hidden transition-all duration-300">
        
        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute top-0 right-0 bg-[var(--color-cyber-white)] text-[var(--color-cyber-black)] font-bold text-[9px] px-3 py-1 font-mono uppercase tracking-widest z-10">
            FEATURED
          </div>
        )}

        {/* Admin Controls */}
        {isAuthenticated && (role === 'admin' || role === 'superadmin') && (
          <div className="absolute top-2 left-2 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(project); }} 
                className="p-1.5 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] hover:border-cyber-blue text-[var(--color-cyber-muted)] hover:text-cyber-blue rounded-sm transition-colors cursor-pointer"
                title="Edit Project"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(project._id); }} 
                className="p-1.5 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] hover:border-red-500 text-[var(--color-cyber-muted)] hover:text-red-500 rounded-sm transition-colors cursor-pointer"
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-heading font-bold tracking-tighter text-cyber-blue group-hover:scale-[1.02] origin-left transition-transform pr-4 leading-tight">
            {project.title}
          </h3>
          {(project.repoUrl || project.githubUrl) && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(project.repoUrl || project.githubUrl, '_blank', 'noopener,noreferrer');
              }}
              className="p-1.5 text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors cursor-pointer"
              aria-label="GitHub Source"
            >
              <GithubIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(project.tags || []).map((tag: string, i: number) => (
            <span key={i} className="font-mono text-[10px] text-[var(--color-cyber-white)] border border-[var(--color-cyber-gray)] bg-[var(--color-cyber-dark)] px-2 py-1 uppercase tracking-wider rounded-sm">
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-[var(--color-cyber-light)] font-body text-sm mb-8 flex-grow leading-relaxed">
          {project.description}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-[var(--color-cyber-gray)] flex items-center justify-between">
          <div className="flex flex-wrap gap-2 truncate pr-4">
            {(project.tags || []).slice(0, 3).map((tech: string, i: number) => (
              <span key={i} className="text-[var(--color-cyber-muted)] font-mono text-[10px] uppercase tracking-wider">
                {tech}{i < Math.min(2, (project.tags || []).length - 1) ? " •" : ""}
              </span>
            ))}
          </div>
          <div className="text-[var(--color-cyber-white)] group-hover:text-[var(--color-cyber-neon)] group-hover:translate-x-1 transition-all flex items-center gap-2 font-heading font-bold text-sm shrink-0">
            Details <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
