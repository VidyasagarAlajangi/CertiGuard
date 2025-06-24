// import fs from "fs";
// import path from "path";
// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// import { v4 as uuidv4 } from "uuid";

// const generateCertificate = async (templatePath, recipient, saveDir) => {
//   const { name, email, courseName, issuedDate } = recipient;

//   const pdfBytes = fs.readFileSync(templatePath);
//   const pdfDoc = await PDFDocument.load(pdfBytes);
//   const page = pdfDoc.getPage(0);

//   const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//   const fontSize = 24;

//   page.drawText(name, {
//     x: 280,
//     y: 300,
//     size: fontSize,
//     font,
//     color: rgb(0, 0, 0),
//   });

//   page.drawText(courseName, {
//     x: 280,
//     y: 270,
//     size: 24,
//     font,
//     color: rgb(0.2, 0.2, 0.2),
//   });

//   page.drawText(issuedDate, {
//     x: 280,
//     y: 240,
//     size: 16,
//     font,
//     color: rgb(0.2, 0.2, 0.2),
//   });
//   const certId = uuidv4();
//   const fileName = `${certId}.pdf`;
//   const filePath = path.join(saveDir, fileName);
//   fs.writeFileSync(filePath, await pdfDoc.save());

//   return { certId, fileName };
// };
// export default generateCertificate;

import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a certificate using PDFKit and dynamic recipient data.
 * @param {string} backgroundPath - Path to the certificate background image.
 * @param {object} recipient - Recipient object with name, courseName, issuedDate, email.
 * @param {string} saveDir - Output directory to save the generated certificate.
 * @returns {object} certId and fileName
 */
const generateCertificate = async (backgroundPath, recipient, saveDir) => {
  const { name, email, courseName, issuedDate } = recipient;

  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
  });

  const certId = uuidv4();
  const fileName = `${certId}.pdf`;
  const filePath = path.join(saveDir, fileName);

  // Pipe PDF to file
  doc.pipe(fs.createWriteStream(filePath));

  // Draw background image
  if (backgroundPath) {
    doc.image(backgroundPath, 0, 0, {
      width: doc.page.width,
      height: doc.page.height,
    });
  }

  // Set font (optional: use your own TTF)
  doc.font("Helvetica-Bold");

  // === Draw Recipient Fields Centered ===

  // Name
  doc.fontSize(30);
  const nameWidth = doc.widthOfString(name);
  doc.text(name, (doc.page.width - nameWidth) / 2, 250);

  // Course Name
  doc.fontSize(22);
  const courseWidth = doc.widthOfString(courseName);
  doc.text(courseName, (doc.page.width - courseWidth) / 2, 300);

  // Issued Date
  doc.fontSize(16);
  const dateWidth = doc.widthOfString(issuedDate);
  doc.text(issuedDate, (doc.page.width - dateWidth) / 2, 340);

  // End PDF generation
  doc.end();

  return { certId, fileName };
};

export default generateCertificate;
