import { useState } from "react";
import { QrCode, Loader, CheckCircle, XCircle, Award } from "lucide-react";
import api from "../lib/axios";
import { Link } from "react-router-dom";

const VerifyByQR = () => {
  const [qrData, setQrData] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.get(`/verify/qr/${encodeURIComponent(qrData)}`);
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "An unknown error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 h-full">
      <div className="flex items-center gap-3 mb-4">
        <QrCode className="text-blue-500" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Verify by QR Code</h2>
      </div>
      <p className="text-gray-500 mb-6">Paste the QR code data string to validate the certificate.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg w-full"
          placeholder="Paste QR code data here"
          value={qrData}
          onChange={(e) => setQrData(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 font-semibold text-lg shadow-md hover:shadow-lg transition-all w-full flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={20} /> Verifying...
            </>
          ) : (
            "Verify"
          )}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
          <XCircle />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {result && result.success && (
        <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="text-green-600" />
            <h3 className="text-lg font-bold">Certificate Verified!</h3>
          </div>
          <div className="space-y-2 text-md">
            <p>
              <strong>Course:</strong> {result.certificate.courseName || result.certificate.title}
            </p>
            <p>
              <strong>Issued By:</strong> {result.certificate.companyId?.name}
            </p>
            <p>
              <strong>Issued To:</strong> {result.certificate.userId?.name} (
              {result.certificate.userId?.email})
            </p>
            <p>
              <strong>Issued On:</strong>{" "}
              {new Date(result.certificate.issuedDate || result.certificate.issueDate).toLocaleDateString()}
            </p>
            <Link
              to={`/certificate/${result.certificate.certId}`}
              className="mt-3 inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
            >
              <Award size={18} /> View Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyByQR; 