// ProductDetails.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
  FiTruck,
  FiPercent,
} from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar, FaUserCircle } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im"; // Spinner Icon
import Navbar from "../components/Navbar";
import { formatDistanceToNow } from "date-fns";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Footer from "../components/Footer";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, cart, incrementQuantity, decrementQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSlides, setLightboxSlides] = useState([]);
  const touchStartX = useRef(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_B_URL}/api/products/${id}`)
      .then((res) => res.json())
      .then(setProduct)
      .catch(console.error);

    fetch(`${import.meta.env.VITE_B_URL}/api/reviews/approved/${id}`)
      .then((res) => res.json())
      .then(setReviews)
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!product?.media?.length) return;
      if (e.key === "ArrowRight") {
        setActiveImage((prev) => (prev + 1) % product.media.length);
      } else if (e.key === "ArrowLeft") {
        setActiveImage((prev) => (prev === 0 ? product.media.length - 1 : prev - 1));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [product]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current || !product?.media?.length) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) {
      setActiveImage((prev) => (prev === 0 ? product.media.length - 1 : prev - 1));
    } else if (deltaX < -50) {
      setActiveImage((prev) => (prev + 1) % product.media.length);
    }
    touchStartX.current = null;
  };

  const openLightbox = (images, index = 0) => {
    setLightboxSlides(images.map((url) => ({ src: url })));
    setLightboxOpen(true);
  };

  // 🌀 Spinner while loading
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <ImSpinner9 className="animate-spin text-5xl text-indigo-500" />
      </div>
    );

  const {
    name,
    price,
    salePrice,
    discountPercent,
    description,
    quantity,
    color,
    media,
    freeDelivery,
  } = product;

  const cartItem = cart.find((item) => item._id === product._id);
  const currentQty = cartItem?.quantity || 0;
  const stockLeft = quantity - currentQty;
  const isOutOfStock = stockLeft <= 0;
  const showLowStock = stockLeft > 0 && stockLeft <= 3;

  const discount = discountPercent || (salePrice ? Math.round((1 - salePrice / price) * 100) : 0);
  const finalPrice = salePrice || price - (price * discount) / 100;

  const approvedReviews = reviews.filter((r) => r.status === "approved");
  const avgRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length
      : null;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white py-10 px-4 pb-36 md:pb-10">
        {/* Product layout section remains the same */}
<div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 bg-white shadow-xl rounded-2xl p-6 md:p-10 border">
  {/* LEFT SIDE: IMAGES */}
  <div className="flex flex-col items-center">
    <div
      className="relative w-full h-[280px] md:h-[420px] bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden shadow-inner"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={media?.[activeImage]?.url}
        alt={name}
        className="max-h-full object-contain transition duration-300"
      />
      {media.length > 1 && (
        <>
          <button
            onClick={() =>
              setActiveImage((prev) => (prev === 0 ? media.length - 1 : prev - 1))
            }
            className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-indigo-600 rounded-full shadow-md"
          >
            <FiChevronLeft />
          </button>
          <button
            onClick={() => setActiveImage((prev) => (prev + 1) % media.length)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-indigo-600 rounded-full shadow-md"
          >
            <FiChevronRight />
          </button>
        </>
      )}
    </div>

    {media.length > 1 && (
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {media.map((m, i) => (
          <img
            key={i}
            src={m.url}
            onClick={() => setActiveImage(i)}
            className={`h-14 w-14 object-cover border-2 rounded-md cursor-pointer transition ${
              activeImage === i ? "border-indigo-600 scale-105" : "border-gray-300"
            }`}
          />
        ))}
      </div>
    )}
  </div>

  {/* RIGHT SIDE: PRODUCT INFO */}
  <div className="flex flex-col justify-center gap-4">
    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{name}</h1>

    {avgRating && (
      <div className="flex items-center gap-2">
        <span className="text-yellow-500 font-semibold text-md">
          {avgRating.toFixed(1)}
        </span>
        <div className="flex gap-1">{renderStars(avgRating)}</div>
      </div>
    )}

    <div className="flex flex-wrap gap-3">
      {freeDelivery && (
        <div className="inline-flex items-center gap-1 text-white text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 shadow">
          <FiTruck size={14} /> Free Delivery
        </div>
      )}
      {discount > 0 && (
        <div className="inline-flex items-center gap-1 text-white text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow">
          <FiPercent size={14} /> {discount}% OFF
        </div>
      )}
    </div>

    <div className="flex items-end gap-4 mt-2">
      <span className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-transparent bg-clip-text tracking-tight">
        Rs {finalPrice.toFixed(0)}
      </span>
      {discount > 0 && (
        <span className="line-through text-slate-400 text-sm font-medium">
          Rs {price}
        </span>
      )}
    </div>

    {color && (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-700">Color:</span>
        <div
          className="w-5 h-5 rounded-full border-2 border-white shadow-md"
          style={{ backgroundColor: color.toLowerCase() }}
          title={color}
        />
        <span className="capitalize text-sm text-slate-600">{color}</span>
      </div>
    )}

    <div className="text-sm font-medium">
      {isOutOfStock ? (
        <span className="text-red-600">Out of Stock</span>
      ) : showLowStock ? (
        <span className="text-yellow-600">Only {stockLeft} left!</span>
      ) : (
        <span className="text-green-600">In Stock</span>
      )}
    </div>

    <div className="hidden md:flex gap-3 items-center">
      {currentQty === 0 ? (
  <button
    disabled={isOutOfStock}
    onClick={() => {
      if (!isOutOfStock) addToCart(product);
    }}

          className={`flex-1 px-4 py-2 text-sm rounded-md font-semibold text-white transition ${
            isOutOfStock
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FiShoppingCart /> Add to Cart
          </div>
        </button>
      ) : (
        <div className="inline-flex items-center gap-4 bg-indigo-50 px-4 py-2 rounded-full shadow-inner">
          <button
            onClick={() => decrementQuantity(product._id)}
            className="text-red-600 hover:text-red-800 text-xl"
          >
            <FiMinus />
          </button>
          <span className="text-lg font-semibold text-slate-800">{currentQty}</span>
          <button
            onClick={() =>
              currentQty < quantity && quantity > 0 && incrementQuantity(product._id)
            }
            disabled={currentQty >= quantity}
            className={`text-green-600 hover:text-green-800 text-xl ${
              currentQty >= quantity ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FiPlus />
          </button>
        </div>
      )}
    </div>

    <div className="bg-white border border-slate-200 p-4 rounded-xl mt-4 shadow-sm">
      <h3 className="text-md font-bold text-slate-700 mb-1">Product Description</h3>
      <p className="text-sm text-slate-600 whitespace-pre-line">{description}</p>
    </div>
  </div>
</div>
<div className="fixed md:hidden bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-3 shadow-xl">
          {currentQty === 0 ? (
  <button
    disabled={isOutOfStock}
    onClick={() => {
      if (!isOutOfStock) addToCart(product);
    }}

              className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-base rounded-md font-semibold text-white transition ${
                isOutOfStock
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90"
              }`}
            >
              <FiShoppingCart /> Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-4 bg-indigo-50 px-4 py-2 rounded-full shadow-inner">
                <button
                  onClick={() => decrementQuantity(product._id)}
                  className="text-red-600 hover:text-red-800 text-xl"
                >
                  <FiMinus />
                </button>
                <span className="text-lg font-semibold text-slate-800">{currentQty}</span>
                <button
                  onClick={() => {
  if (currentQty < quantity && quantity > 0) incrementQuantity(product._id);
}}

                  disabled={currentQty >= quantity}
                  className={`text-green-600 hover:text-green-800 text-xl ${
                    currentQty >= quantity ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          )}
        </div>


        <div className="max-w-6xl mx-auto mt-10 px-2">
          <h2 className="text-md font-semibold text-slate-700 mb-2">Reviews</h2>
          {approvedReviews.length > 0 ? (
            <ul className="space-y-3">
              {approvedReviews.map((review, index) => (
                <li key={index} className="border p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 mb-1">
                    <FaUserCircle className="w-6 h-6 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">
                      {review.user?.name || review.reviewerName || "Anonymous"}
                    </span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex gap-1 text-yellow-600 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{review.comment}</p>
                  {review.images?.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="review-img"
                          onClick={() => openLightbox(review.images, idx)}
                          className="w-20 h-20 object-cover rounded cursor-pointer border"
                        />
                      ))}
                    </div>
                  )}

                  {review.adminReply && (
                    <div className="mt-3 border-t pt-2 text-sm text-indigo-700">
                      <span className="font-semibold">Blynk:</span> {review.adminReply}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-slate-500">No reviews yet for this product.</p>
          )}
        </div>

        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={lightboxSlides}
        />
      </div>
      <Footer/>
    </>
  );
}
