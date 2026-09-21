# 🎭 TIME HEIST · La Casa de Papel

> **A real-time 0/1 Knapsack algorithmic heist simulation where you infiltrate high-security vaults, racing your human strategy against Dynamic Programming and Branch & Bound solvers.**

---

## 🌟 Overview

**Time Heist** is an interactive, gamified computer science simulation inspired by the world of *Money Heist (La Casa de Papel)*. Players step into the shoes of **The Professor (Human Operator)** to infiltrate bank vaults, decode encrypted room intelligence, avoid patrolling sentry drones, and loot maximum Indian Rupee (₹) value before the alarm countdown seals the blast doors.

📖 **New to the game? Check out the complete [How to Play Guide (Field Manual)](file:///c:/Users/Akilan.AKILAN-SP/Desktop/Project/Time_heist/HOW_TO_PLAY.md)!**

Simultaneously, two algorithmic AI rivals execute in real-time:
- 🤖 **Berlin's DP Crew**: Solves the vault using **Bottom-Up Dynamic Programming** tabulation with guaranteed mathematical optimality ($O(n \cdot W)$).
- ⚡ **Tokyo's B&B Squad**: Traverses a state-space tree using **Branch & Bound** with fractional knapsack upper bounds, aggressively pruning sub-optimal branches.

---

## 🎮 Key Features

### 1. 🎭 Money Heist Themed Landing Hub
- **3D Mascot Toy Guide**: Interactive Dali-mask toy mascot welcoming players with dynamic tactical tips and speech bubble dialogues.
- **Strategic Quotes Carousel**: Iconic quotes from *The Professor, Berlin, Tokyo, and Nairobi* bridging heist philosophy with algorithmic principles.
- **Atmospheric Visuals**: Scanline laser grids, crimson & gold glow palettes, and floating Dali mask watermarks.

### 2. 🗺️ Real-Time 2D Vault Infiltration Arena
- **Fog of War & Recon**: Vault room values and time costs are encrypted until scouted or entered.
- **Patrolling Sentry Drones**: Real-time moving security guards; getting spotted incurs ₹25k loot fines and alarm surges.
- **Interactive Power-Ups**:
  - 🛰️ **Scout Drone**: Remotely inspect rooms from afar without entering.
  - 💡 **Greedy Knapsack Hint**: Dynamically evaluate value-to-cost density ratios ($\frac{\text{Value}}{\text{Time}}$) to highlight the best local target.
- **Live Character Movement**: Smooth sprite animation, path interpolation, and looting progress bars.

### 3. 🧠 Live Algorithmic Visualizations
- **Berlin's DP Execution Matrix**: Displays computed DP subproblems, active step timers, and progressive room acquisition.
- **Tokyo's Branch & Bound Tree**: Interactive SVG state-space search tree with real-time zoom/pan, node inspection, upper bound calculation, and pruned branch markers ($\times$).

### 4. ⚙️ Custom Heist Architect
- Fix your own parameters:
  - **Room Count**: 3 to 18 rooms.
  - **Time Budget**: 10s (Blitz) to 150s (Marathon).
  - **Vault Potential**: ₹50k to ₹3,000k.
- Built-in difficulty presets: *Rookie Job, Bank Job, Cyber Heist, Fort Knox*.

### 5. 📊 Post-Heist Debrief & Timeline Scrubber
- **Interactive Replay Scrubber**: Step through the heist millisecond-by-millisecond to compare player movement vs. algorithmic paths.
- **Comparative Analysis**: Benchmark your human score against the optimal DP solution and greedy approximation heuristics.
- **Complexity Breakdown**: Educational metrics covering nodes explored, branches pruned, and DP table cells computed.

### 6. 🔊 Immersive Audio Engine
- Synthesized Web Audio API sound effects for countdown alarms, drone radar pings, vault lock-cracking, loot confirmations, and click feedback (toggleable anytime).

---

## 🔬 Algorithmic Foundations

The game models the **0/1 Knapsack Problem**, a classical NP-hard combinatorial optimization challenge:

$$\max \sum_{i=1}^{n} v_i x_i \quad \text{subject to} \quad \sum_{i=1}^{n} w_i x_i \le W, \quad x_i \in \{0, 1\}$$

Where:
- $v_i$ = Loot Value of Room $i$ (in ₹)
- $w_i$ = Time Cost of Room $i$ (in seconds)
- $W$ = Total Time Budget (in seconds)

| Approach | Character / Role | Method | Time Complexity | Optimality |
|---|---|---|---|---|
| **Human Operator** | 🎭 The Professor | Intuition, Recon & Real-time Pathing | Real-time | Variable |
| **Dynamic Programming** | 🤖 Berlin's Crew | Bottom-Up 2D Table Tabulation | $O(n \cdot W)$ | **100% Guaranteed** |
| **Branch & Bound** | ⚡ Tokyo's Squad | Best-First Search + Fractional Bound Pruning | $O(2^n)$ worst-case | **100% Guaranteed** |
| **Greedy Heuristic** | 💡 Infiltration Hint | Value/Weight Density Sorting ($\frac{v_i}{w_i}$) | $O(n \log n)$ | Approximation |

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 & TypeScript
  - Vite for lightning-fast bundling
  - Vanilla CSS3 with Custom Design System (Glassmorphism, CSS Variables, Keyframes)
  - Lucide React icons
  - Web Audio API (zero external audio asset latency)
  - HTML5 Canvas & Dynamic SVG
- **Backend**:
  - Node.js & Express
  - TypeScript with `tsx` watch mode
  - 0/1 Knapsack Solvers & Procedural Vault Generators
- **Testing**:
  - Custom test suites for DP solvers, Branch & Bound correctness, and path movement mechanics.

---

## 📁 Project Structure

```text
Time_heist/
├── client/                     # Frontend React application
│   ├── public/                 # Static assets & icons
│   └── src/
│       ├── assets/             # Images & visual media
│       ├── components/         # React UI components
│       │   ├── live/           # Live heist sub-panels (Player, DP, B&B, Timer)
│       │   ├── LandingPage.tsx # Money Heist landing hub & 3D mascot
│       │   ├── HeistSetup.tsx  # Mission briefing & Custom Architect
│       │   ├── LiveHeistView.tsx # Main heist orchestration view
│       │   ├── VaultCanvas.tsx # 2D blueprint & character renderer
│       │   ├── ResultsScreen.tsx # Debrief & score breakdown
│       │   ├── ReplayScrubber.tsx# Timeline scrubber playback
│       │   └── Navbar.tsx      # Top HUD & controls
│       ├── services/           # API communication
│       ├── utils/              # Audio engine & movement interpolation
│       ├── App.tsx             # Root router & screen state
│       ├── index.css           # Heist design system & animations
│       └── main.tsx            # React entrypoint
├── server/                     # Backend API & algorithm engine
│   ├── algorithms/             # DP, Branch & Bound, Greedy solvers
│   ├── routes/                 # Express API route handlers
│   ├── tests/                  # Automated solver test suites
│   └── index.ts                # Express server entrypoint
├── shared/                     # Shared TypeScript interfaces & types
└── package.json                # Project dependencies & scripts
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` (bundled with Node.js)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Akilan2407/Time_heist.git
   cd Time_heist
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running the Project

Start both the backend server and frontend development client concurrently:

```bash
npm run dev
```

- **Client App**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API**: [http://localhost:3001/](http://localhost:3001/)

---

## 🧪 Available Scripts

| Script | Command | Description |
|---|---|---|
| **Full Stack Dev** | `npm run dev` | Runs backend (`tsx watch`) and frontend (`vite`) concurrently |
| **Server Only** | `npm run server:dev` | Starts Express backend on port `3001` |
| **Client Only** | `npm run client:dev` | Starts Vite client dev server on port `5173` |
| **Build Client** | `npm run client:build` | Typechecks and builds production client bundle |
| **Run Tests** | `npm test` | Executes solver tests and movement verification |

---

## 📜 License

Distributed under the **ISC License**. Created for educational computer science exploration and game development.
