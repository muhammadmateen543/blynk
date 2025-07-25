const { Resend } = require("resend");
const Admin = require("../models/Admin");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOrderStatusEmail(payload) {
  const {
    type,
    name,
    email,
    phone,
    city,
    address,
    payment,
    orderId,
    date,
    items = [],
    reason = "",
    reviewLinks = "",
    subject: customSubject,
    message: customMessage,
    recipients = [],
    subtotal = 0,
    deliveryCharge = 0,
    total = 0,
  } = payload;

  let subject = "";
  let html = "";

  const itemsList = items
    .map(
      (it) =>
        `<li>${it.name} (Qty: ${it.quantity}) - Rs ${it.price * it.quantity}</li>`
    )
    .join("");

  const billingSummary = `
    <p><strong>Billing Summary:</strong><br/>
    Subtotal: Rs ${subtotal}<br/>
    Delivery Charges: Rs ${deliveryCharge}<br/>
    <strong>Total: Rs ${total}</strong></p>
  `;

  switch (type) {
    case "new_order_admin":
      subject = `🔔 New Order Received – ${orderId}`;
      html = `
        <p>Hi BLYNK Team,</p>
        <p>A new order has been placed on your website:</p>
        <p>
          <strong>Customer Name:</strong> ${name}<br/>
          <strong>Phone:</strong> ${phone}<br/>
          <strong>Email:</strong> ${email}<br/>
          <strong>City:</strong> ${city}<br/>
          <strong>Address:</strong> ${address}<br/>
          <strong>Payment:</strong> ${payment}<br/>
          <strong>Order ID:</strong> ${orderId}<br/>
          <strong>Date:</strong> ${date}
        </p>
        <p><strong>Products Ordered:</strong></p>
        <ul>${itemsList}</ul>
        ${billingSummary}
        <p>Please process and dispatch the order from the ${city} warehouse within 24 hours.</p>
        <hr/>
        <p><br/>BLYNK Website Notification<br/>Fast. Smooth. Reliable.</p>
      `;
      break;

    case "approved":
      subject = "Your BLYNK Order is Confirmed!";
      html = `
        <p>Hi ${name},</p>
        <p>Thanks for ordering from BLYNK!<br/>
        Your order is being prepared at our ${city} warehouse.</p>
        <p><strong>Order Summary:</strong></p>
        <ul>${itemsList}</ul>
        ${billingSummary}
        <p>
          Payment: ${payment}<br/>
          City: ${city}<br/>
          Delivery Time: 2–4 working days<br/>
          Order ID: ${orderId}
        </p>
        <hr/>
        <p><br/>Team BLYNK<br/>Instagram: https://www.instagram.com/blynk_cases/ | www.blynkstore.com</p>
      `;
      break;

    case "dispatched":
      subject = "Your BLYNK Order Has Been Shipped!";
      html = `
        <p>Hi ${name},</p>
        <p>Your order is on its way! 🙌</p>
        <p>
          Payment: ${payment}<br/>
          City: ${city}<br/>
          Delivery Time: 2–4 working days<br/>
          Order ID: ${orderId}
        </p>
        <hr/>
        <p><br/>Team BLYNK<br/>Instagram: https://www.instagram.com/blynk_cases/ | www.blynkstore.com</p>
      `;
      break;

    case "delivered":
      subject = "How was your BLYNK order?";
      html = `
        <p>Hi ${name},</p>
        <p>We hope you're loving your new accessories! 😊</p>
        <p>Your opinion means a lot to us.</p>
        <p><strong>👉 Leave a Quick Review:</strong><br/>${reviewLinks}</p>
        <hr/>
        <p><br/>Team BLYNK<br/>Instagram: https://www.instagram.com/blynk_cases/ | www.blynkstore.com</p>
      `;
      break;

    case "rejected":
      subject = "Your BLYNK Order Was Cancelled – Action Needed";
      html = `
        <p>Hi ${name},</p>
        <p>Unfortunately, your order couldn't be confirmed:</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>You can place a new order anytime at <a href="https://www.blynkstore.com">blynkstore.com</a>.</p>
        <hr/>
        <p><br/>Team BLYNK</p>
      `;
      break;

    case "admin_announcement":
      subject = customSubject || "📢 Message from BLYNK";
      html = `
        <p>Hi there,</p>
        <p>${customMessage}</p>
        <hr/>
        <p><br/>Team BLYNK<br/>www.blynkstore.com</p>
      `;
      break;

    default:
      console.warn("⚠️ Unknown email type:", type);
      return;
  }

  try {
    let toList = [];

    if (type === "new_order_admin") {
      const admins = await Admin.find({}, "email").lean();
      toList = admins.map((a) => a.email);
    } else if (type === "admin_announcement") {
      toList = recipients;
    } else {
      toList = [email]; 
    }

    if (!toList || !toList.length) {
      console.warn("❌ No recipient emails found");
      return;
    }

    await resend.emails.send({
      from: "Team BLYNK <onboarding@resend.dev>",
      to: toList,
      subject,
      html,
    });

    console.log(`📧 Email [${type}] sent to:`, toList);
  } catch (err) {
    console.error("❌ Email send error:", err.message);
  }
}

module.exports = sendOrderStatusEmail;
