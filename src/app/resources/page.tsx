"use client";

import React, { useEffect, useRef, useState } from "react";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { ResourceCard } from "@/shared/components/cards/ResourceCard";
import { AddEntityModal } from "@/shared/components/modals/AddEntityModal";
import { staggerCardsOnScroll } from "@/shared/lib/animations";
import { Plus, BookOpen, Wrench, FileText, Newspaper, UploadCloud } from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";

export default function ResourcesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "propose" | "edit">("propose");
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { fetchApi } = await import('@/shared/lib/api');
        const res = await fetchApi('/resources');
        if (res && res.success) {
          setResources(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch resources", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, [isModalOpen]);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) staggerCardsOnScroll(containerRef.current);
      }, 50);
    }
  }, [isLoading, resources.length]);

  const handleOpenModal = (mode: "add" | "propose" | "edit", resource: any = null) => {
    setModalMode(mode);
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      const { fetchApi } = await import('@/shared/lib/api');
      const result = await fetchApi(`/resources/${id}`, { method: 'DELETE' });
      if (result.success) {
        setResources(resources.filter(r => r._id !== id));
      } else {
        alert(result.error || 'Failed to delete');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting resource');
    }
  };

  const categories = [
    { title: "Learning Roadmaps", id: "roadmap", icon: <BookOpen className="w-5 h-5 text-sky-700" /> },
    { title: "Security Tools", id: "tool", icon: <Wrench className="w-5 h-5 text-amber-700" /> },
    { title: "CTF Writeups", id: "writeup", icon: <FileText className="w-5 h-5 text-indigo-700" /> },
    { title: "Blogs & Articles", id: "blog", icon: <Newspaper className="w-5 h-5 text-emerald-700" /> },
  ];

  return (
    <PageWrapper className="pt-24 pb-32">
      <AddEntityModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedResource(null); }} 
        entityType="RESOURCE"
        mode={modalMode}
        initialData={selectedResource}
      />

      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 z-10 relative">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[var(--color-cyber-gray)] gap-6 relative mb-12">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] mb-4">
              Knowledge Vault
            </div>
            <h1 className="font-heading font-black text-[clamp(4rem,8vw,7rem)] text-cyber-blue tracking-tighter leading-[0.9]">
              Resources & <br className="hidden sm:block" /> Intel
            </h1>
            <p className="font-body text-sm md:text-base text-[var(--color-cyber-light)] mt-6 max-w-xl leading-relaxed">
              Curated cybersecurity roadmaps, recommended tooling, CTF walkthroughs, and research writeups.
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
                  <span>Propose Resource</span>
                </button>
              )}
              {(role === 'admin' || role === 'superadmin') && (
                <button 
                  onClick={() => handleOpenModal("add")}
                  className="btn-primary px-6 py-3 text-xs uppercase tracking-widest flex items-center justify-center shrink-0 self-start md:self-end rounded-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Add Resource</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="py-24 text-center mt-16">
            <p className="text-[var(--color-cyber-muted)] font-mono text-sm tracking-widest uppercase animate-pulse">Decrypting Knowledge Base...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-24 text-center mt-16 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)]">
            <p className="text-[var(--color-cyber-light)] font-body text-sm">No resources available at this time.</p>
          </div>
        ) : (
          <div ref={containerRef} className="space-y-20 mt-16">
            {categories.map((category) => {
              const items = resources.filter(r => r.category === category.id);
              if (items.length === 0) return null;
              
              return (
                <section key={category.id} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm">
                      {category.icon}
                    </div>
                    <h3 className="font-heading font-bold text-2xl text-cyber-purple tracking-tighter uppercase">
                      {category.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {items.map((resource, i) => (
                      <div key={resource._id || i} className="resource-card-wrapper opacity-0">
                        <ResourceCard 
                          resource={resource} 
                          onEdit={(r) => handleOpenModal('edit', r)}
                          onDelete={handleDelete}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
