import React, { useEffect, useState } from "react";
import api from "../lib/axios";

const CompanyViewCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/company/certificates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCertificates(res.data.certificates || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch certificates.");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Issued Certificates</h2>
      {loading ? (
        <div className="text-blue-600">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : certificates.length === 0 ? (
        <div className="text-gray-500">No certificates issued yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-2">Recipient</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Course</th>
                <th className="px-4 py-2">Issued Date</th>
                <th className="px-4 py-2">Download</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert._id} className="border-t">
                  <td className="px-4 py-2">{cert.recipientName}</td>
                  <td className="px-4 py-2">{cert.userId?.email || "-"}</td>
                  <td className="px-4 py-2">{cert.courseName}</td>
                  <td className="px-4 py-2">{new Date(cert.issuedDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {cert.pdfUrl ? (
                      <a
                        href={cert.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        PDF
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompanyViewCertificates; 