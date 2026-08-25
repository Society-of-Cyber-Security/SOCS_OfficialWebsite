"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { GithubIcon, LinkedinIcon } from "@/shared/components/ui/Icons";
import { ArrowLeft, Terminal, User, Mail, Activity, Star, Sparkles, Loader2, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/shared/lib/api";
import { useAuth } from "@/core/context/AuthContext";
import { AddEntityModal } from "@/shared/components/modals/AddEntityModal";

const CLEARANCE_MAP: Record<string, { label: string, badgeColor: string, starCount: number }> = {
  core: { label: "Core Admin", badgeColor: "border-[var(--color-cyber-white)] text-[var(--color-cyber-white)] bg-[var(--color-cyber-white)]/5", starCount: 3 },
  lead: { label: "Lead Operator", badgeColor: "border-[var(--color-cyber-neon)] text-[var(--color-cyber-neon)] bg-[var(--color-cyber-neon)]/5", starCount: 2 },
  member: { label: "Member", badgeColor: "border-[var(--color-cyber-gray)] text-[var(--color-cyber-light)] bg-[var(--color-cyber-dark)]", starCount: 1 },
};

export default function TeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [member, setMember] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { isAuthenticated, role } = useAuth();
  const canEdit = isAuthenticated && (role === "admin" || role === "superadmin");

  const fetchMember = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi(`/team/${slug}`);
      if (res && res.success) {
        setMember(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [slug]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this team member's profile?")) return;
    try {
      const res = await fetchApi(`/team/${member._id}`, {
        method: "DELETE",
      });
      if (res && res.success) {
        router.push("/team");
      } else {
        alert(res?.error || "Failed to delete member");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="pt-32 pb-32 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-[var(--color-cyber-neon)] animate-spin mb-4" />
          <p className="font-mono text-sm text-[var(--color-cyber-muted)] uppercase tracking-widest">Accessing Operator Profile...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!member) {
    return (
      <PageWrapper>
        <div className="pt-32 text-center bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] p-12 max-w-lg mx-auto relative overflow-hidden rounded-sm">
          <h1 className="text-4xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter mb-4 relative z-10">404: OPERATOR NOT FOUND</h1>
          <p className="text-[var(--color-cyber-light)] mb-8 font-body text-sm relative z-10">The requested operator profile could not be located.</p>
          <Link href="/team" className="btn-primary px-8 py-4 text-xs uppercase tracking-widest relative z-10 inline-block rounded-sm">
            Return to Directory
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const clearance = CLEARANCE_MAP[member.tier] || CLEARANCE_MAP.member;

  return (
    <PageWrapper className="pt-24 pb-32">
      <AddEntityModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          fetchMember();
        }} 
        entityType="NODE" 
        mode="edit"
        initialData={member}
      />

      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-3 text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors text-[10px] font-mono tracking-widest uppercase group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Directory</span>
          </button>

          {canEdit && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="btn-primary px-4 py-2 text-[10px] uppercase tracking-widest flex items-center gap-2 rounded-sm"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-[10px] uppercase tracking-widest flex items-center gap-2 rounded-sm text-cyber-red border border-cyber-red/30 hover:bg-cyber-red/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="stealth-card p-10 sm:p-16 flex flex-col items-center text-center relative z-10 bg-[var(--color-cyber-black)]">
            <div className="w-56 h-56 sm:w-64 sm:h-64 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] flex items-center justify-center overflow-hidden mb-10 relative z-10 grayscale hover:grayscale-0 transition-all duration-500 rounded-sm">
              {member.image ? (
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-20 h-20 text-[var(--color-cyber-muted)]" />
              )}
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-black text-[var(--color-cyber-white)] tracking-tighter leading-[0.9] mb-6">
              {member.name}
            </h1>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-10">
              <span className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest border rounded-sm ${clearance.badgeColor}`}>
                {clearance.label}
              </span>
              <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[var(--color-cyber-gray)]" />
              <p className="text-[var(--color-cyber-neon)] font-mono text-sm font-bold uppercase tracking-[0.2em]">
                {member.role}
              </p>
            </div>

            {/* Skills */}
            {member.skills && member.skills.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-lg">
                {member.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] text-[var(--color-cyber-white)] text-[10px] font-mono uppercase tracking-widest rounded-sm cursor-default hover:border-[var(--color-cyber-neon)] transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Social links */}
            <div className="flex justify-center gap-8 pt-8 border-t border-[var(--color-cyber-gray)] w-full max-w-md">
              {member.github && (
                <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors transform hover:scale-110" aria-label="GitHub">
                  <GithubIcon className="w-6 h-6" />
                </a>
              )}
              {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyber-muted)] hover:text-[#0077b5] transition-colors transform hover:scale-110" aria-label="LinkedIn">
                  <LinkedinIcon className="w-6 h-6" />
                </a>
              )}
              {member.email && (
                <a href={`mailto:${member.email}`} className="text-[var(--color-cyber-muted)] hover:text-[var(--color-cyber-white)] transition-colors transform hover:scale-110" aria-label="Email">
                  <Mail className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
