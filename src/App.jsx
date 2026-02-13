import { useState, useEffect } from "react";
import Registration from "./Registration";
import Scanner from "./Scanner";
import Performance from "./Performance";
import FinishScreen from "./FinishScreen";

function App() {
  const [registered, setRegistered] = useState(() => {
    return !!localStorage.getItem("userId");
  });

  const [showWelcome, setShowWelcome] = useState(true);
  const [screen, setScreen] = useState("scanner");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4800); // Slightly longer for the new background to be appreciated

    const handleNav = () => {
      const hash = window.location.hash;
      if (hash === "#performance") setScreen("performance");
      else if (hash === "#finish") setScreen("finish");
      else setScreen("scanner");
    };

    handleNav();
    window.addEventListener("hashchange", handleNav);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", handleNav);
    };
  }, []);

  if (showWelcome) {
    return (
      <div className="app-bg">
        <style>{`
          @keyframes meshGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animated-mesh {
            background: linear-gradient(-45deg, #0d6efd, #004fb1, #212529, #0a58ca);
            background-size: 400% 400%;
            animation: meshGradient 10s ease infinite;
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }

          .welcome-item {
            opacity: 0;
            animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }

          .delay-1 { animation-delay: 0.3s; }
          .delay-2 { animation-delay: 0.7s; }
          .delay-3 { animation-delay: 1.1s; }
          .delay-4 { animation-delay: 1.5s; }
        `}</style>

        <div className="mobile-frame" style={{ overflow: 'hidden' }}>
          <div className="animated-mesh">
            
            {/* 1. Logo with a soft glow */}
            <div className="welcome-item delay-1" style={{ 
              background: 'white', 
              padding: '15px', 
              borderRadius: '25px', 
              display: 'inline-block', 
              marginBottom: '30px', 
              boxShadow: '0 15px 35px rgba(0,0,0,0.3)' 
            }}>
              <img src="/logo.png" alt="DAI Logo" style={{ height: '150px' }} />
            </div>
            
            {/* 2. Main Title */}
            <h1 className="welcome-item delay-2" style={{ 
              fontSize: '34px', 
              fontWeight: '900', 
              margin: '0', 
              color: 'white',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              Walkathon 2026
            </h1>

            {/* ⭐ NEW: Organization Credit in a single small line */}
            <p className="welcome-item delay-3" style={{ 
              fontSize: '16px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px', 
              marginTop: '10px', 
              color: 'rgba(255,255,255,0.8)',
              //whiteSpace: 'nowrap' // Forces it into one line
            }}>
              Organised by Diabetic Association of India, Poona Brach
            </p>
            
            {/* 3. Developer Credit */}
            <div className="welcome-item delay-3" style={{ marginTop: '30px' }}>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0' }}>
                APP developed by
              </p>
              <p style={{ 
                fontSize: '22px', 
                fontWeight: '700', 
                color: 'white', 
                marginTop: '5px',
                letterSpacing: '0.5px'
              }}>
                Pariksheet Vishwas Deval
              </p>
            </div>
            
            {/* 4. Elegant Spinner */}
            <div className="welcome-item delay-4" style={{ marginTop: '60px' }}>
               <div className="spinner" style={{ 
                 borderTopColor: 'white', 
                 borderWidth: '3px',
                 height: '30px',
                 width: '30px'
               }}></div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-bg"> 
      <div className="mobile-frame">
        <div className="app-header">
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