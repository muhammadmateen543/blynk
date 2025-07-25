import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Home,
  Globe,
  MapPin,
  Building2,
  CreditCard,
  Truck,
} from "lucide-react";
import { provincesWithCities } from "../data/tcs_provinces_with_cities";
import Select from "react-select";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function CheckoutForm() {
  const { cart, deliveryCharge, clearCart, coupon } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    country: "Pakistan",
    province: "",
    city: "",
    name: "",
    phone1: "",
    phone2: "",
    email: "",
    address: "",
    paymentMethod: "COD",
  });

  const [cities, setCities] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false); // for submission loading
  const [submitted, setSubmitted] = useState(false); // track if order submitted

  const isDisabled = loading || submitted;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (form.province && provincesWithCities[form.province]) {
      setCities(
        provincesWithCities[form.province].map((city) => ({
          label: city,
          value: city,
        }))
      );
    } else {
      setCities([]);
    }
    setForm((prev) => ({ ...prev, city: "" }));
  }, [form.province]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getFinalPricing = (item) => {
    const hasSalePrice = item.salePrice && item.salePrice !== 0;
    const hasDiscountPercent = item.discountPercent && item.discountPercent !== 0;

    const finalPrice = hasSalePrice
      ? item.salePrice
      : hasDiscountPercent
      ? item.price - (item.price * item.discountPercent) / 100
      : item.price;

    return finalPrice;
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = getFinalPricing(item);
    return sum + price * item.quantity;
  }, 0);

  const couponDiscount = coupon?.amount || 0;
  const total = subtotal + deliveryCharge - couponDiscount;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isDisabled) return; // prevent multiple submissions or after submitted

    if (!userId) {
      alert("You must be logged in to place an order.");
      return;
    }

    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    const payload = {
      userId,
      userDetails: form,
      cart: cart.map((item) => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: getFinalPricing(item),
      })),
      subtotal,
      deliveryCharge,
      coupon: coupon?.code || null,
      couponDiscount,
      total,
    };

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_B_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        clearCart();
        setSubmitted(true); // <-- Mark submitted here to disable form
        navigate("/order-confirmation");
      } else {
        alert(data.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-3">
      {/* Left: Form */}
      <form
        onSubmit={handleSubmit}
        className="md:col-span-2 bg-white shadow-lg rounded-2xl p-6 space-y-6"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 border-b pb-3">
          🧾 Checkout Information
        </h2>

        <InputGroup icon={<Globe />} value="Pakistan" disabled />

        <SelectGroup
          icon={<MapPin />}
          placeholder="Select Province"
          options={Object.keys(provincesWithCities).map((p) => ({
            label: p,
            value: p,
          }))}
          value={
            form.province
              ? { label: form.province, value: form.province }
              : null
          }
          onChange={(opt) =>
            setForm((prev) => ({ ...prev, province: opt.value }))
          }
          isDisabled={isDisabled}
        />

        <SelectGroup
          icon={<Building2 />}
          placeholder="Select City"
          options={cities}
          value={form.city ? { label: form.city, value: form.city } : null}
          onChange={(opt) =>
            setForm((prev) => ({ ...prev, city: opt.value }))
          }
          isDisabled={isDisabled || !form.province}
        />

        <InputGroup
          icon={<User />}
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          disabled={isDisabled}
        />
        <InputGroup
          icon={<Phone />}
          name="phone1"
          value={form.phone1}
          onChange={handleChange}
          placeholder="Primary Phone"
          required
          disabled={isDisabled}
        />
        <InputGroup
          icon={<Phone />}
          name="phone2"
          value={form.phone2}
          onChange={handleChange}
          placeholder="Secondary Phone (optional)"
          disabled={isDisabled}
        />
        <InputGroup
          icon={<Mail />}
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          disabled={isDisabled}
        />
        <TextAreaGroup
          icon={<Home />}
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Complete Address"
          rows={3}
          required
          disabled={isDisabled}
        />

        <div className="flex items-center gap-3 bg-gray-100 border border-gray-300 rounded px-4 py-3 text-sm text-gray-700">
          <CreditCard className="w-5 h-5 text-gray-500" />
          <span>Cash on Delivery</span>
        </div>

        <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
          <Truck className="w-5 h-5" />
          <span>
            Delivery <span className="font-semibold">within 3–4</span> working
            days
          </span>
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className={`w-full py-3 rounded-lg font-semibold shadow transition-all ${
            isDisabled
              ? "bg-gray-300 cursor-not-allowed text-gray-700"
              : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
          }`}
        >
          {loading ? "Placing your order..." : "Confirm & Place Order"}
        </button>
      </form>

      {/* Right: Order Summary */}
      <div className="md:col-span-1 bg-white shadow-lg border border-gray-200 rounded-2xl p-6 h-fit sticky top-24">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          🧾 Order Summary
        </h3>

        <div className="text-sm text-gray-700 space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs {subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{deliveryCharge === 0 ? "Free" : `Rs ${deliveryCharge}`}</span>
          </div>

          {coupon && (
            <div className="flex justify-between text-green-600">
              <span>Coupon ({coupon.code})</span>
              <span>- Rs {coupon.amount}</span>
            </div>
          )}

          <hr />
          <div className="flex justify-between font-semibold text-base text-gray-900">
            <span>Total</span>
            <span>Rs {total.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Form Components --- */

function InputGroup({ icon, disabled, ...props }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-300 rounded px-4 py-2">
      <div className="text-gray-500">{icon}</div>
      <input
        className="flex-1 bg-transparent focus:outline-none text-sm"
        disabled={disabled}
        {...props}
      />
    </div>
  );
}

function TextAreaGroup({ icon, disabled, ...props }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 border border-gray-300 rounded px-4 py-2">
      <div className="text-gray-500 mt-1">{icon}</div>
      <textarea
        className="flex-1 bg-transparent focus:outline-none text-sm resize-none"
        disabled={disabled}
        {...props}
      />
    </div>
  );
}

function SelectGroup({ icon, isDisabled, ...props }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-300 rounded px-4 py-[6px]">
      <div className="text-gray-500">{icon}</div>
      <div className="flex-1">
        <Select
          className="text-sm"
          styles={{
            control: (base) => ({
              ...base,
              border: "none",
              boxShadow: "none",
              backgroundColor: "transparent",
              minHeight: "unset",
            }),
            valueContainer: (base) => ({
              ...base,
              padding: 0,
            }),
            indicatorsContainer: (base) => ({
              ...base,
              padding: 0,
            }),
          }}
          isDisabled={isDisabled}
          {...props}
        />
      </div>
    </div>
  );
}
