import { useState } from "react";
import api from "../lib/axios";
import { Search, Loader, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VerifyById = () => {
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/verify/${certId}`);
      if (res.data && res.data.success && res.data.certificate?.certId) {
        navigate(`/certificate/${res.data.certificate.certId}`);
      } else {
        setError("Certificate not found or not valid.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An unknown error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Search className="text-blue-500" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Verify by ID</h2>
      </div>
      <p className="text-gray-500 mb-6">
        Enter the unique ID from the certificate to verify its authenticity.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg w-full"
          placeholder="Enter Certificate ID"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
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
    </div>
  );
};

export default VerifyById; 