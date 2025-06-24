import { Router } from "express";
import multer from "multer";
import {
  handleUploadRequest,
  approveCertificateIssuance,
} from "../Controllers/issuanceUploadController.js";

import {
  certificateIssuanceDraft,
  DownloadCertificate,
  getUserCertificates,
  rejectCertificateIssuance,
  verifyCertificate,
  verifyCertificateByQR,
  getAllCertificates,
  approveCertificate,
  rejectCertificate,
} from "../Controllers/certificateCotrollers.js";
import { getIssuanceQueue } from "../Controllers/issuanceUploadController.js";

import userAuth from "../Middlewares/AuthUser.js";
import AuthAdmin from "../Middlewares/AuthAdmin.js";

const certRouter = Router();

certRouter.get("/verify/:id", verifyCertificate);
certRouter.get("/verify/qr/:qrData", verifyCertificateByQR);
certRouter.get("/:id/download", userAuth, DownloadCertificate);
certRouter.get("/user/certificates", userAuth, getUserCertificates);
certRouter.get("/admin/certificates", AuthAdmin, getAllCertificates);
certRouter.post("/issuance/draft", AuthAdmin, certificateIssuanceDraft);
certRouter.get("/issuance/queue", AuthAdmin, getIssuanceQueue);
certRouter.post("/issuance/approve/:id", AuthAdmin, approveCertificateIssuance);
certRouter.post("/issuance/reject/:draftId", AuthAdmin, rejectCertificateIssuance);
certRouter.post("/admin/certificates/approve/:id", AuthAdmin, approveCertificate);
certRouter.post("/admin/certificates/reject/:id", AuthAdmin, rejectCertificate);

certRouter.get("/test", (req, res) => {
  res.send("Upload route reachable ✅");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
certRouter.post("/upload", userAuth, upload.single("file"), handleUploadRequest);
export default certRouter;
