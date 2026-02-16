import axios from 'axios';

const API_URL = 'http://localhost:5000';
const TARGET_EMAIL = 'john@example.com';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const simulateNormalTraffic = async () => {
    console.log("Starting normal traffic simulation...");
    for (let i = 0; i < 5; i++) {
        try {
            await axios.get(`${API_URL}/api/patients/health`);
            console.log("Normal request sent");
        } catch (e) {
            console.log("Normal request failed:", e.response?.data || e.message);
        }
        await sleep(1000);
    }
};

const simulateBruteForce = async () => {
    console.log("\nStarting Brute Force simulation...");
    const passwords = ['123456', 'password', 'qwerty', 'admin123', 'wrongpass'];

    for (const pass of passwords) {
        try {
            await axios.post(`${API_URL}/api/auth/login`, {
                email: TARGET_EMAIL,
                password: pass
            });
            console.log(`Login attempt with ${pass} sent`);
        } catch (e) {
            console.log(`Login failed as expected: ${e.response?.status}`);
        }
        await sleep(200);
    }
};

const simulateDDoS = async () => {
    console.log("\nStarting DDoS simulation...");
    const requests = [];
    for (let i = 0; i < 150; i++) {
        requests.push(axios.get(`${API_URL}/api/patients/health`).catch(e => e));
    }

    const results = await Promise.all(requests);
    const success = results.filter(r => r.status === 200).length;
    const blocked = results.filter(r => r.response?.status === 429 || r.response?.status === 403).length;

    console.log(`DDoS Results: ${success} successful, ${blocked} blocked`);
};

const run = async () => {
    await simulateNormalTraffic();
    await simulateBruteForce();
    await simulateDDoS();
};

run();
