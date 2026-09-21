# 🎮 How to Play Time Heist · Complete Field Manual

Welcome to **Time Heist**, an algorithmic vault infiltration game inspired by *Money Heist (La Casa de Papel)*! 

In this game, you take the role of **The Professor (Human Operator)**. Your mission is to infiltrate high-security bank vaults, decode room intelligence, dodge patrolling sentry drones, and crack high-value safe-deposit rooms before the master countdown hits zero.

---

## 🎯 The Core Objective

1. **Loot Maximum Cash (₹)**: Every vault room has a specific **Loot Value (₹k)** and a **Time Cost (seconds)** to crack.
2. **Respect the Time Budget**: You have a limited total time budget (e.g., 30s – 120s). When the timer expires, the vault airlock seals automatically.
3. **Race Against Algorithms**:
   - **Berlin's DP Crew**: Computes the mathematically optimal solution using **0/1 Knapsack Dynamic Programming**.
   - **Tokyo's B&B Squad**: Searches the decision tree using **Branch & Bound** with fractional upper bounds.
   - **Your Goal**: Outsmart or match the 100% mathematical optimal score using human intuition, recon, and real-time pathing!

---

## 🕹️ Step-by-Step Infiltration Guide

### Step 1: Plan Your Mission (Heist Setup)
1. Launch the game and click **"PLAN INFILTRATION"** on the landing screen.
2. Choose a **Difficulty Preset** or configure your own parameters in the **Custom Heist Architect**:
   - **Presets**: *Rookie Job* (Easy), *Bank Job* (Medium), *Cyber Heist* (Hard), *Fort Knox* (Extreme).
   - **Custom Parameters**: Adjust **Room Count** (3 to 18), **Time Budget** (10s to 150s), and **Vault Potential** (₹50k to ₹3,000k).
3. Review the **Tactical Intelligence Briefing** and click **"INITIATE HEIST"** to start the countdown.

---

### Step 2: Navigate the Vault Arena

Once the heist begins, you operate on the **2D Vault Blueprint**:

```
[ AIRLOCK ] ─── 🏃 Sprint ───▶ [ ROOM 1 ] ───▶ [ ROOM 2 ]
                                 🔓 HACKING (⏳ 3.4s left)
                                 (+1.6s spent)
```

- **Airlock (Start Point)**: The green terminal where your character begins at $(x: 30, y: 60)$.
- **Room Portals**: Circular vault nodes connected by high-tech security conduits.
- **Fog of War (Encrypted Rooms)**: Rooms initially show `₹?k in ?s` until scouted or visited.
- **Patrolling Sentry Drones (Guards)**: Red drones moving along laser patrol routes.

---

### Step 3: Orders, Movement & Queueing

1. **Targeting a Room**:
   - Click on any room on the **2D Blueprint Map** or click **"QUEUE"** in the **Target Cards** tactical view.
   - Your character will immediately plot a trajectory and sprint towards the room.
2. **Action Queueing**:
   - You can click multiple rooms in advance to chain commands.
   - Queued rooms display badge markers (`Q1`, `Q2`, etc.) and the operative automatically heads to the next target upon finishing the current room.
3. **View Modes**:
   - **2D Blueprint**: Graphical overhead floor plan showing guard routes and character positions.
   - **Target Cards**: Detailed list view showing room cost, value, efficiency density ($\frac{₹}{\text{second}}$), and queue status.

---

### Step 4: Real-Time Lockpicking & Countdown Feedback

When your operative reaches a target room, lockpicking begins automatically:

1. **Floating Countdown Bubble Over The Character**:
   - **Live Countdown**: Shows the remaining seconds to crack the room (e.g. `⏳ 3.4s left`), reducing smoothly in real-time.
   - **Time Consumed**: Displays the time invested so far (e.g. `+1.6s / 5s spent`).
   - **Micro Progress Bar**: A glowing gradient bar indicating live hacking progress.
2. **Circular Countdown Ring on the Room**:
   - An illuminated cyan circular SVG gauge empties around the room portal as the security lock is broken.
3. **Operator Header Status**:
   - Displays `🔓 HACKING [ROOM NAME] • ⏳ Xs left (+Ys spent)` with a live progress fill bar.

---

### Step 5: Stealth & Sentry Drone Avoidance

Sentry drones continuously patrol the vault:

- **Collision Radius**: Drones detect you within **46 pixels** distance.
- **The Penalty of Getting Caught**:
  - 🚨 **Loot Confiscation**: $-₹25\text{k}$ penalty deducted from your secured loot.
  - ⚡ **Alarm Surge**: $-5\text{s}$ penalty deducted from your remaining time budget.
  - 💫 **Stunned (2.5s)**: Operative optical camouflage reboots, canceling active lockpicks.
- **Pro Tip**: Observe the red laser patrol trajectories and time your runs when the guard is moving away!

---

### Step 6: Tactical Power-Ups

Use your tactical power-up tools in the top toolbar:

| Power-Up | Icon | Charges | How It Works |
|---|---|---|---|
| **Scout Drone** | 🛰️ `Deploy Scout Drone` | 3 Charges | Click the button, then click any encrypted `₹?k` room to remotely decode its exact value and time cost from afar. |
| **Greedy Knapsack Hint** | 💡 `Greedy Hint` | 2 Charges | Evaluates the mathematical greedy density ($\frac{\text{Value}}{\text{Time}}$) across all remaining affordable rooms and lights up the best local target in glowing gold. |

---

### Step 7: Debrief & Synchronized Replay Arena

When the heist concludes (time runs out or you secure your targets):

1. **Mission Debrief**:
   - **Score Comparison**: Human Score vs. DP Crew (Optimal) vs. B&B Crew vs. Greedy Baseline.
   - **Efficiency Percentage**: See what percentage of the true mathematical maximum you secured.
2. **Multi-Agent Replay Arena**:
   - Drag the **Timeline Scrubber** or click **Play Replay** to watch all 3 operatives (You, DP, B&B) and sentry guards move in synchronized real-time.
   - Inspect live countdown timers and step-by-step looting choices at any timestamp $t$.

---

## 🏆 Pro-Gamer Strategies (Algorithmic Thinking)

1. **Prioritize Value Density ($\frac{\text{Value}}{\text{Time}}$)**:
   - A room giving $₹100\text{k}$ in $4\text{s}$ ($25\text{k/s}$) is much better than a room giving $₹120\text{k}$ in $10\text{s}$ ($12\text{k/s}$).
2. **Don't Leave Idle Time**:
   - If you have $4\text{s}$ left, make sure to grab a small $3\text{s}$ room rather than letting time expire!
3. **Use Scout Drones Early**:
   - Reveal rooms early so you can plan the most efficient route and avoid backtracking.
4. **Watch Guard Turning Points**:
   - Sentry guards pause briefly at room waypoints before turning around. Use that window to sprint past!

---

## ⌨️ Controls Quick Reference

- **Left Click on Room**: Move to room or add to Queue.
- **"Deploy Scout Drone" Button + Click Room**: Scout room intel without walking to it.
- **"Greedy Hint" Button**: Highlight top value/time room.
- **2D Blueprint / Target Cards Toggle**: Switch between visual map and data card view.
- **Timeline Slider (Debrief)**: Scrub through heist replay at $0.5\times$, $1\times$, or $2\times$ speed.

*Bella Ciao! May your calculations be swift and your bags full of gold.* 🎭
