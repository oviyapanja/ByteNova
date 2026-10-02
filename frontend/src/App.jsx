import { useState } from "react";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import UploadData from "./pages/UploadData";
import Analytics from "./pages/Analytics";
import Industries from "./pages/Industries";
import Inspections from "./pages/Inspections";
import Satellite from "./pages/Satellite";
import Reports from "./pages/Reports";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [activePage, setActivePage] = useState("dashboard");

  const [analysisResult, setAnalysisResult] = useState(null);

  const [verificationStatus, setVerificationStatus] = useState({});

  const [satelliteOpen, setSatelliteOpen] = useState({});

  const updateVerificationStatus = (industryId, status) => {
    setVerificationStatus((current) => ({
      ...current,
      [industryId]: status,
    }));
  };

  const commonProps = {
    analysisResult,
    setAnalysisResult,
    verificationStatus,
    updateVerificationStatus,
    satelliteOpen,
    setSatelliteOpen,
    setActivePage,
  };

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={() => {
          setIsLoggedIn(true);
          setActivePage("dashboard");
        }}
      />
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard {...commonProps} />;

      case "upload":
        return <UploadData {...commonProps} />;

      case "analytics":
        return <Analytics {...commonProps} />;

      case "industries":
        return <Industries {...commonProps} />;

      case "inspections":
        return <Inspections {...commonProps} />;

      case "satellite":
        return <Satellite {...commonProps} />;

      case "reports":
        return <Reports {...commonProps} />;

      default:
        return <Dashboard {...commonProps} />;
    }
  };

  return (
    <div className="app-layout">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={() => {
          setIsLoggedIn(false);
          setAnalysisResult(null);
          setVerificationStatus({});
        }}
      />

      <main className="app-main">
        {renderPage()}
      </main>

    </div>
  );
}

export default App;