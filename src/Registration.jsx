import { useState } from "react";

export default function Registration({ onRegistered }) {
  const [form, setForm] = useState({ name: "", phone: "", dob: "", gender: "" });
  const [loginMode, setLoginMode] = useState(false); 
  const [loading, setLoading] = useState(false);
  
  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";

  const handleAction = async () => {
    // Basic Validation
    if (!form.phone || form.phone.length !== 10) { 
      alert("Please enter exactly 10 digits for the phone number."); 
      return; 
    }
    
    if (!loginMode && (!form.name || !form.dob || !form.gender)) {
      alert("Please fill in all registration fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: loginMode ? "getUserStats" : "register",
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
        // Find the userId: it might be in data.userId (register) or in the stats (login)
        const id = data.userId || (data.name ? form.phone : null); 
        
        if (!id && loginMode) {
          alert("User not found. Please register first.");
        } else {
          localStorage.setItem("userId", data.userId || id);
          localStorage.setItem("userName", data.name || form.name);
          alert(`✅ Success! Welcome ${data.name || form.name}`);
          onRegistered();
        }
      }
    } catch (err) { 
      alert("Network error. Please try again."); 
    }
    setLoading(false);
  };

  return (
    <div className="form-card">
      <h3 className="form-title">
        {loginMode ? "Participant Login" : "Participant Registration"}
      </h3>

      {!loginMode && (
        <input 
          placeholder="Full Name" 
          className="input" 
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})} 
        />
      )}

      {/* ⭐ FIXED PHONE INPUT: Limited to 10 digits only */}
      <div className="phone-group">
        <div className="input phone-code" style={{width: '60px', textAlign: 'center', background: '#eee'}}>+91</div>
        <input 
          placeholder="Phone Number" 
          className="input phone-number" 
          type="tel" 
          maxLength={10} // Physically stops entry at 10
          value={form.phone}
          onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})} 
        />
      </div>

      {!loginMode && (
        <>
          <label style={{fontSize:'12px', color:'#666', marginLeft:'5px'}}>Date of Birth</label>
          <input 
            type="date" 
            className="input" 
            value={form.dob}
            onChange={(e) => setForm({...form, dob: e.target.value})} 
          />
          <select 
            className="input" 
            value={form.gender}
            onChange={(e) => setForm({...form, gender: e.target.value})}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </>
      )}

      <button className="primary-btn" onClick={handleAction} disabled={loading}>
        {loading ? "Processing..." : loginMode ? "Login" : "Register"}
      </button>

      <button 
        className="secondary-btn" 
        style={{marginTop: '10px'}}
        onClick={() => setLoginMode(!loginMode)}
      >
        {loginMode ? "New? Register here" : "Already Registered? Login"}
      </button>

      {/* ⭐ RESET BUTTON: Only visible on this screen */}
      <button 
        className="secondary-btn" 
        style={{marginTop: '30px', color: 'red', borderColor: 'red'}} 
        onClick={() => {
          if(confirm("This will clear ALL your race progress. Are you sure?")) { 
            localStorage.clear(); 
            window.location.reload(); 
          }
        }}
      >
        Reset App Data
      </button>
    </div>
  );
}