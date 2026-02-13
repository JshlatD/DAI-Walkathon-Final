import { useState, useEffect } from "react";
import confetti from "canvas-confetti"; 

export default function Finish() {
  const runnerId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";

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
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 9999
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, [runnerId]);

  if (loading) return <div className="screen-container"><p>Calculating final results...</p></div>;

 // ⭐ UPDATED FinishScreen.jsx (Optimized for Mobile Height)
// ... same imports and fetch logic ...

return (
  <div className="screen-container" style={{ 
    textAlign: 'center', 
    overflowY: 'auto', 
    maxHeight: '90vh', // ⭐ Limits height so bottom is reachable
    padding: '10px 20px 40px', // Added more bottom padding for scrolling room
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }}>
    <div style={{ fontSize: '50px', marginBottom: '5px' }}>🏆</div>
    <h2 style={{ color: '#28a745', margin: '0 0 5px' }}>Congratulations!</h2>
    <p style={{ fontSize: '15px', margin: '0 0 15px', color: '#555' }}>
      <strong>{userName}</strong>, you finished!
    </p>

    {/* ⭐ Reduced padding and margins here to save space */}
    <div className="finish-card" style={{ 
      background: '#f8f9fa', 
      padding: '15px', 
      borderRadius: '20px', 
      margin: '0 0 15px', 
      border: '2px solid #28a745',
      width: '100%' 
    }}>
      <p style={{ textTransform: 'uppercase', fontSize: '10px', color: '#666', marginBottom: '2px' }}>Your Official Time</p>
      <h1 style={{ fontSize: '40px', margin: 0, color: '#333' }}>
        {stats?.total ? formatTime(stats.total) : "00:00"}
      </h1>
    </div>

    <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>
      Age Group: <strong>{stats?.ageGroup}</strong>
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      <a 
        href={`${API}?action=certificate&userId=${runnerId}`} 
        className="primary-btn" 
        style={{ textDecoration: 'none', background: '#28a745', display: 'block', padding: '12px' }}
        target="_blank"
        rel="noopener noreferrer"
      >
        🎓 Download Certificate
      </a>

      <button 
        className="secondary-btn" 
        style={{ padding: '12px' }}
        onClick={() => window.location.hash = "#performance"}
      >
        Detailed Performance
      </button>
    </div>

    <p style={{ marginTop: '20px', fontSize: '10px', color: '#999' }}>
      Thank you for participating!
    </p>
  </div>
);
}