// 📂 controllers/CompanyController.js
import Company from "../Models/companyModel.js";

// 🚀 Get all registered companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find({});
    if (!companies.length) {
      return res
        .status(404)
        .json({ success: false, message: "No companies found." });
    }
    res.status(200).json({ success: true, companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➕ Register a new company
const newCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      isoCertificateUrl,
      website,
      status,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, and password are required.",
        });
    }

    const existing = await Company.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Company already exists with this email.",
        });
    }

    const company = new Company({
      name,
      email,
      password, // In production, hash this!
      phone,
      address,
      isoCertificateUrl: isoCertificateUrl || "",
      website: website || "",
      status: status || "inactive",
    });

    await company.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Company created successfully.",
        company,
      });
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✏️ Update a company’s status
const updateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const { status } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found." });
    }

    company.status = status || "inactive";
    await company.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Company updated successfully.",
        company,
      });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ❌ Delete a company
const deleteCompany = async (req, res) => {
  try {
    const companyId = req.params.id;

    const company = await Company.findById(companyId);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found." });
    }

    await Company.findByIdAndDelete(companyId);
    res
      .status(200)
      .json({ success: true, message: "Company deleted successfully." });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getAllCompanies, newCompany, updateCompany, deleteCompany };
