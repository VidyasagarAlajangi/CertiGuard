import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";

const userAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    req.user = decoded; // includes { id, role }
    next();
  } catch (error) {
    console.error("Error in userAuth middleware:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export default userAuth;
