import { useState, useEffect } from "react";
import Registration from "./Registration";
import Scanner from "./Scanner";
import Performance from "./Performance";
import FinishScreen from "./FinishScreen";
// Ensure this path matches where you put the file!
import MobileFrame from "./components/MobileFrame"; 

function App(){

  // Check if user is already logged in
  const [registered, setRegistered] = useState(
    !!localStorage.getItem("userId")
  );

  // Simple State-Based Navigation (No URLs)
  const [screen, setScreen] = useState("scanner");

  // ⭐ Listen for "navigation events" from other components
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
    // If you don't have MobileFrame, just use <div className="app-bg">...</div>
    <div className="app-bg"> 
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