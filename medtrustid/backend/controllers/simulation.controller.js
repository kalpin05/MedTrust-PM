import axios from 'axios';

const TARGET_EMAIL = 'john@example.com';
const API_URL = 'http://localhost:5000'; // Self-reference for simulation

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const startSimulation = async (req, res) => {
    const { type } = req.body;

    console.log(`[SIMULATION] Starting ${type} simulation...`);

    // Run simulation asynchronously so we don't block the response
    runSimulation(type).catch(err => console.error("Simulation error:", err));

    res.json({ message: `Simulation '${type}' started`, status: 'running' });
};

const runSimulation = async (type) => {
    if (type === 'brute_force') {
        const passwords = ['123456', 'password', 'qwerty', 'admin123', 'wrongpass', 'pass1', 'pass2', 'pass3'];
        for (const pass of passwords) {
            try {
                await axios.post(`${API_URL}/api/auth/login`, {
                    email: TARGET_EMAIL,
                    password: pass
                });
            } catch (e) {
                // Ignore expected errors
            }
            await sleep(100);
        }
    } else if (type === 'ddos') {
        const requests = [];
        for (let i = 0; i < 200; i++) {
            requests.push(axios.get(`${API_URL}/api/patients/health`).catch(e => e));
        }
        await Promise.all(requests);
    } else if (type === 'scenario') {
        console.log("Running Full Attack Scenario...");
        // Phase 1: Normal
        await axios.get(`${API_URL}/api/patients/health`).catch(e => e);
        await sleep(1000);
        await axios.get(`${API_URL}/api/patients/health`).catch(e => e);
        await sleep(2000);

        // Phase 2: Recon (404s)
        await axios.get(`${API_URL}/api/admin/hidden`).catch(e => e);
        await sleep(500);
        await axios.get(`${API_URL}/api/config.json`).catch(e => e);
        await sleep(1500);

        // Phase 3: Attack (Brute Force then DDoS)
        const passwords = ['admin', '123456', 'password'];
        for (const pass of passwords) {
            await axios.post(`${API_URL}/api/auth/login`, {
                email: TARGET_EMAIL,
                password: pass
            }).catch(e => e);
            await sleep(200);
        }

        // Short DDoS burst
        const requests = [];
        for (let i = 0; i < 50; i++) {
            requests.push(axios.get(`${API_URL}/api/patients/health`).catch(e => e));
        }
        await Promise.all(requests);
    }
};
