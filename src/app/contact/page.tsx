"use client";

import React, { useState } from "react";
import { PageWrapper } from "@/shared/components/layout/PageWrapper";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/shared/components/ui/Icons";
import { Mail, MessageSquare, Globe, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "JOIN_CLUB",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "JOIN_CLUB", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        alert(data.error || "Failed to send message. Please try again later.");
        setStatus("idle");
      }
    } catch (error) {
      console.error(error);
      alert("Network error. Please try again later.");
      setStatus("idle");
    }
  };

  return (
    <PageWrapper className="pt-24 pb-32">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 z-10 relative">
        {/* Header */}
        <div className="mb-16 border-b border-[var(--color-cyber-gray)] pb-8 relative">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyber-muted)] mb-4">
            Communications
          </div>
          <h1 className="font-heading font-black text-[clamp(4rem,8vw,7rem)] text-cyber-purple tracking-tighter leading-[0.9] mb-6">
            Get in Touch
          </h1>
          <p className="max-w-2xl text-[var(--color-cyber-light)] font-body text-sm md:text-base leading-relaxed">
            Ready to collaborate, apply for membership, or inquire about upcoming security workshops? Send us a message below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-16">
          
          {/* ── LEFT: Contact Form Card ── */}
          <div className="stealth-card p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Name Input */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">Your Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Abhishek Kumar"
                    className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] px-4 py-4 text-[var(--color-cyber-white)] font-mono text-sm outline-none focus:border-[var(--color-cyber-white)] transition-all placeholder:text-[var(--color-cyber-muted)] rounded-sm"
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">Email Address</label>
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="user@university.edu"
                    className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] px-4 py-4 text-[var(--color-cyber-white)] font-mono text-sm outline-none focus:border-[var(--color-cyber-white)] transition-all placeholder:text-[var(--color-cyber-muted)] rounded-sm"
                  />
                </div>
              </div>

              {/* Subject Select */}
              <div className="space-y-3">
                <label className="block text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">Inquiry Purpose</label>
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] px-4 py-4 text-[var(--color-cyber-white)] font-mono text-sm outline-none focus:border-[var(--color-cyber-white)] transition-all cursor-pointer rounded-sm appearance-none"
                >
                  <option value="JOIN_CLUB">Join the SOCS Network</option>
                  <option value="COLLABORATION">Collaboration & Sponsorship</option>
                  <option value="WORKSHOP">Workshop & Speaking Request</option>
                </select>
              </div>

              {/* Message Input */}
              <div className="space-y-3">
                <label className="block text-[10px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest">Message</label>
                <textarea 
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Tell us what you're passionate about or what you'd like to collaborate on..."
                  className="w-full bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] px-4 py-4 text-[var(--color-cyber-white)] font-mono text-sm outline-none focus:border-[var(--color-cyber-white)] transition-all placeholder:text-[var(--color-cyber-muted)] resize-none rounded-sm"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
                <button 
                  type="submit" 
                  disabled={status !== "idle"}
                  className="btn-primary px-8 py-4 text-xs w-full sm:w-auto cursor-pointer flex items-center justify-center uppercase tracking-widest rounded-sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  <span>{status === "idle" ? "Transmit Message" : status === "submitting" ? "Sending..." : "Message Sent"}</span>
                </button>
                
                {status === "success" && (
                  <div className="flex items-center gap-3 text-[var(--color-cyber-white)] font-mono text-[10px] uppercase tracking-widest bg-[var(--color-cyber-dark)] px-4 py-2 border border-[var(--color-cyber-gray)] rounded-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Transmission Success // We'll reply shortly</span>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* ── RIGHT: Contact Info ── */}
          <div className="space-y-8">
            {/* Direct Channels */}
            <div className="stealth-card p-8 bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] space-y-8 relative rounded-sm">
              <h3 className="text-cyber-blue font-heading font-bold text-xl uppercase tracking-wider border-b border-[var(--color-cyber-gray)] pb-4 relative z-10">
                Direct Channels
              </h3>
              
              <div className="space-y-4 relative z-10">
                <ContactInfoItem 
                  icon={<Mail className="w-4 h-4 text-[var(--color-cyber-neon)]" />}
                  label="Official Email"
                  value="socs.club@rishihood.edu.in"
                  link="mailto:socs.club@rishihood.edu.in"
                />
                <ContactInfoItem 
                  icon={<MessageSquare className="w-4 h-4 text-[var(--color-cyber-muted)]" />}
                  label="Community Discord"
                  value="discord.gg/2DbssC8t"
                  link="https://discord.gg/2DbssC8t"
                />
                <ContactInfoItem 
                  icon={<Globe className="w-4 h-4 text-[var(--color-cyber-muted)]" />}
                  label="Club Headquarters"
                  value="Cyber Lab, Rishihood University"
                  link="#"
                />
              </div>
            </div>

            {/* Social Matrix */}
            <div className="stealth-card p-8 bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] space-y-6 relative rounded-sm">
              <h3 className="text-cyber-blue font-heading font-bold text-xl uppercase tracking-wider border-b border-[var(--color-cyber-gray)] pb-4 relative z-10">
                Social Matrix
              </h3>
              <div className="grid grid-cols-3 gap-4 relative z-10">
                <SocialLink icon={<GithubIcon className="w-5 h-5" />} label="Github" href="https://github.com/Society-of-Cyber-Security" />
                <SocialLink icon={<InstagramIcon className="w-5 h-5" />} label="Instagram" href="https://www.instagram.com/socs_ru/" />
                <SocialLink icon={<LinkedinIcon className="w-5 h-5" />} label="LinkedIn" href="https://www.linkedin.com/company/society-of-cyber-security/posts/?feedView=all" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}

function ContactInfoItem({ icon, label, value, link }: { icon: React.ReactNode, label: string, value: string, link: string }) {
  return (
    <a href={link} className="flex items-start gap-4 p-4 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] hover:border-[var(--color-cyber-white)] transition-all group rounded-sm">
      <div className="p-3 bg-[var(--color-cyber-black)] border border-[var(--color-cyber-gray)] group-hover:bg-[var(--color-cyber-white)] group-hover:text-[var(--color-cyber-black)] group-hover:border-[var(--color-cyber-white)] transition-colors rounded-sm">
        {icon}
      </div>
      <div>
        <div className="text-[9px] font-mono text-[var(--color-cyber-muted)] uppercase tracking-widest mb-1">{label}</div>
        <div className="text-[var(--color-cyber-white)] font-heading font-bold text-sm group-hover:text-[var(--color-cyber-neon)] transition-colors">{value}</div>
      </div>
    </a>
  );
}

function SocialLink({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 p-4 bg-[var(--color-cyber-dark)] border border-[var(--color-cyber-gray)] hover:border-[var(--color-cyber-white)] transition-all group text-center rounded-sm">
      <div className="text-[var(--color-cyber-muted)] group-hover:text-[var(--color-cyber-white)] transition-colors">
        {icon}
      </div>
      <span className="text-[9px] font-mono tracking-widest text-[var(--color-cyber-light)] group-hover:text-[var(--color-cyber-white)] transition-colors uppercase">{label}</span>
    </a>
  );
}
