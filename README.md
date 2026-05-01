<<<<<<< HEAD
# study-planner
=======
# 🌌 Aura OS: Sovereign Intelligence

**Aura OS** is a premium, enterprise-grade AI study intelligence platform designed for high-performance learning. It leverages local neural engines to provide deep focus sessions, AI-driven study planning, and multimodal knowledge extraction.

![Version](https://img.shields.io/badge/version-5.1.0-blueviolet)
![License](https://img.shields.io/badge/license-MIT-green)
![Tech](https://img.shields.io/badge/tech-Fullstack_Node.js-orange)

---

## 💎 Core Value Proposition

Aura OS is built for individuals and organizations that refuse to settle for average productivity. It transitions the traditional "study planner" into a sophisticated **Neural Operating System**.

### 🧠 Key Features
- **Neural Study Planner**: Generates weighted, exam-optimized schedules using local LLM inference.
- **AI Coach Engine**: Real-time cognitive feedback and performance tracking.
- **Ambient Focus Engine**: Integrated focus music and soundscapes to minimize neural fatigue.
- **Multimodal Extraction**: Turn raw PDFs, images, and notes into structured knowledge vaults and flashcards.
- **Sovereign Privacy**: 100% local AI processing via Ollama. Your data never leaves your hardware.

---

## 🏗️ Architecture

The project follows a modern, decoupled full-stack architecture:

- **Frontend (`/client`)**: A high-end, glassmorphic UI built with Vanilla JS, Three.js, and GSAP for ultra-smooth micro-interactions.
- **Backend (`/server`)**: A robust Node.js/Express server managing AI proxying, state synchronization, and persistent data storage.
- **Neural Node**: Powered by [Ollama](https://ollama.ai/), enabling private, local intelligence.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **Ollama** (Installed and running with `llama3.2:3b` model)

### 2. Installation
Clone the repository and install dependencies:
```bash
# Install root and server dependencies
npm run setup
```

### 3. Configuration
Ensure your `.env` file in the `server` directory is correctly configured:
```env
PORT=5000
OLLAMA_URL=http://localhost:11434/api/generate
```

### 4. Launch
Start the neural server:
```bash
npm run start:server
```
Then, open `client/index.html` in your preferred web browser.

---

## 🛠️ Tech Stack
- **UI/UX**: HTML5, Vanilla CSS (Glassmorphism 2.0), GSAP (Animations), Three.js (3D Graphics).
- **Backend**: Node.js, Express, Axios, fs-extra.
- **AI/ML**: Ollama (Llama 3.2), Tesseract.js (OCR), PDF.js (Multimodal).
- **Persistence**: Server-side JSON State management.

---

## 🔒 Security & Privacy
Aura OS is designed with **Privacy-First** principles. Unlike cloud-based AI planners, Aura OS processes all educational material locally on your device. No data is sent to external servers, making it ideal for sensitive research and private study material.

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with focus and precision by the Aura OS Team.**
>>>>>>> ae4a558 (Initial commit: Aura OS v5.1 Professional Release)
