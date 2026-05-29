import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import { showToast } from '../utils/toast';
import { Star, Heart, ShoppingCart, ShieldAlert, ArrowLeft, Send } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation(['product', 'common', 'notifications']);
  const navigate = useNavigate();
  const { user, getHeaders } = useAuth();
  const { addToCart, toggleWishlist, wishlist, addRecentlyViewed } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState('');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setProduct(data.product);
          setRelated(data.related || []);
          setReviews(data.reviews || []);
          setActiveImage(data.product.images[0]);
          
          addRecentlyViewed(data.product);
        } else {
          showToast.error('Product not found');
          navigate('/shop');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast.error(t('product:comment'));
      return;
    }
    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const data = await response.json();

      if (response.ok) {
        showToast.success('Review added successfully!');
        setReviewComment('');
        const refreshResponse = await fetch(`/api/products/${id}`);
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setReviews(refreshData.reviews || []);
        }
      } else {
        showToast.error(data.message);
      }
    } catch (err) {
      showToast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentLang = i18n.language || 'hi';

  if (loading) return <Loader fullPage />;
  if (!product) return null;

  const isWishlisted = wishlist.some((p) => p._id === product._id);
  const savings = product.originalPrice - product.price;
  const savingsPercent = Math.round((savings / product.originalPrice) * 100);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20 bg-white">
      {/* Back button */}
      <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline mb-6">
        <ArrowLeft size={14} /> {t('common:back')}
      </Link>

      {/* Main product columns */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl h-[350px] flex justify-center items-center overflow-hidden">
            <img src={activeImage} alt={product.name.en} className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl bg-slate-50 border-2 overflow-hidden flex justify-center items-center cursor-pointer transition-all ${
                    activeImage === img ? 'border-blue-600' : 'border-slate-200'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Spec Details */}
        <div className="flex flex-col gap-4 items-start">
          <span className="bg-blue-50 text-blue-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded mt-1 tracking-wider border border-blue-100">
            {product.category?.name[currentLang]}
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
            {product.name[currentLang]}
          </h1>
          
          {/* Ratings display */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  size={16}
                  fill={idx < Math.round(product.ratingsAverage) ? '#f59e0b' : 'none'}
                  color="#f59e0b"
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 font-semibold">{product.ratingsAverage} ({product.ratingsCount} reviews)</span>
          </div>

          <hr className="border-t border-slate-100 w-full" />

          {/* Pricing Box */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-blue-600">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-slate-400 line-through">₹{product.originalPrice}</span>
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded">
                  Save {savingsPercent}%
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{product.description[currentLang]}</p>

          {/* Stock Availability */}
          <div className="flex gap-2 items-center text-sm">
            <span className="text-slate-500 font-semibold">Availability:</span>
            <span
              className={`font-bold ${
                product.availabilityStatus === 'In Stock'
                  ? 'text-emerald-600'
                  : product.availabilityStatus === 'Low Stock'
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {product.availabilityStatus === 'In Stock'
                ? t('product:in_stock')
                : product.availabilityStatus === 'Low Stock'
                ? t('product:low_stock')
                : t('product:out_of_stock')}
            </span>
          </div>

          {/* Return Policy alert */}
          <div className="w-full flex items-center gap-2 bg-blue-50/50 border border-blue-100/50 rounded-xl px-4 py-3 text-xs text-blue-800">
            <ShieldAlert size={16} className="text-blue-600 flex-shrink-0" />
            <span>
              Policy: <strong>{product.returnPolicy}</strong> options apply for this accessory.
            </span>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex gap-4 w-full flex-wrap mt-6">
            {product.stock === 0 ? (
              <button className="flex-1 py-3 font-heading font-bold text-sm bg-slate-100 text-slate-400 border border-slate-200 rounded-full cursor-not-allowed" disabled>
                {t('product:out_of_stock')}
              </button>
            ) : (
              <>
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 py-3 font-heading font-bold text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer flex justify-center items-center gap-2 border-0"
                >
                  <ShoppingCart size={16} />
                  {t('product:add_to_cart')}
                </button>
                <button
                  onClick={() => {
                    addToCart(product);
                    navigate('/cart');
                  }}
                  className="flex-1 py-3 font-heading font-bold text-sm bg-white text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 cursor-pointer flex justify-center items-center"
                >
                  {t('product:buy_now')}
                </button>
              </>
            )}

            {user && (
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-11 h-11 rounded-full flex justify-center items-center cursor-pointer border transition-colors ${
                  isWishlisted ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#94a3b8'} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="flex flex-col md:flex-row gap-10 mt-16 pt-10 border-t border-slate-100">
        {/* Left Column: List Reviews */}
        <div className="flex-1 w-full">
          <h3 className="font-heading text-lg font-bold text-slate-800 mb-6">{t('product:reviews')}</h3>
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400">{t('product:no_reviews')}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{rev.user.name}</span>
                    <span className="text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex my-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < rev.rating ? '#f59e0b' : 'none'}
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
              <h3 className="font-heading text-base font-bold text-blue-600 mb-4">{t('product:write_review')}</h3>
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-500">{t('product:rating')}</label>
                  <select
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer text-xs"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                  >
                    <option value="5">5 Stars - Excellent</option>
                    <option value="4">4 Stars - Very Good</option>
                    <option value="3">3 Stars - Good</option>
                    <option value="2">2 Stars - Fair</option>
                    <option value="1">1 Star - Poor</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="block mb-1.5 text-xs font-semibold text-slate-500">{t('product:comment')}</label>
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
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border-0"
                  disabled={submittingReview}
                >
                  <Send size={12} /> {t('common:submit')}
                </button>
              </form>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-xs text-slate-500 leading-relaxed">
                Please{' '}
                <Link to="/login" className="text-blue-600 hover:underline font-semibold">
                  Login
                </Link>{' '}
                to write a customer review.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="mt-16">
          <h3 className="font-heading text-lg font-bold text-slate-800 mb-6">{t('product:related_products')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((item) => (
              <div key={item._id} className="p-3 text-center bg-white border border-slate-200 rounded-xl hover:shadow-sm">
                <Link to={`/product/${item._id}`}>
                  <div className="h-[110px] flex justify-center items-center overflow-hidden bg-slate-50 border border-slate-100 rounded-lg mb-2">
                    <img src={item.images[0]} alt={item.name.en} className="max-w-[90%] max-h-[90%] object-contain mix-blend-multiply" />
                  </div>
                  <h4 className="font-heading text-xs font-semibold text-slate-700 truncate">{item.name[currentLang]}</h4>
                  <p className="text-xs font-bold text-blue-600 mt-1">₹{item.price}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
