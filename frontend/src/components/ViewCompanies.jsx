import { useEffect, useState } from "react";
import axios from "axios";
import { Building2 } from "lucide-react";

export default function ViewCompanies() {
  const [companies, setCompanies] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [actionLoading, setActionLoading] = useState("");

  const fetchCompanies = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("/api/admin/companies", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompanies(res.data.companies);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAction = async (id, status) => {
    setActionLoading(id + status);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/companies/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCompanies();
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading("");
    }
  };

  const filteredCompanies = companies.filter(
    (company) => company.status === statusFilter
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-2">
        <Building2 className="w-7 h-7" /> Companies
      </h2>
      <div className="mb-6">
        <label className="mr-3 font-medium text-gray-700">Show:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-green-200 rounded px-3 py-2 text-green-700 bg-green-50"
        >
          <option value="active">Approved Companies</option>
          <option value="inactive">Pending Companies</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="text-gray-500 col-span-2">No companies found for this status.</div>
        ) : (
          filteredCompanies.map((company) => (
            <div
              key={company._id}
              className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl shadow p-6 flex flex-col gap-2 hover:shadow-lg transition"
            >
              <div className="font-semibold text-lg text-green-800">{company.name}</div>
              <div className="text-sm text-gray-500">{company.email}</div>
              <div className="text-xs text-gray-400">{company.address}</div>
              {statusFilter === "inactive" && (
                <div className="mt-3 flex gap-3">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded font-semibold disabled:opacity-60"
                    disabled={actionLoading === company._id + "active"}
                    onClick={() => handleAction(company._id, "active")}
                  >
                    {actionLoading === company._id + "active" ? "Approving..." : "Approve"}
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded font-semibold disabled:opacity-60"
                    disabled={actionLoading === company._id + "rejected"}
                    onClick={() => handleAction(company._id, "rejected")}
                  >
                    {actionLoading === company._id + "rejected" ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}