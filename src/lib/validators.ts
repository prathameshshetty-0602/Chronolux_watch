import { z } from "zod";

export const emailSchema = z.email().max(254).transform((value) => value.trim().toLowerCase());
export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(128)
  .regex(/[a-z]/, "Add a lowercase letter.")
  .regex(/[A-Z]/, "Add an uppercase letter.")
  .regex(/[0-9]/, "Add a number.")
  .regex(/[^A-Za-z0-9]/, "Add a symbol.");

export const signupSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: emailSchema,
    phone: z.string().trim().min(7).max(24).optional().or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(32).default("Home"),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(24),
  line1: z.string().trim().min(4).max(160),
  line2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(80).default("India"),
  postalCode: z.string().trim().min(3).max(16),
});

export const productSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  name: z.string().trim().min(2).max(140),
  model: z.string().trim().min(1).max(80),
  description: z.string().trim().min(20).max(3000),
  price: z.number().positive().max(10000000),
  compareAtPrice: z.number().positive().max(10000000).nullable().optional(),
  stock: z.number().int().min(0).max(100000),
  type: z.enum(["SMART", "LUXURY", "ANALOG", "DIGITAL", "SPORTS", "CASUAL", "AUTOMATIC", "MECHANICAL", "CHRONOGRAPH", "COUPLE"]),
  gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX", "COUPLES"]),
  categorySlug: z.string().min(1),
  brandSlug: z.string().min(1),
  displayType: z.string().trim().min(1).max(80),
  caseMaterial: z.string().trim().min(1).max(80),
  strapMaterial: z.string().trim().min(1).max(80),
  movement: z.string().trim().min(1).max(80),
  dialColor: z.string().trim().min(1).max(80),
  waterResistance: z.number().int().min(0).max(10000),
  batteryLife: z.string().trim().max(80).nullable().optional(),
  compatibility: z.string().trim().max(160).nullable().optional(),
  warranty: z.string().trim().min(1).max(80),
  caseSize: z.string().trim().min(1).max(40),
  weightGrams: z.number().positive().max(10000),
  colorOptions: z.array(z.string().trim().min(1).max(40)).max(20),
  strapOptions: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  features: z.array(z.string().trim().min(1).max(100)).max(40),
  tags: z.array(z.string().trim().min(1).max(40)).max(40),
  specs: z.record(z.string(), z.string().max(300)),
  images: z.array(z.object({
    url: z.string().max(2048).refine((value) => {
      try { return new URL(value).protocol === "https:" && new URL(value).hostname.endsWith(".public.blob.vercel-storage.com"); }
      catch { return value.startsWith("/") && !value.startsWith("//") && !value.includes(".."); }
    }, "Enter a Vercel Blob URL or a local path."),
    alt: z.string().trim().min(2).max(180),
  })).min(1).max(12),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isActive: z.boolean().default(true),
}).refine((data) => !data.compareAtPrice || data.compareAtPrice > data.price, {
  message: "The original price must be higher than the current price.",
  path: ["compareAtPrice"],
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: z.string().trim().max(24).optional().or(z.literal("")),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5000),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(100),
  body: z.string().trim().min(20).max(3000),
});

export type ProductInput = z.infer<typeof productSchema>;
