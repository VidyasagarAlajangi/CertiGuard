// 📂 utils/generateCertificate.js

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { convertCmToPdfCoords } from "./pdfCoordinates.js";
import crypto from "crypto";
import QRCode from "qrcode";
import { storeCertificateHash } from "../lib/blockchain.js";

const generateCertificate = async (templatePath, recipient, saveDir) => {
  console.log("generateCertificate recipient:", recipient);
  const {
    certId,
    name,
    email,
    courseName,
    courseDuration,
    courseProvider,
    issuedDate,
    hash,
    companyName,
    instructorName,
  } = recipient;

  const existingPdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const page = pages[0];

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const { height: pageHeight } = page.getSize();

  // 🔹 Draw centered text inside a box
  const drawCenteredInBox = (
    text,
    cmStartX,
    boxWidthCm,
    cmY,
    size,
    font,
    color
  ) => {
    const { x: boxX, y } = convertCmToPdfCoords(cmStartX, cmY, pageHeight);
    const boxWidth = boxWidthCm * 28.35;
    const textWidth = font.widthOfTextAtSize(text, size);
    const x = boxX + (boxWidth - textWidth) / 2;

    page.drawText(text, { x, y, size, font, color });
  };

  // 🔹 Draw normal (left-aligned) text
  const drawNormalText = (text, cmX, cmY, size, font, color) => {
    const { x, y } = convertCmToPdfCoords(cmX, cmY, pageHeight);
    page.drawText(text, { x, y, size, font, color });
  };

  // Draw recipient name (large, bold, centered)
  drawCenteredInBox(
    String(name ?? "N/A"),
    7.64,
    14.29,
    7.8,
    26,
    helveticaBold,
    rgb(0.1, 0.1, 0.1)
  );

  // Draw course name (large, bold, centered, below name)
  drawCenteredInBox(
    String(courseName ?? "N/A"),
    7.64,
    14.29,
    9.99,
    21,
    helveticaBold,
    rgb(0.15, 0.15, 0.15)
  );

  // Draw Certificate ID (top right)
  drawNormalText(
    String(certId ?? "N/A").slice(0, 32),
    19.68,
    2.2,
    14,
    helvetica,
    rgb(0.6, 0.6, 0.6)
  );

  // Draw only the date (bottom left above QR)
  drawNormalText(
    String(issuedDate ?? "N/A"),
    1.29,
    18.42,
    14,
    helvetica,
    rgb(0.5, 0.5, 0.5)
  );

  // Draw Instructor & Company (bottom right)
  drawNormalText(
    `${String(companyName ?? "")}`.trim(),
    23,
    19,
    16,
    helvetica,
    rgb(0.1, 0.1, 0.1)
  );

  // Draw QR code (bottom left)
  const qrText = `${process.env.FRONTEND_URL || "https://certiguard.com"}/verify/${certId}`;
  const qrDataUrl = await QRCode.toDataURL(qrText);
  const qrImage = await pdfDoc.embedPng(qrDataUrl);
  const { x: qrX, y: qrY } = convertCmToPdfCoords(1.81, 16.34, pageHeight);
  const qrSize = 100;
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  // 💾 Save final certificate
  const fileName = `CertGuard-${certId}.pdf`;
  const outputPath = path.join(saveDir, fileName);
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  return { certId, fileName, hash, qrDataUrl, qrText };
};

async function processCertificate(localPdfPath, certId) {
  const fileBuffer = fs.readFileSync(localPdfPath);
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  // Store hash on blockchain
  let txHash = "";
  let contractAddress = process.env.CONTRACT_ADDRESS || "";
  try {
    txHash = await storeCertificateHash(hash);
  } catch (err) {
    console.error('[Blockchain] Anchoring failed:', err);
  }

  return {
    pdfUrl: `/${localPdfPath}`,
    hash,
    txHash,
    contractAddress
  };
}

export default generateCertificate;
export { processCertificate };
