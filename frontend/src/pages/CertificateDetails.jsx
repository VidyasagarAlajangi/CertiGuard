import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const mockCertificates = [
  { id: 'CERT123', name: 'Blockchain Fundamentals', company: 'BlockTech Inc.', date: '2024-05-01', url: '/certificates/CERT123.pdf' },
  { id: 'CERT456', name: 'React Advanced', company: 'WebDev Solutions', date: '2024-06-10', url: '/certificates/CERT456.pdf' },
  { id: 'CERT789', name: 'Cybersecurity Basics', company: 'SecureIT', date: '2024-07-15', url: '/certificates/CERT789.pdf' },
];

const CertificateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const cert = mockCertificates.find(c => c.id === id);
      setCertificate(cert);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-blue-600">Loading certificate...</div>;
  }

  if (!certificate) {
    return <div className="flex items-center justify-center min-h-[60vh] text-red-600">Certificate not found.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Certificate Details</h2>
        <div className="mb-4">
          <div className="font-semibold text-blue-800 text-lg mb-2">{certificate.name}</div>
          <div className="text-blue-500 text-base mb-1">Company: {certificate.company}</div>
          <div className="text-blue-500 text-base mb-1">Certificate ID: {certificate.id}</div>
          <div className="text-gray-500 text-sm mb-1">Issued: {certificate.date}</div>
        </div>
        <div className="flex gap-4 mt-6 justify-center">
          <a href={certificate.url} className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition" download>
            Download PDF
          </a>
          <button onClick={() => navigate(-1)} className="px-5 py-3 bg-gray-200 text-blue-700 rounded-lg font-semibold hover:bg-gray-300 transition">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetails; 