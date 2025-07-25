import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { Link } from "react-router-dom";
import { MdEmail } from "react-icons/md";

export default function CustomerForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset email sent. Please check your inbox.");
      setEmail("");
    } catch (err) {
      setError("❌ Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-purple-100 px-4">
      <div className="w-full max-w-sm sm:max-w-md bg-white/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200 transition-all">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-purple-700 mb-5 sm:mb-6">
          Reset Password
        </h2>

        {message && (
          <p className="text-green-600 text-sm text-center mb-4">{message}</p>
        )}
        {error && (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5">
          {/* Email Input */}
          <div className="relative">
            <MdEmail className="absolute top-3.5 left-3 text-gray-500 text-lg" />
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              aria-label="Email address"
              disabled={loading}
            />
          </div>

          {/* Reset Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white font-semibold rounded-lg transition-transform ${
              loading
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105"
            }`}
            aria-label="Send password reset email"
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        {/* Navigation */}
        <div className="text-center text-sm mt-5 text-gray-600">
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
