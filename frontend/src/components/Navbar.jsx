import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { User } from "lucide-react";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <nav className="bg-gradient-to-r from-blue-50 via-white to-blue-100 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center text-2xl font-extrabold text-blue-700 gap-2">
          <span role="img" aria-label="certificate">📜</span>
          CertGuard
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/verify" className="px-4 py-2 rounded-full text-blue-700 hover:bg-blue-100 transition font-medium">Verify</Link>
          {user && (
            <Link to="/dashboard" className="px-4 py-2 rounded-full text-blue-700 hover:bg-blue-100 transition font-medium">Dashboard</Link>
          )}
          {user ? (
            <div className="ml-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center gap-2">
              <User size={22} />
              <span className="hidden sm:inline">{user.name || 'Profile'}</span>
            </div>
          ) : (
            <Link to="/login" className="ml-2 px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow transition">Login / Sign Up</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 