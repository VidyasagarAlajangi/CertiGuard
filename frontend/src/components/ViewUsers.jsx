import { useEffect, useState } from "react";
import { Users, FileText, ChevronDown, ChevronUp } from "lucide-react";
import api from "../lib/axios";

export default function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [certificates, setCertificates] = useState({});
  const [loadingCertificates, setLoadingCertificates] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/users");
        setUsers(res.data.users);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchUserCertificates = async (userId) => {
    try {
      setLoadingCertificates(prev => ({ ...prev, [userId]: true }));
      const res = await api.get(`/admin/users/${userId}/certificates`);
      setCertificates(prev => ({ ...prev, [userId]: res.data.certificates }));
    } catch (err) {
      console.error("Error fetching certificates:", err);
      setCertificates(prev => ({ ...prev, [userId]: [] }));
    } finally {
      setLoadingCertificates(prev => ({ ...prev, [userId]: false }));
    }
  };

  const toggleUserCertificates = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      if (!certificates[userId]) {
        await fetchUserCertificates(userId);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 rounded-lg bg-red-50 border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
        <Users className="w-7 h-7" /> Users
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl shadow p-6 flex flex-col gap-2 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-lg text-blue-800">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                    ${user.role === "admin"
                      ? "bg-indigo-100 text-indigo-700"
                      : user.role === "company"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"}
                  `}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleUserCertificates(user._id)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                View Certificates
                {expandedUser === user._id ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Certificates Section */}
            {expandedUser === user._id && (
              <div className="mt-4 border-t border-blue-100 pt-4">
                {loadingCertificates[user._id] ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : certificates[user._id]?.length > 0 ? (
                  <div className="grid gap-3">
                    {certificates[user._id].map((cert) => (
                      <div
                        key={cert._id}
                        className="bg-white border border-blue-100 rounded-lg p-3 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-blue-900">{cert.title}</div>
                          <div className="text-sm text-gray-500">
                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium
                          ${cert.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                        `}>
                          {cert.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No certificates found for this user
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}