import { useState } from "react";

export default function Registration({ onRegistered }) {

  const [form, setForm] = useState({
    name: "",
    phone: "",
    countryCode: "+91",
    email: "",
    gender: "",
    dob: "",
    otp: ""
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // ⚠️ Ensure this matches your latest Google Script URL
  const API = "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";
   
  const validateForm = () => {
    if (!form.name.trim()) return "Enter Name";
    if (!/^[0-9]{10}$/.test(form.phone)) return "Phone must be 10 digits";
    if (!form.dob) return "Enter Date of Birth";
    if (!form.gender) return "Select Gender";
    if (!form.email.includes("@")) return "Enter valid Email"; 
    return null;
  };

  const handleSendOtp = async () => {
    const error = validateForm();
    if (error) { alert(error); return; }

    setLoading(true);
    const fullPhone = `${form.countryCode}${form.phone}`;

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "sendOtp",
          phone: fullPhone,
          email: form.email,
          name: form.name
        })
      });
      const data = await res.json();
      
      if (data.status === "sent") {
        alert("✅ OTP sent to your Email!");
        setStep(2); 
      } else {
        alert("Error sending OTP");
      }
    } catch (e) { alert("Network Error"); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!form.otp) { alert("Please enter OTP"); return; }
    
    setLoading(true);
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
          gender: form.gender,
          otp: form.otp 
        })
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error); 
      } else {
        localStorage.setItem("userId", data.userId);
        alert(`✅ Success! Welcome ${data.name}`);
        onRegistered();
      }

    } catch (err) { alert("Network Error"); }
    setLoading(false);
  };

  return (
    <div className="form-card">
      <h3 className="form-title">
        {step === 1 ? "Participant Registration" : "Verify OTP"}
      </h3>

      {step === 1 && (
        <>
          <input
            placeholder="Full Name"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          {/* ⭐ THIS SECTION IS FIXED WITH THE NEW CSS CLASS */}
          <div className="phone-group">
            <select
              className="input"
              value={form.countryCode}
              onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
            </select>
            
            <input
              placeholder="Phone (10 digits)"
              className="input"
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
            // Adding styles to ensure text is visible on iOS
            style={{lineHeight: '20px', minHeight:'50px'}}
            min="1920-01-01"
            max="2020-12-31"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
          />

          <input 
            placeholder="Email (for OTP)"
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

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
            onClick={handleSendOtp} 
            disabled={loading}
          >
            {loading ? "Sending..." : "Register"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p style={{textAlign:"center", marginBottom:"15px"}}>
            Enter the 6-digit code sent to {form.email}
          </p>
          
          <input
            placeholder="OTP"
            className="input"
            style={{textAlign:"center", letterSpacing:"5px", fontSize:"20px"}}
            maxLength={6}
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value })}
          />

          <button 
            className="btn" 
            onClick={handleRegister} 
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Register"}
          </button>
          
          <button 
            className="secondary-btn" 
            style={{marginTop:"10px", width:"100%"}}
            onClick={() => setStep(1)}
          >
            Back
          </button>
        </>
      )}

    </div>
  );
}