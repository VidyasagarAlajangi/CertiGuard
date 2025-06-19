const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  courseName: { type: String, required: true },
  issuedDate: { type: Date, required: true },
  status: { type: String, enum: ['approved', 'rejected'], default: 'approved' },
  pdfUrl: { type: String, required: true },
  qrCodeUrl: { type: String, required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

module.exports = mongoose.model('Certificate', certificateSchema); 