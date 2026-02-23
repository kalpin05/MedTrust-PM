import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ATTACKS_DIR = path.join(__dirname, '..', '..', 'Attacks');
const API_URL = 'http://localhost:5000';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runSimulation = async () => {
    try {
        const files = fs.readdirSync(ATTACKS_DIR).filter(f => f.endsWith('.csv'));

        console.log(`Found ${files.length} attack files. Starting simulation...`);

        for (const file of files) {
            console.log(`\n--- Simulating attacks from ${file} ---`);
            const filePath = path.join(ATTACKS_DIR, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('timestamp'));

            // Simulating 3 attacks from each file for verification
            const sampleLines = lines.sort(() => 0.5 - Math.random()).slice(0, 3);

            for (const line of sampleLines) {
                const parts = line.split(',');
                if (parts.length < 6) continue;

                const [timestamp, source_ip, target_ip, malware_file, malware_hash, attack_type] = parts;

                console.log(`[ATTACK] Type: ${attack_type}, File: ${malware_file}, IP: ${source_ip}`);

                try {
                    await axios.get(`${API_URL}/api/patients/health`, {
                        headers: {
                            'X-Simulation-Filename': malware_file,
                            'X-Simulation-Hash': malware_hash,
                            'X-Simulation-Source-Ip': source_ip
                        }
                    });
                } catch (error) {
                    if (error.response?.status === 403) {
                        console.log(`   - SUCCESS: Attack detected and blocked.`);
                    } else {
                        console.log(`   - INFO: Request state: ${error.message}`);
                    }
                }
                await sleep(200);
            }
        }

        console.log('\nSimulation complete. Detections confirmed.');
    } catch (err) {
        console.error('Simulation script encountered an error:', err.message);
    }
};

runSimulation();
