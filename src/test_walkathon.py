import requests
import random
import time
from datetime import datetime, timedelta

# ================= CONFIGURATION =================
# 🔴 REPLACE THIS WITH YOUR GOOGLE SCRIPT WEB APP URL
SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw29fKoma877NUPeIQcTeHgvvMomLLJrImyMCecHBlfF2GqFKgHNdCch0C44Z-m01vQBQ/exec" 

# How many dummy users do you want to create?
NUM_USERS = 5 

# Checkpoints sequence
CHECKPOINTS = ["CP1", "CP2", "CP3", "CP4", "CP5"]

# Rounds required per group (Must match your Google Script)
ROUNDS_REQ = {"G1": 5, "G2": 4, "G3": 3, "G4": 2, "G5": 1}

# ================= HELPER FUNCTIONS =================

def get_random_dob(group):
    """Generates a DOB consistent with the Age Group."""
    today = datetime.now()
    if group == "G1": age = random.randint(18, 40)
    elif group == "G2": age = random.randint(41, 50)
    elif group == "G3": age = random.randint(51, 60)
    elif group == "G4": age = random.randint(61, 70)
    else: age = random.randint(71, 85) # G5
    
    birth_date = today - timedelta(days=age*365)
    return birth_date.strftime("%Y-%m-%d")

def generate_user():
    """Creates random user data."""
    first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Diya", "Saanvi", "Ananya"]
    last_names = ["Sharma", "Verma", "Patel", "Singh", "Gupta", "Malhotra", "Bhat", "Deshmukh", "Joshi", "Mehta"]
    
    group_target = random.choice(["G1", "G2", "G3", "G4", "G5"])
    
    return {
        "action": "register",
        "name": f"{random.choice(first_names)} {random.choice(last_names)}",
        "phone": f"98{random.randint(10000000, 99999999)}",
        "gender": random.choice(["Male", "Female"]),
        "dob": get_random_dob(group_target)
    }

# ================= MAIN LOGIC =================

def run_simulation():
    print(f"🚀 Starting Walkathon Simulation for {NUM_USERS} users...")
    print(f"📡 Target URL: {SCRIPT_URL}\n")

    for i in range(NUM_USERS):
        # 1. Register User
        user_data = generate_user()
        try:
            print(f"[{i+1}/{NUM_USERS}] Registering {user_data['name']}...", end=" ")
            res = requests.post(SCRIPT_URL, json=user_data).json()
            
            if "error" in res:
                print(f"❌ Error: {res['error']}")
                continue
                
            user_id = res['userId']
            group = res['ageGroup']
            print(f"✅ Success! ID: {user_id} | Group: {group}")
            
            # 2. Simulate their Walk
            rounds = ROUNDS_REQ.get(group, 1)
            print(f"   👟 Walking {rounds} rounds: ", end="")
            
            # Walk the rounds
            for r in range(rounds):
                for cp in CHECKPOINTS:
                    scan_payload = {
                        "action": "scan",
                        "userId": user_id,
                        "checkpoint": cp
                    }
                    requests.post(SCRIPT_URL, json=scan_payload)
                    print(f"{cp}..", end="", flush=True)
                    # Small delay to simulate walking (and prevent rate limits)
                    time.sleep(0.5) 
            
            # 3. Finish Line (Scan CP1 one last time to close the loop)
            # logic: CP5 -> CP1 finishes the round
            final_payload = {
                "action": "scan", 
                "userId": user_id, 
                "checkpoint": "CP1"
            }
            final_res = requests.post(SCRIPT_URL, json=final_payload).json()
            
            if final_res.get("finished"):
                print(" 🏁 FINISHED!")
            else:
                print(" ⚠️ Did not finish properly.")
                
        except Exception as e:
            print(f"\n❌ Exception: {e}")

    print("\n✅ Simulation Complete. Check your Google Sheet 'Participants' and 'Leaderboard' tabs.")

if __name__ == "__main__":
    run_simulation()