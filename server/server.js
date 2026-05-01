const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeJsonSync(DATA_FILE, { users: {} });
}

// ── DATA PERSISTENCE ──
const getData = () => fs.readJsonSync(DATA_FILE);
const saveData = (data) => fs.writeJsonSync(DATA_FILE, data);

// ── AI PROXY ──
app.post('/api/ai/generate', async (req, res) => {
    const { model, prompt, system } = req.body;
    const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";

    try {
        const response = await axios.post(OLLAMA_URL, {
            model: model || "llama3.2:3b",
            prompt: `System: ${system}\n\nUser: ${prompt}`,
            stream: false
        });
        res.json(response.data);
    } catch (error) {
        console.error("AI Proxy Error:", error.message);
        res.status(500).json({ error: "Failed to communicate with Neural Engine (Ollama)" });
    }
});

// ── USER DATA ROUTES ──
app.get('/api/user/:id', (req, res) => {
    const data = getData();
    const user = data.users[req.params.id] || { sessions: [], notes: [], plans: [] };
    res.json(user);
});

app.post('/api/user/:id/sync', (req, res) => {
    const data = getData();
    data.users[req.params.id] = req.body;
    saveData(data);
    res.json({ success: true });
});

// ── SERVE CLIENT ──
app.use(express.static(path.join(__dirname, '../client')));
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '../client', 'index.html')));

app.listen(PORT, () => {
    console.log(`🚀 AURA OS Backend initialized on port ${PORT}`);
});
