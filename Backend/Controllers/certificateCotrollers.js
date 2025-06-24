// 📂 controllers/certificateController.js
import Certificate from "../Models/certificateModel.js";
import IssuanceQueue from "../Models/issuanceQueueModel.js";

const verifyCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Certificate ID is required." });
    }

    const certificate = await Certificate.findOne({ certId: id })
      .populate("companyId", "name")
      .populate("userId", "name email");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: `Certificate with ID '${id}' not found.`,
      });
    }

    if (certificate.status !== "approved") {
      return res
        .status(400)
        .json({ success: false, message: "Certificate is not approved." });
    }

    res.status(200).json({
      success: true,
      message: "Certificate is valid.",
      certificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying certificate.",
      error: error.message,
    });
  }
};

const verifyCertificateByQR = async (req, res) => {
  try {
    const { qrData } = req.params;
    if (!qrData) {
      return res
        .status(400)
        .json({ success: false, message: "QR Code data is required." });
    }

    const certificate = await Certificate.findOne({ qrCodeUrl: qrData })
      .populate("companyId", "name")
      .populate("userId", "name email");

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "QR Code not found." });
    }

    if (certificate.status !== "approved") {
      return res
        .status(400)
        .json({ success: false, message: "Certificate is not approved." });
    }

    res.status(200).json({
      success: true,
      message: "QR Code is valid.",
      certificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "QR verification error.",
      error: error.message,
    });
  }
};

const DownloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const certificate = await Certificate.findOne({ certId: certificateId });

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found." });
    }

    if (certificate.status !== "approved") {
      return res
        .status(400)
        .json({ success: false, message: "Certificate is not approved." });
    }

    res.status(200).json({
      success: true,
      message: "Download ready.",
      pdfUrl: certificate.pdfUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while downloading certificate.",
      error: error.message,
    });
  }
};

const certificateIssuanceDraft = async (req, res) => {
  try {
    const { userId, companyId, courseName } = req.body;

    if (!userId || !companyId || !courseName) {
      return res.status(400).json({
        success: false,
        message: "userId, companyId, and courseName are required.",
      });
    }

    const newCertificate = new Certificate({
      certId: `CERT-${Date.now()}`,
      userId,
      companyId,
      courseName,
      issuedDate: new Date(),
      status: "pending",
    });

    await newCertificate.save();

    res.status(201).json({
      success: true,
      message: "Certificate draft created.",
      certificate: newCertificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating draft.",
      error: error.message,
    });
  }
};

const approveCertificateIssuance = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await IssuanceQueue.findByIdAndUpdate(
      id,
      { status: "approved", approvedAt: new Date() },
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });

    res.status(200).json({ success: true, message: "Approved", data: updated });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Approval failed", error: err.message });
  }
};

const rejectCertificateIssuance = async (req, res) => {
  try {
    const { draftId } = req.params;

    const certificate = await Certificate.findByIdAndUpdate(
      draftId,
      { status: "rejected" },
      { new: true }
    );

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "Draft not found." });
    }

    res.status(200).json({
      success: true,
      message: "Certificate rejected.",
      certificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error rejecting certificate.",
      error: error.message,
    });
  }
};

const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user._id;

    const certificates = await Certificate.find({ userId }).populate(
      "companyId",
      "name"
    );

    if (!certificates || certificates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No certificates found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Certificates retrieved successfully.",
      certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user certificates.",
      error: error.message,
    });
  }
};

// Get all certificates (Admin)
const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({})
      .populate('userId', 'name email')      // recipient
      .populate('companyId', 'name')         // issuer
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      certificates: certificates.map(cert => ({
        _id: cert._id,
        title: cert.title || cert.courseName,
        recipientName: cert.userId?.name || 'N/A',
        recipientEmail: cert.userId?.email || 'N/A',
        issuerName: cert.companyId?.name || 'N/A',
        issueDate: cert.issueDate || cert.issuedDate,
        status: cert.status,
        certId: cert.certId
      }))
    });
  } catch (error) {
    console.error('Error fetching all certificates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching certificates',
      error: error.message 
    });
  }
};

// Approve a single certificate
export const approveCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findById(id);
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }
    cert.status = "approved";
    await cert.save();
    res.status(200).json({ success: true, message: "Certificate approved." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject a single certificate
export const rejectCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findById(id);
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }
    cert.status = "rejected";
    await cert.save();
    res.status(200).json({ success: true, message: "Certificate rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  verifyCertificate,
  verifyCertificateByQR,
  DownloadCertificate,
  certificateIssuanceDraft,
  approveCertificateIssuance,
  rejectCertificateIssuance,
  getUserCertificates,
  getAllCertificates,
  
  
};
