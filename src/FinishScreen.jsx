import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function FinishScreen(){

  const [stats,setStats] = useState(null);

  const API =
    "https://script.google.com/macros/s/AKfycbxzpxbYQzVMSgnUheJ0N8y_KFmiMAeTBGxZBs3AFIghCQj82bN2W6E1TlBTEdcYuwE/exec";

  const userId = localStorage.getItem("userId");

  /* ------------ FETCH FINAL STATS ------------ */
  useEffect(()=>{

    // 🎉 Confetti
    setTimeout(()=>{
      confetti({ particleCount:200, spread:100 });
    },400);

    fetch(API,{
      method:"POST",
      body: JSON.stringify({
        action:"getUserStats",
        userId:userId
      })
    })
    .then(res=>res.json())
    .then(data=>setStats(data));

  },[]);

  if(!stats){
    return <h2>Loading results...</h2>;
  }

  /* ------------ CERTIFICATE DOWNLOAD ------------ */
  const downloadCertificate = () => {

    window.open(
      `${API}?action=certificate&userId=${userId}`,
      "_blank"
    );
  };

  return(
    <div className="screen-container" style={{textAlign:"center"}}>

      <h1>🏅 Walkathon Completed</h1>

      <p><b>Name:</b> {stats.name}</p>
      <p><b>Age Group:</b> {stats.ageGroup}</p>
      <p><b>Total Time:</b> {stats.total} sec</p>

      <button
        className="primary-btn"
        style={{marginTop:"20px"}}
        onClick={downloadCertificate}
      >
        Download Certificate 📜
      </button>

      <button
        className="secondary-btn"
        style={{marginTop:"10px"}}
        onClick={()=>{
          localStorage.clear();
          window.location.reload();
        }}
      >
        Register New Participant
      </button>

    </div>
  );
}
