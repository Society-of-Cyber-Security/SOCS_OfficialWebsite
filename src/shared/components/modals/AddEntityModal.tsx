"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Shield, Save, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/shared/lib/api";

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "PROJECT" | "NODE" | "EVENT" | "RESOURCE" | "VISUAL";
  mode?: "add" | "propose" | "edit";
  initialData?: any;
}

export function AddEntityModal({ isOpen, onClose, entityType, mode = "propose", initialData }: AddEntityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setStep(0);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Extract form data
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    try {
      let endpoint = '';
      let payload: any = {};
      let isFormData = false;
      let method = 'POST';

      if (entityType === 'VISUAL' && mode === 'add' && data.image && (data.image as File).size > 0) {
        endpoint = `/gallery/upload`;
        const visualFormData = new FormData();
        visualFormData.append('image', data.image);
        visualFormData.append('caption', data.category || data.title || 'Visual');
        payload = visualFormData;
        isFormData = true;
      } else if (mode === 'propose') {
        endpoint = `/submissions`;
        payload = {
          type: entityType.toLowerCase(),
          title: data.title || data.name || 'Untitled',
          description: data.description || `Proposal for ${entityType}`,
          payload: data
        };
      } else if (mode === 'edit' && initialData?._id) {
        endpoint = `/${entityType.toLowerCase()}s/${initialData._id}`;
        method = entityType === 'PROJECT' ? 'PATCH' : 'PUT';
        
        if (entityType === 'PROJECT') {
          payload = {
            title: data.title,
            description: data.description,
            tags: data.tech ? data.tech.split(',').map((t: string) => t.trim()) : [],
            repoUrl: data.github
          };
        } else if (entityType === 'RESOURCE') {
          payload = {
            title: data.title,
            description: data.description,
            category: data.category,
            url: data.url,
            tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : []
          };
        } else {
          payload = data;
        }
      } else {
        // Direct Add
        endpoint = `/${entityType.toLowerCase()}s`;
        
        if (entityType === 'PROJECT') {
          payload = {
            title: data.title,
            description: data.description,
            tags: data.tech ? data.tech.split(',').map((t: string) => t.trim()) : [],
            repoUrl: data.github,
            isPublished: true
          };
        } else if (entityType === 'RESOURCE') {
          payload = {
            title: data.title,
            description: data.description,
            category: data.category,
            url: data.url,
            tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : []
          };
        } else {
          payload = data;
          
          // Minor corrections for direct payloads
          if (entityType === 'EVENT') {
            payload.type = 'workshop'; // Default
            payload.isPublished = true;
          }
        }
      }

      const result = await fetchApi(endpoint, {
        method,
        body: isFormData ? payload : JSON.stringify(payload)
      });
      
      if (result.success) {
        setStep(1);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        alert(result.error || 'Operation failed');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFields = () => {
    switch (entityType) {
      case "PROJECT":
        return [
          { name: "title", label: "Project Title", placeholder: "e.g. Project Sentinel Recon" },
          { name: "description", label: "Synopsis & Purpose", placeholder: "Brief summary of the security tool..." },
          { name: "tech", label: "Tech Stack", placeholder: "e.g. Next.js, Python, Rust, Go" },
          { name: "github", label: "Repository URL", placeholder: "https://github.com/..." },
        ];
      case "NODE":
        return [
          { name: "name", label: "Operator Name", placeholder: "e.g. Alex Rivera" },
          { name: "role", label: "Designation & Role", placeholder: "e.g. Lead Security Researcher" },
          { name: "clearance", label: "Clearance Tier", placeholder: "core / lead / member" },
        ];
      case "EVENT":
        return [
          { name: "title", label: "Event / Workshop Title", placeholder: "e.g. Advanced Web Exploitation Workshop" },
          { name: "date", label: "Date & Time", placeholder: "YYYY-MM-DD" },
          { name: "location", label: "Venue / Coordinates", placeholder: "e.g. Cyber Lab 304 / Discord Live" },
        ];
      case "RESOURCE":
        return [
          { name: "title", label: "Resource Title", placeholder: "e.g. OWASP Top 10 Deep Dive" },
          { name: "description", label: "Description", placeholder: "Brief summary of the resource..." },
          { name: "category", label: "Classification", placeholder: "roadmap / tool / writeup / blog" },
          { name: "tags", label: "Tags", placeholder: "e.g. Web Security, Beginners", optional: true },
          { name: "url", label: "Resource URL", placeholder: "https://..." },
        ];
      case "VISUAL":
        return [
          { name: "title", label: "Photo / Asset Title", placeholder: "e.g. Annual CTF Championship 2026" },
          { name: "category", label: "Tag / Category", placeholder: "Team / Events / Infrastructure" },
          { name: "image", label: "Upload Image File", placeholder: "Select image file...", type: "file", optional: false },
          { name: "url", label: "Or Image URL", placeholder: "https://images.unsplash.com/...", optional: true },
        ];
      default:
        return [];
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="stealth-card relative w-full max-w-lg bg-[var(--color-cyber-black)] rounded-sm border border-[var(--color-cyber-gray)] shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="bg-[var(--color-cyber-dark)] border-b border-[var(--color-cyber-gray)] p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[var(--color-cyber-black)] text-[var(--color-cyber-neon)] border border-[var(--color-cyber-gray)] rounded-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-sm font-black font-heading tracking-widest text-[var(--color-cyber-white)] uppercase">
                  {mode === 'edit' ? 'EDIT' : mode === 'propose' ? 'PROPOSE' : 'ADD'} {mode !== 'edit' ? 'NEW' : ''} {entityType}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-neon)] hover:bg-[var(--color-cyber-black)] rounded-sm transition-colors cursor-pointer border border-transparent hover:border-[var(--color-cyber-gray)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Area */}
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[80vh]">
              {step === 0 ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    {getFields().map((field: any) => (
                      <div key={field.name} className="space-y-1.5">
                        <label className="text-xs font-mono font-bold text-[var(--color-cyber-muted)] uppercase tracking-widest">
                          {field.label}
                        </label>
                        <input 
                          required={!field.optional && mode !== 'edit'}
                          type={field.type || "text"}
                          name={field.name}
                          accept={field.type === 'file' ? "image/*" : undefined}
                          placeholder={field.placeholder}
                          defaultValue={(() => {
                            if (!initialData) return "";
                            if (entityType === "PROJECT") {
                              if (field.name === "tech") return initialData.tags?.join(", ");
                              if (field.name === "github") return initialData.repoUrl;
                            }
                            if (entityType === "RESOURCE" && field.name === "tags") {
                              return initialData.tags?.join(", ");
                            }
                            if (entityType === "EVENT" && field.name === "date" && initialData.date) {
                              return new Date(initialData.date).toISOString().split('T')[0];
                            }
                            return initialData[field.name] || "";
                          })()}
                          className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm px-4 py-2.5 text-sm font-body text-[var(--color-cyber-light)] placeholder:text-[var(--color-cyber-muted)] outline-none focus:border-[var(--color-cyber-neon)] focus:bg-[var(--color-cyber-black)] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-mono file:bg-cyber-blue file:text-[var(--color-cyber-white)] hover:file:bg-cyber-neon"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full py-3.5 text-xs font-bold tracking-widest uppercase shadow-md cursor-pointer flex items-center justify-center gap-2 rounded-sm relative overflow-hidden"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2 relative z-10">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>SYNCHRONIZING ENTRY...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 relative z-10">
                          <Save className="w-4 h-4" />
                          <span>SAVE AND PUBLISH</span>
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-[var(--color-cyber-dark)] text-[var(--color-cyber-neon)] rounded-sm flex items-center justify-center mx-auto border border-[var(--color-cyber-neon)] shadow-[0_0_15px_rgba(0,255,157,0.2)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black font-heading text-[var(--color-cyber-white)] tracking-widest uppercase">
                    ENTRY SYNCHRONIZED!
                  </h3>
                  <p className="text-[var(--color-cyber-muted)] font-medium text-xs font-mono tracking-wider">
                    New {entityType.toLowerCase()} node broadcasted to SOCS network successfully.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
