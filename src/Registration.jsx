import { useState } from "react";

export default function Registration({ onRegistered }) {
  const [form, setForm] = useState({ name: "", phone: "", dob: "", gender: "" });
  const [loginMode, setLoginMode] = useState(false); 
  const [loading, setLoading] = useState(false);
  
  // ⭐ RESTORED CORRECT URL: J0N8y_ included
  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";

  const handleAction = async () => {
    if (!form.phone || form.phone.length !== 10) { 
      alert("Please enter exactly 10 digits."); 
      return; 
    }
    
    setLoading(true);

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: loginMode ? "getUserStats" : "register",
          userId: form.phone.trim(), 
          phone: form.phone.trim(),
          name: form.name,
          dob: form.dob,
          gender: form.gender
        })
      });

      const data = await res.json();
      
      if (data.error) {
        alert(`❌ ${data.error}`);
      } else {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userName", data.name);
        // ⭐ Check status from Sheet to enable auto-redirect
        localStorage.setItem("raceStatus", data.status || "IN PROGRESS"); 
        
        alert(`✅ Welcome ${data.name}`);
        
        // ⭐ Route immediately if finished
        if (data.status === "YES") {
          window.location.hash = "#finish";
        } else {
          window.location.hash = "#scanner";
        }
        
        onRegistered();
      }
    } catch (err) { 
      // If the URL is wrong or script crashes, this triggers
      alert("Network error: Please check your Internet or Script Deployment."); 
    }
    setLoading(false);
  };

  return (
    <div className="form-card">
      <h3 className="form-title">{loginMode ? "Participant Login" : "Registration"}</h3>
      
      {!loginMode && (
        <input placeholder="Full Name" className="input" value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})} />
      )}

      <div className="phone-group">
        <div className="input phone-code" style={{width: '60px', background: '#eee'}}>+91</div>
        <input placeholder="Phone Number" className="input phone-number" type="tel" maxLength={10} 
          value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})} />
      </div>

      {!loginMode && (
        <>
          <label style={{fontSize:'12px', color:'#666'}}>Date of Birth</label>
          <input type="date" className="input" value={form.dob} onChange={(e) => setForm({...form, dob: e.target.value})} />
          <select className="input" value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </>
      )}

      <button className="primary-btn" onClick={handleAction} disabled={loading}>
        {loading ? "Processing..." : loginMode ? "Login" : "Register"}
      </button>

      <button className="secondary-btn" style={{marginTop: '10px'}} onClick={() => setLoginMode(!loginMode)}>
        {loginMode ? "New? Register here" : "Already Registered? Login"}
      </button>
    </div>
  );
}