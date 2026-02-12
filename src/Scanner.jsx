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

  const [batchData, setBatchData] = useState(() => {
    return JSON.parse(localStorage.getItem("batchData") || "[]");
  });

  const [startTime, setStartTime] = useState(() => {
    const saved = localStorage.getItem("raceStartTime");
    return saved ? parseInt(saved) : null;
  });
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  useEffect(() => {
    let interval = null;
    if (startTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - startTime;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }, 1000);
    } else {
      setElapsedTime("00:00:00");
    }
    return () => { if (interval) clearInterval(interval); };
  }, [startTime]);

  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";
  
  const onScanSuccess = async (decodedText) => {
    // ⭐ GUARD 1: Kill any immediate double-triggers from the camera
    if (processing) return; 
    setProcessing(true);

    // ⭐ GUARD 2: Explicitly stop the hardware immediately
    await stopScanner();
    
    const scanTime = new Date().getTime();
    const sequence = ["CP1", "CP2", "CP3", "CP4", "CP5"];
    const currentStoredCP = localStorage.getItem("lastCP") || "";
    const expected = !currentStoredCP ? "CP1" : (currentStoredCP === "CP5" ? "CP1" : sequence[sequence.indexOf(currentStoredCP) + 1]);
    
    if (decodedText !== expected) {
      setStatus(`❌ Wrong Checkpoint! Go to ${expected}`);
      setProcessing(false);
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
          // ⭐ CRITICAL: Check if this lap finished the race
          if (data.finished) {
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
  };

  const startScanner = async () => {
    if (scanning || processing) return;
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
        <p style={{textAlign: 'center', fontSize: '12px', color: '#666', marginBottom: '15px'}}>Bib Number: {runnerId}</p>

        <div style={{ position: 'relative', width: '100%', maxWidth: '300px', margin: '15px auto' }}>
          {(!cameraReady || !scanning) && (
            <div className="stopwatch-overlay">
               <p style={{fontSize: '14px', color: '#666'}}>Race Time</p>
               <h1 style={{fontSize: '42px', fontFamily: 'monospace'}}>{elapsedTime}</h1>
            </div>
          )}
          <div id="reader-box" className="scanner-box"></div>
        </div>
        
        <p className="status-text">{status}</p>

        <div className="scanner-buttons" style={{width: '100%'}}>
          {!scanning && (
            <button className="primary-btn" onClick={startScanner} disabled={processing}>
              {processing ? "Saving..." : "Start Scan"}
            </button>
          )}
          {scanning && (
            <button className="primary-btn" style={{background: "#dc3545"}} onClick={stopScanner}>Close Camera</button>
          )}
          <button className="secondary-btn" onClick={() => window.location.hash = "#performance"}>View Performance</button>
        </div>
      </div>
    </div>
  );
}