import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

const mockCertificates = [
  { id: 'CERT123', name: 'Blockchain Fundamentals', company: 'BlockTech Inc.', date: '2024-05-01', url: '/certificates/CERT123.pdf' },
  { id: 'CERT456', name: 'React Advanced', company: 'WebDev Solutions', date: '2024-06-10', url: '/certificates/CERT456.pdf' },
  { id: 'CERT789', name: 'Cybersecurity Basics', company: 'SecureIT', date: '2024-07-15', url: '/certificates/CERT789.pdf' },
];

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Simulate API call
    setTimeout(() => {
      setCertificates(mockCertificates);
      setLoading(false);
    }, 800);
  }, [user, navigate]);

  if (!user) return null;

  const filteredCertificates = certificates.filter(cert =>
    cert.name.toLowerCase().includes(search.toLowerCase()) ||
    cert.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">My Certificates</h2>
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Search by course or company name..."
            className="border-2 border-blue-200 rounded-lg px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="text-blue-600 text-center">Loading certificates...</div>
        ) : error ? (
          <div className="text-red-600 text-center">{error}</div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-gray-500 text-center">No certificates found.</div>
        ) : (
          <ul className="space-y-4">
            {filteredCertificates.map((cert) => (
              <li key={cert.id} className="border border-blue-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-blue-50">
                <div>
                  <div className="font-semibold text-blue-800 text-lg">{cert.name}</div>
                  <div className="text-blue-500 text-sm">Company: {cert.company}</div>
                  <div className="text-blue-500 text-sm">ID: {cert.id}</div>
                  <div className="text-gray-500 text-xs">Issued: {cert.date}</div>
                </div>
                <div className="mt-2 md:mt-0 flex gap-2">
                  <Link to={`/certificate/${cert.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">View</Link>
                  <a href={`/verify/${cert.id}`} className="px-4 py-2 bg-white border border-blue-600 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition">Share/Verify</a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 