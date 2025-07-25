// src/pages/AdminEmailSender.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminEmailSender = () => {
  const [users, setUsers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false); // ✅ loading state

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/users/admin/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error loading users:", err);
      }
    };

    fetchUsers();
  }, []);

  const toggleEmail = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  const sendEmails = async () => {
    if (!subject || !message) {
      alert("Subject and message are required.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const res = await axios.post("/api/users/admin/send-bulk-email", {
        subject,
        message,
        sendToAll,
        selectedEmails,
      });

      setStatus(res.data.message || "✅ Emails sent!");
      setSubject("");
      setMessage("");
      setSelectedEmails([]);
    } catch (err) {
      console.error("Email send failed:", err);
      setStatus("❌ Failed to send emails.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 text-gray-800">
        📨 Send Email to Customers
      </h2>

      <div className="mb-4 flex items-center space-x-2">
        <input
          type="checkbox"
          id="sendToAll"
          checked={sendToAll}
          onChange={() => {
            setSendToAll(!sendToAll);
            if (!sendToAll) setSelectedEmails([]);
          }}
          className="w-4 h-4"
        />
        <label htmlFor="sendToAll" className="text-sm sm:text-base text-gray-700">
          Send to all customers
        </label>
      </div>

      {!sendToAll && (
        <div className="mb-4 max-h-52 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
          {users.map((user) => (
            <label key={user.email} className="block text-sm mb-1 text-gray-700">
              <input
                type="checkbox"
                checked={selectedEmails.includes(user.email)}
                onChange={() => toggleEmail(user.email)}
                className="mr-2"
              />
              {user.name || "Unnamed"} ({user.email})
            </label>
          ))}
        </div>
      )}

      <input
        type="text"
        placeholder="Email Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-3 text-sm sm:text-base"
      />

      <textarea
        placeholder="Email Message"
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4 text-sm sm:text-base"
      />

      <button
        onClick={sendEmails}
        disabled={loading}
        className={`w-full sm:w-auto font-medium px-6 py-2 rounded transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {loading ? "Sending..." : "📤 Send Email"}
      </button>

      {status && (
        <p
          className={`mt-4 text-sm ${
            status.includes("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
};

export default AdminEmailSender;
