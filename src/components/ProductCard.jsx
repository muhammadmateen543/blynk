import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  ShoppingCart,
  Plus,
  Minus,
  Zap,
  BadgePercent,
  PackageCheck,
  PackageX,
  Truck,
} from "lucide-react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useEffect, useState } from "react";


function ProductCard({ product }) {
  const navigate = useNavigate();
  const { cart, addToCart, incrementQuantity, decrementQuantity } = useCart();
  const [avgRating, setAvgRating] = useState(null);

  const cartItem = cart.find((p) => p._id === product._id);
  const qty = cartItem?.quantity || 0;
  const stockLeft = product.quantity - qty;
  const isOutOfStock = stockLeft <= 0;

  const hasSalePrice =
    product.salePrice && !isNaN(product.salePrice) && product.salePrice !== 0;

  const discount = product.discountPercent
    ? product.discountPercent
    : hasSalePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const finalPrice = hasSalePrice
    ? product.salePrice
    : discount > 0
    ? product.price - (product.price * discount) / 100
    : product.price;

  const handleBuyNow = () => {
    if (qty === 0) addToCart(product);
    navigate("/cart");
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FaStar key={i} className="text-yellow-400 text-[10px]" />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 text-[10px]" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300 text-[10px]" />);
      }
    }
    return stars;
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_B_URL}/api/reviews/approved/${product._id}`);
        const data = await res.json();
        const approved = data.filter((r) => r.status === "approved");
        if (approved.length > 0) {
          const avg = approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
          setAvgRating(avg);
        }
      } catch (err) {
        console.error("Error fetching product reviews:", err);
      }
    };

    fetchReviews();
  }, [product._id]);

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition">
      {/* Top Badges (Delivery / Discount) */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {product.freeDelivery && (
          <div className="bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow flex items-center gap-1">
            <Truck size={10} /> Free Delivery
          </div>
        )}
        {discount > 0 && (
          <div className="bg-rose-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow flex items-center gap-1">
            <BadgePercent size={10} /> {discount}% OFF
          </div>
        )}
      </div>

      {/* Rating top-right (desktop only) */}
      {avgRating && (
        <div className="hidden sm:flex absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full items-center gap-1 shadow-sm z-10">
          <span className="text-[10px] font-semibold text-yellow-600">{avgRating.toFixed(1)}</span>
          <div className="flex gap-[1px]">{renderStars(avgRating)}</div>
        </div>
      )}

      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="block">
        <div className="h-40 sm:h-48 bg-gray-100 overflow-hidden">
          <img
  src={product.media?.[0]?.url}
  alt={product.name}
  className="h-full w-full object-contain hover:scale-105 transition-transform duration-300"
/>

        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-4 space-y-1">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
          {product.name}
        </h2>

        {/* Rating below name (mobile only) */}
        {avgRating && (
          <div className="sm:hidden flex items-center gap-1">
            <span className="text-xs text-yellow-600 font-semibold">{avgRating.toFixed(1)}</span>
            <div className="flex gap-[1px]">{renderStars(avgRating)}</div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-rose-600 font-bold text-base sm:text-lg">
            Rs {finalPrice.toFixed(0)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">Rs {product.price}</span>
          )}
        </div>

        {/* Stock Status */}
        <div className="text-xs font-medium">
          {isOutOfStock ? (
            <span className="flex items-center text-red-600 gap-1">
              <PackageX size={14} /> Out of Stock
            </span>
          ) : stockLeft < 3 ? (
            <span className="flex items-center text-yellow-600 gap-1">
              <PackageCheck size={14} /> Only {stockLeft} left
            </span>
          ) : (
            <span className="flex items-center text-green-600 gap-1">
              <PackageCheck size={14} /> In Stock
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {qty === 0 ? (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => addToCart(product)}
              disabled={isOutOfStock}
              className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-xs sm:text-sm font-medium py-1.5 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
            >
              <ShoppingCart size={14} /> Add
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="hidden sm:flex flex-1 items-center justify-center gap-1 bg-emerald-600 text-white text-xs sm:text-sm font-medium py-1.5 rounded-full hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Zap size={14} /> Buy
            </button>
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-between bg-indigo-50 rounded-full px-3 py-1.5">
            <button
              onClick={() => decrementQuantity(product._id)}
              className="text-red-500 hover:text-red-700"
              title="Remove"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-semibold text-gray-800">{qty}</span>
            <button
              onClick={() => stockLeft > 0 && incrementQuantity(product._id)}
              disabled={isOutOfStock}
              className="text-green-500 hover:text-green-700 disabled:opacity-40"
              title="Add"
            >
              <Plus size={16} />
            </button>

            <button
              onClick={handleBuyNow}
              className="hidden sm:inline-block ml-2 bg-teal-600 text-white text-[10px] px-3 py-1 rounded-full hover:bg-teal-700"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
