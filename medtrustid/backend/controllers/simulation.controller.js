import axios from 'axios';

const TARGET_EMAIL = 'john@example.com';
const API_URL = 'http://localhost:5000'; // Self-reference for simulation

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const startSimulation = async (req, res) => {
    const { type } = req.body;

    console.log(`[SIMULATION] Starting ${type} simulation...`);

    if (type === 'malware_csv') {
        const logs = await runCsvSimulation();
        return res.json({ message: `Simulation '${type}' finished`, status: 'completed', logs });
    }

    // Run other simulations asynchronously so we don't block the response
    runSimulation(type).catch(err => console.error("Simulation error:", err));

    res.json({ message: `Simulation '${type}' started`, status: 'running' });
};

const runCsvSimulation = async () => {
    const logs = [];
    console.log("Running Advanced Malware Simulation from CSVs...");
    logs.push("Running Advanced Malware Simulation from CSVs...");
    try {
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const ATTACKS_DIR = path.join(__dirname, '..', '..', 'Attacks');

        if (fs.existsSync(ATTACKS_DIR)) {
            const files = fs.readdirSync(ATTACKS_DIR).filter(f => f.endsWith('.csv'));
            for (const file of files) {
                const filePath = path.join(ATTACKS_DIR, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('timestamp'));

                const sampleLines = lines.sort(() => 0.5 - Math.random()).slice(0, 2);

                for (const line of sampleLines) {
                    const parts = line.split(',');
                    if (parts.length < 6) {
                        logs.push(`❌ Corrupted Data Detected in [${file}]: Line is missing required fields.`);
                        logs.push(`   -> Raw Line: "${line.substring(0, 50)}..."`);
                        continue;
                    }

                    const [timestamp, source_ip, target_ip, malware_file, malware_hash] = parts;

                    // Basic validation for IP address corruption
                    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
                    if (!ipRegex.test(source_ip) || !ipRegex.test(target_ip)) {
                        logs.push(`❌ Corrupted IP format in [${file}]: Source or Target IP is invalid.`);
                        logs.push(`   -> Found Source IP: "${source_ip}", Target IP: "${target_ip}"`);
                        continue;
                    }

                    const attackLog = `[${timestamp}] ⚠️ Alert: Simulated '${file.replace('.csv', '')}' attack from ${source_ip} (File: ${malware_file})`;
                    logs.push(attackLog);
                    console.log(attackLog);

                    await axios.get(`${API_URL}/api/patients/health`, {
                        headers: {
                            'X-Simulation-Filename': malware_file,
                            'X-Simulation-Hash': malware_hash,
                            'X-Simulation-Source-Ip': source_ip
                        }
                    }).catch(e => e); // Suppress expected 403 blocks
                    await sleep(300);

                    logs.push(`🛡️ Action: Blocked IP ${source_ip} successfully.`);
                }
            }
            logs.push("✅ CSV Malware Simulation finished successfully.");
            console.log("CSV Malware Simulation finished.");
            return logs;
        } else {
            console.error("Attacks directory not found.");
            return ["❌ Error: Attacks directory not found."];
        }
    } catch (err) {
        console.error("Error running malware_csv simulation:", err);
        return [`❌ Error running simulation: ${err.message}`];
    }
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
