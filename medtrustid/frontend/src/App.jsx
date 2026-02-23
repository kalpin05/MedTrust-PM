import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import PatientDashboard from "./pages/PatientDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import SecurityDashboard from "./pages/SecurityDashboard";
import SecurityLab from "./pages/SecurityLab";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Protected routes wrapped in universal Navbar Layout */}
        <Route element={<Layout />}>
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/security/dashboard" element={<SecurityDashboard />} />
          <Route path="/security-lab" element={<SecurityLab />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
