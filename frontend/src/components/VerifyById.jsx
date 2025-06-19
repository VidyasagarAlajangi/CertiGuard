import { useState } from "react";

const VerifyById = () => {
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: Replace with API call
    setResult(`Searched for certificate ID: ${certId}`);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🔎</span>
        <h2 className="text-2xl font-bold text-blue-700">Verify by Certificate ID</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          className="border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          placeholder="Enter Certificate ID"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 font-semibold text-lg shadow transition"
        >
          Verify
        </button>
      </form>
      {result && <div className="mt-4 text-green-600 font-medium">{result}</div>}
    </div>
  );
};

export default VerifyById; 