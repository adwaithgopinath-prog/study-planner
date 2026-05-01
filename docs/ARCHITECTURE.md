# Aura OS Architecture

## System Overview
Aura OS is a full-stack web application designed to manage and optimize educational workflows using Artificial Intelligence.

## Data Flow
1. **User Input**: The user provides a syllabus, notes, or focus parameters via the Glassmorphic Frontend.
2. **API Bridge**: The `client/api.js` module sends structured requests to the Node.js backend.
3. **Neural Processing**: The `server/server.js` proxies the request to a local Ollama instance (`llama3.2:3b`).
4. **State Management**: 
    - **Frontend**: Local state `S` manages immediate UI reactivity.
    - **Backend**: `data.json` provides persistence across sessions.
5. **UI Rendering**: The results are rendered using GSAP for smooth transitions and KaTeX for mathematical notation.

## Component Map
- **Frontend**:
    - `index.html`: Entry & Structure.
    - `style.css`: Design System.
    - `main.js`: Interaction Logic.
    - `api.js`: Data Layer.
- **Backend**:
    - `server.js`: Express Server & AI Proxy.
    - `.env`: Environment Config.
    - `data.json`: Database Simulation.

## Scalability
The architecture is ready to be migrated to a production database (e.g., PostgreSQL/MongoDB) by simply replacing the `data.json` logic in the `server.js` controller.
