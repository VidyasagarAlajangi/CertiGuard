import Certificate from "../Models/certificateModel.js";
import User from "../Models/userModel.js";
import csvParser from "csv-parser";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import generateCertificate from "../utils/generateCertificate.js";

// Issue a single certificate
export const issueSingleCertificate = async (req, res) => {
  try {
    const { recipientName, recipientEmail, courseName, courseDuration, remarks } = req.body;

    if (!recipientName || !recipientEmail || !courseName) {
      return res.status(400).json({
        success: false,
        message: "Recipient name, email, and course name are required.",
      });
    }

    // Check if recipient exists or create new user
    let recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      recipient = await User.create({
        name: recipientName,
        email: recipientEmail,
        role: "user",
        password: uuidv4(), // Generate random password
      });
    }

    const certId = uuidv4();
    const templatePath = "templates/Template_1.pdf";
    const saveDir = "certificates/";

    // Generate certificate PDF
    const { fileName } = await generateCertificate(
      templatePath,
      {
        name: recipientName,
        email: recipientEmail,
        courseName,
        issuedDate: new Date().toISOString().split("T")[0],
      },
      saveDir
    );

    // Create certificate record
    const certificate = new Certificate({
      certId,
      recipientName,
      userId: recipient._id,
      companyId: req.user.id,
      courseName,
      courseDuration: courseDuration || "",
      remarks: remarks || "Successfully Completed",
      issuedDate: new Date(),
      status: "approved",
      pdfUrl: `/certificates/${fileName}`,
    });

    await certificate.save();

    res.status(201).json({
      success: true,
      message: "Certificate issued successfully.",
      certificate,
    });
  } catch (error) {
    console.error("Certificate issuance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to issue certificate.",
      error: error.message,
    });
  }
};

// Issue certificates in bulk via CSV
export const issueBulkCertificates = async (req, res) => {
  try {
    const { courseName, courseDuration, remarks } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded.",
      });
    }

    if (!courseName) {
      return res.status(400).json({
        success: false,
        message: "Course name is required.",
      });
    }

    const recipients = [];
    const templatePath = "templates/Template_1.pdf";
    const saveDir = "certificates/";
    const certificates = [];

    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on("data", (row) => {
          recipients.push(row);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    // Process each recipient
    for (const recipient of recipients) {
      try {
        // Check if recipient exists or create new user
        let user = await User.findOne({ email: recipient.email });
        if (!user) {
          user = await User.create({
            name: recipient.name,
            email: recipient.email,
            role: "user",
            password: uuidv4(), // Generate random password
          });
        }

        const certId = uuidv4();
        
        // Generate certificate PDF
        const { fileName } = await generateCertificate(
          templatePath,
          {
            name: recipient.name,
            email: recipient.email,
            courseName,
            issuedDate: new Date().toISOString().split("T")[0],
          },
          saveDir
        );

        // Create certificate record
        const certificate = new Certificate({
          certId,
          recipientName: recipient.name,
          userId: user._id,
          companyId: req.user.id,
          courseName,
          courseDuration: courseDuration || "",
          remarks: remarks || "Successfully Completed",
          issuedDate: new Date(),
          status: "approved",
          pdfUrl: `/certificates/${fileName}`,
        });

        await certificate.save();
        certificates.push(certificate);
      } catch (err) {
        console.error(`Error processing recipient ${recipient.email}:`, err);
      }
    }

    // Clean up the uploaded CSV file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: `Successfully issued ${certificates.length} certificates.`,
      failedCount: recipients.length - certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("Bulk certificate issuance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to issue certificates in bulk.",
      error: error.message,
    });
  }
};

// Get all certificates issued by the company
export const getCompanyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ companyId: req.user.id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Certificates retrieved successfully.",
      certificates,
    });
  } catch (error) {
    console.error("Error fetching company certificates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificates.",
      error: error.message,
    });
  }
}; 