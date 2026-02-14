import { useRef, useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Scanner() {
  const runnerId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName"); 
  
  const [lastCP, setLastCP] = useState(() => localStorage.getItem("lastCP") || "");
  const [status, setStatus] = useState("Ready to scan");
  const [scanning, setScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // ⭐ Observation 3: Cooldown State
  const [cooldown, setCooldown] = useState(0);
  
  // ⭐ Observation 4: Round Requirement State
  const [roundsInfo, setRoundsInfo] = useState({ current: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(localStorage.getItem("raceStatus") === "YES");

  const [batchData, setBatchData] = useState(() => {
    return JSON.parse(localStorage.getItem("batchData") || "[]");
  });

  const [startTime, setStartTime] = useState(() => {
    const saved = localStorage.getItem("raceStartTime");
    return saved ? parseInt(saved) : null;
  });
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";

  // ⭐ Observation 4: Fetch round info on mount
  useEffect(() => {
    const getInitStats = async () => {
      try {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "getUserStats", userId: runnerId })
        });
        const data = await res.json();
        if (!data.error) {
          setRoundsInfo({ current: data.rounds.length, total: data.totalRounds });
          if (data.status === "YES") setIsFinished(true);
        }
      } catch (e) { console.warn("Could not fetch round targets"); }
    };
    getInitStats();
  }, [runnerId]);

  // ⭐ Observation 3: Cooldown Timer Effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    let interval = null;
    // ⭐ Observation 1: Stop the clock if race is finished
    if (startTime && !isFinished) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - startTime;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }, 1000);
    } 
    return () => { if (interval) clearInterval(interval); };
  }, [startTime, isFinished]);

  const onScanSuccess = async (decodedText) => {
    if (processing) return; 
    setProcessing(true);

    await stopScanner();
    
    const scanTime = new Date().getTime();
    const sequence = ["CP1", "CP2", "CP3", "CP4", "CP5"];
    const currentStoredCP = localStorage.getItem("lastCP") || "";
    const expected = !currentStoredCP ? "CP1" : (currentStoredCP === "CP5" ? "CP1" : sequence[sequence.indexOf(currentStoredCP) + 1]);
    
    if (decodedText !== expected) {
      setStatus(`❌ Wrong Checkpoint! Go to ${expected}`);
      setProcessing(false);
      setCooldown(10); // ⭐ Observation 3: Lockout after wrong scan to prevent camera spam
      return;
    }

    localStorage.setItem("lastCP", decodedText);
    setLastCP(decodedText);

    if (decodedText === "CP1") {
      setStatus("🔄 Syncing Start/Lap...");
      
      if (!startTime) {
        localStorage.setItem("raceStartTime", scanTime);
        setStartTime(scanTime);
      }

      try {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "batchScan", 
            userId: runnerId,
            checkpoint: "CP1",
            timestamp: scanTime,
            offlineData: batchData 
          })
        });
        const data = await res.json();
        
        if (!data.error) {
          localStorage.removeItem("batchData");
          setBatchData([]);
          setStatus("CP1 Verified ✅");
          
          // ⭐ Update Progress for Observation 5 (if logic shared)
          setRoundsInfo(prev => ({ ...prev, current: prev.current + 1 }));

          if (data.finished) {
            setIsFinished(true);
            localStorage.setItem("raceStatus", "YES");
            alert("🏁 Race Completed!");
            window.location.hash = "#finish";
          }
        } else {
           setStatus(`❌ ${data.error}`);
        }
      } catch (e) {
        setStatus("⚠️ Server busy. CP1 saved locally.");
      }
    } else {
      const newBatch = [...batchData, { checkpoint: decodedText, timestamp: scanTime }];
      setBatchData(newBatch);
      localStorage.setItem("batchData", JSON.stringify(newBatch));
      setStatus(`${decodedText} Saved Locally ✅`);
    }
    
    setProcessing(false);
    setCooldown(10); // ⭐ Observation 3: 10s lockout after successful scan
  };

  const startScanner = async () => {
    if (scanning || processing || cooldown > 0 || isFinished) return;
    setCameraReady(false); 
    const scanner = new Html5Qrcode("reader-box");
    scannerRef.current = scanner;
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        let cameraId = devices.length > 1 ? devices[devices.length - 1].id : devices[0].id;
        await scanner.start(cameraId, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess);
        setScanning(true);
        setCameraReady(true);
      }
    } catch (err) { setScanning(false); }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { 
        if (scannerRef.current.isScanning) await scannerRef.current.stop(); 
        scannerRef.current.clear(); 
      } catch (e) { console.warn("Camera stop issue:", e); }
    }
    setScanning(false);
    setCameraReady(false);
    scannerRef.current = null;
  };

  const scannerRef = useRef(null);

  return (
    <div className="app-content">
      <div className="screen-container">
        <h2 style={{textAlign: 'center', marginBottom: '5px'}}>{userName}</h2>
        <p style={{textAlign: 'center', fontSize: '12px', color: '#666', marginBottom: '5px'}}>Bib Number: {runnerId}</p>

        {/* ⭐ Observation 4: Round Target Display */}
        <p style={{textAlign: 'center', fontSize: '14px', color: '#0d6efd', fontWeight: 'bold', marginBottom: '15px'}}>
          {isFinished ? "🏆 RACE COMPLETE" : `Target: ${roundsInfo.total} Rounds (${roundsInfo.current}/${roundsInfo.total})`}
        </p>

        <div style={{ position: 'relative', width: '100%', maxWidth: '300px', margin: '15px auto' }}>
          {(!cameraReady || !scanning || isFinished) && (
            <div className="stopwatch-overlay">
                <p style={{fontSize: '14px', color: '#666'}}>Race Time</p>
                <h1 style={{fontSize: '42px', fontFamily: 'monospace'}}>{elapsedTime}</h1>
                {isFinished && <p style={{color: '#28a745', fontWeight: 'bold'}}>Final Time</p>}
            </div>
          )}
          <div id="reader-box" className="scanner-box"></div>
        </div>
        
        <p className="status-text">{status}</p>

        <div className="scanner-buttons" style={{width: '100%'}}>
          {!scanning && !isFinished && (
            <button 
              className="primary-btn" 
              onClick={startScanner} 
              disabled={processing || cooldown > 0}
              style={{ background: cooldown > 0 ? '#6c757d' : '#0d6efd' }}
            >
              {/* ⭐ Observation 3: Countdown on button */}
              {processing ? "Saving..." : cooldown > 0 ? `Wait ${cooldown}s...` : "Start Scan"}
            </button>
          )}
          
          {scanning && (
            <button className="primary-btn" style={{background: "#dc3545"}} onClick={stopScanner}>Close Camera</button>
          )}

          {isFinished && (
            <button className="primary-btn" style={{background: "#28a745"}} onClick={() => window.location.hash = "#finish"}>View Results</button>
          )}

          <button className="secondary-btn" onClick={() => window.location.hash = "#performance"}>View Performance</button>
        </div>
      </div>
    </div>
  );
}