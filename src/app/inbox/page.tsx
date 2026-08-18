"use client";

import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { useAuth } from "@/core/context/AuthContext";
import { useRouter } from "next/navigation";
import { Check, X, FileText, Inbox as InboxIcon, Clock, User } from "lucide-react";
import { fetchApi } from "@/shared/lib/api";

interface Submission {
  _id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  submittedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  payload?: any;
}

export default function InboxPage() {
  const { role, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (role !== "admin" && role !== "superadmin"))) {
      router.push("/");
    }
  }, [isAuthenticated, role, isLoading, router]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetchApi('/submissions/pending');
      if (res && res.success) {
        setSubmissions(res.data);
      } else {
        setError(res?.error || "Failed to fetch submissions");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetchApi(`/submissions/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (res && res.success) {
        setSubmissions((prev) => prev.filter((s) => s._id !== id));
      } else {
        alert(res?.error || "Failed to review submission");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading || isDataLoading) {
    return (
      <PageWrapper className="pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="font-mono text-[var(--color-cyber-blue)] animate-pulse uppercase tracking-widest text-sm">
          Decrypting Inbox...
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="pt-32 pb-24 min-h-screen relative">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="flex items-center gap-4 mb-12 border-b border-[var(--color-cyber-gray)] pb-6">
          <div className="p-3 bg-[var(--color-cyber-dark)] rounded-sm border border-[var(--color-cyber-gray)]">
            <InboxIcon className="w-8 h-8 text-[var(--color-cyber-blue)]" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-black text-[var(--color-cyber-white)] uppercase tracking-tighter">
              Command Inbox
            </h1>
            <p className="font-mono text-[10px] text-[var(--color-cyber-muted)] uppercase tracking-widest mt-1">
              Review & Approve Member Proposals
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 border border-cyber-red/30 bg-cyber-red/10 text-cyber-red font-mono text-sm rounded-sm">
            {error}
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="stealth-card p-16 text-center border border-[var(--color-cyber-gray)] bg-[var(--color-cyber-black)]/50 rounded-sm">
            <Check className="w-12 h-12 text-[var(--color-cyber-muted)] mx-auto mb-4 opacity-50" />
            <h3 className="font-heading text-xl text-[var(--color-cyber-white)] uppercase mb-2">Inbox Clear</h3>
            <p className="font-mono text-sm text-[var(--color-cyber-muted)]">No pending proposals awaiting your review.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div key={submission._id} className="stealth-card p-6 border border-[var(--color-cyber-gray)] bg-[var(--color-cyber-black)] hover:border-[var(--color-cyber-blue)] transition-colors rounded-sm relative overflow-hidden group">
                {/* Accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-cyber-blue)] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex flex-col md:flex-row justify-between gap-6 pl-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-[10px] px-2 py-1 bg-[var(--color-cyber-dark)] text-[var(--color-cyber-blue)] uppercase tracking-widest border border-[var(--color-cyber-blue)]/30 rounded-sm">
                        {submission.type}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-cyber-muted)]">
                        <Clock className="w-3 h-3" />
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[var(--color-cyber-white)] mb-2 font-heading uppercase tracking-tight">
                      {submission.title}
                    </h3>
                    <p className="text-sm text-[var(--color-cyber-light)] mb-4 font-body line-clamp-2">
                      {submission.description}
                    </p>
                    
                    <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--color-cyber-muted)] bg-[var(--color-cyber-dark)] inline-flex px-3 py-1.5 rounded-sm border border-[var(--color-cyber-gray)]">
                      <User className="w-3 h-3" />
                      Proposed by: <span className="text-[var(--color-cyber-white)]">{submission.submittedBy?.name}</span> ({submission.submittedBy?.email})
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col gap-3 justify-end items-end md:w-32 shrink-0">
                    <button
                      onClick={() => handleReview(submission._id, "approved")}
                      className="w-full flex-1 md:flex-none flex items-center justify-center gap-2 bg-[var(--color-cyber-neon)]/10 hover:bg-[var(--color-cyber-neon)]/20 text-[var(--color-cyber-neon)] border border-[var(--color-cyber-neon)]/50 px-4 py-3 rounded-sm font-mono text-xs uppercase tracking-widest transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(submission._id, "rejected")}
                      className="w-full flex-1 md:flex-none flex items-center justify-center gap-2 bg-cyber-red/10 hover:bg-cyber-red/20 text-cyber-red border border-cyber-red/50 px-4 py-3 rounded-sm font-mono text-xs uppercase tracking-widest transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
