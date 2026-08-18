"use client";

import React, { useState, useCallback } from "react";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { UploadCloud, CheckCircle2, AlertCircle, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/shared/components/auth/ProtectedRoute";

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    // Only accept images for this demo
    if (!selectedFile.type.startsWith("image/")) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }
    setFile(selectedFile);
    setStatus("idle");
  };

  const handleUpload = () => {
    if (!file) return;
    setStatus("uploading");
    
    // Simulate upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setStatus("success");
          setTimeout(() => {
            setFile(null);
            setProgress(0);
            setStatus("idle");
          }, 3000);
        }, 500);
      } else {
        setProgress(currentProgress);
      }
    }, 300);
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <PageWrapper className="pt-24 pb-32">
        <div className="w-full max-w-[1000px] mx-auto px-6 lg:px-12 z-10 relative flex flex-col items-center">
          
          {/* Header */}
          <div className="text-center mb-16 relative">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] mb-4">
              Intel Submission
            </div>
            <h1 className="font-heading font-black text-[clamp(3.5rem,7vw,6.5rem)] text-cyber-blue tracking-tighter leading-[0.9] mb-6">
              Upload Visuals
            </h1>
            <p className="max-w-xl mx-auto text-[var(--color-cyber-light)] font-body text-sm md:text-base leading-relaxed">
              Submit captures from recent events, hackathons, and infrastructure upgrades to the visual archive.
            </p>
          </div>

          {/* Upload Terminal */}
          <div className="w-full max-w-2xl bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] p-8 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between border-b border-[var(--color-cyber-gray)] pb-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-cyber-red rounded-full animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-cyber-muted)]">Secure Upload Gateway</span>
              </div>
              <span className="font-mono text-[10px] text-[var(--color-cyber-muted)]">v2.1.4</span>
            </div>

            <AnimatePresence mode="wait">
              {!file && (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`relative border-2 border-dashed transition-all duration-300 rounded-sm flex flex-col items-center justify-center p-16 text-center ${
                    isDragging 
                      ? "border-cyber-blue bg-cyber-blue/5" 
                      : "border-[var(--color-cyber-gray)] hover:border-[var(--color-cyber-muted)] bg-[var(--color-cyber-dark)]"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={handleFileInput}
                  />
                  <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragging ? "text-cyber-blue" : "text-[var(--color-cyber-muted)]"}`} />
                  <h3 className="font-heading font-bold text-xl text-[var(--color-cyber-white)] mb-2 tracking-tighter">
                    Drag & Drop Image
                  </h3>
                  <p className="font-mono text-xs text-[var(--color-cyber-muted)] uppercase tracking-widest">
                    or click to browse local files
                  </p>
                  <p className="font-mono text-[9px] text-[var(--color-cyber-muted)] mt-6 border border-[var(--color-cyber-gray)] px-3 py-1 rounded-sm">
                    SUPPORTED: JPG, PNG, WEBP (MAX 5MB)
                  </p>
                </motion.div>
              )}

              {file && (
                <motion.div
                  key="file-preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full space-y-6"
                >
                  {/* File Info */}
                  <div className="flex items-center gap-4 bg-[var(--color-cyber-dark)] p-4 border border-[var(--color-cyber-gray)] rounded-sm">
                    <div className="p-3 bg-[var(--color-cyber-black)] rounded-sm border border-[var(--color-cyber-gray)]">
                      <ImageIcon className="w-6 h-6 text-cyber-blue" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-heading font-bold text-[var(--color-cyber-white)] truncate tracking-tighter">{file.name}</h4>
                      <span className="font-mono text-[10px] text-[var(--color-cyber-muted)] uppercase tracking-widest">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    {status === "idle" && (
                      <button onClick={() => setFile(null)} className="p-2 hover:bg-[var(--color-cyber-black)] hover:text-cyber-red transition-colors text-[var(--color-cyber-muted)] rounded-sm">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Progress / Status */}
                  {status === "uploading" && (
                    <div className="space-y-2">
                      <div className="flex justify-between font-mono text-[10px] text-cyber-blue uppercase tracking-widest">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1 bg-[var(--color-cyber-dark)] w-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-cyber-blue"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ ease: "linear" }}
                        />
                      </div>
                    </div>
                  )}

                  {status === "success" && (
                    <div className="flex items-center gap-3 p-4 border border-cyber-green/30 bg-cyber-green/5 text-cyber-green rounded-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-mono text-xs uppercase tracking-widest">Upload Complete! Saved to archive.</span>
                    </div>
                  )}

                  {status === "error" && (
                    <div className="flex items-center gap-3 p-4 border border-cyber-red/30 bg-cyber-red/5 text-cyber-red rounded-sm">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-mono text-xs uppercase tracking-widest">Error: Invalid format or connection failed.</span>
                    </div>
                  )}

                  {/* Action */}
                  {status === "idle" && (
                    <button 
                      onClick={handleUpload}
                      className="w-full btn-primary py-4 uppercase tracking-widest font-bold text-xs"
                    >
                      Initiate Upload
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  );
}
