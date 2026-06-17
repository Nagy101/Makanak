import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const arPath = path.join(__dirname, 'src', 'locales', 'ar.json');
const enPath = path.join(__dirname, 'src', 'locales', 'en.json');

const arData = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

// Update Arabic
arData.home.heroTitle = "أجّر بيتك أو مصيفك من المالك مباشرة.. بأمان وبدون وسطاء";
arData.home.heroSubtitle = "اكتشف آلاف العقارات الموثقة، تواصل مع المالك، وادفع بأمان تام.";

// Update English
enData.home.heroTitle = "Rent your home or resort directly from the owner.. Safely and without brokers";
enData.home.heroSubtitle = "Discover thousands of verified properties, contact the owner, and pay securely.";

fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));

console.log("Updated copy successfully.");
