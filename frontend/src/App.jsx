import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CertificateDetails from "./pages/CertificateDetails";
import AdminDashboard from "./pages/AdminDashboard";
//import InstitutesPage from "./pages/InstitutesPage";

import VerifyPage from "./pages/VerifyPage";
import PrivateRoute from "./components/PrivateRoute";
import { Routes, Route } from "react-router-dom";
import CompanyDashboard from "./pages/CompanyDashboard";

function App() {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-transparent">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/certificate/:id" element={<CertificateDetails />} />
        {/* Protected Routes */}
        <Route element={<PrivateRoute roles={["user"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
        </Route>

        { <Route element={<PrivateRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          
        </Route> }

        <Route element={<PrivateRoute roles={["company"]} />}>
          <Route path="/company" element={<CompanyDashboard />} />
        </Route>
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
