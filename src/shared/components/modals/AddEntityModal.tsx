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
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [selectedAlbumOption, setSelectedAlbumOption] = useState<string>("General");

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setStep(0);
      setSelectedAlbumOption(initialData?.album || initialData?.payload?.album || "General");
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      if (entityType === "VISUAL") {
        fetchApi('/events').then((res) => {
          if (res && res.success && Array.isArray(res.data)) {
            setEventsList(res.data);
          }
        }).catch((err) => console.error("Failed to load events for gallery modal", err));
      }
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen, entityType, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Extract form data
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Resolve album and eventId for VISUAL
    let resolvedAlbum = 'General';
    let resolvedEventId: string | undefined = undefined;

    if (entityType === 'VISUAL') {
      const albumChoice = data.albumSelection || selectedAlbumOption || 'General';
      if (albumChoice.startsWith('event:')) {
        const parts = albumChoice.split(':');
        resolvedEventId = parts[1];
        resolvedAlbum = parts.slice(2).join(':') || 'Event Album';
      } else if (albumChoice === 'custom') {
        resolvedAlbum = (data.customAlbum as string)?.trim() || 'General';
      } else {
        resolvedAlbum = albumChoice;
      }
    }

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
      let finalImageUrl = data.url;

      if (entityType === 'VISUAL' && data.image && (data.image as File).size > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', data.image);
        uploadFormData.append('caption', data.title || resolvedAlbum || 'Visual');
        uploadFormData.append('album', resolvedAlbum);
        if (resolvedEventId) {
          uploadFormData.append('eventId', resolvedEventId);
        }
        if (mode === 'add') {
          uploadFormData.append('directAdd', 'true');
        }

        const uploadRes = await fetchApi(`/gallery/upload`, {
          method: 'POST',
          body: uploadFormData
        });

        if (!uploadRes.success) {
          alert(uploadRes.error || 'Failed to upload image');
          setIsSubmitting(false);
          return;
        }

        if (mode === 'add') {
          setStep(1);
          setTimeout(() => onClose(), 1800);
          return;
        } else {
          finalImageUrl = uploadRes.data.url;
          data.title = data.title || uploadRes.data.filename;
        }
      } else if (data.imageFile && (data.imageFile as File).size > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', data.imageFile);
        uploadFormData.append('caption', data.name || data.title || 'Profile Image');

        const uploadRes = await fetchApi(`/gallery/upload`, {
          method: 'POST',
          body: uploadFormData
        });

        if (!uploadRes.success) {
          alert(uploadRes.error || 'Failed to upload image');
          setIsSubmitting(false);
          return;
        }

        data.image = uploadRes.data.url;
      }

      let endpoint = '';
      let payload: any = {};
      let isFormData = false;
      let method = 'POST';

      if (mode === 'propose') {
        // Member proposing — goes through submissions pipeline
        endpoint = `/submissions`;

        if (entityType === 'VISUAL') {
          payload = {
            type: 'gallery',
            title: data.title || 'Gallery Image',
            description: data.description || `Gallery image submission: ${data.title || 'Untitled'}`,
            payload: {
              url: finalImageUrl || '',
              caption: data.title || 'Gallery Image',
              album: resolvedAlbum,
              eventId: resolvedEventId,
              category: resolvedAlbum,
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
              url: finalImageUrl || initialData.payload?.url || '',
              caption: data.title,
              album: resolvedAlbum,
              eventId: resolvedEventId,
              category: resolvedAlbum
            }
          };
        } else {
          payload = {
            title: data.title || data.name,
            description: data.description,
            payload: data
          };
        }
      } else if (mode === 'edit' && initialData?._id) {
        method = 'PATCH';
        if (entityType === 'PROJECT') {
          endpoint = `/projects/${initialData._id}`;
          payload = {
            title: data.title,
            description: data.description,
            tags: data.tech ? data.tech.split(',').map((t: string) => t.trim()) : [],
            repoUrl: data.github
          };
        } else if (entityType === 'RESOURCE') {
          endpoint = `/resources/${initialData._id}`;
          payload = {
            title: data.title,
            description: data.description,
            category: data.category,
            tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [],
            url: data.url
          };
        } else if (entityType === 'EVENT') {
          endpoint = `/events/${initialData._id}`;
          payload = {
            title: data.title,
            description: data.description,
            date: data.date,
            location: data.location,
            type: data.eventType || 'other',
            registrationLink: data.registrationLink
          };
        } else if (entityType === 'NODE') {
          endpoint = `/team/${initialData._id}`;
          payload = {
            name: data.name,
            role: data.role,
            tier: data.tier,
            skills: data.skills,
            image: data.image,
            github: data.github,
            linkedin: data.linkedin,
            email: data.email
          };
        } else if (entityType === 'VISUAL') {
          endpoint = `/gallery/${initialData._id}`;
          payload = {
            caption: data.title,
            album: resolvedAlbum,
            eventId: resolvedEventId,
            url: finalImageUrl || initialData.url
          };
        }
      } else {
        // Direct Add
        if (entityType === 'PROJECT') {
          endpoint = `/projects`;
          payload = {
            title: data.title,
            description: data.description,
            tags: data.tech ? data.tech.split(',').map((t: string) => t.trim()) : [],
            repoUrl: data.github,
            isApproved: true
          };
        } else if (entityType === 'RESOURCE') {
          endpoint = `/resources`;
          payload = {
            title: data.title,
            description: data.description,
            category: data.category || 'other',
            tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [],
            url: data.url,
            isApproved: true
          };
        } else if (entityType === 'EVENT') {
          endpoint = `/events`;
          payload = {
            title: data.title,
            description: data.description,
            date: data.date,
            location: data.location,
            type: data.eventType || 'workshop',
            isPublished: true
          };
        } else if (entityType === 'NODE') {
          endpoint = `/team`;
          payload = {
            name: data.name,
            role: data.role,
            tier: data.tier || 'member',
            skills: data.skills,
            image: data.image,
            github: data.github,
            linkedin: data.linkedin,
            email: data.email
          };
        } else if (entityType === 'VISUAL') {
          endpoint = `/gallery`;
          payload = {
            title: data.title,
            caption: data.title,
            url: finalImageUrl,
            album: resolvedAlbum,
            eventId: resolvedEventId,
            category: resolvedAlbum
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
          {
            name: "tier",
            label: "Member Tier",
            options: [
              { value: "core", label: "Board Member (Core)" },
              { value: "lead", label: "Department Lead" },
              { value: "member", label: "Member" },
              { value: "mentor", label: "Mentor" },
            ]
          },
          { name: "imageFile", label: "Profile Image", placeholder: "https://...", type: "combined_image", optional: true },
          { name: "github", label: "GitHub URL", placeholder: "https://github.com/...", optional: true },
          { name: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/...", optional: true },
          { name: "email", label: "Email Address", placeholder: "operator@socs.org", optional: true },
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
      case "VISUAL": {
        const albumOptions = [
          { value: "General", label: "General Gallery (General / All Non-Event)" },
          ...eventsList.map(ev => ({
            value: `event:${ev._id}:${ev.title}`,
            label: `Event Album: ${ev.title}`
          })),
          { value: "custom", label: "+ Create Custom Album Name..." }
        ];

        const visualFields: any[] = [
          { name: "title", label: "Photo / Capture Title", placeholder: "e.g. Annual CTF Championship 2026", optional: true },
          { name: "description", label: "Description", placeholder: "Describe the image and context...", textarea: true, optional: true },
          {
            name: "albumSelection",
            label: "Target Album / Event",
            options: albumOptions,
            onChange: (e: any) => setSelectedAlbumOption(e.target.value)
          },
        ];

        if (selectedAlbumOption === 'custom') {
          visualFields.push({
            name: "customAlbum",
            label: "Custom Album Name",
            placeholder: "e.g. Infrastructure Setup, Hackfest 2025",
            optional: false
          });
        }

        visualFields.push(
          { name: "image", label: "Upload Image File (Local)", placeholder: "Select image file...", type: "file", optional: true },
          { name: "url", label: "Or Image URL (Link)", placeholder: "https://...", optional: true }
        );

        return visualFields;
      }
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
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Scrollable Container */}
          <div className="fixed inset-0 overflow-y-auto overflow-x-hidden overscroll-contain">
            <div
              className="min-h-full flex flex-col items-center justify-center p-4 sm:p-6"
              onClick={onClose}
            >
              {/* Modal Content */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg rounded-sm border border-[var(--color-cyber-gray)] shadow-2xl z-10 flex flex-col max-h-[90vh]"
                style={{ background: 'rgb(10, 12, 18)' }}
              >
                {/* Header */}
                <div className="bg-[var(--color-cyber-dark)] border-b border-[var(--color-cyber-gray)] px-4 py-2.5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-[var(--color-cyber-black)] text-[var(--color-cyber-neon)] border border-[var(--color-cyber-gray)] rounded-sm">
                      {mode === 'propose' ? <Send className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                    </div>
                    <span className="text-[11px] font-black font-heading tracking-widest text-[var(--color-cyber-white)] uppercase">
                      {mode === 'edit' ? 'EDIT' : mode === 'propose' ? 'PROPOSE' : 'ADD'} {mode !== 'edit' ? 'NEW' : ''} {entityType === 'VISUAL' ? 'GALLERY IMAGE' : entityType}
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-neon)] rounded-sm transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info banner for propose mode */}
                {mode === 'propose' && step === 0 && (
                  <div className="mx-3 mt-2 px-3 py-1.5 bg-[var(--color-tech-blue)]/10 border border-[var(--color-tech-blue)]/30 rounded-sm flex items-center gap-2 shrink-0">
                    <Shield className="w-3 h-3 text-[var(--color-tech-blue)] shrink-0" />
                    <p className="text-[10px] font-mono text-[var(--color-cyber-light)]">
                      Proposal will be reviewed by admin before publishing.
                    </p>
                  </div>
                )}

                {/* Form Area */}
                <div className="overflow-y-auto flex-1 px-3 py-2 overscroll-contain">
                  {step === 0 ? (
                    <form id="add-entity-form" onSubmit={handleSubmit} className="space-y-2">
                      <div className="grid gap-2">
                        {getFields().map((field: any) => (
                          <div key={field.name} className="space-y-0.5">
                            <label className="text-[9px] font-mono font-bold text-[var(--color-cyber-muted)] uppercase tracking-widest flex items-center gap-1">
                              {field.label}
                              {field.optional && <span className="opacity-50 normal-case tracking-normal font-normal">(opt)</span>}
                            </label>
                            {field.type === 'combined_image' ? (
                              <div className="border border-[var(--color-cyber-gray)] rounded-sm overflow-hidden bg-[var(--color-cyber-dark)]">
                                <div className="px-3 py-1.5">
                                  <p className="text-[8px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest mb-1">Upload File</p>
                                  <input
                                    type="file"
                                    name="imageFile"
                                    accept="image/*"
                                    className="w-full text-[11px] font-body text-[var(--color-cyber-light)] file:mr-2 file:py-0.5 file:px-2 file:rounded-sm file:border-0 file:text-[9px] file:font-mono file:bg-[var(--color-cyber-neon)]/20 file:text-[var(--color-cyber-neon)] hover:file:bg-[var(--color-cyber-neon)]/30 file:cursor-pointer outline-none"
                                  />
                                </div>
                                <div className="flex items-center gap-2 px-3">
                                  <div className="flex-1 h-px bg-[var(--color-cyber-gray)]" />
                                  <span className="text-[8px] font-mono text-[var(--color-cyber-muted)] uppercase">or</span>
                                  <div className="flex-1 h-px bg-[var(--color-cyber-gray)]" />
                                </div>
                                <div className="px-3 py-1.5">
                                  <p className="text-[8px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest mb-1">Image URL</p>
                                  <input
                                    type="text"
                                    name="image"
                                    placeholder="https://..."
                                    defaultValue={(() => {
                                      if (!initialData) return "";
                                      return initialData.image || initialData.payload?.image || "";
                                    })()}
                                    className="w-full bg-transparent border-b border-[var(--color-cyber-gray)] py-1 text-[11px] font-body text-[var(--color-cyber-light)] placeholder:text-[var(--color-cyber-muted)] outline-none focus:border-[var(--color-cyber-neon)] transition-all"
                                  />
                                </div>
                              </div>
                            ) : field.textarea ? (
                              <textarea
                                required={!field.optional && mode !== 'edit'}
                                name={field.name}
                                placeholder={field.placeholder}
                                rows={2}
                                defaultValue={(() => {
                                  if (!initialData) return "";
                                  return initialData[field.name] || initialData.payload?.[field.name] || "";
                                })()}
                                className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm px-2.5 py-1.5 text-xs font-body text-[var(--color-cyber-light)] placeholder:text-[var(--color-cyber-muted)] outline-none focus:border-[var(--color-cyber-neon)] transition-all resize-none"
                              />
                            ) : field.options ? (
                              <select
                                required={!field.optional && mode !== 'edit'}
                                name={field.name}
                                onChange={field.onChange}
                                defaultValue={(() => {
                                  if (field.name === 'albumSelection') {
                                    if (initialData?.eventId) {
                                      const evId = typeof initialData.eventId === 'object' ? initialData.eventId._id : initialData.eventId;
                                      return `event:${evId}:${initialData.album || initialData.eventId.title || ''}`;
                                    }
                                    if (initialData?.album && initialData.album !== 'General') {
                                      const foundEv = eventsList.find(e => e.title === initialData.album);
                                      if (foundEv) return `event:${foundEv._id}:${foundEv.title}`;
                                      return 'custom';
                                    }
                                    return 'General';
                                  }
                                  if (!initialData) return field.options[0]?.value || "";
                                  const d = initialData.payload || {};
                                  return initialData[field.name] || d[field.name] || field.options[0]?.value || "";
                                })()}
                                className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm px-2.5 py-1.5 text-xs font-body text-[var(--color-cyber-light)] outline-none focus:border-[var(--color-cyber-neon)] transition-all cursor-pointer"
                              >
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
                                className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm px-2.5 py-1.5 text-xs font-body text-[var(--color-cyber-light)] placeholder:text-[var(--color-cyber-muted)] outline-none focus:border-[var(--color-cyber-neon)] transition-all"
                              />
                            )}
                          </div>
                        ))}
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

                {/* Sticky submit button — always visible at bottom */}
                {step === 0 && (
                  <div className="shrink-0 px-3 pb-3 pt-2 border-t border-[var(--color-cyber-gray)]" style={{ background: 'rgb(10,12,18)' }}>
                    <button
                      type="submit"
                      form="add-entity-form"
                      disabled={isSubmitting}
                      className="btn-primary w-full py-2 text-[10px] font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-1.5 rounded-sm relative overflow-hidden"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-1.5 relative z-10">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>PROCESSING...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 relative z-10">
                          {mode === 'propose' ? <Send className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                          <span>{getButtonLabel()}</span>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return require('react-dom').createPortal(modalContent, document.body);
}
