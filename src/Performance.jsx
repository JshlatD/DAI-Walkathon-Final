import { useEffect, useState } from "react";

const REQUIRED_ROUNDS = {
  G1: 5,
  G2: 4,
  G3: 3,
  G4: 2,
  G5: 1
};

export default function Performance() {

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";
  const userId = localStorage.getItem("userId");

  const fetchStats = () => {
    fetch(API, {
      method: "POST",
      body: JSON.stringify({
        action: "getUserStats",
        userId
      })
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 5000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="screen-container">
        <h2>Loading performance…</h2>
      </div>
    );
  }

  const completed = stats.rounds.length;
  const required = REQUIRED_ROUNDS[stats.ageGroup] || 0;
  const progressPercent = Math.min(
    Math.round((completed / required) * 100),
    100
  );

  return (
    <div className="screen-container">

      <h2>Your Performance</h2>

      <p><b>Name:</b> {stats.name}</p>
      <p><b>Age Group:</b> {stats.ageGroup}</p>
      <p><b>Status:</b> {stats.status}</p>

      {/* Progress Bar */}
      <div className="progress-wrapper">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p>{completed} / {required} rounds completed</p>
      </div>

      <h3>Round Times</h3>

      {completed === 0 ? (
        <p>No rounds completed</p>
      ) : (
        stats.rounds.map((time, index) => (
          <p key={index}>
            Round {index + 1}: {time} sec
          </p>
        ))
      )}

      <h3>Total Time</h3>
      <p>{stats.total} sec</p>

      {/* Back button */}
      <button
        className="primary-btn"
        style={{ marginTop: "15px" }}
        onClick={() => {
          window.location.hash = "";
          window.location.reload();
        }}
      >
        Back to Scan
      </button>

    </div>
  );
}
