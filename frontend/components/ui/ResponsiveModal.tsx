"use client";

import React, { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  hideCloseButton?: boolean;
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  icon,
  className,
  hideCloseButton = false,
}: ResponsiveModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className={cn(
                    "pointer-events-auto w-full max-w-[420px] max-h-[90vh] overflow-y-auto bg-[#121216] border border-white/10 rounded-[24px] shadow-[0_20px_70px_rgba(0,0,0,0.8)] relative",
                    className
                  )}
                >
                  {!hideCloseButton && (
                    <Dialog.Close asChild>
                      <button 
                        className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors z-10"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </Dialog.Close>
                  )}

                  <div className="flex flex-col items-center text-center p-6 sm:p-8">
                    {icon && (
                      <div className="mb-4">
                        {icon}
                      </div>
                    )}
                    
                    {title && (
                      <Dialog.Title className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                        {title}
                      </Dialog.Title>
                    )}
                    
                    {description && (
                      <Dialog.Description className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                        {description}
                      </Dialog.Description>
                    )}

                    <div className="w-full">
                      {children}
                    </div>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export function ResponsiveModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col sm:flex-row-reverse items-center gap-3 w-full mt-2", className)}>
      {children}
    </div>
  );
}
