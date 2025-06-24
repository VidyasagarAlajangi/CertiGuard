import { Router } from "express";
import multer from "multer";
import {
  issueSingleCertificate,
  issueBulkCertificates,
  getCompanyCertificates,
} from "../Controllers/companyCertificateController.js";
import companyAuth from "../Middlewares/AuthCompany.js";

const companyCertRouter = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Apply company authentication middleware to all routes
companyCertRouter.use(companyAuth);

// Routes
companyCertRouter.post("/issue/single", issueSingleCertificate);
companyCertRouter.post("/issue/bulk", upload.single("file"), issueBulkCertificates);
companyCertRouter.get("/certificates", getCompanyCertificates);

export default companyCertRouter; 