"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";
import { StoreProduct } from "@/types/store";

type WishlistContextValue = {
  ids: string[];
  toggle: (product: StoreProduct) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [ids, setIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") return;
    const response = await fetch("/api/wishlist", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setIds((data.items as { productId: string }[]).map((item) => item.productId));
  }, [status]);

  useEffect(() => {
    const task = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(task);
  }, [refresh]);

  const remove = useCallback(async (productId: string) => {
    const response = await fetch("/api/wishlist?productId=" + encodeURIComponent(productId), { method: "DELETE" });
    if (!response.ok) throw new Error("Could not remove this watch from your saved list.");
    setIds((current) => current.filter((id) => id !== productId));
  }, []);

  const toggle = useCallback(async (product: StoreProduct) => {
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (ids.includes(product.id)) {
      await remove(product.id);
      toast("Removed from your wishlist.", "info");
      return;
    }
    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not save this watch.");
    setIds((current) => [...current, product.id]);
    toast("Saved to your wishlist.");
  }, [ids, remove, router, status, toast]);

  const value = useMemo(() => ({ ids: status === "authenticated" ? ids : [], toggle, remove, refresh }), [ids, status, toggle, remove, refresh]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
