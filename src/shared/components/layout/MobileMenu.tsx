"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type MobileMenuProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  links: { name: string; href: string }[];
  pathname: string;
};

export function MobileMenu({ isOpen, setIsOpen, links, pathname }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--color-cyber-black)]/95 backdrop-blur-md z-[40] lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-[45] bg-[var(--color-cyber-black)] border-b border-[var(--color-cyber-gray)] lg:hidden shadow-sm pt-[80px]"
          >
            <div className="flex flex-col px-8 py-8">
              <div className="flex flex-col gap-0 mb-8 pb-8">
                {links.map((link, i) => {
                  const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`block text-3xl font-heading font-bold py-4 border-b border-[var(--color-cyber-gray)]/50 transition-colors ${
                          isActive
                            ? "text-[var(--color-cyber-neon)]"
                            : "text-[var(--color-cyber-light)] hover:text-[var(--color-cyber-white)]"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-4"
              >
                <Link
                  href="/join"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full py-4 text-lg"
                >
                  Join Us
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="btn-outline w-full py-4 text-lg"
                >
                  Member Login
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
