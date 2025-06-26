import { Router } from "express";
import multer from "multer";
import {
  handleUploadRequest,
  approveCertificateIssuance,
} from "../Controllers/issuanceUploadController.js";

import {
  certificateIssuanceDraft,
  downloadSingleCertificate,
  downloadBulkCertificates,
  getUserCertificates,
  rejectCertificateIssuance,
  verifyCertificate,
  getAllCertificates,
  approveCertificate,
  rejectCertificate,
  getCertificateDownloadUrl,
  verifyCertificateByQR,
  scanQRFromImage,
} from "../Controllers/certificateCotrollers.js";
import { getIssuanceQueue } from "../Controllers/issuanceUploadController.js";

import userAuth from "../Middlewares/AuthUser.js";
import AuthAdmin from "../Middlewares/AuthAdmin.js";

const certRouter = Router();

certRouter.get("/verify/:certId", verifyCertificate);
certRouter.get("/user/certificates", userAuth, getUserCertificates);
certRouter.get("/admin/certificates", AuthAdmin, getAllCertificates);
certRouter.get("/certificates/download/:certId", downloadSingleCertificate);
certRouter.post("/certificates/download-zip", downloadBulkCertificates);

certRouter.post("/issuance/draft", AuthAdmin, certificateIssuanceDraft);
certRouter.get("/issuance/queue", AuthAdmin, getIssuanceQueue);
certRouter.post("/issuance/approve/:id", AuthAdmin, approveCertificateIssuance);
certRouter.post(
  "/issuance/reject/:draftId",
  AuthAdmin,
  rejectCertificateIssuance
);
certRouter.post(
  "/admin/certificates/approve/:id",
  AuthAdmin,
  approveCertificate
);
certRouter.post("/admin/certificates/reject/:id", AuthAdmin, rejectCertificate);

certRouter.get("/download-url/:certId", userAuth, getCertificateDownloadUrl);

certRouter.get("/test", (req, res) => {
  res.send("Certificate router is working!");
});

certRouter.get("/test-user", userAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

certRouter.get("/test-auth", userAuth, (req, res) => {
  res.json({ user: req.user });
});

certRouter.get("/test-alive", (req, res) => res.json({ alive: true }));

certRouter.get('/public/verify/:certId', verifyCertificate);

certRouter.get('/verify/qr', verifyCertificateByQR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
certRouter.post(
  "/upload",
  userAuth,
  upload.single("file"),
  handleUploadRequest
);

certRouter.post(
  "/scan-qr",
  upload.single("qrImage"),
  scanQRFromImage
);

export default certRouter;
