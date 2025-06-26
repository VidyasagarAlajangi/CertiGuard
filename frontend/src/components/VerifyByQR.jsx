import { useState, useRef } from 'react';
import api from '../lib/axios';

const VerifyByQR = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image file containing a QR code.');
      return;
    }
    setScanning(true);
    setError(null);
    setResult(null);
    try {
      console.log('[VerifyByQR] Uploading image to scan QR...');
      const formData = new FormData();
      formData.append('qrImage', image);
      console.log('[VerifyByQR] Uploading image to scan QR...');
      const scanRes = await api.post('/certificates/scan-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('[VerifyByQR] Scan response:', scanRes.data);
      if (scanRes.data && scanRes.data.qrData) {
        // Now verify the certificate using the decoded QR data
        setLoading(true);
        const verifyRes = await api.get(`/certificates/verify/qr?data=${encodeURIComponent(scanRes.data.qrData)}`);
        console.log('[VerifyByQR] Verification response:', verifyRes.data);
        setResult(verifyRes.data);
      } else {
        setError(scanRes.data?.message || 'No QR code found in the image.');
      }
    } catch (err) {
      console.error('[VerifyByQR] Error:', err);
      setError(err.response?.data?.message || 'QR scan or verification failed.');
    } finally {
      setScanning(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Verify Certificate by QR Image</h2>
      <form onSubmit={handleScan} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className="border border-gray-300 rounded-lg px-2 py-1"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition"
          disabled={scanning || loading || !image}
        >
          {scanning || loading ? 'Verifying...' : 'Verify by QR Image'}
        </button>
      </form>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {result && result.success && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-bold text-green-700 mb-2">Certificate Verified!</h3>
          <div className="text-gray-800">
            <div><b>Course:</b> {result.certificate.courseName}</div>
            <div><b>Issued By:</b> {result.certificate.companyId?.name}</div>
            <div><b>Issued To:</b> {result.certificate.userId?.name} ({result.certificate.userId?.email})</div>
            <div><b>Issued On:</b> {new Date(result.certificate.issuedDate).toLocaleDateString()}</div>
            <div><b>Certificate ID:</b> {result.certificate.certId}</div>
          </div>
        </div>
      )}
      {result && !result.success && (
        <div className="mt-4 text-red-600">{result.message}</div>
      )}
    </div>
  );
};

export default VerifyByQR; 