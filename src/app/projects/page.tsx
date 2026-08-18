"use client";

import React, { useEffect, useRef, useState } from "react";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { ProjectCard } from "@/shared/components/cards/ProjectCard";
import { AddEntityModal } from "@/shared/components/modals/AddEntityModal";
import { staggerCardsOnScroll } from "@/shared/lib/animations";
import { Plus, UploadCloud } from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";

export default function ProjectsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string | "All">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "propose" | "edit">("propose");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, role } = useAuth();

  const tags: string[] = [
    "All", "Web Security", "OSINT", "Reverse Engineering", "AI Security"
  ];
  
  const filteredProjects = projects.filter(p => filter === "All" || (p.tags && p.tags.includes(filter)));

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { fetchApi } = await import('@/shared/lib/api');
        const res = await fetchApi('/projects');
        if (res && res.success) {
          setProjects(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [isModalOpen]);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) {
          staggerCardsOnScroll(containerRef.current);
        }
      }, 50);
    }
  }, [filter, isLoading, projects.length]);

  const handleOpenModal = (mode: "add" | "propose" | "edit", project: any = null) => {
    setModalMode(mode);
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const { fetchApi } = await import('@/shared/lib/api');
      const result = await fetchApi(`/projects/${id}`, { method: 'DELETE' });
      if (result.success) {
        setProjects(projects.filter(p => p._id !== id));
      } else {
        alert(result.error || 'Failed to delete');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting project');
    }
  };

  return (
    <PageWrapper className="pt-24 pb-32">
      <AddEntityModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedProject(null); }} 
        entityType="PROJECT"
        mode={modalMode}
        initialData={selectedProject}
      />

      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 z-10 relative">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[var(--color-cyber-gray)] gap-6 relative mb-12">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] mb-4">
              Project Arsenal
            </div>
            <h1 className="font-heading font-black text-[clamp(4rem,8vw,7rem)] text-cyber-purple tracking-tighter leading-[0.9]">
              Research & <br className="hidden sm:block" /> Initiatives
            </h1>
            <p className="font-body text-sm md:text-base text-[var(--color-cyber-light)] mt-6 max-w-xl leading-relaxed">
              Open-source vulnerability scanners, intelligence modules, and automated defense tools architected by society members.
            </p>
          </div>

          {isAuthenticated && (
            <div className="flex gap-3">
              {role === 'member' && (
                <button 
                  onClick={() => handleOpenModal("propose")}
                  className="btn-primary px-6 py-3 text-xs uppercase tracking-widest flex items-center justify-center shrink-0 self-start md:self-end rounded-sm"
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  <span>Propose Project</span>
                </button>
              )}
              {(role === 'admin' || role === 'superadmin') && (
                <button 
                  onClick={() => handleOpenModal("add")}
                  className="btn-primary px-6 py-3 text-xs uppercase tracking-widest flex items-center justify-center shrink-0 self-start md:self-end rounded-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Add Project</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 mt-8 mb-12">
          <span className="text-[10px] font-bold font-mono text-[var(--color-cyber-muted)] uppercase mr-2 tracking-widest">Filter by:</span>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4 py-2 text-[10px] font-mono tracking-widest uppercase transition-all duration-300 cursor-pointer border rounded-sm ${
                filter === tag 
                  ? "bg-[var(--color-cyber-white)] text-[var(--color-cyber-black)] border-[var(--color-cyber-white)]" 
                  : "bg-[var(--color-cyber-dark)] border-[var(--color-cyber-gray)] text-[var(--color-cyber-light)] hover:border-[var(--color-cyber-white)] hover:text-[var(--color-cyber-white)]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        
        {/* Grid */}
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {isLoading ? (
            <div className="col-span-full py-24 text-center">
              <p className="text-[var(--color-cyber-muted)] font-mono text-sm tracking-widest uppercase animate-pulse">Establishing Connection to Network...</p>
            </div>
          ) : (
            <>
              {filteredProjects.map((project, i) => (
                <div key={`${project.title}-${i}`} className="opacity-0">
                  <ProjectCard 
                    project={project} 
                    onEdit={(p) => handleOpenModal('edit', p)}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
              {filteredProjects.length === 0 && (
                <div className="col-span-full py-24 text-center bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)]">
                  <p className="text-[var(--color-cyber-light)] font-body text-sm">No projects matching selected criteria found.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
