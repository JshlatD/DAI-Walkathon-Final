import { useState, useEffect } from "react";
import confetti from "canvas-confetti"; 

export default function Finish() {
  const runnerId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";

  const formatTime = (decimalMins) => {
    if (!decimalMins || isNaN(decimalMins)) return "00:00";
    const totalSeconds = Math.round(decimalMins * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "getUserStats", userId: runnerId })
        });
        const data = await res.json();
        setStats(data);
        
        if (data.status === "YES") {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 9999 });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, [runnerId]);

  return (
    <div className="app-content">
      {/* ⭐ HEADER BLOCK (Restored from Image 29) */}
      <div className="header-blue" style={{ padding: '30px 20px 40px', textAlign: 'center', background: '#0d6efd', color: 'white', borderRadius: '0 0 30px 30px' }}>
        <div className="logo-white-box" style={{ background: 'white', padding: '10px', borderRadius: '15px', display: 'inline-block', marginBottom: '15px' }}>
          <img src="logo.png" alt="DAI Walkathon" style={{ height: '60px' }} />
        </div>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>DAI Walkathon</h2>
      </div>

      <div className="screen-container" style={{ marginTop: '-20px', padding: '0 20px 30px' }}>
        <div style={{ background: 'white', borderRadius: '30px', padding: '30px 20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
              <p style={{ marginTop: '10px', color: '#666' }}>Finalizing results...</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '5px' }}>Congratulations!</h2>
              <p style={{ color: '#333', fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>{userName}</p>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '25px' }}>Bib Number: {runnerId}</p>

              {/* ⭐ STATS CARDS (Restored visual style from Image 29) */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <div style={{ flex: 1, border: '1px solid #eee', borderRadius: '20px', padding: '15px', textAlign: 'center' }}>
                  <small style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Total Time</small>
                  {/* ⭐ Bound-Safe Time Display */}
                  <h3 style={{ fontSize: '28px', margin: '5px 0', color: '#1a1a1a' }}>
                    {stats?.total ? formatTime(stats.total) : "00:00"}
                  </h3>
                </div>
                <div style={{ flex: 1, border: '1px solid #eee', borderRadius: '20px', padding: '15px', textAlign: 'center' }}>
                  <small style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>Race Status</small>
                  <h3 style={{ fontSize: '18px', margin: '10px 0', color: '#28a745', fontWeight: 'bold' }}>FINISHED</h3>
                </div>
              </div>

              {/* ⭐ ACTION BUTTON (Only Download Certificate) */}
              <a 
                href={`${API}?action=certificate&userId=${runnerId}`} 
                className="primary-btn" 
                style={{ 
                  textDecoration: 'none', 
                  background: '#28a745', 
                  color: 'white',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  padding: '16px', 
                  fontSize: '16px', 
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                🎓 Download Certificate
              </a>
              <p style={{ fontSize: '10px', color: '#999' }}>PDF will open in a new tab for download.</p>

              <button 
                className="secondary-btn" 
                style={{ marginTop: '20px', width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', background: 'transparent', color: '#666' }}
                onClick={() => window.location.hash = "#performance"}
              >
                Detailed Performance
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}