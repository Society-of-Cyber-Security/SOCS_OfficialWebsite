"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { 
  Plus, 
  Trash2, 
  Star, 
  Folder, 
  FolderPlus,
  Grid3X3, 
  Search, 
  ArrowLeft, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Tag, 
  Layers,
  UploadCloud,
  CheckCircle2,
  FileImage,
  Loader2,
  ImageIcon
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { fetchApi } from "@/shared/lib/api";
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// BULK DRAG & DROP UPLOAD MODAL
// ==========================================
function BulkUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
  albums,
  events,
  defaultAlbum
}: {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (targetAlbum: string) => void;
  albums: any[];
  events: any[];
  defaultAlbum?: string | null;
}) {
  const [selectedAlbumChoice, setSelectedAlbumChoice] = useState<string>('General');
  const [customAlbumName, setCustomAlbumName] = useState<string>('');
  const [optionalCaption, setOptionalCaption] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string; id: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated, role } = useAuth();
  const isAdmin = isAuthenticated && (role === 'admin' || role === 'superadmin');

  useEffect(() => {
    if (isOpen) {
      setSelectedAlbumChoice(defaultAlbum || 'General');
      setCustomAlbumName('');
      setOptionalCaption('');
      setSelectedFiles([]);
      setIsUploading(false);
      setUploadProgress(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Clean up object URLs
      selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, defaultAlbum]);

  const handleFilesAdded = (files: FileList | File[]) => {
    const newItems: { file: File; preview: string; id: string }[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newItems.push({
          file,
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).substring(2, 9)
        });
      }
    });
    setSelectedFiles((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please select or drop at least one image to upload.");
      return;
    }

    let finalAlbum = 'General';
    let finalEventId: string | undefined = undefined;

    if (selectedAlbumChoice.startsWith('event:')) {
      const parts = selectedAlbumChoice.split(':');
      finalEventId = parts[1];
      finalAlbum = parts.slice(2).join(':') || 'Event Album';
    } else if (selectedAlbumChoice === '__custom__') {
      finalAlbum = customAlbumName.trim() || 'General';
    } else {
      finalAlbum = selectedAlbumChoice;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      selectedFiles.forEach((item) => {
        formData.append('images', item.file);
      });
      formData.append('album', finalAlbum);
      if (finalEventId) {
        formData.append('eventId', finalEventId);
      }
      if (optionalCaption.trim()) {
        formData.append('caption', optionalCaption.trim());
      }
      if (isAdmin) {
        formData.append('directAdd', 'true');
      }

      setUploadProgress(40);

      const res = await fetchApi('/gallery/upload', {
        method: 'POST',
        body: formData
      });

      setUploadProgress(90);

      if (res && res.success) {
        setUploadProgress(100);
        setTimeout(() => {
          onUploadComplete(finalAlbum);
          onClose();
        }, 600);
      } else {
        alert(res.error || 'Failed to upload images');
        setIsUploading(false);
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred during bulk upload');
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs"
          />

          <div className="fixed inset-0 overflow-y-auto overscroll-contain flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-sm border border-[var(--color-tech-blue)]/50 shadow-2xl z-10 flex flex-col max-h-[92vh] overflow-hidden bg-[rgb(10,12,18)]"
            >
              {/* Modal Header */}
              <div className="bg-[var(--color-cyber-dark)] border-b border-[var(--color-cyber-gray)] px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-[var(--color-cyber-black)] text-[var(--color-tech-blue)] border border-[var(--color-tech-blue)]/40 rounded-sm">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black font-heading tracking-widest text-[var(--color-cyber-white)] uppercase block">
                      BULK PHOTO UPLOADER // DRAG & DROP
                    </span>
                    <span className="text-[9px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-wider block">
                      Fast Multi-Capture Database Ingestion
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-[var(--color-cyber-muted)] hover:text-[var(--color-tech-blue)] rounded-sm transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form & Dropzone Area */}
              <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* Target Album Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-[var(--color-cyber-muted)] uppercase tracking-widest">
                      Destination Album
                    </label>
                    <select
                      value={selectedAlbumChoice}
                      onChange={(e) => setSelectedAlbumChoice(e.target.value)}
                      className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm px-3 py-2 text-xs font-body text-[var(--color-cyber-light)] outline-none focus:border-[var(--color-tech-blue)] transition-colors cursor-pointer"
                    >
                      <option value="General">General Gallery (No Event)</option>
                      {albums.filter(a => a.name.toLowerCase() !== 'general').map(a => (
                        <option key={a.name} value={a.name}>Album: {a.name}</option>
                      ))}
                      {events.map(ev => (
                        <option key={ev._id} value={`event:${ev._id}:${ev.title}`}>
                          Event: {ev.title}
                        </option>
                      ))}
                      <option value="__custom__">+ New Custom Album Name...</option>
                    </select>
                  </div>

                  {selectedAlbumChoice === '__custom__' ? (
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-[var(--color-cyber-muted)] uppercase tracking-widest">
                        New Album Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Server Migration 2026"
                        value={customAlbumName}
                        onChange={(e) => setCustomAlbumName(e.target.value)}
                        className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm px-3 py-2 text-xs font-body text-[var(--color-cyber-white)] placeholder:text-[var(--color-cyber-muted)] outline-none focus:border-[var(--color-tech-blue)] transition-colors"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-[var(--color-cyber-muted)] uppercase tracking-widest flex items-center justify-between">
                        <span>Global Caption Tag <span className="opacity-50 font-normal lowercase">(optional)</span></span>
                      </label>
                      <input
                        type="text"
                        placeholder="Auto-generated from filenames if blank"
                        value={optionalCaption}
                        onChange={(e) => setOptionalCaption(e.target.value)}
                        className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm px-3 py-2 text-xs font-body text-[var(--color-cyber-light)] placeholder:text-[var(--color-cyber-muted)] outline-none focus:border-[var(--color-tech-blue)] transition-colors"
                      />
                    </div>
                  )}
                </div>

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-sm p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? 'border-[var(--color-tech-blue)] bg-[var(--color-tech-blue)]/10 scale-[0.99] shadow-[0_0_25px_rgba(0,240,255,0.2)]'
                      : 'border-[var(--color-cyber-gray)] hover:border-[var(--color-tech-blue)]/60 bg-[var(--color-cyber-black)]/40 hover:bg-[var(--color-cyber-dark)]/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFilesAdded(e.target.files);
                      }
                    }}
                  />

                  <div className="w-12 h-12 rounded-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] flex items-center justify-center text-[var(--color-tech-blue)] mb-3 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <h4 className="text-sm font-heading font-bold text-[var(--color-cyber-white)] uppercase tracking-wide">
                    Drag & Drop Multiple Photos Here
                  </h4>
                  <p className="text-[11px] font-mono text-[var(--color-cyber-muted)] mt-1 max-w-sm">
                    or <span className="text-[var(--color-tech-blue)] underline underline-offset-2">browse files</span> from your device. No file size restrictions.
                  </p>
                </div>

                {/* Selected Files Preview Grid */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[var(--color-tech-blue)] uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{selectedFiles.length} {selectedFiles.length === 1 ? 'Photo' : 'Photos'} Ready for Ingestion</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="text-[10px] font-mono text-red-400 hover:underline uppercase tracking-wider cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto p-2 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm scrollbar-thin">
                      {selectedFiles.map((item, idx) => (
                        <div key={item.id} className="relative group aspect-square rounded-sm overflow-hidden border border-[var(--color-cyber-gray)] bg-[var(--color-cyber-black)]">
                          <img
                            src={item.preview}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(item.id);
                            }}
                            className="absolute top-1 right-1 p-1 bg-black/80 text-red-400 hover:text-red-300 rounded-sm opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1 py-0.5 text-[8px] font-mono text-[var(--color-cyber-light)] truncate">
                            {item.file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {isUploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase">
                      <span>Synchronizing Visual Database...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--color-cyber-dark)] rounded-full overflow-hidden border border-[var(--color-cyber-gray)]">
                      <motion.div
                        className="h-full bg-[var(--color-tech-blue)]"
                        style={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-3 border-t border-[var(--color-cyber-gray)] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isUploading}
                    className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] rounded-sm cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isUploading || selectedFiles.length === 0}
                    className="btn-primary px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 rounded-sm cursor-pointer disabled:opacity-40"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>INGESTING {selectedFiles.length} PHOTOS...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>UPLOAD {selectedFiles.length > 0 ? `${selectedFiles.length} PHOTOS` : 'PHOTOS'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// DEDICATED CREATE ALBUM MODAL
// ==========================================
function CreateAlbumModal({
  isOpen,
  onClose,
  onAlbumCreated,
  events
}: {
  isOpen: boolean;
  onClose: () => void;
  onAlbumCreated: (albumName: string) => void;
  events: any[];
}) {
  const [albumName, setAlbumName] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, role } = useAuth();
  const isAdmin = isAuthenticated && (role === 'admin' || role === 'superadmin');

  useEffect(() => {
    if (isOpen) {
      setAlbumName('');
      setSelectedEventId('');
      setCaption('');
      setImageUrl('');
      setImageFile(null);
      setIsSubmitting(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleEventSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedEventId(val);
    if (val && !albumName) {
      const selected = events.find(ev => ev._id === val);
      if (selected) {
        setAlbumName(selected.title);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAlbumName = albumName.trim();
    if (!finalAlbumName) {
      alert("Please provide a name for the new album.");
      return;
    }

    if (!imageFile && !imageUrl) {
      alert("Please select or drop a cover image for the album.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalUrl = imageUrl;

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        uploadFormData.append('caption', caption || `${finalAlbumName} Cover`);
        uploadFormData.append('album', finalAlbumName);
        if (selectedEventId) {
          uploadFormData.append('eventId', selectedEventId);
        }
        if (isAdmin) {
          uploadFormData.append('directAdd', 'true');
        }

        const uploadRes = await fetchApi('/gallery/upload', {
          method: 'POST',
          body: uploadFormData
        });

        if (!uploadRes.success) {
          alert(uploadRes.error || 'Failed to upload cover image');
          setIsSubmitting(false);
          return;
        }

        if (isAdmin) {
          onAlbumCreated(finalAlbumName);
          onClose();
          return;
        } else {
          finalUrl = uploadRes.data.url;
        }
      }

      if (isAdmin) {
        const createRes = await fetchApi('/gallery', {
          method: 'POST',
          body: JSON.stringify({
            title: caption || `${finalAlbumName} Cover`,
            caption: caption || `${finalAlbumName} Cover`,
            album: finalAlbumName,
            eventId: selectedEventId || undefined,
            url: finalUrl
          })
        });

        if (createRes.success) {
          onAlbumCreated(finalAlbumName);
          onClose();
        } else {
          alert(createRes.error || 'Failed to initialize album');
        }
      } else {
        const propRes = await fetchApi('/submissions', {
          method: 'POST',
          body: JSON.stringify({
            type: 'gallery',
            title: `${finalAlbumName} (New Album)`,
            description: `Proposal for new album: ${finalAlbumName}`,
            payload: {
              url: finalUrl,
              caption: caption || `${finalAlbumName} Cover`,
              album: finalAlbumName,
              eventId: selectedEventId || undefined,
              filename: finalAlbumName.toLowerCase().replace(/\s+/g, '-')
            }
          })
        });

        if (propRes.success) {
          alert('Album proposal submitted! Awaiting administrator approval.');
          onClose();
        } else {
          alert(propRes.error || 'Failed to submit proposal');
        }
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while creating album');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
          />

          <div className="fixed inset-0 overflow-y-auto overscroll-contain flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-sm border border-[var(--color-tech-blue)]/50 shadow-2xl z-10 flex flex-col overflow-hidden bg-[rgb(10,12,18)]"
            >
              {/* Modal Header */}
              <div className="bg-[var(--color-cyber-dark)] border-b border-[var(--color-cyber-gray)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[var(--color-cyber-black)] text-[var(--color-tech-blue)] border border-[var(--color-tech-blue)]/40 rounded-sm">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black font-heading tracking-widest text-[var(--color-cyber-white)] uppercase block">
                      CREATE NEW EVENT ALBUM
                    </span>
                    <span className="text-[9px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-wider block">
                      Archive Visual Collection Initializer
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-[var(--color-cyber-muted)] hover:text-[var(--color-tech-blue)] rounded-sm transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-[var(--color-cyber-muted)] uppercase tracking-widest flex items-center justify-between">
                    <span>Album Title / Collection Name <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HackShield CTF 2026, Core Induction"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm px-3 py-2 text-xs font-body text-[var(--color-cyber-white)] placeholder:text-[var(--color-cyber-muted)] outline-none focus:border-[var(--color-tech-blue)] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-[var(--color-cyber-muted)] uppercase tracking-widest">
                    Link to Scheduled Event (Optional)
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={handleEventSelect}
                    className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] rounded-sm px-3 py-2 text-xs font-body text-[var(--color-cyber-light)] outline-none focus:border-[var(--color-tech-blue)] transition-colors cursor-pointer"
                  >
                    <option value="">No Event Link (Standalone Collection)</option>
                    {events.map((ev) => (
                      <option key={ev._id} value={ev._id} className="bg-[var(--color-cyber-black)] text-[var(--color-cyber-light)]">
                        {ev.title} ({new Date(ev.date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-[var(--color-cyber-muted)] uppercase tracking-widest">
                    Cover / Initial Image <span className="text-red-400">*</span>
                  </label>
                  <div className="border border-[var(--color-cyber-gray)] rounded-sm bg-[var(--color-cyber-dark)] p-3 space-y-2">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full text-[11px] font-body text-[var(--color-cyber-light)] file:mr-2 file:py-1 file:px-2.5 file:rounded-sm file:border-0 file:text-[9px] file:font-mono file:bg-[var(--color-tech-blue)]/20 file:text-[var(--color-tech-blue)] hover:file:bg-[var(--color-tech-blue)]/30 file:cursor-pointer outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-[var(--color-cyber-gray)]" />
                      <span className="text-[8px] font-mono text-[var(--color-cyber-muted)] uppercase">or URL</span>
                      <div className="flex-1 h-px bg-[var(--color-cyber-gray)]" />
                    </div>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-transparent border-b border-[var(--color-cyber-gray)] py-1 text-[11px] font-body text-[var(--color-cyber-light)] placeholder:text-[var(--color-cyber-muted)] outline-none focus:border-[var(--color-tech-blue)] transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-[var(--color-cyber-gray)]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] rounded-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary px-5 py-2 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 rounded-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>CREATING ALBUM...</span>
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>INITIALIZE ALBUM</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// MAIN GALLERY PAGE COMPONENT
// ==========================================
export default function GalleryPage() {
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'albums'>('all');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  
  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { isAuthenticated, role } = useAuth();
  const isAdmin = isAuthenticated && (role === 'admin' || role === 'superadmin');

  // Load gallery images and events
  const loadGalleryData = async () => {
    try {
      setIsLoading(true);
      const [galleryRes, eventsRes] = await Promise.all([
        fetchApi('/gallery'),
        fetchApi('/events')
      ]);

      if (galleryRes && galleryRes.success) {
        setImages(galleryRes.data || []);
      } else {
        setImages([]);
      }

      if (eventsRes && eventsRes.success) {
        setEvents(eventsRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load gallery data", err);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryData();
  }, [isBulkModalOpen, isCreateAlbumOpen]);

  // Group images into albums
  const albums = useMemo(() => {
    const map = new Map<string, {
      name: string;
      images: any[];
      coverImage: string;
      eventId?: any;
      latestDate: string;
    }>();

    images.forEach((img) => {
      const albumName = img.album?.trim() || 'General';
      const existing = map.get(albumName);

      if (!existing) {
        map.set(albumName, {
          name: albumName,
          images: [img],
          coverImage: img.url,
          eventId: img.eventId,
          latestDate: img.createdAt || new Date().toISOString()
        });
      } else {
        existing.images.push(img);
        if (img.isFeatured && !existing.coverImage) {
          existing.coverImage = img.url;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.name.toLowerCase() === 'general') return -1;
      if (b.name.toLowerCase() === 'general') return 1;
      return b.images.length - a.images.length;
    });
  }, [images]);

  // Filtered images based on current tab, active album, filters, and search
  const displayedImages = useMemo(() => {
    return images.filter((img) => {
      if (selectedAlbum) {
        const imgAlbum = img.album?.trim() || 'General';
        if (imgAlbum.toLowerCase() !== selectedAlbum.toLowerCase()) return false;
      } else if (selectedCategoryFilter !== 'all') {
        const imgAlbum = img.album?.trim() || 'General';
        if (imgAlbum.toLowerCase() !== selectedCategoryFilter.toLowerCase()) return false;
      }

      if (featuredOnly && !img.isFeatured) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCaption = img.caption?.toLowerCase().includes(query);
        const matchAlbum = img.album?.toLowerCase().includes(query);
        const matchUploader = img.uploadedBy?.name?.toLowerCase().includes(query);
        if (!matchCaption && !matchAlbum && !matchUploader) return false;
      }

      return true;
    });
  }, [images, selectedAlbum, selectedCategoryFilter, featuredOnly, searchQuery]);

  // Lightbox navigation
  const openLightbox = (image: any) => {
    const index = displayedImages.findIndex(i => i._id === image._id);
    if (index !== -1) setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const prevLightboxImage = useCallback(() => {
    if (lightboxIndex === null || displayedImages.length === 0) return;
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : displayedImages.length - 1));
  }, [lightboxIndex, displayedImages.length]);

  const nextLightboxImage = useCallback(() => {
    if (lightboxIndex === null || displayedImages.length === 0) return;
    setLightboxIndex((prev) => (prev! < displayedImages.length - 1 ? prev! + 1 : 0));
  }, [lightboxIndex, displayedImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLightboxImage();
      if (e.key === 'ArrowRight') nextLightboxImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, prevLightboxImage, nextLightboxImage]);

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this capture?')) return;
    try {
      const result = await fetchApi(`/gallery/${id}`, { method: 'DELETE' });
      if (result.success) {
        setImages(prev => prev.filter(img => img._id !== id));
        if (lightboxIndex !== null) closeLightbox();
      } else {
        alert(result.error || 'Failed to delete');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting image');
    }
  };

  // Handle Feature Toggle
  const handleToggleFeature = async (id: string, currentStatus: boolean) => {
    try {
      const result = await fetchApi(`/gallery/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isFeatured: !currentStatus })
      });
      if (result.success) {
        setImages(prev => prev.map(img => img._id === id ? { ...img, isFeatured: !currentStatus } : img));
      } else {
        alert(result.error || 'Failed to update feature status');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating capture');
    }
  };

  const handleAlbumCreated = (newAlbumName: string) => {
    loadGalleryData();
    setSelectedAlbum(newAlbumName);
    setActiveTab('all');
  };

  const handleBulkUploadComplete = (targetAlbum: string) => {
    loadGalleryData();
    if (targetAlbum && targetAlbum !== 'General') {
      setSelectedAlbum(targetAlbum);
      setActiveTab('all');
    }
  };

  const activeAlbumData = useMemo(() => {
    if (!selectedAlbum) return null;
    return albums.find(a => a.name.toLowerCase() === selectedAlbum.toLowerCase()) || null;
  }, [selectedAlbum, albums]);

  return (
    <PageWrapper className="pt-24 pb-32">
      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onUploadComplete={handleBulkUploadComplete}
        albums={albums}
        events={events}
        defaultAlbum={selectedAlbum}
      />

      {/* Create New Album Modal */}
      <CreateAlbumModal
        isOpen={isCreateAlbumOpen}
        onClose={() => setIsCreateAlbumOpen(false)}
        onAlbumCreated={handleAlbumCreated}
        events={events}
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 z-10 relative">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[var(--color-cyber-gray)] gap-6 relative mb-8">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] mb-3">
              <span className="w-2 h-2 rounded-full bg-[var(--color-tech-blue)] animate-ping" />
              <span>Visual Archive Database // v2.4</span>
            </div>
            <h1 className="font-heading font-black text-[clamp(2.5rem,6vw,5.5rem)] text-cyber-blue tracking-tighter leading-[0.95]">
              Event & Team <br className="hidden sm:block" /> Gallery
            </h1>
            <p className="font-body text-sm md:text-base text-[var(--color-cyber-light)] mt-4 max-w-2xl leading-relaxed">
              Archived captures of hackathons, cybersecurity operations, workshops, infrastructure deployments, and community operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-end shrink-0">
            {/* Create New Album Button */}
            <button
              onClick={() => setIsCreateAlbumOpen(true)}
              className="btn-outline px-4 py-2.5 text-xs uppercase tracking-widest flex items-center justify-center rounded-sm cursor-pointer hover:border-[var(--color-tech-blue)] hover:text-[var(--color-tech-blue)] transition-all"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              <span>+ New Album</span>
            </button>

            {/* Bulk Upload Capture Button */}
            {isAdmin && (
              <button 
                onClick={() => setIsBulkModalOpen(true)}
                className="btn-primary px-5 py-2.5 text-xs uppercase tracking-widest flex items-center justify-center rounded-sm cursor-pointer shadow-[0_0_15px_rgba(0,255,157,0.2)] hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                <span>Upload Photos</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher & Filter Bar */}
        <div className="bg-[var(--color-cyber-dark)]/80 border border-[var(--color-cyber-gray)] p-3 rounded-sm mb-8 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Main View Mode Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] rounded-sm shrink-0">
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSelectedAlbum(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                  activeTab === 'all' && !selectedAlbum
                    ? 'bg-[var(--color-tech-blue)] text-[var(--color-cyber-black)] shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] hover:bg-[var(--color-cyber-dark)]'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>General Gallery ({images.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('albums');
                  setSelectedAlbum(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                  activeTab === 'albums' && !selectedAlbum
                    ? 'bg-[var(--color-tech-blue)] text-[var(--color-cyber-black)] shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] hover:bg-[var(--color-cyber-dark)]'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Event Albums ({albums.length})</span>
              </button>
            </div>

            {/* Search & Refinement Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-cyber-muted)]" />
                <input
                  type="text"
                  placeholder="Search captures, albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] rounded-sm pl-8 pr-3 py-1.5 text-xs font-body text-[var(--color-cyber-light)] placeholder:text-[var(--color-cyber-muted)] outline-none focus:border-[var(--color-tech-blue)] transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Featured Toggle */}
              <button
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm border transition-all cursor-pointer ${
                  featuredOnly
                    ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-400'
                    : 'bg-[var(--color-cyber-black)] border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)]'
                }`}
                title="Show only featured captures"
              >
                <Star className={`w-3.5 h-3.5 ${featuredOnly ? 'fill-yellow-400' : ''}`} />
                <span>Featured</span>
              </button>
            </div>
          </div>

          {/* Quick Album Filter Pills */}
          {activeTab === 'all' && !selectedAlbum && albums.length > 1 && (
            <div className="mt-3 pt-3 border-t border-[var(--color-cyber-gray)]/50 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest shrink-0 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Filter Album:
              </span>
              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase rounded-sm border whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryFilter === 'all'
                    ? 'border-[var(--color-tech-blue)] bg-[var(--color-tech-blue)]/20 text-[var(--color-cyber-white)] font-bold'
                    : 'border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-light)] hover:border-[var(--color-cyber-light)]/40'
                }`}
              >
                All Albums ({images.length})
              </button>
              {albums.map((album) => (
                <button
                  key={album.name}
                  onClick={() => setSelectedCategoryFilter(album.name)}
                  className={`px-2.5 py-1 text-[10px] font-mono uppercase rounded-sm border whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategoryFilter === album.name
                      ? 'border-[var(--color-tech-blue)] bg-[var(--color-tech-blue)]/20 text-[var(--color-cyber-white)] font-bold'
                      : 'border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-light)] hover:border-[var(--color-cyber-light)]/40'
                  }`}
                >
                  {album.name} ({album.images.length})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Album Breadcrumb / Banner */}
        {selectedAlbum && activeAlbumData && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-[var(--color-cyber-dark)] border border-[var(--color-tech-blue)]/40 rounded-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[var(--color-tech-blue)]/10 to-transparent pointer-events-none" />
            
            <div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="flex items-center gap-1.5 text-xs font-mono text-[var(--color-tech-blue)] hover:underline mb-3 cursor-pointer uppercase tracking-widest"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to All Albums</span>
              </button>
              <div className="flex items-center gap-3">
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-[var(--color-cyber-white)] tracking-tight uppercase">
                  {activeAlbumData.name}
                </h2>
                {activeAlbumData.eventId?.type && (
                  <span className="px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-[var(--color-cyber-black)] border border-[var(--color-tech-blue)]/40 text-[var(--color-tech-blue)] rounded-sm font-bold">
                    {activeAlbumData.eventId.type}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-[var(--color-cyber-muted)] mt-1 flex items-center gap-3">
                <span>{activeAlbumData.images.length} Captures in this collection</span>
                {activeAlbumData.eventId?.location && (
                  <span>• Venue: {activeAlbumData.eventId.location}</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="btn-primary px-4 py-2 text-xs uppercase tracking-widest flex items-center gap-2 self-start md:self-auto rounded-sm cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>+ Upload Photos to this Album</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 1: EVENT ALBUMS GRID */}
        {activeTab === 'albums' && !selectedAlbum && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-[var(--color-tech-blue)]" />
                <span>Organized Event Collections ({albums.length})</span>
              </h3>
            </div>

            {isLoading ? (
              <div className="py-24 text-center">
                <p className="text-[var(--color-cyber-muted)] font-mono text-sm tracking-widest uppercase animate-pulse">
                  Decrypting Visual Archives...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Create New Album Action Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setIsCreateAlbumOpen(true)}
                  className="group relative border-2 border-dashed border-[var(--color-cyber-gray)] hover:border-[var(--color-tech-blue)] rounded-sm bg-[var(--color-cyber-black)]/20 hover:bg-[var(--color-tech-blue)]/5 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[260px] p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] group-hover:border-[var(--color-tech-blue)] group-hover:scale-110 flex items-center justify-center text-[var(--color-tech-blue)] mb-4 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                    <FolderPlus className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-black text-sm text-[var(--color-cyber-white)] group-hover:text-[var(--color-tech-blue)] uppercase tracking-wider transition-colors">
                    + Create New Album
                  </h4>
                  <p className="text-[11px] font-mono text-[var(--color-cyber-muted)] mt-2 max-w-[200px] leading-relaxed">
                    Initialize a dedicated album collection for a hackathon or event.
                  </p>
                  <span className="mt-4 px-3 py-1 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] group-hover:border-[var(--color-tech-blue)] text-[9px] font-mono text-[var(--color-tech-blue)] tracking-widest uppercase rounded-sm">
                    START ALBUM
                  </span>
                </motion.div>

                {albums.map((album, idx) => (
                  <motion.div
                    key={album.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    onClick={() => setSelectedAlbum(album.name)}
                    className="group stealth-card overflow-hidden border border-[var(--color-cyber-gray)] hover:border-[var(--color-tech-blue)] rounded-sm bg-[var(--color-cyber-black)]/40 cursor-pointer transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,240,255,0.15)] flex flex-col"
                  >
                    {/* Album Cover & Preview Collage */}
                    <div className="aspect-[16/11] overflow-hidden relative bg-[var(--color-cyber-dark)] border-b border-[var(--color-cyber-gray)] group-hover:border-[var(--color-tech-blue)]/50 transition-colors">
                      <img
                        src={album.coverImage}
                        alt={album.name}
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-cyber-black)] via-transparent to-transparent opacity-80" />

                      <div className="absolute bottom-3 left-3 bg-[var(--color-cyber-black)]/90 backdrop-blur-md px-2.5 py-1 border border-[var(--color-cyber-gray)] text-[10px] font-mono tracking-widest text-[var(--color-cyber-white)] uppercase rounded-sm flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-[var(--color-tech-blue)]" />
                        <span>{album.images.length} {album.images.length === 1 ? 'Capture' : 'Captures'}</span>
                      </div>

                      {album.name.toLowerCase() === 'general' ? (
                        <div className="absolute top-3 right-3 bg-[var(--color-cyber-gray)]/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono tracking-widest text-[var(--color-cyber-white)] uppercase rounded-sm font-bold">
                          General
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-[var(--color-tech-blue)]/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono tracking-widest text-[var(--color-cyber-black)] uppercase rounded-sm font-bold">
                          Event Album
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-heading font-bold text-base text-[var(--color-cyber-white)] group-hover:text-[var(--color-tech-blue)] transition-colors uppercase tracking-tight line-clamp-1">
                          {album.name}
                        </h4>
                        <p className="text-[11px] font-mono text-[var(--color-cyber-muted)] mt-1">
                          {album.images[0]?.caption || 'Event visual archive'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[var(--color-cyber-gray)]/40 flex items-center justify-between text-[10px] font-mono text-[var(--color-cyber-muted)]">
                        <span>VIEW ALBUM →</span>
                        <span className="text-[var(--color-tech-blue)] group-hover:translate-x-1 transition-transform">EXPLORE</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: GENERAL GALLERY & SINGLE ALBUM PHOTO GRID */}
        {(activeTab === 'all' || selectedAlbum) && (
          <div>
            {isLoading ? (
              <div className="py-24 text-center">
                <p className="text-[var(--color-cyber-muted)] font-mono text-sm tracking-widest uppercase animate-pulse">
                  Decrypting Visual Data...
                </p>
              </div>
            ) : displayedImages.length === 0 ? (
              <div className="py-24 text-center border border-[var(--color-cyber-gray)] border-dashed rounded-sm">
                <p className="text-[var(--color-cyber-muted)] font-mono text-sm tracking-widest uppercase">
                  No visual captures match your current selection.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedImages.map((img, idx) => (
                  <motion.div 
                    key={img._id || idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.4) }}
                    className="stealth-card overflow-hidden group border border-[var(--color-cyber-gray)] rounded-sm flex flex-col bg-[var(--color-cyber-black)]/30 hover:border-[var(--color-tech-blue)]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]"
                  >
                    {/* Image Container */}
                    <div 
                      onClick={() => openLightbox(img)}
                      className="aspect-[16/10] overflow-hidden border-b border-[var(--color-cyber-gray)] relative bg-[var(--color-cyber-dark)] cursor-pointer group-hover:border-[var(--color-tech-blue)]/30"
                    >
                      <img 
                        src={img.url} 
                        alt={img.caption || 'Gallery visual'}
                        className="w-full h-full object-cover grayscale opacity-90 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100"
                      />

                      {/* Album badge */}
                      <div className="absolute top-3 right-3 bg-[var(--color-cyber-black)]/90 backdrop-blur-md px-2.5 py-1 border border-[var(--color-cyber-gray)] text-[9px] font-mono tracking-widest text-[var(--color-cyber-white)] uppercase rounded-sm">
                        {img.album || 'General'}
                      </div>

                      {/* Featured badge */}
                      {img.isFeatured && (
                        <div className="absolute top-3 left-3 bg-yellow-500/90 backdrop-blur-md px-2 py-0.5 text-[8px] font-mono tracking-widest text-[var(--color-cyber-black)] uppercase rounded-sm font-bold flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          Featured
                        </div>
                      )}

                      {/* Quick click zoom hint */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1 bg-[var(--color-cyber-black)]/80 border border-[var(--color-tech-blue)] text-[10px] font-mono text-[var(--color-tech-blue)] tracking-widest uppercase rounded-sm">
                          ENLARGE
                        </span>
                      </div>
                    </div>

                    {/* Content info */}
                    <div className="p-4 relative z-10 flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h3 
                            onClick={() => openLightbox(img)}
                            className="text-sm font-heading font-bold text-[var(--color-cyber-white)] tracking-tight leading-tight uppercase hover:text-[var(--color-tech-blue)] transition-colors cursor-pointer"
                          >
                            {img.caption || 'Verified Capture'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-[var(--color-cyber-muted)]">
                            <span className="text-[var(--color-cyber-light)]/70">{img.album || 'General Archive'}</span>
                            {img.createdAt && (
                              <>
                                <span>•</span>
                                <span>{new Date(img.createdAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Admin quick controls */}
                        {isAdmin && img._id && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleToggleFeature(img._id, !!img.isFeatured);
                              }}
                              className={`p-1.5 bg-[var(--color-cyber-dark)] border rounded-sm transition-colors cursor-pointer ${
                                img.isFeatured 
                                  ? 'border-yellow-500/50 text-yellow-500 hover:text-yellow-600 hover:border-yellow-600' 
                                  : 'border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)] hover:text-yellow-500 hover:border-yellow-500'
                              }`}
                              title={img.isFeatured ? "Unfeature Image" : "Feature Image"}
                            >
                              <Star className={`w-3.5 h-3.5 ${img.isFeatured ? 'fill-yellow-500' : ''}`} />
                            </button>

                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(img._id);
                              }} 
                              className="p-1.5 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] hover:border-red-500 text-[var(--color-cyber-muted)] hover:text-red-500 rounded-sm transition-colors cursor-pointer"
                              title="Delete Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FULLSCREEN CYBER LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxIndex !== null && displayedImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex flex-col justify-between bg-black/95 backdrop-blur-xl"
            onClick={closeLightbox}
          >
            {/* Lightbox Top Bar */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full px-4 py-3 bg-[var(--color-cyber-black)]/90 border-b border-[var(--color-cyber-gray)] flex items-center justify-between z-20"
            >
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-[var(--color-tech-blue)]/20 border border-[var(--color-tech-blue)] text-[var(--color-tech-blue)] rounded-sm">
                  {displayedImages[lightboxIndex].album || 'General'}
                </span>
                <span className="text-xs font-mono text-[var(--color-cyber-muted)]">
                  CAPTURE {lightboxIndex + 1} OF {displayedImages.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={displayedImages[lightboxIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] border border-[var(--color-cyber-gray)] rounded-sm hover:border-[var(--color-cyber-light)] transition-colors"
                  title="Open full image in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={closeLightbox}
                  className="p-2 text-[var(--color-cyber-muted)] hover:text-red-400 border border-[var(--color-cyber-gray)] rounded-sm hover:border-red-400 transition-colors cursor-pointer"
                  title="Close viewer (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Main Image & Navigation */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none"
            >
              {displayedImages.length > 1 && (
                <button
                  onClick={prevLightboxImage}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 bg-[var(--color-cyber-black)]/80 hover:bg-[var(--color-tech-blue)] hover:text-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] text-[var(--color-cyber-white)] rounded-sm transition-all cursor-pointer shadow-2xl"
                  title="Previous (Arrow Left)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              <motion.img
                key={displayedImages[lightboxIndex]._id || lightboxIndex}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={displayedImages[lightboxIndex].url}
                alt={displayedImages[lightboxIndex].caption || 'Enlarged visual'}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-sm border border-[var(--color-cyber-gray)] shadow-2xl"
              />

              {displayedImages.length > 1 && (
                <button
                  onClick={nextLightboxImage}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 bg-[var(--color-cyber-black)]/80 hover:bg-[var(--color-tech-blue)] hover:text-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] text-[var(--color-cyber-white)] rounded-sm transition-all cursor-pointer shadow-2xl"
                  title="Next (Arrow Right)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Lightbox Bottom Info Bar */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full px-6 py-4 bg-[var(--color-cyber-black)]/90 border-t border-[var(--color-cyber-gray)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-20"
            >
              <div>
                <h3 className="font-heading font-black text-lg text-[var(--color-cyber-white)] uppercase tracking-tight">
                  {displayedImages[lightboxIndex].caption || 'Verified Capture'}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--color-cyber-muted)] mt-1">
                  <span>Album: {displayedImages[lightboxIndex].album || 'General'}</span>
                  {displayedImages[lightboxIndex].uploadedBy?.name && (
                    <span>• Logged by: {displayedImages[lightboxIndex].uploadedBy.name}</span>
                  )}
                  {displayedImages[lightboxIndex].createdAt && (
                    <span>• Date: {new Date(displayedImages[lightboxIndex].createdAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {isAdmin && displayedImages[lightboxIndex]._id && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFeature(
                      displayedImages[lightboxIndex]._id, 
                      !!displayedImages[lightboxIndex].isFeatured
                    )}
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      displayedImages[lightboxIndex].isFeatured
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                        : 'border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)] hover:text-yellow-400 hover:border-yellow-400'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${displayedImages[lightboxIndex].isFeatured ? 'fill-yellow-400' : ''}`} />
                    <span>{displayedImages[lightboxIndex].isFeatured ? 'Featured' : 'Feature'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(displayedImages[lightboxIndex]._id)}
                    className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm border border-red-500/40 hover:border-red-500 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
