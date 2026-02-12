import { useRef, useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Scanner() {

  const runnerId = localStorage.getItem("userId");
  
  // Track last checkpoint locally
  const [lastCP, setLastCP] = useState(localStorage.getItem("lastCP") || "");

  const [status, setStatus] = useState("Ready to scan");
  const [scanning, setScanning] = useState(false);
  
  const [pendingScans, setPendingScans] = useState(
    JSON.parse(localStorage.getItem("pendingScans") || "[]")
  );

  // ⭐ Ref to keep track of the scanner instance
  const scannerRef = useRef(null);
  const regionId = "reader-box"; // Unique HTML ID for the camera box

  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";


  
  /* ---------------- LIFECYCLE CLEANUP ---------------- */
  // ⭐ Ensures camera is killed if user leaves the screen
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .then(() => scannerRef.current.clear())
          .catch(err => console.log("Cleanup error", err));
      }
    };
  }, []);

  /* ---------------- VALIDATION LOGIC ---------------- */
  const validateSequence = (scannedCP) => {
    const sequence = ["CP1", "CP2", "CP3", "CP4", "CP5"];
    
    // Case 1: First ever scan must be CP1
    if (!lastCP && scannedCP !== "CP1") {
      return { valid: false, msg: "Start with CP1!" };
    }

    // Case 2: If we have history, check order
    if (lastCP) {
      const lastIndex = sequence.indexOf(lastCP);
      const expected = lastCP === "CP5" ? "CP1" : sequence[lastIndex + 1];

      if (scannedCP !== expected) {
        return { valid: false, msg: `Wrong! Go to ${expected}` };
      }
    }

    return { valid: true };
  };

  /* ---------------- HELPER: STATE UPDATES ---------------- */
  const handleSuccess = (checkpoint) => {
    setLastCP(checkpoint);
    localStorage.setItem("lastCP", checkpoint);
  };

  /* ---------------- OFFLINE SAVING ---------------- */
  const saveOffline = (checkpoint, timestamp) => {
    const newScan = { userId: runnerId, checkpoint, timestamp };
    
    // Prevent duplicates in queue
    const isDuplicate = pendingScans.some(s => s.checkpoint === checkpoint && s.timestamp === timestamp);
    if(isDuplicate) return;

    const updatedQueue = [...pendingScans, newScan];
    setPendingScans(updatedQueue);
    localStorage.setItem("pendingScans", JSON.stringify(updatedQueue));
    
    handleSuccess(checkpoint); // Update local state so volunteer can continue
    setStatus(`⚠️ Offline! Saved ${checkpoint}`);
  };

  /* ---------------- SYNC DATA (Hotspot Logic) ---------------- */
  const syncData = async () => {
    if (pendingScans.length === 0) return;

    setStatus(`Syncing ${pendingScans.length} offline scans...`);

    const remaining = [];

    for (const scan of pendingScans) {
      try {
        await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "scan",
            userId: scan.userId,
            checkpoint: scan.checkpoint,
            timestamp: scan.timestamp
          })
        });
      } catch (err) {
        remaining.push(scan);
      }
    }

    setPendingScans(remaining);
    localStorage.setItem("pendingScans", JSON.stringify(remaining));

    if (remaining.length === 0) setStatus("✅ All synced!");
    else setStatus(`⚠️ Sync incomplete. ${remaining.length} pending.`);
  };

  /* ---------------- ROBUST START SCANNER ---------------- */
  const startScanner = async () => {
    if (scanning) return;

    // 1. Initialize scanner
    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;

    setStatus("Starting camera...");

    try {
      // 2. Get Cameras (Fix for Laptop vs Mobile)
      const devices = await Html5Qrcode.getCameras();
      
      if (devices && devices.length) {
        // Default to first camera (laptop), or try to find "back" camera (mobile)
        let cameraId = devices[0].id;
        
        // Simple heuristic: Usually last camera on mobile is the "back" one
        if (devices.length > 1) {
          cameraId = devices[devices.length - 1].id; 
        }

        await scanner.start(
          cameraId, 
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          (errorMessage) => { 
            // ignore frame errors 
          }
        );
        
        setScanning(true);
        setStatus("Ready to scan...");

      } else {
        setStatus("No cameras found ❌");
      }

    } catch (err) {
      console.error("Camera Start Error:", err);
      setStatus("Camera failed. Try Refresh. ❌");
      setScanning(false);
    }
  };

  /* ---------------- STOP SCANNER ---------------- */
  const stopScanner = async () => {
    if (!scannerRef.current) return;
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      scannerRef.current.clear();
    } catch (e) {
      console.log("Stop warning:", e);
    }
    scannerRef.current = null;
    setScanning(false);
  };

  /* ---------------- ON SCAN SUCCESS ---------------- */
  const onScanSuccess = async (decodedText) => {
    // Stop immediately to prevent duplicate reads
    await stopScanner();
    
    const scanTime = new Date().getTime(); 

    // 1. Validate Sequence
    const validation = validateSequence(decodedText);
    if (!validation.valid) {
      setStatus(`❌ ${validation.msg}`);
      return; 
    }

    setStatus(`Processing ${decodedText}...`);

    try {
      // 2. Try Online
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "scan",
          userId: runnerId,
          checkpoint: decodedText,
          timestamp: scanTime
        })
      });

      const data = await res.json();

      if (data.error) {
        setStatus(data.error + " ❌");
      } else {
        setStatus(`Verified ${decodedText} ✅`);
        handleSuccess(decodedText); 
        
        // Auto-Sync if we just got online
        if (pendingScans.length > 0) syncData();
        
        if (data.finished) window.location.hash = "#finish";
      }

    } catch (err) {
      // 3. Offline -> Save
      console.log("Network fail, saving offline");
      saveOffline(decodedText, scanTime);
    }
  };

  return (
    <div className="screen-container">
      <h2>DAI Walkathon</h2>
      
      {/* Offline Warning Banner */}
      {pendingScans.length > 0 && (
        <div style={{
          background: "#ffeb3b", padding: "10px", borderRadius: "8px", 
          marginBottom: "15px", border: "1px solid #fbc02d"
        }}>
          <strong>⚠️ {pendingScans.length} Scans Pending</strong>
          <p style={{fontSize:"12px", margin:"5px 0"}}>Data saved locally.</p>
          <button onClick={syncData} style={{
              background: "#333", color: "white", border: "none", 
              padding: "8px 16px", borderRadius: "5px", cursor: "pointer"
            }}>🔄 Force Sync</button>
        </div>
      )}

      <h3>Bib: {runnerId}</h3>
      {lastCP && <p style={{fontSize:"12px", color:"#666"}}>Last Checked: {lastCP}</p>}

      {/* Camera Box */}
      <div id={regionId} className="scanner-box"></div>

      <p className="status-text">{status}</p>

      <div className="scanner-buttons">
        
        {!scanning && (
          <button className="primary-btn" onClick={startScanner}>Start Scan</button>
        )}

        {scanning && (
          <button className="primary-btn" style={{background: "#dc3545"}} onClick={stopScanner}>Stop Scan</button>
        )}

        <button className="secondary-btn" onClick={() => window.location.hash = "#performance"}>
          View Performance
        </button>

        <button className="secondary-btn" onClick={() => {
            if(pendingScans.length > 0 && !confirm("Unsaved scans! Reset anyway?")) return;
            localStorage.clear();
            window.location.reload();
          }}>
          Reset User
        </button>
      </div>
    </div>
  );
}