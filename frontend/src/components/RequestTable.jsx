import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RequestTable = ({ requests }) => {
  const navigate = useNavigate();

  const handleMoreClick = (companyId) => {
    if (companyId) navigate(`/admin/companies/${companyId}`);
  };

  const handleStatusUpdate = async (id, action) => {
    const token = localStorage.getItem("token");
    const endpoint = `/api/certificates/issuance/${action}/${id}`;

    try {
      await axios.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`Certificate ${action}ed successfully!`);
      window.location.reload(); // or call a refetch function
    } catch (err) {
      console.error(`Error ${action}ing request:`, err);
      alert(`Failed to ${action} request.`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Pending Certificate Requests
        </h2>
        <input
          type="text"
          placeholder="Search..."
          className="border border-gray-300 rounded px-3 py-1 text-sm w-64"
        />
      </div>

      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req._id}
            className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-3 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center font-bold text-blue-700">
                {req.companyId?.name?.[0] || "U"}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  {req.companyId?.name || req.userId?.name || "Unknown"}
                </h4>
                <p className="text-sm text-gray-500">
                  Uploaded by: {req.userId?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  Requested on: {new Date(req.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>
                <strong>Course:</strong> {req.courseName}
              </p>
              <p>
                <strong>Issued Date:</strong>{" "}
                {new Date(req.issuedDate).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right space-y-2">
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  req.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : req.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {req.status}
              </span>

              {req.status === "pending" && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleStatusUpdate(req._id, "approve")}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(req._id, "reject")}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}

              {req.companyId && (
                <button
                  onClick={() => handleMoreClick(req.companyId._id)}
                  className="ml-2 text-sm text-blue-600 hover:underline font-medium"
                >
                  Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestTable;
