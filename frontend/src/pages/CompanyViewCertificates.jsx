import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { Download, FileText } from "lucide-react";

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
        setError(
          err.response?.data?.message || "Failed to fetch certificates."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl font-bold text-blue-700 mb-8">
        📄 Issued Certificates
      </h2>

      {loading ? (
        <div className="text-blue-600 text-lg font-medium">
          Loading certificates...
        </div>
      ) : error ? (
        <div className="text-red-600 font-semibold">{error}</div>
      ) : certificates.length === 0 ? (
        <div className="text-gray-500 text-md">No certificates issued yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-blue-100 text-blue-800 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Recipient</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Course</th>
                <th className="px-5 py-3 font-semibold">Issued On</th>
                <th className="px-5 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {certificates.map((cert) => (
                <tr key={cert._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3">{cert.recipientName}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {cert.userId?.email || "-"}
                  </td>
                  <td className="px-5 py-3">{cert.courseName}</td>
                  <td className="px-5 py-3">
                    {new Date(cert.issuedDate).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 flex justify-center gap-4">
                    {cert.pdfUrl ? (
                      <>
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View PDF"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FileText size={20} />
                        </a>
                        <a
                          href={`/api/certificates/download/${cert.certId}`}
                          title="Download PDF"
                          className="text-green-600 hover:text-green-800"
                        >
                          <Download size={20} />
                        </a>
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
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
