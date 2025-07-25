const admin = require("../firebase");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // includes uid, email, etc.
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
