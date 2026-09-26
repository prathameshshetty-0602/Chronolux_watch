"use client";

import { useCallback, useEffect, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { ProductGrid } from "@/components/store-ui";
import type { StoreProduct } from "@/types/store";

type Taxonomy = { categories: { name: string; slug: string; productCount: number }[]; brands: { name: string; slug: string }[] };
type Filters = {
  category: string; brand: string; type: string; gender: string; strap: string;
  case: string; display: string; water: string; rating: string; availability: string;
  minPrice: string; maxPrice: string; sort: string;
};

export function ProductBrowser({ initialCategory = "", initialQuery = "", initialGender = "", initialSort = "newest" }: { initialCategory?: string; initialQuery?: string; initialGender?: string; initialSort?: string }) {
  const [filters, setFilters] = useState<Filters>({
    category: initialCategory, brand: "", type: "", gender: initialGender.toUpperCase(),
    strap: "", case: "", display: "", water: "", rating: "", availability: "",
    minPrice: "", maxPrice: "", sort: initialSort,
  });
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [taxonomy, setTaxonomy] = useState<Taxonomy>({ categories: [], brands: [] });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "12");
    params.set("sort", filters.sort);
    if (query.trim()) params.set("q", query.trim());
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== "sort") params.set(key, value);
    });
    try {
      const response = await fetch("/api/products?" + params.toString(), { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The collection couldn't load.");
      setProducts(data.products);
      setTotal(data.pagination.total);
      setPages(Math.max(1, data.pagination.pages));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The collection couldn't load.");
    } finally {
      setLoading(false);
    }
  }, [filters, page, query]);

  useEffect(() => {
    let active = true;
    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => { if (active) setTaxonomy(data); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 120);
    return () => window.clearTimeout(timer);
  }, [load]);

  function update(key: keyof Filters, value: string) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setFilters({ category: "", brand: "", type: "", gender: "", strap: "", case: "", display: "", water: "", rating: "", availability: "", minPrice: "", maxPrice: "", sort: "newest" });
    setQuery("");
    setPage(1);
  }

  return (
    <section className="container">
      <div className="catalog-layout">
        <aside className={"filter-panel" + (showFilters ? " visible" : "")}>
          <div className="filter-title"><h2>Refine the collection</h2><button className="icon-button" onClick={reset} aria-label="Reset filters"><RotateCcw size={14} /></button></div>
          <FilterSelect label="Collection" value={filters.category} onChange={(value) => update("category", value)} options={taxonomy.categories.map((item) => [item.slug, item.name])} />
          <FilterSelect label="Brand" value={filters.brand} onChange={(value) => update("brand", value)} options={taxonomy.brands.map((item) => [item.slug, item.name])} />
          <FilterSelect label="Watch type" value={filters.type} onChange={(value) => update("type", value)} options={["SMART", "LUXURY", "ANALOG", "DIGITAL", "SPORTS", "CASUAL", "AUTOMATIC", "MECHANICAL", "CHRONOGRAPH", "COUPLE"].map((item) => [item.toLowerCase(), labelCase(item)])} />
          <FilterSelect label="For" value={filters.gender} onChange={(value) => update("gender", value)} options={["MEN", "WOMEN", "KIDS", "UNISEX", "COUPLES"].map((item) => [item.toLowerCase(), labelCase(item)])} />
          <div className="filter-group">
            <h3>Price range</h3>
            <div className="form-grid" style={{ gap: 7 }}>
              <input aria-label="Minimum price" className="filter-field" type="number" min="0" placeholder="From ₹" value={filters.minPrice} onChange={(event) => update("minPrice", event.target.value)} />
              <input aria-label="Maximum price" className="filter-field" type="number" min="0" placeholder="To ₹" value={filters.maxPrice} onChange={(event) => update("maxPrice", event.target.value)} />
            </div>
          </div>
          <FilterSelect label="Strap material" value={filters.strap} onChange={(value) => update("strap", value)} options={["Steel", "Leather", "Silicone", "Nylon", "Mesh"]} />
          <FilterSelect label="Case material" value={filters.case} onChange={(value) => update("case", value)} options={["Steel", "Titanium", "Aluminium", "Polymer", "Resin"]} />
          <FilterSelect label="Display" value={filters.display} onChange={(value) => update("display", value)} options={["Analog", "Digital", "AMOLED", "LCD", "Sapphire"]} />
          <FilterSelect label="Water resistance" value={filters.water} onChange={(value) => update("water", value)} options={[["30", "30 m or more"], ["50", "50 m or more"], ["100", "100 m or more"], ["300", "300 m or more"]]} />
          <FilterSelect label="Minimum rating" value={filters.rating} onChange={(value) => update("rating", value)} options={[["3", "3 stars & up"], ["4", "4 stars & up"], ["5", "5 stars"]]} />
          <FilterSelect label="Availability" value={filters.availability} onChange={(value) => update("availability", value)} options={[["in-stock", "In stock"]]} />
        </aside>
        <div>
          <div className="catalog-toolbar">
            <p>{loading ? "Finding your timepiece…" : total + (total === 1 ? " watch" : " watches")}</p>
            <div className="toolbar-actions">
              <button className="button button-outline button-small mobile-filter" onClick={() => setShowFilters((value) => !value)}><Filter size={13} /> Filters</button>
              <input className="filter-field" style={{ width: 205 }} aria-label="Search this collection" placeholder="Search by name, brand or model" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
              <select className="filter-field" style={{ width: 160 }} aria-label="Sort products" value={filters.sort} onChange={(event) => update("sort", event.target.value)}>
                <option value="newest">Newest</option><option value="popular">Popular</option><option value="rating">Highest rated</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="discount">Best offers</option>
              </select>
            </div>
          </div>
          {error ? <div className="error-panel"><h2>The collection couldn&apos;t load.</h2><p>{error}</p><button className="button button-outline" onClick={() => void load()}>Try again</button></div> : loading ? (
            <div className="product-grid">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="skeleton skeleton-card" />)}</div>
          ) : <ProductGrid products={products} empty="No watches match those filters." />}
          {!loading && !error && pages > 1 && (
            <div className="pagination">
              <button className="page-number" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} aria-label="Previous page">‹</button>
              {Array.from({ length: pages }, (_, index) => index + 1).slice(Math.max(0, page - 3), Math.min(pages, page + 2)).map((number) => (
                <button className={"page-number" + (number === page ? " active" : "")} key={number} onClick={() => setPage(number)}>{number}</button>
              ))}
              <button className="page-number" disabled={page >= pages} onClick={() => setPage((value) => value + 1)} aria-label="Next page">›</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: ([string, string] | string)[] }) {
  return (
    <div className="filter-group">
      <label className="field-label">{label}</label>
      <select className="filter-field" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option) => {
          const [optionValue, optionLabel] = Array.isArray(option) ? option : [option, option];
          return <option value={optionValue} key={optionValue}>{optionLabel}</option>;
        })}
      </select>
    </div>
  );
}

function labelCase(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}
