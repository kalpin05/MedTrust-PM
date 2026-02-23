import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ATTACKS_DIR = path.join(__dirname, '..', '..', 'Attacks');

if (!fs.existsSync(ATTACKS_DIR)) {
    fs.mkdirSync(ATTACKS_DIR, { recursive: true });
}

const attackTypes = [
    {
        name: 'Ransomware',
        filename: 'ransomware_attacks.csv',
        files: ['invoice_2024.pdf.exe', 'critical_update.msi', 'payment_overdue.zip.exe', 'system_patch.bat'],
        severities: ['Critical', 'High']
    },
    {
        name: 'Trojan',
        filename: 'trojan_attacks.csv',
        files: ['free_vpn_setup.exe', 'crack_installer.exe', 'game_mod.zip.exe', 'utility_tool.msi'],
        severities: ['High', 'Medium']
    },
    {
        name: 'Backdoor',
        filename: 'backdoor_attacks.csv',
        files: ['svchost_update.ps1', 'net_svc.dll', 'web_shell.php', 'system_listener.exe'],
        severities: ['Critical', 'High']
    },
    {
        name: 'Keylogger',
        filename: 'keylogger_attacks.csv',
        files: ['driver_helper.exe', 'input_capture.dll', 'keyboard_fix.msi', 'win_logoff.exe.backup'],
        severities: ['High', 'Medium']
    },
    {
        name: 'Spyware',
        filename: 'spyware_attacks.csv',
        files: ['browser_extension.crx', 'ad_optimizer.exe', 'search_helper.dll', 'tracking_svc.exe'],
        severities: ['Medium', 'High']
    }
];

const generateRandomIP = () => {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
};

const generateRandomHash = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const generateData = () => {
    const header = 'timestamp,source_ip,target_ip,malware_file,malware_hash,attack_type,severity,payload_size_kb,status\n';

    attackTypes.forEach(attack => {
        let content = header;
        for (let i = 0; i < 20; i++) {
            const timestamp = new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString();
            const sourceIP = generateRandomIP();
            const targetIP = `192.168.1.${Math.floor(Math.random() * 100) + 10}`;
            const file = attack.files[Math.floor(Math.random() * attack.files.length)];
            const hash = generateRandomHash();
            const severity = attack.severities[Math.floor(Math.random() * attack.severities.length)];
            const size = Math.floor(Math.random() * 5000) + 100;
            const statuses = ['Detected', 'Blocked', 'Quarantined', 'Executed'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            content += `${timestamp},${sourceIP},${targetIP},${file},${hash},${attack.name},${severity},${size},${status}\n`;
        }

        const filePath = path.join(ATTACKS_DIR, attack.filename);
        fs.writeFileSync(filePath, content);
        console.log(`Generated: ${filePath}`);
    });
};

generateData();
console.log('Successfully generated all attack CSV files.');
