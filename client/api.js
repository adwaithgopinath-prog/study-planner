const API_BASE = "http://localhost:5000/api";

const api = {
    // ── AI ENGINE ──
    async callAI(system, user, onChunk = null) {
        try {
            const response = await fetch(`${API_BASE}/ai/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ system, prompt: user })
            });

            if (!response.ok) throw new Error(`Neural Engine Error: ${response.status}`);

            const data = await response.json();
            const result = data.response;

            if (onChunk) {
                let current = '';
                const words = result.split(' ');
                for (let i = 0; i < words.length; i++) {
                    current += words[i] + ' ';
                    if (i % 5 === 0) onChunk(current);
                    await new Promise(r => setTimeout(r, 10));
                }
                onChunk(result);
            }
            return result;
        } catch (err) {
            console.error("API Call Failed:", err);
            throw err;
        }
    },

    // ── DATA SYNC ──
    async syncData(userId, state) {
        try {
            const response = await fetch(`${API_BASE}/user/${userId}/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(state)
            });
            return await response.json();
        } catch (err) {
            console.error("Sync Failed:", err);
        }
    },

    async loadData(userId) {
        try {
            const response = await fetch(`${API_BASE}/user/${userId}`);
            return await response.json();
        } catch (err) {
            console.error("Load Failed:", err);
        }
    }
};

window.AuraAPI = api;
