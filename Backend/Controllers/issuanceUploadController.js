// 📂 controllers/issuanceUploadController.js
import IssuanceQueue from "../Models/issuanceQueueModel.js";
import User from "../Models/userModel.js";
import Certificate from "../Models/certificateModel.js";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import generateCertificate from "../utils/generateCertificate.js";

export const handleUploadRequest = async (req, res) => {
  try {
    const { courseName, issuedDate } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user found in token.",
      });
    }

    const isCompany = req.user.role === "company";

    const newRequest = new IssuanceQueue({
      companyId: isCompany ? req.user.id : undefined, // Only if company
      uploadedBy: req.user.id,
      courseName,
      issuedDate,
      fileUrl: req.file.path,
      status: "pending",
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Upload successful. Awaiting admin approval.",
      data: newRequest,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Certificate upload failed.",
      error: error.message,
    });
  }
};

export const getIssuanceQueue = async (req, res) => {
  try {
    const queue = await IssuanceQueue.find({ status: "pending" })
      .populate("companyId", "name")
      .populate("uploadedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Issuance queue fetched successfully.",
      requests: queue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch issuance queue.",
      error: error.message,
    });
  }
};

export const approveCertificateIssuance = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await IssuanceQueue.findById(id).populate("uploadedBy");
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    const csvPath = request.fileUrl;
    const templatePath = "templates/Template_1.pdf";
    const saveDir = "certificates/";

    const recipients = [];

    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on("data", (row) => {
        recipients.push(row);
      })
      .on("end", async () => {
        const generated = [];

        for (const recipient of recipients) {
          const { certId, fileName } = await generateCertificate(
            templatePath,
            {
              name: recipient.name,
              email: recipient.email,
              courseName: request.courseName,
              issuedDate: request.issuedDate.toISOString().split("T")[0],
            },
            saveDir
          );

          const cert = new Certificate({
            certId,
            recipientName: recipient.name,
            companyId: request.companyId || null,
            userId: request.uploadedBy._id,
            courseName: request.courseName,
            issuedDate: request.issuedDate,
            pdfUrl: `/certificates/${fileName}`,
            status: "approved",
          });

          await cert.save();
          generated.push(cert);
        }

        request.status = "approved";
        request.approvedAt = new Date();
        await request.save();

        res.status(200).json({
          success: true,
          message: "Certificates approved and generated.",
          generatedCount: generated.length,
        });
      });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({
      success: false,
      message: "Certificate generation failed.",
      error: err.message,
    });
  }
};
