import VerifyById from "../components/VerifyById";
import VerifyByQR from "../components/VerifyByQR";

const Home = () => {
  return (
    <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full text-center mb-12">
        <h1 className="text-5xl font-extrabold text-blue-800 mb-4 drop-shadow-sm">Welcome to CertGuard</h1>
        <p className="text-xl text-blue-600 mb-6 font-medium">Secure, blockchain-based digital certificate issuance and verification. Instantly verify certificates by ID or QR code.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-stretch">
        <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center mb-4 md:mb-0 min-w-[280px] max-w-md mx-auto">
          <VerifyById />
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center min-w-[280px] max-w-md mx-auto">
          <VerifyByQR />
        </div>
      </div>
    </div>
  );
};

export default Home; 