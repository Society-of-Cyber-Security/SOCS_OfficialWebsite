"use client";

import React, { useEffect, useRef, useState } from "react";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { EventCard } from "@/shared/components/cards/EventCard";
import { AddEntityModal } from "@/shared/components/modals/AddEntityModal";
import { staggerCardsOnScroll } from "@/shared/lib/animations";
import { Plus, Archive, UploadCloud } from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";

export default function EventsPage() {
  const upcomingRef = useRef<HTMLDivElement>(null);
  const pastRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "propose" | "edit">("propose");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, role } = useAuth();

  // Compute status based on date
  const now = new Date().getTime();
  const enhancedEvents = events.map(e => ({
    ...e,
    status: new Date(e.date).getTime() > now ? "upcoming" : "past"
  }));

  const upcomingEvents = enhancedEvents.filter(e => e.status === "upcoming").sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = enhancedEvents.filter(e => e.status === "past").sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { fetchApi } = await import('@/shared/lib/api');
        const res = await fetchApi('/events');
        if (res && res.success) {
          setEvents(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [isModalOpen]);

  useEffect(() => {
    if (!isLoading && upcomingRef.current) staggerCardsOnScroll(upcomingRef.current);
    if (!isLoading && pastRef.current) staggerCardsOnScroll(pastRef.current);
  }, [isLoading, upcomingEvents.length, pastEvents.length]);

  const handleOpenModal = (mode: "add" | "propose" | "edit", event: any = null) => {
    setModalMode(mode);
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const { fetchApi } = await import('@/shared/lib/api');
      const result = await fetchApi(`/events/${id}`, { method: 'DELETE' });
      if (result.success) {
        setEvents(events.filter(e => e._id !== id));
      } else {
        alert(result.error || 'Failed to delete');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting event');
    }
  };

  return (
    <PageWrapper className="pt-24 pb-32">
      <AddEntityModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedEvent(null); }} 
        entityType="EVENT"
        mode={modalMode}
        initialData={selectedEvent}
      />

      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 z-10 relative">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[var(--color-cyber-gray)] gap-6 relative mb-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] mb-4">
              Event Calendar
            </div>
            <h1 className="font-heading font-black text-[clamp(4rem,8vw,7rem)] text-cyber-blue tracking-tighter leading-[0.9]">
              Scheduled <br className="hidden sm:block" /> Directives
            </h1>
            <p className="font-body text-sm md:text-base text-[var(--color-cyber-light)] mt-6 max-w-xl leading-relaxed">
              Hands-on workshops, competitive CTF tournaments, and technical discussions designed to level up your hacking and defense capabilities.
            </p>
          </div>

          {isAuthenticated && (
            <div className="flex gap-3">
              {role === 'member' && (
                <button 
                  onClick={() => handleOpenModal("propose")}
                  className="btn-primary px-6 py-3 text-xs uppercase tracking-widest flex items-center justify-center shrink-0 self-start md:self-end rounded-sm"
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  <span>Propose Event</span>
                </button>
              )}
              {(role === 'admin' || role === 'superadmin') && (
                <button 
                  onClick={() => handleOpenModal("add")}
                  className="btn-primary px-6 py-3 text-xs uppercase tracking-widest flex items-center justify-center shrink-0 self-start md:self-end rounded-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Add Event</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-24 mt-12">
          {/* Upcoming Section */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <span className="w-2.5 h-2.5 bg-[var(--color-cyber-neon)] rounded-full relative">
                <span className="absolute inset-0 bg-[var(--color-cyber-neon)] animate-ping opacity-75 rounded-full" />
              </span>
              <h3 className="font-heading font-bold text-2xl text-cyber-yellow tracking-tighter uppercase">
                Active & Upcoming
              </h3>
            </div>

            {isLoading ? (
              <div className="py-24 text-center">
                <p className="text-[var(--color-cyber-muted)] font-mono text-sm tracking-widest uppercase animate-pulse">Decrypting Event Data...</p>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div ref={upcomingRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {upcomingEvents.map((event) => (
                  <div key={event._id || event.title} className="opacity-0">
                    <EventCard 
                      event={event} 
                      onEdit={(e) => handleOpenModal('edit', e)}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            ) : (
             <div className="py-24 text-center bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)]">
               <p className="text-[var(--color-cyber-light)] font-body text-sm">No active events scheduled at this time.</p>
             </div>
            )}
          </section>

          {/* Past Section */}
          <section className="pt-16 border-t border-[var(--color-cyber-gray)]">
            <div className="flex items-center gap-4 mb-10 opacity-60">
              <Archive className="w-5 h-5 text-[var(--color-cyber-muted)]" />
              <h3 className="font-heading font-bold text-2xl text-[var(--color-cyber-light)] tracking-tighter uppercase">
                Archived Protocols
              </h3>
            </div>

            {!isLoading && (
              <div ref={pastRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {pastEvents.map((event) => (
                  <div key={event._id || event.title} className="opacity-0">
                    <EventCard 
                      event={event} 
                      onEdit={(e) => handleOpenModal('edit', e)}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
