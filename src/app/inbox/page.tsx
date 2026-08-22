"use client";

import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { useAuth } from "@/core/context/AuthContext";
import { useRouter } from "next/navigation";
import { Check, X, Inbox as InboxIcon, Clock, User, Info, Edit, Trash2 } from "lucide-react";
import { fetchApi } from "@/shared/lib/api";
import { AddEntityModal } from "@/shared/components/modals/AddEntityModal";

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
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isAdmin = role === "admin" || role === "superadmin";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [isAuthenticated, role]);

  const fetchSubmissions = async () => {
    try {
      const endpoint = isAdmin ? '/submissions/pending' : '/submissions/mine';
      const res = await fetchApi(endpoint);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this proposal?")) return;
    try {
      const res = await fetchApi(`/submissions/${id}`, {
        method: "DELETE"
      });
      if (res && res.success) {
        setSubmissions((prev) => prev.filter((s) => s._id !== id));
      } else {
        alert(res?.error || "Failed to delete submission");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getEntityType = (type: string): "PROJECT" | "NODE" | "EVENT" | "RESOURCE" | "VISUAL" => {
    switch (type.toLowerCase()) {
      case "project": return "PROJECT";
      case "node": return "NODE";
      case "event": return "EVENT";
      case "resource": return "RESOURCE";
      case "gallery": return "VISUAL";
      default: return "PROJECT";
    }
  };

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetchApi(`/submissions/${id}`, {
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
              {isAdmin ? "Command Inbox" : "My Submissions"}
            </h1>
            <p className="font-mono text-[10px] text-[var(--color-cyber-muted)] uppercase tracking-widest mt-1">
              {isAdmin ? "Review & Approve Member Proposals" : "Track Your Project Requests"}
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
            <p className="font-mono text-sm text-[var(--color-cyber-muted)]">
              {isAdmin ? "No pending proposals awaiting your review." : "You haven't submitted any proposals yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div key={submission._id} className="stealth-card p-6 border border-[var(--color-cyber-gray)] bg-[var(--color-cyber-black)] hover:border-[var(--color-cyber-blue)] transition-colors rounded-sm relative overflow-hidden group">
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
                      
                      {/* Status badge for members */}
                      {!isAdmin && (
                        <span className={`font-mono text-[10px] px-2 py-1 uppercase tracking-widest border rounded-sm ${
                          submission.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 
                          submission.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 
                          'bg-red-500/10 text-red-500 border-red-500/30'
                        }`}>
                          {submission.status}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-[var(--color-cyber-white)] mb-2 font-heading uppercase tracking-tight">
                      {submission.title}
                    </h3>
                    <p className="text-sm text-[var(--color-cyber-light)] mb-4 font-body line-clamp-2">
                      {submission.description}
                    </p>
                    
                    {isAdmin && (
                      <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--color-cyber-muted)] bg-[var(--color-cyber-dark)] inline-flex px-3 py-1.5 rounded-sm border border-[var(--color-cyber-gray)]">
                        <User className="w-3 h-3" />
                        Proposed by: <span className="text-[var(--color-cyber-white)]">{submission.submittedBy?.name}</span> ({submission.submittedBy?.email})
                      </div>
                    )}
                  </div>
                  
                  {isAdmin && (
                    <div className="flex flex-row md:flex-col gap-3 justify-end items-end md:w-32 shrink-0">
                      <button
                        onClick={() => handleReview(submission._id, "approved")}
                        className="w-full flex-1 md:flex-none flex items-center justify-center gap-2 bg-[var(--color-cyber-neon)]/10 hover:bg-[var(--color-cyber-neon)]/20 text-[var(--color-cyber-neon)] border border-[var(--color-cyber-neon)]/50 px-4 py-3 rounded-sm font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(submission._id, "rejected")}
                        className="w-full flex-1 md:flex-none flex items-center justify-center gap-2 bg-cyber-red/10 hover:bg-cyber-red/20 text-cyber-red border border-cyber-red/50 px-4 py-3 rounded-sm font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                  
                  {/* Info & controls for members */}
                  {!isAdmin && (
                    <div className="flex flex-row gap-3 justify-end items-center shrink-0 self-start md:self-center">
                      {submission.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setIsEditModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 px-3 py-1.5 rounded-sm font-mono text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(submission._id)}
                            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-sm font-mono text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--color-cyber-muted)]">
                          <Info className="w-3.5 h-3.5" />
                          <span>Processed</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSubmission && (
        <AddEntityModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSubmission(null);
            fetchSubmissions(); // reload on close to fetch changes
          }}
          entityType={getEntityType(selectedSubmission.type)}
          mode="edit_submission"
          initialData={selectedSubmission}
        />
      )}
    </PageWrapper>
  );
}
