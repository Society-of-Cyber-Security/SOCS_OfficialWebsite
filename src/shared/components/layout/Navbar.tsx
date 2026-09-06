"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileMenu } from "./MobileMenu";
import { Menu, X, User, LogOut, Inbox } from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { RoleBadge } from "@/shared/components/auth/RoleBadge";
import { fetchApi } from "@/shared/lib/api";

function InboxButton({ isAdmin }: { isAdmin: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchCount = async () => {
      try {
        const res = await fetchApi('/submissions/pending');
        if (res && res.success) {
          setCount(res.count || 0);
        }
      } catch (e) {
        // fail silently
      }
    };
    fetchCount();
  }, [isAdmin]);

  return (
    <Link
      href="/inbox"
      className="btn-primary text-sm px-4 py-2 flex items-center gap-2 relative"
    >
      <Inbox className="w-4 h-4" />
      <span>Inbox</span>
      {isAdmin && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, role, logout, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "About",      href: "/#about" }, // Or just home scroll
    { name: "Initiatives",href: "/projects" },
    { name: "Events",    href: "/events" },
    { name: "Team",      href: "/team" },
    { name: "Gallery",   href: "/gallery" },
    { name: "Resources", href: "/resources" },
    { name: "Contact",   href: "/contact" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[50] transition-all duration-400 ease-out flex flex-col h-[72px] justify-center ${
          scrolled || pathname !== "/"
            ? "bg-[var(--color-cyber-black)]/95 backdrop-blur-md border-b border-[var(--color-cyber-gray)] shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-12">
          
          {/* Brand & Partner Logos */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="SOCS Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(0,184,255,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(0,184,255,0.8)] transition-all duration-300" />
              <div className="flex items-end gap-2">
                <span className="font-heading font-black text-2xl sm:text-3xl tracking-tighter text-[var(--color-cyber-white)] leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] group-hover:text-cyber-blue group-hover:drop-shadow-[0_0_12px_var(--color-cyber-blue)] transition-all duration-300">
                  SOCS
                </span>
              </div>
            </Link>

            <div className="h-6 w-px bg-[var(--color-cyber-gray)]/80 mx-0.5 sm:mx-1" />

            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm overflow-hidden bg-white p-0.5 border border-[var(--color-cyber-gray)]/60 shadow-sm flex items-center justify-center transition-all duration-300 hover:border-cyber-blue hover:scale-105">
                <img src="/partner-logo-1.jpg" alt="Partner Logo" className="w-full h-full object-contain" />
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm overflow-hidden bg-white p-0.5 border border-[var(--color-cyber-gray)]/60 shadow-sm flex items-center justify-center transition-all duration-300 hover:border-cyber-blue hover:scale-105">
                <img src="/partner-logo-2.jpg" alt="University Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`group text-base font-bold transition-all duration-300 relative flex items-center ${
                    isActive 
                      ? "text-cyber-blue scale-105" 
                      : "text-[var(--color-cyber-white)] hover:text-cyber-neon hover:scale-105"
                  }`}
                >
                  <span className="absolute -left-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-cyber-neon transition-all duration-300">[</span>
                  <span>{link.name}</span>
                  <span className="absolute -right-3 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 text-cyber-neon transition-all duration-300">]</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--color-cyber-neon)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-4">
            {!isLoading ? (
              isAuthenticated ? (
                <div className="hidden lg:flex items-center gap-4">
                  {role && <RoleBadge role={role} />}
                  {isAuthenticated && <InboxButton isAdmin={role === 'admin' || role === 'superadmin'} />}
                  <button
                    onClick={logout}
                    className="text-[var(--color-cyber-muted)] hover:text-red-500 hover:scale-110 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center">
                  <Link
                    href="/login"
                    className="group relative flex items-center gap-2 overflow-hidden rounded-md border border-[var(--color-cyber-blue)] bg-transparent px-5 py-2 text-sm font-bold tracking-wider text-[var(--color-cyber-blue)] uppercase transition-all duration-300 hover:border-transparent hover:text-white hover:shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Member Portal
                    </span>
                    <div className="absolute inset-0 z-0 h-full w-0 bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-400 ease-out group-hover:w-full"></div>
                  </Link>
                </div>
              )
            ) : null}

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex lg:hidden text-[var(--color-cyber-white)] p-1"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} links={links} pathname={pathname} />
    </>
  );
}
