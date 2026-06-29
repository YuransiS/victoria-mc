"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ClientPortalProps {
  children: React.ReactNode;
  selector?: string;
}

export function ClientPortal({ children, selector = "body" }: ClientPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const target = document.querySelector(selector);
  if (!target) return null;

  return createPortal(children, target);
}
