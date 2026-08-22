"use client";

import React, { useState, useEffect } from 'react';
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { AddEntityModal } from "@/shared/components/modals/AddEntityModal";
import { Plus, Image as ImageIcon, Trash2, Star } from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { fetchApi } from "@/shared/lib/api";
import { motion } from 'framer-motion';

const FALLBACK_IMAGES = [
  { _id: 1, caption: "Core Team Briefing", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80" },
  { _id: 2, caption: "Infrastructure Dock", url: "https://images.unsplash.com/photo-1558494949-ef0109121c9b?auto=format&fit=crop&w=800&q=80" },
  { _id: 3, caption: "Hackathon Event 2026", url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80" },
  { _id: 4, caption: "Cyber Squad Collaboration", url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80" },
  { _id: 5, caption: "Hardware & Security Lab", url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80" },
  { _id: 6, caption: "Night CTF Tournament", url: "https://images.unsplash.com/photo-1510511459019-5dee1a2078a5?auto=format&fit=crop&w=800&q=80" },
];

export default function GalleryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await fetchApi('/gallery');
        if (res && res.success && res.data.length > 0) {
          // Combine uploaded images with fallback placeholders to keep it looking nice
          setImages([...res.data, ...FALLBACK_IMAGES]);
        } else {
          setImages(FALLBACK_IMAGES);
        }
      } catch (err) {
        console.error("Failed to load gallery images", err);
        setImages(FALLBACK_IMAGES);
      } finally {
        setIsLoading(false);
      }
    };
    loadImages();
  }, [isModalOpen]); // Reload images when modal closes

  const getImageUrl = (url: string) => {
    return url;
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    if (typeof id === 'number') {
      setImages(images.filter(img => img._id !== id));
      return;
    }

    try {
      const { fetchApi } = await import('@/shared/lib/api');
      const result = await fetchApi(`/gallery/${id}`, { method: 'DELETE' });
      if (result.success) {
        setImages(images.filter(img => img._id !== id));
      } else {
        alert(result.error || 'Failed to delete');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting image');
    }
  };

  return (
    <PageWrapper className="pt-24 pb-32">
      <AddEntityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        entityType="VISUAL"
        mode="add"
      />
      
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 z-10 relative">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[var(--color-cyber-gray)] gap-6 relative mb-12">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] mb-4">
              Visual Archive
            </div>
            <h1 className="font-heading font-black text-[clamp(4rem,8vw,7rem)] text-cyber-blue tracking-tighter leading-[0.9]">
              Event & Team <br className="hidden sm:block" /> Gallery
            </h1>
            <p className="font-body text-sm md:text-base text-[var(--color-cyber-light)] mt-6 max-w-xl leading-relaxed">
              A visual log of hackathons, club sessions, infrastructure buildouts, and community events.
            </p>
          </div>

          {isAuthenticated && (role === 'admin' || role === 'superadmin') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary px-6 py-3 text-xs uppercase tracking-widest flex items-center justify-center shrink-0 self-start md:self-end rounded-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Upload Image</span>
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mt-16">
          {isLoading ? (
             <div className="col-span-full py-24 text-center">
               <p className="text-[var(--color-cyber-muted)] font-mono text-sm tracking-widest uppercase animate-pulse">Decrypting Visual Data...</p>
             </div>
          ) : (
            images.map((img, idx) => (
              <motion.div 
                key={img._id || idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 0.5) }}
                className="stealth-card overflow-hidden group border border-[var(--color-cyber-gray)] rounded-sm flex flex-col bg-[var(--color-cyber-black)]/30 hover:border-[var(--color-tech-blue)]/30"
              >
                {/* Image Container */}
                <div className="aspect-[16/10] overflow-hidden border-b border-[var(--color-cyber-gray)] relative bg-[var(--color-cyber-dark)]">
                  <img 
                    src={getImageUrl(img.url)} 
                    alt={img.caption || 'Gallery visual'}
                    className="w-full h-full object-cover grayscale opacity-90 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 right-4 bg-[var(--color-cyber-black)]/90 backdrop-blur-md px-3 py-1 border border-[var(--color-cyber-gray)] text-[9px] font-mono tracking-widest text-[var(--color-cyber-white)] uppercase rounded-sm">
                    {img.caption?.split(' ')[0] || 'Visual'}
                  </div>
                  {img.isFeatured && (
                    <div className="absolute top-4 left-4 bg-yellow-500/90 backdrop-blur-md px-2 py-1 text-[8px] font-mono tracking-widest text-[var(--color-cyber-black)] uppercase rounded-sm font-bold flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Featured
                    </div>
                  )}
                </div>

                {/* Content info */}
                <div className="p-4 relative z-10 flex-grow flex flex-col justify-center">
                  <div className="flex justify-between items-center gap-4">
                    <h3 className="text-sm font-heading font-bold text-[var(--color-cyber-white)] tracking-tight leading-tight uppercase">
                      {img.caption || 'Verified Capture'}
                    </h3>
                    {isAuthenticated && (role === 'admin' || role === 'superadmin') && img._id && (
                      <div className="flex items-center gap-1.5">
                        {typeof img._id !== 'number' && (
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                const result = await fetchApi(`/gallery/${img._id}`, {
                                  method: 'PATCH',
                                  body: JSON.stringify({ isFeatured: !img.isFeatured })
                                });
                                if (result.success) {
                                  setImages(images.map(i => i._id === img._id ? { ...i, isFeatured: result.data.isFeatured } : i));
                                } else {
                                  alert(result.error || 'Failed to update');
                                }
                              } catch (err: any) {
                                alert(err.message || 'Error updating');
                              }
                            }}
                            className={`p-1.5 bg-[var(--color-cyber-dark)] border rounded-sm transition-colors cursor-pointer shrink-0 ${
                              img.isFeatured 
                                ? 'border-yellow-500/50 text-yellow-500 hover:text-yellow-600 hover:border-yellow-600' 
                                : 'border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)] hover:text-yellow-500 hover:border-yellow-500'
                            }`}
                            title={img.isFeatured ? "Unfeature Image" : "Feature Image"}
                          >
                            <Star className={`w-3.5 h-3.5 ${img.isFeatured ? 'fill-yellow-500' : ''}`} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(img._id); }} 
                          className="p-1.5 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] hover:border-red-500 text-[var(--color-cyber-muted)] hover:text-red-500 rounded-sm transition-colors cursor-pointer shrink-0"
                          title="Delete Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
