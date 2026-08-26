"use client";

import React, { useState, useEffect } from "react";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { Search, Plus, Shield, Trash2, Crown, Users, GraduationCap } from "lucide-react";
import { AddEntityModal } from "@/shared/components/modals/AddEntityModal";
import { TeamCard } from "@/shared/components/cards/TeamCard";
import { useAuth } from "@/core/context/AuthContext";
import { fetchApi } from "@/shared/lib/api";

export default function TeamPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, role } = useAuth();
  
  const [users, setUsers] = useState<any[]>([]);
  const [teamRoster, setTeamRoster] = useState<any[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchTeamRoster();
  }, []);

  useEffect(() => {
    if (isAuthenticated && (role === "superadmin" || role === "admin") && isManaging) {
      fetchUsers();
    }
  }, [isAuthenticated, role, isManaging]);

  const fetchTeamRoster = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi('/team');
      if (res && res.success) {
        setTeamRoster(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetchApi('/users');
      if (res && res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    try {
      const res = await fetchApi(`/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      if (res && res.success) {
        fetchUsers();
      } else {
        alert(res?.error || "Failed to change role");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const removeUser = async (id: string) => {
    if (!confirm("Are you sure you want to remove this user access?")) return;
    try {
      const res = await fetchApi(`/users/${id}`, {
        method: "DELETE",
      });
      if (res && res.success) {
        fetchUsers();
      } else {
        alert(res?.error || "Failed to remove user");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const removeTeamMember = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this public team member?")) return;
    try {
      const res = await fetchApi(`/team/${id}`, {
        method: "DELETE",
      });
      if (res && res.success) {
        fetchTeamRoster();
      } else {
        alert(res?.error || "Failed to delete member");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const applySearch = (members: any[]) => {
    if (!searchQuery) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.role?.toLowerCase().includes(q) ||
        m.skills?.some((s: string) => s.toLowerCase().includes(q))
    );
  };

  const boardMembers = applySearch(teamRoster.filter((m) => m.tier === "core"));
  const teamMembers  = applySearch(teamRoster.filter((m) => m.tier === "lead" || m.tier === "member"));
  const mentors      = applySearch(teamRoster.filter((m) => m.tier === "mentor"));
  const totalVisible = boardMembers.length + teamMembers.length + mentors.length;

  return (
    <PageWrapper className="pt-24 pb-32">
      <AddEntityModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchTeamRoster();
        }} 
        entityType="NODE" 
        mode="add"
      />

      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 z-10 relative">

        {/* PAGE HEADER */}
        <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-[var(--color-cyber-gray)] pb-8 relative">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] mb-4">
              Collective Roster
            </div>
            <h1 className="font-heading font-black text-[clamp(4rem,8vw,7rem)] text-cyber-yellow tracking-tighter leading-[0.9]">
              The <br className="hidden sm:block" /> Sentinels
            </h1>
            <p className="font-body text-sm md:text-base text-[var(--color-cyber-light)] mt-6 max-w-xl leading-relaxed">
              Meet the security architects, researchers, and engineers driving the SOCS network forward.
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-cyber-muted)]" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search operator or skill..." 
                className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] pl-12 pr-4 py-3 text-xs font-mono text-[var(--color-cyber-white)] outline-none focus:border-[var(--color-cyber-white)] transition-all placeholder:text-[var(--color-cyber-muted)] rounded-sm"
              />
            </div>

            {isAuthenticated && (role === "superadmin" || role === "admin") && (
              <button 
                onClick={() => setIsManaging(!isManaging)}
                className="btn-primary px-6 py-3 text-xs uppercase tracking-widest flex items-center justify-center shrink-0 rounded-sm"
              >
                <Shield className="w-4 h-4 mr-2" />
                <span>{isManaging ? "Exit Management" : "Manage Access"}</span>
              </button>
            )}

            {isAuthenticated && (role === 'admin' || role === 'superadmin') && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-primary px-6 py-3 text-xs uppercase tracking-widest flex items-center justify-center shrink-0 rounded-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span>Add Member</span>
              </button>
            )}
          </div>
        </div>

        {/* MANAGEMENT MODE */}
        {isManaging && (role === "superadmin" || role === "admin") ? (
          <div className="mb-16">
            <h2 className="font-heading text-2xl text-[var(--color-cyber-white)] uppercase mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-[var(--color-cyber-neon)]" />
              System Access Control
            </h2>
            <div className="overflow-x-auto border border-[var(--color-cyber-gray)] bg-[var(--color-cyber-black)] rounded-sm mb-16">
              <table className="w-full text-left font-mono text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)] text-xs uppercase tracking-widest">
                    <th className="px-6 py-4">System User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Clearance</th>
                    <th className="px-6 py-4">Modify Access</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-[var(--color-cyber-gray)] hover:bg-[var(--color-cyber-dark)] transition-colors">
                      <td className="px-6 py-4 text-[var(--color-cyber-white)] font-bold">{u.name}</td>
                      <td className="px-6 py-4 text-[var(--color-cyber-light)]">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[10px] uppercase tracking-widest border rounded-sm ${u.role === 'superadmin' ? 'border-cyber-red text-cyber-red' : u.role === 'admin' ? 'border-[var(--color-cyber-neon)] text-[var(--color-cyber-neon)]' : 'border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)]'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={u.role} 
                          onChange={(e) => changeRole(u._id, e.target.value)}
                          disabled={role === 'admin' && u.role === 'superadmin'}
                          className="bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] text-[var(--color-cyber-white)] text-xs px-3 py-1 outline-none disabled:opacity-50"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                          {role === 'superadmin' && <option value="superadmin">Super Admin</option>}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => removeUser(u._id)}
                          disabled={role === 'admin' && u.role === 'superadmin'}
                          className="text-xs uppercase tracking-widest text-cyber-red hover:bg-cyber-red/10 px-3 py-1 rounded-sm transition-colors border border-transparent hover:border-cyber-red/30 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <h2 className="font-heading text-2xl text-[var(--color-cyber-white)] uppercase mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-cyber-yellow" />
              Public Roster Management
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {teamRoster.map((member) => (
                <div key={member._id} className="relative group">
                  <TeamCard member={member} />
                  <button
                    onClick={() => removeTeamMember(member._id)}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg z-20"
                    title="Delete Public Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        ) : isLoading ? (
          <div className="py-24 text-center text-[var(--color-cyber-muted)] font-mono">
            LOADING ROSTER...
          </div>

        ) : (
          <div className="space-y-24">

            {/* SECTION 1: BOARD MEMBERS */}
            <section>
              <div className="flex items-center gap-4 mb-10 pb-4 border-b border-[var(--color-cyber-white)]/20">
                <div className="w-10 h-10 rounded-sm bg-[var(--color-cyber-white)]/10 border border-[var(--color-cyber-white)]/30 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5 text-[var(--color-cyber-white)]" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-3xl text-[var(--color-cyber-white)] tracking-tighter uppercase">
                    Board Members
                  </h2>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-cyber-muted)] mt-0.5">
                    President · Vice President · General Secretary
                  </p>
                </div>
                <span className="ml-auto font-mono text-xs text-[var(--color-cyber-muted)] border border-[var(--color-cyber-gray)] px-3 py-1 rounded-sm shrink-0">
                  {boardMembers.length} NODE{boardMembers.length !== 1 ? "S" : ""}
                </span>
              </div>

              {boardMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                  {boardMembers.map((member) => (
                    <TeamCard key={member._id || member.slug} member={member} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)] font-mono text-xs uppercase tracking-widest">
                  No Board Members Found
                </div>
              )}
            </section>

            {/* SECTION 2: TEAM MEMBERS */}
            <section>
              <div className="flex items-center gap-4 mb-10 pb-4 border-b border-[var(--color-cyber-neon)]/20">
                <div className="w-10 h-10 rounded-sm bg-[var(--color-cyber-neon)]/10 border border-[var(--color-cyber-neon)]/30 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[var(--color-cyber-neon)]" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-3xl text-[var(--color-cyber-white)] tracking-tighter uppercase">
                    Team Members
                  </h2>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-cyber-muted)] mt-0.5">
                    Lead Operators · Active Members
                  </p>
                </div>
                <span className="ml-auto font-mono text-xs text-[var(--color-cyber-muted)] border border-[var(--color-cyber-gray)] px-3 py-1 rounded-sm shrink-0">
                  {teamMembers.length} NODE{teamMembers.length !== 1 ? "S" : ""}
                </span>
              </div>

              {teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                  {teamMembers.map((member) => (
                    <TeamCard key={member._id || member.slug} member={member} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)] font-mono text-xs uppercase tracking-widest">
                  No Team Members Found
                </div>
              )}
            </section>

            {/* SECTION 3: MENTORS */}
            <section>
              <div className="flex items-center gap-4 mb-10 pb-4 border-b border-[var(--color-cyber-neon)]/10">
                <div className="w-10 h-10 rounded-sm bg-[var(--color-cyber-neon)]/5 border border-[var(--color-cyber-neon)]/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-[var(--color-cyber-neon)]" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-3xl text-[var(--color-cyber-white)] tracking-tighter uppercase">
                    Mentors
                  </h2>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-cyber-muted)] mt-0.5">
                    Advisors · Guides · Industry Experts
                  </p>
                </div>
                <span className="ml-auto font-mono text-xs text-[var(--color-cyber-muted)] border border-[var(--color-cyber-gray)] px-3 py-1 rounded-sm shrink-0">
                  {mentors.length} NODE{mentors.length !== 1 ? "S" : ""}
                </span>
              </div>

              {mentors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                  {mentors.map((member) => (
                    <TeamCard key={member._id || member.slug} member={member} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-[var(--color-cyber-gray)] text-[var(--color-cyber-muted)] font-mono text-xs uppercase tracking-widest">
                  No Mentors Found
                </div>
              )}
            </section>

            {totalVisible === 0 && searchQuery && (
              <div className="py-24 text-center bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)]">
                <p className="text-[var(--color-cyber-light)] font-body text-sm">
                  No members found matching &quot;{searchQuery}&quot;.
                </p>
              </div>
            )}
          </div>
        )}

        {/* FOOTER LOG */}
        <div className="mt-20 pt-6 border-t border-[var(--color-cyber-gray)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[var(--color-cyber-neon)] rounded-full animate-pulse shadow-[0_0_8px_var(--color-cyber-neon)]" />
            <span>{isManaging ? users.length : totalVisible} ACTIVE MEMBERS SYNCHRONIZED</span>
          </div>
          <div className="text-[var(--color-cyber-muted)]">
            SOCS DIRECTORY // VERIFIED
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
