"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { CartItem, StoreProduct } from "@/types/store";
import { useToast } from "@/components/toast-provider";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  addItem: (product: StoreProduct, quantity?: number, variant?: string) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "chronolux-guest-cart-v1";

function readGuestCart(): CartItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) as CartItem[] : [];
  } catch {
    return [];
  }
}

async function readRemoteCart(): Promise<CartItem[]> {
  const response = await fetch("/api/cart", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load your saved cart.");
  const data = await response.json();
  return data.items as CartItem[];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const toast = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    let cancelled = false;
    const load = async () => {
      if (status === "authenticated") {
        try {
          const guestItems = readGuestCart();
          if (guestItems.length) {
            await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "merge", items: guestItems.map((item) => ({ productId: item.productId, quantity: item.quantity, variant: item.variant })) }),
            });
            localStorage.removeItem(STORAGE_KEY);
          }
          const cart = await readRemoteCart();
          if (!cancelled) setItems(cart);
        } catch {
          if (!cancelled) toast("Your saved cart couldn't be loaded. Please refresh to try again.", "error");
        }
      } else {
        if (!cancelled) setItems(readGuestCart());
      }
      if (!cancelled) setReady(true);
    };
    void load();
    return () => { cancelled = true; };
  }, [status, toast]);

  useEffect(() => {
    if (ready && status !== "authenticated") localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready, status]);

  const addItem = useCallback(async (product: StoreProduct, quantity = 1, variant?: string) => {
    if (status === "authenticated") {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity, variant }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not add this watch.");
      setItems(result.items);
    } else {
      setItems((current) => {
        const found = current.find((item) => item.productId === product.id);
        if (found) return current.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(product.stock, 20, item.quantity + quantity), variant: variant ?? item.variant } : item);
        return [...current, { id: product.id, productId: product.id, quantity: Math.min(quantity, product.stock, 20), variant, product }];
      });
    }
    toast(product.name + " added to your bag.");
  }, [status, toast]);

  const setQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    const current = items.find((item) => item.productId === productId);
    if (!current) return;
    if (quantity > current.product.stock || quantity > 20) throw new Error("There isn't enough stock for that quantity.");
    if (status === "authenticated") {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update your bag.");
      setItems(result.items);
    } else {
      setItems((value) => value.map((item) => item.productId === productId ? { ...item, quantity } : item));
    }
  }, [items, status]);

  const removeItem = useCallback(async (productId: string) => {
    if (status === "authenticated") {
      const response = await fetch("/api/cart?productId=" + encodeURIComponent(productId), { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not remove this watch.");
      setItems(result.items);
    } else {
      setItems((value) => value.filter((item) => item.productId !== productId));
    }
  }, [status]);

  const value = useMemo(() => ({
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    ready,
    addItem,
    setQuantity,
    removeItem,
  }), [items, ready, addItem, setQuantity, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
