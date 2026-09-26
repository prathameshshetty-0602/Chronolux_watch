"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { BadgeCheck, Flag, Send, Star, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/toast-provider";

type ReviewItem = { id: string; rating: number; title: string; body: string; createdAt: string; name: string; verifiedPurchase: boolean };
type ReviewData = { reviews: ReviewItem[]; average: number; count: number; distribution: Record<number, number>; canReview: boolean; myReview: { id: string; rating: number; title: string; body: string; status: "PUBLISHED" | "HIDDEN" } | null; signedIn: boolean };

export function ReviewPanel({ productId }: { productId: string }) {
  const { status } = useSession();
  const toast = useToast();
  const [data, setData] = useState<ReviewData | null>(null);
  const [sort, setSort] = useState("newest");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/reviews?productId=" + encodeURIComponent(productId) + "&sort=" + sort, { cache: "no-store" });
    const result = await response.json();
    if (response.ok) {
      setData(result);
      if (result.myReview) {
        setRating(result.myReview.rating);
        setTitle(result.myReview.title);
        setBody(result.myReview.body);
      }
    }
  }, [productId, sort]);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!data?.canReview) return;
    setBusy(true);
    setError("");
    try {
      const editing = Boolean(data.myReview);
      const response = await fetch(editing ? "/api/reviews/" + data.myReview?.id : "/api/reviews", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your review couldn't be saved.");
      toast(editing ? "Your review was updated." : "Thank you for sharing your review.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your review couldn't be saved.");
    } finally { setBusy(false); }
  }

  async function removeReview() {
    if (!data?.myReview || !window.confirm("Delete your review?")) return;
    const response = await fetch("/api/reviews/" + data.myReview.id, { method: "DELETE" });
    if (!response.ok) { toast("Your review couldn't be deleted.", "error"); return; }
    toast("Review deleted.", "info");
    setTitle("");
    setBody("");
    await load();
  }

  async function report(review: ReviewItem) {
    if (!window.confirm("Report this review for moderator attention?")) return;
    const response = await fetch("/api/reviews/" + review.id + "/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Inappropriate or misleading content" }),
    });
    const result = await response.json();
    if (!response.ok) { toast(result.error || "Sign in to report a review.", "error"); return; }
    toast("Review reported to the ChronoLux team.");
  }

  return (
    <div>
      {!data ? <div className="skeleton loading-block" /> : (
        <>
          <div className="review-summary">
            <div className="review-score">{data.count ? data.average.toFixed(1) : "—"}<small>{data.count ? data.count + " verified review" + (data.count === 1 ? "" : "s") : "No reviews yet"}</small></div>
            <div className="rating-bars">
              {[5, 4, 3, 2, 1].map((value) => (
                <div className="rating-bar-row" key={value}>
                  <span>{value} stars</span><div className="rating-bar"><span style={{ width: data.count ? (data.distribution[value] / data.count * 100) + "%" : "0%" }} /></div><span>{data.distribution[value]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="section-heading" style={{ marginTop: 31 }}>
            <div><span className="eyebrow">Verified owner notes</span><h2>Customer reviews</h2></div>
            <select className="filter-field" style={{ width: 150 }} aria-label="Sort reviews" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option></select>
          </div>
          {data.reviews.length ? data.reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 15 }}>
                <div><span className="stars">{Array.from({ length: review.rating }).map((_, index) => <Star key={index} size={12} fill="currentColor" strokeWidth={0} />)}</span><span className="verified" style={{ marginLeft: 10 }}><BadgeCheck size={12} /> Verified purchase</span></div>
                <button className="icon-button" onClick={() => void report(review)} aria-label="Report this review"><Flag size={14} /></button>
              </div>
              <h3>{review.title}</h3>
              <p>{review.body}</p>
              <small style={{ color: "#858985", fontSize: 9 }}>{review.name} · {new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</small>
            </article>
          )) : <div className="empty-state" style={{ marginTop: 18 }}><h3>Be the first to share.</h3><p>Reviews are published after a verified purchase.</p></div>}

          {status === "unauthenticated" ? (
            <div className="data-card" style={{ marginTop: 28 }}><h2>Share your experience</h2><p className="detail-description">Sign in and purchase this watch to leave a verified review.</p><Link className="button button-outline" href="/login">Sign in</Link></div>
          ) : data.canReview ? (
            <form className="data-card form-stack" style={{ marginTop: 28 }} onSubmit={submit}>
              <h2>{data.myReview ? "Edit your review" : "Write a review"}</h2>
              {data.myReview?.status === "HIDDEN" && <p className="field-hint">Your review is hidden while a moderator reviews it. You can edit or delete it here.</p>}
              <div><span className="field-label">Your rating</span><div className="swatch-row" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((value) => <button className="icon-button" type="button" key={value} aria-pressed={rating === value} aria-label={value + " stars"} onClick={() => setRating(value)}><Star size={21} fill={value <= rating ? "currentColor" : "none"} color="var(--gold)" /></button>)}
              </div></div>
              <div><label className="field-label" htmlFor="review-title">Review title</label><input className="field" id="review-title" value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} maxLength={100} required /></div>
              <div><label className="field-label" htmlFor="review-body">Your review</label><textarea className="field" id="review-body" rows={5} minLength={20} maxLength={3000} required value={body} onChange={(event) => setBody(event.target.value)} style={{ resize: "vertical" }} /></div>
              {error && <p className="form-error">{error}</p>}
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}><button className="button button-gold" disabled={busy}>{busy ? "Saving…" : data.myReview ? "Update review" : "Submit review"} <Send size={14} /></button>{data.myReview && <button type="button" className="button button-outline" onClick={() => void removeReview()}><Trash2 size={14} /> Delete review</button>}</div>
            </form>
          ) : status === "authenticated" ? (
            <div className="data-card" style={{ marginTop: 28 }}><h2>Verified owners welcome</h2><p className="detail-description">Once your purchase is confirmed, you can leave a verified review here. See your <Link className="inline-link" href="/orders">orders</Link>.</p></div>
          ) : null}
        </>
      )}
    </div>
  );
}
