import { useState, useEffect } from "react";

export default function Performance() {
  const runnerId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";

  const formatTime = (decimalMins) => {
    if (!decimalMins || isNaN(decimalMins) || decimalMins === 0) return "00:00";
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
      } catch (err) {
        console.error("Fetch error:", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, [runnerId]);

  if (loading) return (
    <div className="app-content">
      <div className="screen-container" style={{ width: '100%', boxSizing: 'border-box' }}>
        <div className="spinner" style={{margin: '50px auto'}}></div>
        <p style={{textAlign: 'center'}}>Fetching your stats...</p>
      </div>
    </div>
  );

  // ⭐ Observation 5: Logic to calculate progress safely
  const completedRounds = stats?.rounds?.length || 0;
  const totalRounds = stats?.totalRounds || 1; // Fallback to 1 to avoid division by zero
  const progressPercent = Math.min((completedRounds / totalRounds) * 100, 100);

  return (
    <div className="app-content" style={{ width: '100%', boxSizing: 'border-box' }}>
      <div className="screen-container" style={{ 
        width: '50vh', 
        boxSizing: 'border-box', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'stretch' 
      }}>
        <h2 style={{textAlign: 'center', marginBottom: '10px'}}>My Performance</h2>
        <div style={{textAlign: 'center', marginBottom: '10px'}}>
          <p><strong>{userName}</strong></p>
          <p style={{fontSize: '12px', color: '#666'}}>Bib Number: {runnerId}</p>
        </div>

        {/* ⭐ Observation 5: Progress Bar */}
        <div style={{ marginBottom: '25px', padding: '0 5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px', color: '#666' }}>
            <span>Race Progress</span>
            <span>{completedRounds} / {totalRounds} Rounds</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              background: stats?.status === "YES" ? "#28a745" : "#0d6efd", 
              transition: 'width 0.5s ease' 
            }}></div>
          </div>
        </div>
        
        <div className="stats-grid" style={{display: 'flex', gap: '10px', marginBottom: '25px', width: '100%', boxSizing: 'border-box'}}>
          <div className="stat-card" style={{flex: 1, background: '#f8f9fa', padding: '15px', borderRadius: '15px', textAlign: 'center', border: '1px solid #dee2e6'}}>
            <small style={{color: '#666', fontSize: '11px', textTransform: 'uppercase'}}>Total Time</small>
            <h3 style={{margin: '5px 0', fontSize: '24px'}}>{formatTime(stats?.total)}</h3>
          </div>
          <div className="stat-card" style={{flex: 1, background: '#f8f9fa', padding: '15px', borderRadius: '15px', textAlign: 'center', border: '1px solid #dee2e6'}}>
            <small style={{color: '#666', fontSize: '11px', textTransform: 'uppercase'}}>Race Status</small>
            <h3 style={{margin: '5px 0', fontSize: '18px', color: stats?.status === "YES" ? "#28a745" : "#fd7e14"}}>
              {stats?.status === "YES" ? "FINISHED" : "IN PROGRESS"}
            </h3>
          </div>
        </div>

        <h4 style={{marginBottom: '10px', alignSelf: 'flex-start'}}>Lap Breakdown</h4>
        <div className="lap-list" style={{background: '#fff', borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee', width: '100%', boxSizing: 'border-box'}}>
          {stats?.rounds && stats.rounds.length > 0 ? (
            stats.rounds.map((time, index) => (
              <div key={index} className="lap-item" style={{display: 'flex', justifyContent: 'space-between', padding: '12px 15px', borderBottom: '1px solid #eee'}}>
                <span style={{color: '#555'}}>Lap {index + 1}</span>
                <strong style={{color: '#0d6efd'}}>{formatTime(time)}</strong>
              </div>
            ))
          ) : (
            <p style={{padding: '15px', color: '#999', textAlign: 'center'}}>No laps completed yet.</p>
          )}
        </div>

        {stats?.status === "YES" && (
          <div style={{marginTop: '25px', width: '100%'}}>
            <a 
              href={`${API}?action=certificate&userId=${runnerId}`} 
              className="primary-btn" 
              style={{textDecoration: 'none', display: 'block', textAlign: 'center', background: '#28a745', width: '100%', boxSizing: 'border-box'}}
              target="_blank"
              rel="noopener noreferrer"
            >
              🎓 Download Certificate
            </a>
          </div>
        )}

        {/* ⭐ Observation 2: Disabled when finished */}
        <button 
          className="secondary-btn" 
          disabled={stats?.status === "YES"}
          style={{
            marginTop: stats?.status === "YES" ? '15px' : '25px', 
            width: '100%',
            opacity: stats?.status === "YES" ? 0.6 : 1,
            cursor: stats?.status === "YES" ? 'not-allowed' : 'pointer'
          }}
          onClick={() => window.location.hash = "#scanner"}
        >
          {stats?.status === "YES" ? "Race Completed" : "Back to Scanner"}
        </button>
      </div>
    </div>
  );
}