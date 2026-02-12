import { useState, useEffect } from "react";
import Registration from "./Registration";
import Scanner from "./Scanner";
import Performance from "./Performance";
import FinishScreen from "./FinishScreen";

function App(){

  // Check if user is already logged in
  const [registered, setRegistered] = useState(
    !!localStorage.getItem("userId")
  );

  // Simple State-Based Navigation
  const [screen, setScreen] = useState("scanner");

  // ⭐ Listen for "navigation events"
  useEffect(() => {
    const handleNav = () => {
      const hash = window.location.hash;
      if (hash === "#performance") setScreen("performance");
      else if (hash === "#finish") setScreen("finish");
      else setScreen("scanner");
    };

    // Check on load
    handleNav();

    // Listen for changes
    window.addEventListener("hashchange", handleNav);
    return () => window.removeEventListener("hashchange", handleNav);
  }, []);

  return (
    <div className="app-bg"> 
      {/* This div acts as your mobile frame wrapper */}
      <div className="mobile-frame">
        
        {/* Header */}
        <div className="app-header">
           <h2>DAI Walkathon</h2>
        </div>

        <div className="app-content">
          {!registered ? (
            <Registration onRegistered={() => setRegistered(true)} />
          ) : screen === "performance" ? (
            <Performance />
          ) : screen === "finish" ? (
            <FinishScreen />
          ) : (
            <Scanner />
          )}
        </div>

      </div>
    </div>
  );
}

export default App;