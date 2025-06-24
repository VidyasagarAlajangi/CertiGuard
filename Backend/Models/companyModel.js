import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true, minlength: 6 },

    phone: { type: String },

    address: { type: String },

    isoCertificateUrl: { type: String, default: "" },

    website: { type: String, default: "" },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", CompanySchema);
export default Company;
