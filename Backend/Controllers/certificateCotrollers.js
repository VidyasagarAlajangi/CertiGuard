// 📂 controllers/certificateController.js
import path from "path";
import fs from "fs";
import Certificate from "../Models/certificateModel.js";
import IssuanceQueue from "../Models/issuanceQueueModel.js";
import archiver from "archiver";
import axios from 'axios';
import crypto from 'crypto';
import s3 from '../lib/s3.js';
import jsQR from 'jsqr';

const verifyCertificate = async (req, res) => {
  try {
    const { certId } = req.params;
    console.log(certId);
    // Find certificate by certId and populate company name
    const cert = await Certificate.findOne({ certId }).populate("companyId", "name");
    if (!cert) return res.status(404).json({ valid: false, message: 'Certificate not found' });

    // Generate a pre-signed S3 URL for the file
    const urlParts = cert.s3Url.split('/');
    const key = urlParts.slice(3).join('/');
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: 60
    });

    // Download PDF from S3 using the signed URL
    const response = await axios.get(signedUrl, { responseType: 'arraybuffer' });
    const hash = crypto.createHash('sha256').update(response.data).digest('hex');

    // Compare with hash stored in MongoDB
    const isValid = hash === cert.hash;

    res.json({
      valid: isValid,
      cert: {
        certId: cert.certId,
        recipientName: cert.recipientName,
        courseName: cert.courseName,
        issuedDate: cert.issuedDate,
        companyName: cert.companyId?.name || "N/A",
        s3Url: cert.s3Url,
        hash: cert.hash,
      },
      message: isValid ? "Certificate is valid." : "Certificate is invalid or has been tampered with."
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: "Verification failed", error: error.message });
  }
};

const downloadSingleCertificate = async (req, res) => {
  try {
    const { certId } = req.params;

    const cert = await Certificate.findOne({ certId });
    if (!cert || !cert.pdfUrl) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found.",
      });
    }

    // Prevent directory traversal
    const safeFileName = path.basename(cert.pdfUrl); // Prevents "../../etc/passwd"
    const filePath = path.resolve("certificates", safeFileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "PDF file not found.",
      });
    }

    res.download(filePath, `certificate-${certId}.pdf`);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Download failed.",
      error: error.message,
    });
  }
};

const downloadBulkCertificates = async (req, res) => {
  try {
    const { certIds } = req.body; // array of certId
    if (!Array.isArray(certIds) || certIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Certificate IDs required." });
    }

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=certificates.zip"
    );
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (const certId of certIds) {
      const cert = await Certificate.findOne({ certId });
      if (cert && cert.pdfUrl) {
        const filePath = path.resolve(`.${cert.pdfUrl}`);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: `certificate-${certId}.pdf` });
    }
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error("ZIP download error:", error);
    res.status(500).json({
      success: false,
      message: "Bulk download failed",
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
    console.log('req.user:', req.user);
    const userId = req.user.id;
    console.log('userId:', userId);

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
      .populate("userId", "name email") // recipient
      .populate("companyId", "name") // issuer
      .sort({ issueDate: -1 });
      const userId = req.user._id;
      console.log("Fetching certificates for user:", userId);
      const certificate = await Certificate.find({ userId }).populate("companyId", "name");
      console.log("Found certificates:", certificate);

      
    res.status(200).json({
      success: true,
      certificates: certificates.map((cert) => ({
        _id: cert._id,
        title: cert.title || cert.courseName,
        recipientName: cert.userId?.name || "N/A",
        recipientEmail: cert.userId?.email || "N/A",
        issuerName: cert.companyId?.name || "N/A",
        issueDate: cert.issueDate || cert.issuedDate,
        status: cert.status,
        certId: cert.certId,
      })),
    });
  } catch (error) {
    console.error("Error fetching all certificates:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching certificates",
      error: error.message,
    });
  }
};

// Approve a single certificate
export const approveCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findById(id);
    if (!cert) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found." });
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
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found." });
    }
    cert.status = "rejected";
    await cert.save();
    res.status(200).json({ success: true, message: "Certificate rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCertificateDownloadUrl = async (req, res) => {
  try {
    const { certId } = req.params;
    const cert = await Certificate.findOne({ certId });
    
    if (!cert) {
      return res.status(404).json({ 
        success: false, 
        message: "Certificate not found." 
      });
    }

    // Generate a pre-signed S3 URL for the file
    const urlParts = cert.s3Url.split('/');
    const key = urlParts.slice(3).join('/');
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: 3600 // 1 hour
    });

    res.json({ 
      success: true, 
      url: signedUrl 
    });
  } catch (error) {
    console.error("Download URL error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate download URL.",
      error: error.message 
    });
  }
};

export const verifyCertificateByQR = async (req, res) => {
  try {
    const qrData = req.query.data;
    console.log('[QR VERIFY] Incoming data:', qrData);
    if (!qrData) {
      return res.status(400).json({ success: false, message: 'QR data is required.' });
    }
    // Extract certId from URL or direct value
    let certId = qrData;
    const match = qrData.match(/(?:\/verify\/|certId=)([\w-]+)/);
    if (match && match[1]) {
      certId = match[1];
    }
    console.log('[QR VERIFY] Parsed certId:', certId);
    if (!certId) {
      return res.status(400).json({ success: false, message: 'Invalid QR code format.' });
    }
    // Find certificate by certId
    const certificate = await Certificate.findOne({ certId })
      .populate('companyId', 'name')
      .populate('userId', 'name email');
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }
    if (certificate.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Certificate is not approved.' });
    }
    res.status(200).json({
      success: true,
      message: 'Certificate verified successfully.',
      certificate,
    });
  } catch (error) {
    console.error('[QR VERIFY] Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
  }
};

export const scanQRFromImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded."
      });
    }
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file (JPEG, PNG, etc.)."
      });
    }
    try {
      const JimpModule = await import('jimp');
      const Jimp = JimpModule.default;
      const image = await Jimp.read(req.file.path);
      console.log('[QR SCAN] Image loaded:', req.file.originalname, image.bitmap.width, image.bitmap.height, req.file.mimetype);
      if (image.bitmap.width < 300 || image.bitmap.height < 300) {
        image.resize(300, 300);
        console.log('[QR SCAN] Image resized to 300x300 for QR detection');
      }
      image.grayscale();
      const imageData = {
        data: new Uint8ClampedArray(image.bitmap.data),
        width: image.bitmap.width,
        height: image.bitmap.height
      };
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('[QR SCAN] Error deleting uploaded file:', err);
      });
      if (code) {
        return res.json({
          success: true,
          qrData: code.data
        });
      } else {
        console.log('[QR SCAN] jsQR could not find a QR code in the image.');
        return res.status(404).json({
          success: false,
          message: "No QR code found in the image. Please try another image."
        });
      }
    } catch (imageError) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('[QR SCAN] Error deleting uploaded file:', err);
      });
      console.error('[QR SCAN] Jimp or jsQR error:', imageError);
      return res.status(400).json({
        success: false,
        message: "Failed to process the image. Please ensure it's a valid image file.",
        error: imageError.message
      });
    }
  } catch (error) {
    console.error("[QR SCAN] QR scanning error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to scan QR code from image.",
      error: error.message
    });
  }
};

export {
  verifyCertificate,
  downloadSingleCertificate,
  downloadBulkCertificates,
  certificateIssuanceDraft,
  approveCertificateIssuance,
  rejectCertificateIssuance,
  getUserCertificates,
  getAllCertificates,
};
