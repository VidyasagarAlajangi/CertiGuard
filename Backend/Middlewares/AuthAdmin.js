// 📂 Middlewares/AuthAdmin.js
import jwt from "jsonwebtoken";

const AuthAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Check if header exists and follows Bearer format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; // ✅ Extract token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Check if user is admin
    if (!decoded || decoded.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Admin access required" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error in AuthAdmin middleware:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default AuthAdmin;
