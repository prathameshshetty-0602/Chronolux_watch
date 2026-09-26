"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { Archive, BarChart3, Check, Mail, PackageCheck, Pencil, Plus, Star, Tags, Trash2, Users, Watch } from "lucide-react";
import { money } from "@/lib/money";
import { useToast } from "@/components/toast-provider";

type Tab = "overview" | "products" | "orders" | "taxonomy" | "customers" | "reviews" | "messages";
type ProductRow = {
  id: string; slug: string; name: string; model: string; description: string; price: number; compareAtPrice: number | null;
  stock: number; type: string; gender: string; displayType: string; caseMaterial: string; strapMaterial: string;
  movement: string; dialColor: string; waterResistance: number; batteryLife: string | null; compatibility: string | null;
  warranty: string; caseSize: string; weightGrams: number; colorOptions: string[]; strapOptions: string[];
  features: string[]; tags: string[]; specs: Record<string, string>; isFeatured: boolean; isTrending: boolean;
  isBestSeller: boolean; isNewArrival: boolean; isActive: boolean; brand: { name: string; slug: string };
  category: { name: string; slug: string }; images: { url: string; alt: string }[];
};
type ProductForm = {
  slug: string; name: string; model: string; brandSlug: string; categorySlug: string; type: string; gender: string;
  price: string; compareAtPrice: string; stock: string; description: string; displayType: string; caseMaterial: string;
  strapMaterial: string; movement: string; dialColor: string; waterResistance: string; batteryLife: string;
  compatibility: string; warranty: string; caseSize: string; weightGrams: string; colorOptions: string; strapOptions: string;
  features: string; tags: string; specs: string; imageUrl: string; imageAlt: string;
  isFeatured: boolean; isTrending: boolean; isBestSeller: boolean; isNewArrival: boolean; isActive: boolean;
};
type TaxonomyItem = { id: string; slug: string; name: string; description?: string | null; _count?: { products: number } };
type TaxonomyData = { categories: TaxonomyItem[]; brands: TaxonomyItem[] };
type AdminOrder = { id: string; orderNumber: string; user: { name: string; email: string }; total: number | string; createdAt: string; status: string; paymentStatus: string };
type AdminCustomer = { id: string; name: string; email: string; phone: string | null; role: string; createdAt: string; _count: { orders: number; reviews: number } };
type AdminReview = { id: string; title: string; body: string; rating: number; status: string; reportCount: number; user: { id: string; name: string; email: string }; product: { id: string; name: string; slug: string }; _count: { reports: number } };
type AdminMessage = { id: string; name: string; email: string; phone: string | null; subject: string; message: string; isRead: boolean; createdAt: string };
type DashboardStats = {
  totals: { sales: number; orders: number; customers: number; products: number; lowStock: number };
  monthly: { key: string; label: string; revenue: number; orders: number }[];
  categories: { name: string; count: number }[];
  lowStock: { id: string; name: string; stock: number }[];
  recentOrders: AdminOrder[];
};
const adminTabs = [
  ["overview", "Overview", BarChart3], ["products", "Products", Watch], ["orders", "Orders", PackageCheck],
  ["taxonomy", "Categories & brands", Tags], ["customers", "Customers", Users], ["reviews", "Reviews", Star], ["messages", "Messages", Mail],
] as const;

const emptyProduct: ProductForm = {
  slug: "", name: "", model: "", brandSlug: "", categorySlug: "", type: "ANALOG", gender: "UNISEX",
  price: "", compareAtPrice: "", stock: "10", description: "", displayType: "Analog",
  caseMaterial: "316L stainless steel", strapMaterial: "Leather", movement: "Japanese quartz",
  dialColor: "Black", waterResistance: "50", batteryLife: "", compatibility: "", warranty: "2 years",
  caseSize: "40 mm", weightGrams: "70", colorOptions: "Black", strapOptions: "Original leather",
  features: "", tags: "", specs: "{}", imageUrl: "/watches/watch-01.svg", imageAlt: "ChronoLux watch",
  isFeatured: false, isTrending: false, isBestSeller: false, isNewArrival: false, isActive: true,
};

export function AdminDashboard() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [taxonomy, setTaxonomy] = useState<TaxonomyData>({ categories: [], brands: [] });
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct);
  const [editingId, setEditingId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [taxonomyForm, setTaxonomyForm] = useState({ kind: "category", name: "", description: "" });

  const api = useCallback(async (url: string, init?: RequestInit) => {
    const response = await fetch(url, init);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "That admin action couldn't be completed.");
    return data;
  }, []);

  const load = useCallback(async (target: Tab = tab) => {
    try {
      if (target === "overview") setStats(await api("/api/admin/stats"));
      if (target === "products") {
        const data = await api("/api/admin/products" + (productSearch ? "?q=" + encodeURIComponent(productSearch) : ""));
        setProducts(data.products);
        const tax = await api("/api/admin/taxonomy");
        setTaxonomy(tax);
      }
      if (target === "orders") setOrders((await api("/api/admin/orders")).orders);
      if (target === "taxonomy") setTaxonomy(await api("/api/admin/taxonomy"));
      if (target === "customers") setCustomers((await api("/api/admin/customers")).customers);
      if (target === "reviews") setReviews((await api("/api/admin/reviews")).reviews);
      if (target === "messages") setMessages((await api("/api/admin/contact")).messages);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load this section.");
    }
  }, [api, productSearch, tab]);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(tab); }, 0);
    return () => window.clearTimeout(task);
  }, [load, tab]);

  function startEdit(product: ProductRow) {
    setEditingId(product.id);
    setProductForm({
      ...emptyProduct,
      slug: product.slug, name: product.name, model: product.model,
      brandSlug: product.brand.slug, categorySlug: product.category.slug, type: product.type, gender: product.gender,
      price: String(product.price), compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      stock: String(product.stock), description: product.description, displayType: product.displayType,
      caseMaterial: product.caseMaterial, strapMaterial: product.strapMaterial, movement: product.movement,
      dialColor: product.dialColor, waterResistance: String(product.waterResistance), batteryLife: product.batteryLife ?? "",
      compatibility: product.compatibility ?? "", warranty: product.warranty, caseSize: product.caseSize,
      weightGrams: String(product.weightGrams), colorOptions: product.colorOptions.join(", "),
      strapOptions: product.strapOptions.join(", "), features: product.features.join(", "), tags: product.tags.join(", "),
      specs: JSON.stringify(product.specs, null, 2), imageUrl: product.images[0]?.url ?? "/watches/watch-01.svg",
      imageAlt: product.images[0]?.alt ?? product.name, isFeatured: product.isFeatured,
      isTrending: product.isTrending, isBestSeller: product.isBestSeller, isNewArrival: product.isNewArrival, isActive: product.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.set("file", file);
    setBusy(true);
    try {
      const data = await api("/api/admin/upload", { method: "POST", body: form });
      setProductForm((current) => ({ ...current, imageUrl: data.url, imageAlt: current.imageAlt || current.name }));
      toast("Product image uploaded to Vercel Blob.");
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : "Image upload failed.", "error");
    } finally { setBusy(false); event.target.value = ""; }
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      let specs: Record<string, string>;
      try { specs = JSON.parse(productForm.specs); }
      catch { throw new Error("Specifications must be valid JSON."); }
      const csv = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
      const payload = {
        slug: productForm.slug, name: productForm.name, model: productForm.model, brandSlug: productForm.brandSlug,
        categorySlug: productForm.categorySlug, type: productForm.type, gender: productForm.gender,
        price: Number(productForm.price), compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : null,
        stock: Number(productForm.stock), description: productForm.description, displayType: productForm.displayType,
        caseMaterial: productForm.caseMaterial, strapMaterial: productForm.strapMaterial, movement: productForm.movement,
        dialColor: productForm.dialColor, waterResistance: Number(productForm.waterResistance), batteryLife: productForm.batteryLife || null,
        compatibility: productForm.compatibility || null, warranty: productForm.warranty, caseSize: productForm.caseSize,
        weightGrams: Number(productForm.weightGrams), colorOptions: csv(productForm.colorOptions), strapOptions: csv(productForm.strapOptions),
        features: csv(productForm.features), tags: csv(productForm.tags), specs,
        images: [{ url: productForm.imageUrl, alt: productForm.imageAlt || productForm.name }],
        isFeatured: productForm.isFeatured, isTrending: productForm.isTrending, isBestSeller: productForm.isBestSeller,
        isNewArrival: productForm.isNewArrival, isActive: productForm.isActive,
      };
      await api(editingId ? "/api/admin/products/" + editingId : "/api/admin/products", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast(editingId ? "Product updated." : "Product created.");
      setProductForm(emptyProduct);
      setEditingId("");
      await load("products");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Product couldn't be saved.");
    } finally { setBusy(false); }
  }

  async function deleteProduct(product: ProductRow) {
    if (!window.confirm("Archive " + product.name + "? It will be hidden from shoppers and kept in order history.")) return;
    try {
      await api("/api/admin/products/" + product.id, { method: "DELETE" });
      toast("Product archived.", "info");
      await load("products");
    } catch (caught) { toast(caught instanceof Error ? caught.message : "Product couldn't be archived.", "error"); }
  }

  async function updateOrder(id: string, status: string) {
    try {
      await api("/api/admin/orders/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      toast("Order status updated.");
      await load("orders");
    } catch (caught) { toast(caught instanceof Error ? caught.message : "Order couldn't be updated.", "error"); }
  }

  async function moderateReview(id: string, status: string) {
    try {
      await api("/api/admin/reviews/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      toast("Review moderation updated.");
      await load("reviews");
    } catch (caught) { toast(caught instanceof Error ? caught.message : "Review couldn't be updated.", "error"); }
  }

  async function deleteReview(id: string) {
    if (!window.confirm("Permanently remove this review?")) return;
    try {
      await api("/api/admin/reviews/" + id, { method: "DELETE" });
      toast("Review removed.", "info");
      await load("reviews");
    } catch (caught) { toast(caught instanceof Error ? caught.message : "Review couldn't be removed.", "error"); }
  }

  async function markMessage(id: string, isRead: boolean) {
    try {
      await api("/api/admin/contact", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isRead }) });
      setMessages((current) => current.map((item) => item.id === id ? { ...item, isRead } : item));
    } catch (caught) { toast(caught instanceof Error ? caught.message : "Message couldn't be updated.", "error"); }
  }

  async function saveTaxonomy(event: FormEvent) {
    event.preventDefault();
    try {
      await api("/api/admin/taxonomy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(taxonomyForm) });
      setTaxonomyForm({ ...taxonomyForm, name: "", description: "" });
      toast("Collection saved.");
      await load("taxonomy");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Collection couldn't be saved."); }
  }

  async function editTaxonomy(kind: "category" | "brand", item: TaxonomyItem) {
    const name = window.prompt("New name", item.name);
    if (!name?.trim()) return;
    try {
      await api("/api/admin/taxonomy", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id: item.id, name, description: item.description ?? "" }) });
      toast("Collection updated.");
      await load("taxonomy");
    } catch (caught) { toast(caught instanceof Error ? caught.message : "Collection couldn't be updated.", "error"); }
  }

  async function deleteTaxonomy(kind: "category" | "brand", id: string) {
    if (!window.confirm("Remove this " + kind + "? Products still assigned to it must be moved first.")) return;
    try {
      await api("/api/admin/taxonomy?kind=" + kind + "&id=" + id, { method: "DELETE" });
      toast(kind + " removed.", "info");
      await load("taxonomy");
    } catch (caught) { toast(caught instanceof Error ? caught.message : "It may still have products assigned.", "error"); }
  }

  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <div className="eyebrow" style={{ padding: "7px 10px" }}>ChronoLux admin</div>
        {adminTabs.map(([key, label, Icon]) => <a href="#" key={key} onClick={(event) => { event.preventDefault(); setError(""); setTab(key); }}>{<Icon size={14} style={{ verticalAlign: "middle", marginRight: 8 }} />}{label}</a>)}
      </aside>
      <section className="admin-main">
        <span className="eyebrow">Store operations</span><h1>{adminTabs.find(([key]) => key === tab)?.[1]}</h1>
        {error && <div className="error-panel" style={{ marginBottom: 16 }}><p>{error}</p><button className="button button-outline button-small" onClick={() => void load()}>Try again</button></div>}
        {tab === "overview" && <Overview stats={stats} />}
        {tab === "products" && (
          <>
            <form className="catalog-toolbar" onSubmit={(event) => { event.preventDefault(); void load("products"); }}>
              <input className="field" placeholder="Search products" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} style={{ maxWidth: 330 }} />
              <button className="button button-outline button-small">Search</button>
              <button type="button" className="button button-gold button-small" onClick={() => { setEditingId(""); setProductForm(emptyProduct); }}><Plus size={14} /> New product</button>
            </form>
            <form className="admin-form" onSubmit={saveProduct}>
              <div className="span-3"><h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, margin: 0 }}>{editingId ? "Edit product" : "Add a product"}</h2></div>
              <AdminInput label="Product name" value={productForm.name} onChange={(value) => setProductForm({ ...productForm, name: value, slug: productForm.slug || slugify(value) })} required />
              <AdminInput label="Slug" value={productForm.slug} onChange={(value) => setProductForm({ ...productForm, slug: value })} required />
              <AdminInput label="Model" value={productForm.model} onChange={(value) => setProductForm({ ...productForm, model: value })} required />
              <AdminSelect label="Brand" value={productForm.brandSlug} onChange={(value) => setProductForm({ ...productForm, brandSlug: value })} options={taxonomy.brands.map((item) => [item.slug, item.name] as [string, string])} />
              <AdminSelect label="Category" value={productForm.categorySlug} onChange={(value) => setProductForm({ ...productForm, categorySlug: value })} options={taxonomy.categories.map((item) => [item.slug, item.name] as [string, string])} />
              <AdminSelect label="Type" value={productForm.type} onChange={(value) => setProductForm({ ...productForm, type: value })} options={["SMART", "LUXURY", "ANALOG", "DIGITAL", "SPORTS", "CASUAL", "AUTOMATIC", "MECHANICAL", "CHRONOGRAPH", "COUPLE"].map((item) => [item, item])} />
              <AdminSelect label="Gender" value={productForm.gender} onChange={(value) => setProductForm({ ...productForm, gender: value })} options={["MEN", "WOMEN", "KIDS", "UNISEX", "COUPLES"].map((item) => [item, item])} />
              <AdminInput label="Price (INR)" type="number" value={productForm.price} onChange={(value) => setProductForm({ ...productForm, price: value })} required />
              <AdminInput label="Original price (optional)" type="number" value={productForm.compareAtPrice} onChange={(value) => setProductForm({ ...productForm, compareAtPrice: value })} />
              <AdminInput label="Stock" type="number" value={productForm.stock} onChange={(value) => setProductForm({ ...productForm, stock: value })} required />
              <AdminInput label="Display" value={productForm.displayType} onChange={(value) => setProductForm({ ...productForm, displayType: value })} required />
              <AdminInput label="Case material" value={productForm.caseMaterial} onChange={(value) => setProductForm({ ...productForm, caseMaterial: value })} required />
              <AdminInput label="Strap material" value={productForm.strapMaterial} onChange={(value) => setProductForm({ ...productForm, strapMaterial: value })} required />
              <AdminInput label="Movement" value={productForm.movement} onChange={(value) => setProductForm({ ...productForm, movement: value })} required />
              <AdminInput label="Dial color" value={productForm.dialColor} onChange={(value) => setProductForm({ ...productForm, dialColor: value })} required />
              <AdminInput label="Water resistance (m)" type="number" value={productForm.waterResistance} onChange={(value) => setProductForm({ ...productForm, waterResistance: value })} required />
              <AdminInput label="Battery life" value={productForm.batteryLife} onChange={(value) => setProductForm({ ...productForm, batteryLife: value })} />
              <AdminInput label="Compatibility" value={productForm.compatibility} onChange={(value) => setProductForm({ ...productForm, compatibility: value })} />
              <AdminInput label="Warranty" value={productForm.warranty} onChange={(value) => setProductForm({ ...productForm, warranty: value })} required />
              <AdminInput label="Case size" value={productForm.caseSize} onChange={(value) => setProductForm({ ...productForm, caseSize: value })} required />
              <AdminInput label="Weight (g)" type="number" value={productForm.weightGrams} onChange={(value) => setProductForm({ ...productForm, weightGrams: value })} required />
              <AdminInput label="Dial / case finish options (comma separated)" value={productForm.colorOptions} onChange={(value) => setProductForm({ ...productForm, colorOptions: value })} required />
              <AdminInput label="Strap options (comma separated)" value={productForm.strapOptions} onChange={(value) => setProductForm({ ...productForm, strapOptions: value })} />
              <AdminInput label="Features (comma separated)" value={productForm.features} onChange={(value) => setProductForm({ ...productForm, features: value })} required />
              <AdminInput label="Search tags (comma separated)" value={productForm.tags} onChange={(value) => setProductForm({ ...productForm, tags: value })} />
              <div className="span-3"><label className="field-label" htmlFor="product-description">Description</label><textarea className="field" id="product-description" rows={4} value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} required minLength={20} maxLength={3000} /></div>
              <div className="span-2"><label className="field-label" htmlFor="product-specs">Specifications (JSON)</label><textarea className="field" id="product-specs" rows={4} value={productForm.specs} onChange={(event) => setProductForm({ ...productForm, specs: event.target.value })} /></div>
              <div><label className="field-label" htmlFor="product-image">Image URL or local path</label><input className="field" id="product-image" value={productForm.imageUrl} onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })} required /><input className="field" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void uploadImage(event)} style={{ marginTop: 8 }} /><p className="field-hint">Upload uses Vercel Blob. Enter a URL or demo path if Blob is not configured.</p></div>
              <AdminInput label="Image description" value={productForm.imageAlt} onChange={(value) => setProductForm({ ...productForm, imageAlt: value })} required />
              <div className="span-2" style={{ display: "flex", gap: 11, flexWrap: "wrap", alignItems: "end" }}>
                {([["isFeatured", "Featured"], ["isTrending", "Trending"], ["isBestSeller", "Best seller"], ["isNewArrival", "New arrival"], ["isActive", "Visible"]] as const).map(([key, label]) => <label className="checkbox-line" key={key}><input type="checkbox" checked={productForm[key]} onChange={(event) => setProductForm({ ...productForm, [key]: event.target.checked })} /> {label}</label>)}
              </div>
              <div className="span-3" style={{ display: "flex", gap: 9 }}><button className="button button-gold" disabled={busy}>{busy ? "Saving…" : editingId ? "Save changes" : "Create product"} <Check size={14} /></button>{editingId && <button type="button" className="button button-outline" onClick={() => { setEditingId(""); setProductForm(emptyProduct); }}>Cancel</button>}</div>
            </form>
            <div className="table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>Brand / category</th><th>Price</th><th>Stock</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>
              {products.map((product) => <tr key={product.id}><td><b>{product.name}</b><br />{product.model}</td><td>{product.brand.name}<br />{product.category.name}</td><td>{money(product.price)}</td><td style={{ color: product.stock <= 5 ? "#e0bb7e" : "inherit" }}>{product.stock}</td><td>{product.isActive ? "Visible" : "Archived"}</td><td><button className="icon-button" aria-label="Edit product" onClick={() => startEdit(product)}><Pencil size={14} /></button><button className="icon-button" aria-label="Archive product" onClick={() => void deleteProduct(product)}><Archive size={14} /></button></td></tr>)}
            </tbody></table></div>
          </>
        )}
        {tab === "orders" && <div className="table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Amount / payment</th><th>Status</th><th>Update status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><b>{order.orderNumber}</b><br />{new Date(order.createdAt).toLocaleDateString()}</td><td>{order.user.name}<br />{order.user.email}</td><td>{money(Number(order.total))}<br />{order.paymentStatus.replaceAll("_", " ")}</td><td>{order.status.replaceAll("_", " ")}</td><td><select className="filter-field" value={order.status} onChange={(event) => void updateOrder(order.id, event.target.value)}>{["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></td></tr>)}</tbody></table></div>}
        {tab === "taxonomy" && (
          <>
            <form className="admin-form" onSubmit={saveTaxonomy}>
              <AdminSelect label="Type" value={taxonomyForm.kind} onChange={(value) => setTaxonomyForm({ ...taxonomyForm, kind: value })} options={[["category", "Category"], ["brand", "Brand"]]} />
              <AdminInput label="Name" value={taxonomyForm.name} onChange={(value) => setTaxonomyForm({ ...taxonomyForm, name: value })} required />
              {taxonomyForm.kind === "category" && <AdminInput label="Description" value={taxonomyForm.description} onChange={(value) => setTaxonomyForm({ ...taxonomyForm, description: value })} />}
              <button className="button button-gold" style={{ alignSelf: "end" }}><Plus size={14} /> Add</button>
            </form>
            <div className="form-grid">
              <TaxonomyList title="Categories" kind="category" items={taxonomy.categories ?? []} edit={editTaxonomy} remove={deleteTaxonomy} />
              <TaxonomyList title="Brands" kind="brand" items={taxonomy.brands ?? []} edit={editTaxonomy} remove={deleteTaxonomy} />
            </div>
          </>
        )}
        {tab === "customers" && <div className="table-wrap"><table className="data-table"><thead><tr><th>Customer</th><th>Email / phone</th><th>Orders</th><th>Reviews</th><th>Role</th><th>Joined</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td>{customer.name}</td><td>{customer.email}<br />{customer.phone ?? "—"}</td><td>{customer._count.orders}</td><td>{customer._count.reviews}</td><td>{customer.role}</td><td>{new Date(customer.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
        {tab === "reviews" && <div className="table-wrap"><table className="data-table"><thead><tr><th>Review</th><th>Customer / product</th><th>Rating</th><th>Reports</th><th>Status</th><th>Actions</th></tr></thead><tbody>{reviews.map((review) => <tr key={review.id}><td><b>{review.title}</b><br />{review.body.slice(0, 150)}{review.body.length > 150 ? "…" : ""}</td><td>{review.user.name}<br />{review.product.name}</td><td>{review.rating} / 5</td><td>{review._count.reports}</td><td>{review.status}</td><td><button className="button button-outline button-small" onClick={() => void moderateReview(review.id, review.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED")}>{review.status === "PUBLISHED" ? "Hide" : "Publish"}</button><button className="icon-button" aria-label="Delete review" onClick={() => void deleteReview(review.id)}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>}
        {tab === "messages" && <div className="table-wrap"><table className="data-table"><thead><tr><th>Received</th><th>Contact</th><th>Subject / message</th><th>State</th><th>Action</th></tr></thead><tbody>{messages.map((message) => <tr key={message.id}><td>{new Date(message.createdAt).toLocaleString()}</td><td>{message.name}<br /><a href={"mailto:" + message.email}>{message.email}</a><br />{message.phone ?? ""}</td><td><b>{message.subject}</b><br />{message.message}</td><td>{message.isRead ? "Read" : "Unread"}</td><td><button className="button button-outline button-small" onClick={() => void markMessage(message.id, !message.isRead)}>{message.isRead ? "Mark unread" : "Mark read"}</button></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}

function Overview({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return <div className="skeleton loading-block" />;
  const max = Math.max(1, ...stats.monthly.map((item) => item.revenue));
  return (
    <>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(5,minmax(0,1fr))" }}>
        <Stat label="Net sales" value={money(stats.totals.sales)} /><Stat label="Orders" value={stats.totals.orders} /><Stat label="Customers" value={stats.totals.customers} /><Stat label="Active products" value={stats.totals.products} /><Stat label="Low stock" value={stats.totals.lowStock} />
      </div>
      <div className="detail-tabs">
        <div className="chart-panel"><h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 400 }}>Paid revenue · six months</h2><div className="chart-bars">{stats.monthly.map((month) => <div className="chart-row" key={month.key}><span>{month.label}</span><div className="chart-track"><div className="chart-fill" style={{ width: Math.max(month.revenue ? 3 : 0, month.revenue / max * 100) + "%" }} /></div><span>{money(month.revenue)}</span></div>)}</div></div>
        <div className="chart-panel"><h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 400 }}>Products by collection</h2><div className="chart-bars">{stats.categories.map((item) => <div className="chart-row" key={item.name}><span>{item.name}</span><div className="chart-track"><div className="chart-fill" style={{ width: Math.min(100, item.count / Math.max(1, ...stats.categories.map((entry) => entry.count)) * 100) + "%" }} /></div><span>{item.count}</span></div>)}</div></div>
      </div>
      <div className="section-heading" style={{ marginTop: 30 }}><div><span className="eyebrow">Needs attention</span><h2>Low inventory</h2></div></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>Units remaining</th></tr></thead><tbody>{stats.lowStock.map((product) => <tr key={product.id}><td>{product.name}</td><td>{product.stock}</td></tr>)}</tbody></table></div>
      <div className="section-heading" style={{ marginTop: 30 }}><div><span className="eyebrow">Latest activity</span><h2>Recent orders</h2></div></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>{stats.recentOrders.map((order) => <tr key={order.id}><td>{order.orderNumber}</td><td>{order.user.name}</td><td>{money(Number(order.total))}</td><td>{order.status.replaceAll("_", " ")}</td></tr>)}</tbody></table></div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="stat-card"><strong style={{ fontSize: 23 }}>{value}</strong><span>{label}</span></div>;
}

function AdminInput({ label, value, onChange, required = false, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  const id = "admin-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div><label className="field-label" htmlFor={id}>{label}</label><input className="field" id={id} type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} /></div>;
}

function AdminSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  const id = "admin-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div><label className="field-label" htmlFor={id}>{label}</label><select className="filter-field" id={id} value={value} onChange={(event) => onChange(event.target.value)} required><option value="">Choose…</option>{options.map(([key, name]) => <option value={key} key={key}>{name}</option>)}</select></div>;
}

function TaxonomyList({ title, kind, items, edit, remove }: { title: string; kind: "category" | "brand"; items: TaxonomyItem[]; edit: (kind: "category" | "brand", item: TaxonomyItem) => void; remove: (kind: "category" | "brand", id: string) => void }) {
  return <section className="data-card"><h2>{title}</h2>{items.map((item) => <div key={item.id} className="summary-line" style={{ borderBottom: "1px solid var(--line)" }}><span><b>{item.name}</b><small style={{ display: "block", color: "#7e837f" }}>{item.slug} · {item._count?.products ?? 0} products</small></span><span><button className="icon-button" aria-label="Rename" onClick={() => edit(kind, item)}><Pencil size={13} /></button><button className="icon-button" aria-label="Remove" onClick={() => void remove(kind, item.id)}><Trash2 size={13} /></button></span></div>)}</section>;
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
