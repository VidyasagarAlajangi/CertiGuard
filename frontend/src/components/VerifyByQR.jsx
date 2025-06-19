import { useState } from "react";
import { QrCode } from "lucide-react";

const VerifyByQR = () => {
  const [qrResult, setQrResult] = useState(null);

  const handleFileChange = (e) => {
    // Placeholder: Replace with QR scan logic
    setQrResult("Scanned QR code (placeholder)");
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <QrCode className="text-blue-700" size={28} />
        <h2 className="text-2xl font-bold text-blue-700">Verify by QR Code</h2>
      </div>
      <input
        type="file"
        accept="image/*"
        className="mb-3 border-2 border-blue-200 rounded-lg px-4 py-3 w-full text-lg bg-blue-50 hover:bg-blue-100 transition"
        onChange={handleFileChange}
      />
      <div className="text-blue-500 text-base mb-2">Upload a QR code image to verify a certificate.</div>
      {qrResult && <div className="mt-4 text-green-600 font-medium">{qrResult}</div>}
    </div>
  );
};

export default VerifyByQR; 