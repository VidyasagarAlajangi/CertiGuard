// 📂 controllers/userController.js
import bcrypt from "bcrypt";
import User from "../Models/userModel.js";
import tokenGeneration from "../lib/tokenGeneration.js";
import Certificate from "../Models/certificateModel.js";

const SignUp = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, website } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      phone,
      address,
      website,
    });

    await newUser.save();

    // Link certificates with matching name/email and no userId to this user (case-insensitive, trimmed)
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const updateResult = await Certificate.updateMany(
      {
        userId: null,
        recipientEmail: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') },
        recipientName: normalizedName
      },
      { $set: { userId: newUser._id } }
    );
    console.log('Certificates linked to new user:', updateResult.modifiedCount);

    // If role is company, also create a Company record
    let companyInfo = null;
    if (role === "company") {
      // Import Company model here to avoid circular dependency
      const Company = (await import("../Models/companyModel.js")).default;
      const existingCompany = await Company.findOne({ email });
      if (!existingCompany) {
        const company = new Company({
          name,
          email,
          password: hashedPassword, // Store hashed password
          phone,
          address,
          website,
          isoCertificateUrl: req.body.isoCertificateUrl || "",
          status: "inactive",
        });
        await company.save();
        companyInfo = company;
      }
    }

    const token = tokenGeneration(newUser);
    const userInfo = { ...newUser._doc, password: undefined };

    res.status(201).json({
      token,
      user: userInfo,
      company: companyInfo,
      success: true,
      message: "User registered successfully.",
    });
  } catch (error) {
    console.error("Error in SignUp:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });

    // If company, check company model and status
    if (user.role === "company") {
      const Company = (await import("../Models/companyModel.js")).default;
      const company = await Company.findOne({ email });
      if (!company)
        return res.status(403).json({ success: false, message: "Company not found. Please contact support." });
      if (company.status !== "active")
        return res.status(403).json({ success: false, message: "Your institute account is not active yet. Please wait for admin approval." });
    }

    const token = tokenGeneration(user);
    const userInfo = { ...user._doc, password: undefined };

    res.status(200).json({
      token,
      user: userInfo,
      success: true,
      message: "Login successful.",
    });
  } catch (error) {
    console.error("Error in Login:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const GetUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in GetUser:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const UpdateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role } = req.body;

    if (!userId || !name || !email || !role)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });

    const user = await User.findById(userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    user.name = name;
    user.email = email;
    user.role = role;

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "User updated successfully.", user });
  } catch (error) {
    console.error("Error in UpdateUser:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const GetAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    if (!users || users.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No users found." });

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error in GetAllUsers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user certificates (Admin)
const GetUserCertificates = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const certificates = await Certificate.find({ issuedTo: userId })
      .populate('issuedBy', 'name')
      .sort({ issueDate: -1 });  // Most recent first

    res.status(200).json({
      success: true,
      certificates: certificates.map(cert => ({
        _id: cert._id,
        title: cert.title,
        issueDate: cert.issueDate,
        status: cert.status,
        issuerName: cert.issuedBy.name
      }))
    });
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { SignUp, Login, GetUser, UpdateUser, GetAllUsers, GetUserCertificates };
