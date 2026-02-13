import { useState, useEffect } from "react";
import confetti from "canvas-confetti"; 

export default function Finish() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ⭐ Use state for these to ensure they are reactive
  const [runnerId, setRunnerId] = useState(localStorage.getItem("userId"));
  const [userName, setUserName] = useState(localStorage.getItem("userName"));

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
      // ⭐ RE-CHECK: If state is empty, try reading one last time
      const currentId = runnerId || localStorage.getItem("userId");
      
      if (!currentId) {
        console.error("No userId found in storage.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "getUserStats", userId: currentId })
        });
        
        const data = await res.json();
        
        if (data.error) {
          console.error("Fetch Error:", data.error);
        } else {
          setStats(data);
          
          // ⭐ Trigger celebration if status is YES
          if (data.status === "YES") {
            localStorage.setItem("raceStatus", "YES");
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              zIndex: 9999
            });
          }
        }
      } catch (err) {
        console.error("Network Error:", err);
      }
      setLoading(false);
    };

    fetchStats();
  }, [runnerId]);

  if (loading) return <div className="screen-container"><div className="spinner"></div><p>Calculating final results...</p></div>;

  return (
    <div className="screen-container" style={{ 
      textAlign: 'center', 
      overflowY: 'auto', 
      maxHeight: '90vh', 
      padding: '10px 20px 40px', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ fontSize: '50px', marginBottom: '5px' }}>🏆</div>
      <h2 style={{ color: '#28a745', margin: '0 0 5px' }}>Congratulations!</h2>
      <p style={{ fontSize: '15px', margin: '0 0 15px', color: '#555' }}>
        <strong>{userName || localStorage.getItem("userName")}</strong>, you finished!
      </p>

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
        Age Group: <strong>{stats?.ageGroup || "Fetching..."}</strong>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        <a 
          href={`${API}?action=certificate&userId=${runnerId || localStorage.getItem("userId")}`} 
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