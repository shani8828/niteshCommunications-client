import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Send } from "lucide-react";
import api from "../../utils/api";
import { showToast } from "../../utils/toast";
import { setCachedData } from "../../utils/cache";

const ProductReviews = ({
  productId,
  productSlug,
  reviews,
  onReviewsUpdate,
  user,
  currentLang,
  t,
  loading,
}) => {
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-10 mt-16 pt-10 border-t border-slate-100 animate-pulse">
        {/* Left Column: List Reviews */}
        <div className="flex-1 w-full">
          <div className="h-6 w-32 bg-slate-200 rounded mb-6" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                </div>
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-full bg-slate-200 rounded mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Write Review */}
        <div className="w-full md:w-[320px] flex-shrink-0">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl">
            <div className="h-5 w-28 bg-slate-200 rounded mb-4" />
            <div className="flex flex-col gap-4">
              <div className="h-8 bg-slate-100 rounded" />
              <div className="h-16 bg-slate-100 rounded" />
              <div className="h-8 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast.error(t("product:comment"));
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${productId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });

      showToast.success("Review added successfully!");
      setReviewComment("");
      setReviewRating(5);

      // Fetch refreshed product detail to get updated reviews list
      const refreshResponse = await api.get(`/products/slug/${productSlug}`);
      const updatedReviews = refreshResponse.data.reviews || [];
      
      onReviewsUpdate(updatedReviews);

      // Sync updated reviews list to cached details
      setCachedData(
        `product_detail_${productSlug}`,
        refreshResponse.data,
        5 * 60 * 1000
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to submit review";
      showToast.error(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 mt-16 pt-10 border-t border-slate-100">
      {/* Left Column: List Reviews */}
      <div className="flex-1 w-full">
        <h3 className="font-heading text-lg font-bold text-slate-800 mb-6">
          {t("product:reviews")}
        </h3>
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400">{t("product:no_reviews")}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">
                    {rev.user?.name || "Customer"}
                  </span>
                  <span className="text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex my-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      fill={i < rev.rating ? "#f59e0b" : "none"}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-2">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Write Review */}
      <div className="w-full md:w-[320px] flex-shrink-0">
        {user ? (
          <div className="p-6 bg-white border border-slate-200 rounded-2xl">
            <h3 className="font-heading text-base font-bold text-blue-600 mb-4">
              {t("product:write_review")}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                  {t("product:rating")}
                </label>
                <select
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer text-xs"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  <option value="5">5 Stars - 🌕</option>
                  <option value="4">4 Stars - 🌖</option>
                  <option value="3">3 Stars - 🌗</option>
                  <option value="2">2 Stars - 🌘</option>
                  <option value="1">1 Star - 🌑</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="block mb-1.5 text-xs font-semibold text-slate-500">
                  {t("product:comment")}
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 outline-none text-xs"
                  rows="3"
                  placeholder="Share your experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={12} />{" "}
                {submittingReview
                  ? t("common:submitting", "Submitting...")
                  : t("common:submit")}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Please{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-semibold"
              >
                Login
              </Link>{" "}
              to write a customer review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductReviews);
