import { useState } from "react";

export default function Registration({ onRegistered }) {

  const [form, setForm] = useState({
    name: "",
    phone: "",
    countryCode: "+91", // Default
    dob: "",
    gender: ""
  });

  const [loading, setLoading] = useState(false);

  // ⚠️ Make sure this is your latest Web App URL
  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";
   
  const handleRegister = async () => {
    // 1. Simple Validation
    if (!form.name.trim()) { alert("Enter Name"); return; }
    if (!/^[0-9]{10}$/.test(form.phone)) { alert("Phone must be 10 digits"); return; }
    if (!form.dob) { alert("Enter Date of Birth"); return; }
    if (!form.gender) { alert("Select Gender"); return; }

    setLoading(true);
    const fullPhone = `${form.countryCode}${form.phone}`;

    try {
      // 2. Send to Google Sheet
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "register", // Direct registration
          name: form.name,
          phone: fullPhone,
          dob: form.dob,
          gender: form.gender
        })
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error); 
      } else {
        // 3. Save & Login
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userName", form.name); // Save name for certificate later
        alert(`✅ Welcome ${form.name}!`);
        onRegistered();
      }

    } catch (err) {
      console.error(err);
      alert("Network Error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="form-card">
      <h3 className="form-title">Participant Registration</h3>

      <input
        placeholder="Full Name"
        className="input"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      {/* ⭐ PHONE GROUP (Fixed Layout) */}
      <div className="phone-group">
        <select
          className="input phone-code"
          value={form.countryCode}
          onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
        >
          <option value="+91">+91</option>
          <option value="+1">+1</option>
          <option value="+44">+44</option>
        </select>
        
        <input
          placeholder="Phone (10 digits)"
          className="input phone-number"
          type="tel"
          maxLength={10}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
        />
      </div>

      <label style={{fontSize:'12px', color:'#666', marginLeft:'5px'}}>Date of Birth</label>
      <input
        type="date"
        className="input"
        style={{lineHeight: '20px', minHeight:'52px'}}
        value={form.dob}
        onChange={(e) => setForm({ ...form, dob: e.target.value })}
      />

      <select
        className="input"
        value={form.gender}
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <button 
        className="primary-btn" 
        onClick={handleRegister} 
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>

    </div>
  );
}