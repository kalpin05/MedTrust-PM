import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import PatientDashboard from "./pages/PatientDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import SecurityDashboard from "./pages/SecurityDashboard";
import SecurityLab from "./pages/SecurityLab";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/security/dashboard" element={<SecurityDashboard />} />
        <Route path="/security-lab" element={<SecurityLab />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
