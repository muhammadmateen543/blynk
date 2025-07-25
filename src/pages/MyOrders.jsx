import React, { useEffect, useRef, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  ChevronDown,
  ChevronUp,
  Truck,
  PackageCheck,
  Ban,
  Clock,
  PencilLine,
  CheckCircle,
} from "lucide-react";
import OrderNavbar from "../components/OrderNavbar";
import { useNavigate } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import InlineReviewForm from "../pages/InlineReviewForm";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeReviewProductKey, setActiveReviewProductKey] = useState(null);
  const loadingRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      loadingRef.current.continuousStart();
      if (currentUser) {
        setUser(currentUser);
        try {
          const res = await fetch(
            `${import.meta.env.VITE_B_URL}/api/orders/user/${currentUser.uid}`
          );
          const data = await res.json();

          if (data.success) {
            const ordersWithTokens = data.orders.map((order) => {
              const tokenMap = {};
              order.reviewTokens?.forEach((t) => {
                tokenMap[t.productId] = t.token;
              });

              const cartWithTokens = order.cart.map((item) => ({
                ...item,
                reviewToken: tokenMap[item.productId] || null,
              }));

              return {
                ...order,
                cart: cartWithTokens,
              };
            });

            setOrders(ordersWithTokens);

            const productOrderKeys = ordersWithTokens.flatMap((order) =>
              order.cart.map((item) => `${item.productId}_${order._id}`)
            );

            if (productOrderKeys.length > 0) {
              const reviewRes = await fetch(
  `${import.meta.env.VITE_B_URL}/api/review-tokens/status?userId=${currentUser.uid}`
);

              const reviewData = await reviewRes.json();
              if (reviewData.success) {
                const reviewedKeys = reviewData.reviewed.map(
                  (rev) => `${rev.productId}_${rev.orderId}`
                );
                setReviewedProducts(reviewedKeys);
              }
            }
          } else {
            console.error("Failed to fetch orders:", data.message);
          }
        } catch (err) {
          console.error("Fetch error:", err);
        }
        loadingRef.current.complete();
        setLoading(false);
      } else {
        setUser(null);
        loadingRef.current.complete();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusBadge = (status) => {
    const base =
      "px-3 py-1 rounded-full text-sm font-semibold capitalize flex items-center gap-1";
    switch (status) {
      case "pending":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "dispatched":
        return `${base} bg-blue-100 text-blue-700`;
      case "delivered":
        return `${base} bg-green-100 text-green-700`;
      default:
        return `${base} bg-red-100 text-red-700`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "dispatched":
        return <Truck size={16} />;
      case "delivered":
        return <PackageCheck size={16} />;
      default:
        return <Ban size={16} />;
    }
  };

  const hasReviewed = (productId, orderId) =>
    reviewedProducts.includes(`${productId}_${orderId}`);

  if (loading)
    return (
      <>
        <LoadingBar color="#2563eb" height={4} ref={loadingRef} />
        <div className="p-6 text-center">Loading your orders...</div>
      </>
    );

  if (!user)
    return (
      <>
        <LoadingBar color="#2563eb" height={4} ref={loadingRef} />
        <OrderNavbar />
        <div className="p-6 text-red-500">
          You must be logged in to view your orders.
        </div>
      </>
    );

  if (!orders.length)
    return (
      <>
        <LoadingBar color="#2563eb" height={4} ref={loadingRef} />
        <OrderNavbar />
        <div className="p-6 text-gray-500">
          You haven’t placed any orders yet.
        </div>
      </>
    );

  return (
    <>
      <LoadingBar color="#2563eb" height={4} ref={loadingRef} />
      <OrderNavbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 shadow-md rounded-xl p-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Order ID: {order._id}
                  </p>
                  <p className="text-lg font-semibold">
                    {order.cart.length} item(s) – Rs. {order.total}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={getStatusBadge(order.status)}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                  <button
                    onClick={() => toggleExpand(order._id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {expandedOrderId === order._id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
              </div>

              {expandedOrderId === order._id && (
                <div className="mt-4 text-sm text-gray-700 space-y-3 border-t pt-4">
                  <div>
                    <p className="font-medium mb-1">📦 Items:</p>
                    {order.cart.map((item, idx) => {
                      const productKey = `${item.productId}_${order._id}`;
                      return (
                        <div key={idx} className="ml-2 border-b pb-2 mb-2">
                          <div className="flex justify-between items-center">
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>Rs. {item.price * item.quantity}</span>
                          </div>

                          {order.status === "delivered" && (
                            <div className="mt-2">
                              {hasReviewed(item.productId, order._id) ? (
                                <span className="text-green-600 text-sm flex items-center gap-1">
                                  <CheckCircle size={16} /> Reviewed
                                </span>
                              ) : (
                                <>
                                  <button
                                    onClick={() =>
                                      setActiveReviewProductKey((prev) =>
                                        prev === productKey
                                          ? null
                                          : productKey
                                      )
                                    }
                                    className="text-blue-600 text-sm border border-blue-500 px-2 py-1 rounded hover:bg-blue-50 flex items-center gap-1"
                                  >
                                    <PencilLine size={14} />
                                    {activeReviewProductKey === productKey
                                      ? "Cancel"
                                      : "Write Review"}
                                  </button>

                                  {activeReviewProductKey === productKey && (
                                    <InlineReviewForm
                                      productId={item.productId}
                                      productName={item.name}
                                      userId={user.uid}
                                      orderId={order._id}
                                      reviewToken={item.reviewToken}
                                      reviewerName={user.displayName || ""}
                                      onSubmitted={(res) => {
                                        if (res?.success) {
                                          setReviewedProducts((prev) => [
                                            ...prev,
                                            productKey,
                                          ]);
                                        }
                                        setActiveReviewProductKey(null);
                                      }}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <p className="font-medium">📍 Delivery Address:</p>
                    <p className="ml-2">
                      {order.userDetails?.name}, {order.userDetails?.address},{" "}
                      {order.userDetails?.city}, {order.userDetails?.province}
                    </p>
                  </div>

                  <div className="flex justify-between font-semibold pt-2">
                    <span>Subtotal:</span>
                    <span>Rs. {order.subtotal}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Delivery:</span>
                    <span>
                      {order.deliveryCharge === 0
                        ? "Free"
                        : `Rs. ${order.deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-blue-800 text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>Rs. {order.total}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
