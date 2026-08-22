"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Shield, Save, Loader2, CheckCircle2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/shared/lib/api";

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "PROJECT" | "NODE" | "EVENT" | "RESOURCE" | "VISUAL";
  mode?: "add" | "propose" | "edit" | "edit_submission";
  initialData?: any;
}

export function AddEntityModal({ isOpen, onClose, entityType, mode = "propose", initialData }: AddEntityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setStep(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
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

    // Normalize URLs to prevent validation errors
    const normalizeUrl = (urlVal: any) => {
      if (typeof urlVal !== 'string') return urlVal;
      const trimmed = urlVal.trim();
      if (!trimmed) return '';
      if (!/^https?:\/\//i.test(trimmed)) {
        return 'https://' + trimmed;
      }
      return trimmed;
    };

    if (data.url) data.url = normalizeUrl(data.url);
    if (data.github) data.github = normalizeUrl(data.github);
    if (data.registrationLink) data.registrationLink = normalizeUrl(data.registrationLink);

    try {
      let endpoint = '';
      let payload: any = {};
      let isFormData = false;
      let method = 'POST';

      if (entityType === 'VISUAL' && mode === 'add' && data.image && (data.image as File).size > 0) {
        // Direct upload by admin — send file to gallery upload endpoint
        endpoint = `/gallery/upload`;
        const visualFormData = new FormData();
        visualFormData.append('image', data.image);
        visualFormData.append('caption', data.title || data.category || 'Visual');
        payload = visualFormData;
        isFormData = true;
      } else if (mode === 'propose') {
        // Member proposing — goes through submissions pipeline
        endpoint = `/submissions`;
        
        if (entityType === 'VISUAL') {
          payload = {
            type: 'gallery',
            title: data.title || 'Gallery Image',
            description: data.description || `Gallery image submission: ${data.title || 'Untitled'}`,
            payload: {
              url: data.url || '',
              category: data.category || 'Events',
              filename: data.title?.toLowerCase().replace(/\s+/g, '-') || 'untitled'
            }
          };
        } else if (entityType === 'PROJECT') {
          payload = {
            type: 'project',
            title: data.title || 'Untitled Project',
            description: data.description || 'Project proposal',
            payload: {
              tags: data.tech ? data.tech.split(',').map((t: string) => t.trim()) : [],
              repoUrl: data.github || ''
            }
          };
        } else if (entityType === 'EVENT') {
          payload = {
            type: 'event',
            title: data.title || 'Untitled Event',
            description: data.description || 'Event proposal',
            payload: {
              date: data.date || new Date().toISOString(),
              location: data.location || 'TBA',
              type: data.eventType || 'other',
              registrationLink: data.registrationLink || ''
            }
          };
        } else if (entityType === 'RESOURCE') {
          payload = {
            type: 'resource',
            title: data.title || 'Untitled Resource',
            description: data.description || 'Resource proposal',
            payload: {
              category: data.category || 'other',
              url: data.url || '',
              tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : []
            }
          };
        } else {
          payload = {
            type: entityType.toLowerCase(),
            title: data.title || data.name || 'Untitled',
            description: data.description || `Proposal for ${entityType}`,
            payload: data
          };
        }
      } else if (mode === 'edit_submission' && initialData?._id) {
        endpoint = `/submissions/${initialData._id}`;
        method = 'PATCH';
        
        if (entityType === 'PROJECT') {
          payload = {
            title: data.title,
            description: data.description,
            payload: {
              tags: data.tech ? data.tech.split(',').map((t: string) => t.trim()) : [],
              repoUrl: data.github || ''
            }
          };
        } else if (entityType === 'RESOURCE') {
          payload = {
            title: data.title,
            description: data.description,
            payload: {
              category: data.category,
              url: data.url,
              tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : []
            }
          };
        } else if (entityType === 'EVENT') {
          payload = {
            title: data.title,
            description: data.description,
            payload: {
              date: data.date,
              location: data.location,
              type: data.eventType || 'other',
              registrationLink: data.registrationLink || ''
            }
          };
        } else if (entityType === 'VISUAL') {
          payload = {
            title: data.title,
            description: data.description,
            payload: {
              url: data.url,
              category: data.category
            }
          };
        } else {
          payload = data;
        }
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
        } else if (entityType === 'EVENT') {
          payload = {
            title: data.title,
            description: data.description,
            date: data.date,
            location: data.location,
            type: data.eventType || 'other',
            registrationLink: data.registrationLink || ''
          };
        } else {
          payload = data;
        }
      } else {
        // Direct Add by admin
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
        } else if (entityType === 'EVENT') {
          payload = {
            title: data.title,
            description: data.description,
            date: data.date,
            location: data.location,
            type: data.eventType || 'workshop',
            isPublished: true
          };
        } else {
          payload = data;
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
          { name: "description", label: "Synopsis & Purpose", placeholder: "Brief summary of the security tool...", textarea: true },
          { name: "tech", label: "Tech Stack", placeholder: "e.g. Next.js, Python, Rust, Go" },
          { name: "github", label: "Repository URL", placeholder: "https://github.com/...", optional: true },
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
          { name: "description", label: "Event Description", placeholder: "Describe the event objectives, agenda, etc...", textarea: true },
          { name: "date", label: "Date & Time", placeholder: "YYYY-MM-DD", type: "date" },
          { name: "location", label: "Venue / Coordinates", placeholder: "e.g. Cyber Lab 304 / Discord Live" },
          { name: "registrationLink", label: "Registration Link", placeholder: "https://...", optional: true },
        ];
      case "RESOURCE":
        return [
          { name: "title", label: "Resource Title", placeholder: "e.g. OWASP Top 10 Deep Dive" },
          { name: "description", label: "Description", placeholder: "Brief summary of the resource...", textarea: true },
          { 
            name: "category", 
            label: "Classification", 
            options: [
              { value: "roadmap", label: "Learning Roadmaps" },
              { value: "tool", label: "Security Tools" },
              { value: "writeup", label: "CTF Writeups" },
              { value: "blog", label: "Blogs & Articles" }
            ]
          },
          { name: "tags", label: "Tags", placeholder: "e.g. Web Security, Beginners", optional: true },
          { name: "url", label: "Resource URL", placeholder: "https://..." },
        ];
      case "VISUAL":
        if (mode === 'add') {
          return [
            { name: "title", label: "Photo / Asset Title", placeholder: "e.g. Annual CTF Championship 2026" },
            { 
              name: "category", 
              label: "Tag / Category", 
              options: [
                { value: "Team", label: "Team" },
                { value: "Events", label: "Events" },
                { value: "Infrastructure", label: "Infrastructure" }
              ]
            },
            { name: "image", label: "Upload Image File", placeholder: "Select image file...", type: "file", optional: false },
          ];
        }
        // Propose mode — no file upload, just URL
        return [
          { name: "title", label: "Photo / Asset Title", placeholder: "e.g. Annual CTF Championship 2026" },
          { name: "description", label: "Description", placeholder: "Describe the image and context...", textarea: true },
          { 
            name: "category", 
            label: "Tag / Category", 
            options: [
              { value: "Team", label: "Team" },
              { value: "Events", label: "Events" },
              { value: "Infrastructure", label: "Infrastructure" }
            ]
          },
          { name: "url", label: "Image URL", placeholder: "https://images.unsplash.com/..." },
        ];
      default:
        return [];
    }
  };

  const getSuccessMessage = () => {
    if (mode === 'propose') return 'Proposal submitted! Awaiting admin review.';
    if (mode === 'edit') return 'Entry updated successfully!';
    return `New ${entityType.toLowerCase()} created and published!`;
  };

  const getButtonLabel = () => {
    if (mode === 'propose') return 'SUBMIT PROPOSAL';
    if (mode === 'edit') return 'SAVE CHANGES';
    return 'SAVE AND PUBLISH';
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
                  {mode === 'propose' ? <Send className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <span className="text-sm font-black font-heading tracking-widest text-[var(--color-cyber-white)] uppercase">
                  {mode === 'edit' ? 'EDIT' : mode === 'propose' ? 'PROPOSE' : 'ADD'} {mode !== 'edit' ? 'NEW' : ''} {entityType === 'VISUAL' ? 'GALLERY IMAGE' : entityType}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-neon)] hover:bg-[var(--color-cyber-black)] rounded-sm transition-colors cursor-pointer border border-transparent hover:border-[var(--color-cyber-gray)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info banner for propose mode */}
            {mode === 'propose' && step === 0 && (
              <div className="mx-6 mt-6 p-3 bg-[var(--color-tech-blue)]/10 border border-[var(--color-tech-blue)]/30 rounded-sm flex items-start gap-2">
                <Shield className="w-4 h-4 text-[var(--color-tech-blue)] shrink-0 mt-0.5" />
                <p className="text-[11px] font-mono text-[var(--color-cyber-light)] leading-relaxed">
                  Your proposal will be reviewed by an admin before being published. You can track its status in your inbox.
                </p>
              </div>
            )}

            {/* Form Area */}
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[70vh]">
              {step === 0 ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    {getFields().map((field: any) => (
                      <div key={field.name} className="space-y-1.5">
                        <label className="text-xs font-mono font-bold text-[var(--color-cyber-muted)] uppercase tracking-widest flex items-center gap-2">
                          {field.label}
                          {field.optional && <span className="text-[var(--color-cyber-muted)]/50 normal-case tracking-normal font-normal">(optional)</span>}
                        </label>
                        {field.textarea ? (
                          <textarea 
                            required={!field.optional && mode !== 'edit'}
                            name={field.name}
                            placeholder={field.placeholder}
                            rows={3}
                            defaultValue={(() => {
                              if (!initialData) return "";
                              return initialData[field.name] || initialData.payload?.[field.name] || "";
                            })()}
                            className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm px-4 py-2.5 text-sm font-body text-[var(--color-cyber-light)] placeholder:text-[var(--color-cyber-muted)] outline-none focus:border-[var(--color-cyber-neon)] focus:bg-[var(--color-cyber-black)] transition-all resize-none"
                          />
                        ) : field.options ? (
                          <select
                            required={!field.optional && mode !== 'edit'}
                            name={field.name}
                            defaultValue={(() => {
                              if (!initialData) return "";
                              const d = initialData.payload || {};
                              return initialData[field.name] || d[field.name] || "";
                            })()}
                            className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm px-4 py-2.5 text-sm font-body text-[var(--color-cyber-light)] outline-none focus:border-[var(--color-cyber-neon)] focus:bg-[var(--color-cyber-black)] transition-all cursor-pointer"
                          >
                            <option value="" disabled>Select option...</option>
                            {field.options.map((opt: any) => (
                              <option key={opt.value} value={opt.value} className="bg-[var(--color-cyber-black)] text-[var(--color-cyber-light)]">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input 
                            required={!field.optional && mode !== 'edit'}
                            type={field.type || "text"}
                            name={field.name}
                            accept={field.type === 'file' ? "image/*" : undefined}
                            placeholder={field.placeholder}
                            defaultValue={(() => {
                              if (!initialData) return "";
                              const d = initialData.payload || {};
                              if (entityType === "PROJECT") {
                                if (field.name === "tech") return initialData.tags?.join(", ") || d.tags?.join(", ") || "";
                                if (field.name === "github") return initialData.repoUrl || d.repoUrl || "";
                              }
                              if (entityType === "RESOURCE") {
                                if (field.name === "tags") return initialData.tags?.join(", ") || d.tags?.join(", ") || "";
                                if (field.name === "category") return initialData.category || d.category || "";
                                if (field.name === "url") return initialData.url || d.url || "";
                              }
                              if (entityType === "EVENT") {
                                if (field.name === "date") {
                                  const dateVal = initialData.date || d.date;
                                  return dateVal ? new Date(dateVal).toISOString().split('T')[0] : "";
                                }
                                if (field.name === "location") return initialData.location || d.location || "";
                                if (field.name === "registrationLink") return initialData.registrationLink || d.registrationLink || "";
                              }
                              if (entityType === "VISUAL") {
                                if (field.name === "url") return initialData.url || d.url || "";
                                if (field.name === "category") return initialData.category || d.category || "";
                              }
                              return initialData[field.name] || d[field.name] || "";
                            })()}
                            className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm px-4 py-2.5 text-sm font-body text-[var(--color-cyber-light)] placeholder:text-[var(--color-cyber-muted)] outline-none focus:border-[var(--color-cyber-neon)] focus:bg-[var(--color-cyber-black)] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-mono file:bg-cyber-blue file:text-[var(--color-cyber-white)] hover:file:bg-cyber-neon"
                          />
                        )}
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
                          <span>PROCESSING...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 relative z-10">
                          {mode === 'propose' ? <Send className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                          <span>{getButtonLabel()}</span>
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
                    {mode === 'propose' ? 'PROPOSAL SUBMITTED!' : 'ENTRY SYNCHRONIZED!'}
                  </h3>
                  <p className="text-[var(--color-cyber-muted)] font-medium text-xs font-mono tracking-wider">
                    {getSuccessMessage()}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return require('react-dom').createPortal(modalContent, document.body);
}
