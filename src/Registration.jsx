import { useState } from "react";

export default function Registration({ onRegistered }) {

  const [form, setForm] = useState({
    name: "",
    phone: "",
    countryCode: "+91", 
    gender: "",
    dob: ""
  });

  const [loading, setLoading] = useState(false);

  // ⚠️ Ensure this matches your latest deployment
  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";
   
  const validateForm = () => {
    // 1. Name Check
    if (!form.name.trim()) return "Please enter your name";

    // 2. Phone Validation (Strictly 10 digits)
    // The regex ^[0-9]{10}$ means "Start to end must be exactly 10 digits"
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone)) {
      return "Phone number must be exactly 10 digits.";
    }

    // 3. DOB Validation (Year 1920 - 2020)
    if (!form.dob) return "Please select Date of Birth";
    const year = new Date(form.dob).getFullYear();
    if (year < 1920 || year > 2020) {
      return "Date of Birth year must be between 1920 and 2020.";
    }

    if (!form.gender) return "Please select Gender";

    return null;
  };

  const handleSubmit = async () => {
    
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setLoading(true);

    // Combine Country Code + Phone
    const fullPhone = `${form.countryCode}${form.phone}`;

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "register",
          name: form.name,
          phone: fullPhone,
          dob: form.dob,
          gender: form.gender
        })
      });

      const data = await res.json();

      if (data.error) {
        alert("❌ Registration Failed: " + data.error);
      } else {
        localStorage.setItem("userId", data.userId);
        alert(`✅ Registration Successful!\n\nWelcome, ${data.name}!`);
        onRegistered();
      }

    } catch (err) {
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

      <div style={{ display: "flex", gap: "10px" }}>
        <select
          className="input"
          style={{ width: "80px", padding: "10px" }}
          value={form.countryCode}
          onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
        >
          <option value="+91">+91 (IN)</option>
          <option value="+1">+1 (US)</option>
          <option value="+44">+44 (UK)</option>
        </select>
        
        <input
          placeholder="Phone (10 digits)"
          className="input"
          type="tel"
          maxLength={10} // ⭐ UI Restriction
          value={form.phone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, ""); 
            setForm({ ...form, phone: val });
          }}
        />
      </div>

      <div style={{textAlign:'left', marginBottom:'10px'}}>
        <label style={{fontSize:'12px', color:'#666', marginLeft:'5px'}}>Date of Birth</label>
        <input
          type="date"
          className="input"
          min="1920-01-01"
          max="2020-12-31"
          value={form.dob}
          onChange={(e) => setForm({ ...form, dob: e.target.value })}
        />
      </div>

      <select
        className="input"
        value={form.gender}
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
      >
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>

      <button 
        className="btn" 
        onClick={handleSubmit} 
        disabled={loading}
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}