import { useState, useEffect } from "react";
import Registration from "./Registration";
import Scanner from "./Scanner";
import Performance from "./Performance";
import FinishScreen from "./FinishScreen";

function App(){

  const [registered, setRegistered] = useState(
    !!localStorage.getItem("userId")
  );

  const [screen, setScreen] = useState("scanner");

  useEffect(() => {
    const handleNav = () => {
      const hash = window.location.hash;
      if (hash === "#performance") setScreen("performance");
      else if (hash === "#finish") setScreen("finish");
      else setScreen("scanner");
    };
    handleNav();
    window.addEventListener("hashchange", handleNav);
    return () => window.removeEventListener("hashchange", handleNav);
  }, []);

  return (
    <div className="app-bg"> 
      <div className="mobile-frame">
        
        {/* ⭐ HEADER WITH BIG LOGO */}
        <div className="app-header">
           {/* Ensure logo.png is in your /public folder! */}
           <img src="/logo.png" alt="DAI Logo" className="app-logo" />
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