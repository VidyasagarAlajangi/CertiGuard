import mongoose from "mongoose";

const IssuanceQueueSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // previously Company
      required: false, // ✅ Make optional for individual users
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // can be normal user or company
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    issuedDate: {
      type: Date,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    csvFileUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedAt: Date,
  },
  { timestamps: true }
);

const IssuanceQueue = mongoose.model("IssuanceQueue", IssuanceQueueSchema);
export default IssuanceQueue;
