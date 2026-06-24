# Chitkara Full Stack Engineering Challenge - Hierarchy Processor

A production-quality full-stack developer utility application built with Node.js, Express, React (Vite), and Tailwind CSS. The app implements a graph-processing engine that parses node relationships (`Parent->Child`), validates formatting, filters duplicate edges, resolves multi-parent conflicts (first parent wins), executes recursion-stack-based DFS cycle detection, and generates interactive, collapsible visual trees with longest-path depth calculation.

---

## Architecture & Folder Structure

The project is split into a modular backend service and a component-driven React frontend to maximize separation of concerns and maintainability.

```text
chitkara-fullstack-challenge/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers (request handling & validation)
│   │   ├── routes/           # REST endpoints definition
│   │   ├── services/         # Graph processing & DFS algorithms
│   │   ├── middleware/       # Global error handlers
│   │   └── app.js            # Express app configuration & middleware pipeline
│   ├── server.js             # Entrypoint, starts HTTP server
│   ├── package.json          # Node dependencies and scripts
│   ├── .env                  # Configuration variables (ports, identity fields)
│   └── tests/                # Jest tests (graph algorithms and API integration)
├── frontend/
│   ├── src/
│   │   ├── components/       # Collapsible tree, Navbar, ThemeToggle, Toast
│   │   ├── App.jsx           # Main state management & API dashboard Layout
│   │   ├── main.jsx          # React app mounting
│   │   ├── index.css         # Global styles & Tailwind CSS rules
│   │   └── App.css           # Local overrides
│   ├── tailwind.config.js    # Customized developer theme settings
│   ├── postcss.config.js     # PostCSS runner configuration
│   ├── package.json          # React dependencies and scripts
│   └── index.html            # Main HTML template (imports Outfit/Inter fonts)
└── README.md                 # Complete system documentation
```

---

## Features

1. **Flexible Edge Parser**: Accepts input as raw line-separated relationships (e.g. `A->B\nB->C`) or standard JSON payload objects.
2. **Robust Validation**: Enforces single-letter uppercase edges (`A-Z->A-Z`) and filters self-loops (`A->A`). Logs invalid inputs in a dedicated dashboard section.
3. **Deduplication**: Discards duplicate edges while tracking them in the output summary.
4. **Multi-Parent Resolution**: Adheres to the "first parent wins" constraint. Discards secondary parents silently.
5. **DFS Cycle Detection**: Runs a directed depth-first search with a recursion stack on all nodes to detect cycles. If a cycle is detected, the tree representation is hidden, and `has_cycle: true` is reported.
6. **Collapsible Visual Trees**: Renders tree components in an interactive collapsible tree widget, displaying child counts and depth tags.
7. **Premium Developer Interface**: Designed with glassmorphic cards, smooth micro-animations, toast notifications, responsive grids, and an active light/dark mode switch.
8. **JSON Exporter**: Includes a code-block preview of the server response with a "Copy JSON" utility.

---

## Setup & Running Locally

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   USER_ID=yourname_ddmmyyyy
   EMAIL_ID=your_college_email
   ROLL_NUMBER=your_roll_number
   ```
4. Start the server (development mode):
   ```bash
   npm run dev
   ```
   The backend will be running at `http://localhost:5000`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will start at `http://localhost:5173`. Open this URL in your web browser.

---

## API Documentation

### 1. Health Status (`GET /`)
Returns server running status.
- **URL**: `/`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "running"
  }
  ```

### 2. Detailed Health Metrics (`GET /health`)
Used for infrastructure health probing.
- **URL**: `/health`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "status": "UP",
    "timestamp": "2026-06-24T13:00:00.000Z",
    "uptime": 12.43
  }
  ```

### 3. Graph Resolver (`POST /bfhl`)
Processes edge inputs and builds trees.
- **URL**: `/bfhl`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "data": ["A->B", "A->C", "B->D"]
  }
  ```
- **Success Response (Tree Component)**:
  Non-cyclic subgraphs omit `has_cycle` entirely.
  ```json
  {
    "is_success": true,
    "user_id": "vansh_24062026",
    "email_id": "vansh.student@chitkara.edu.in",
    "college_roll_number": "2410991234",
    "invalid_entries": [],
    "duplicate_edges": [],
    "hierarchies": [
      {
        "root": "A",
        "tree": {
          "A": {
            "B": {
              "D": {}
            },
            "C": {}
          }
        },
        "depth": 3
      }
    ],
    "summary": {
      "total_trees": 1,
      "total_cycles": 0,
      "largest_tree_root": "A"
    }
  }
  ```
- **Success Response (Cycle Component)**:
  Cyclic subgraphs set `has_cycle: true` and report empty tree/no depth.
  ```json
  {
    "is_success": true,
    "user_id": "vansh_24062026",
    "email_id": "vansh.student@chitkara.edu.in",
    "college_roll_number": "2410991234",
    "invalid_entries": [],
    "duplicate_edges": [],
    "hierarchies": [
      {
        "root": "A",
        "tree": {},
        "has_cycle": true
      }
    ],
    "summary": {
      "total_trees": 0,
      "total_cycles": 1,
      "largest_tree_root": ""
    }
  }
  ```

---

## Running Automated Tests

A comprehensive suite of test scripts has been built with Jest and Supertest to validate backend logic.

To execute tests:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run Jest:
   ```bash
   npm run test
   ```
   Tests cover: format validations, duplicate edge processing, first-parent overrides, cycle detection via DFS recursion stack, depth calculation, summary statistics, and edge cases (e.g. empty edge array).

---

## Deployment Instructions

### Backend Deployment (Render)
1. Sign in to your [Render](https://render.com) dashboard.
2. Select **New** > **Web Service**.
3. Link your GitHub repository.
4. Configure the environment:
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
5. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `USER_ID`: `yourname_ddmmyyyy`
   - `EMAIL_ID`: `your_college_email`
   - `ROLL_NUMBER`: `your_roll_number`
6. Click **Deploy Web Service**.

### Frontend Deployment (Vercel)
1. Install Vercel CLI locally or connect your repo via the [Vercel Dashboard](https://vercel.com).
2. Create a configuration file `frontend/vercel.json` to handle React client-side routing if required:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/" }]
   }
   ```
3. Set the project root configuration on Vercel:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy the project and configure `http://localhost:5000` in `App.jsx` to map to your production backend URL (e.g. `https://your-service.onrender.com/bfhl`).
