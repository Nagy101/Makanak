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
arData.home.marketingBadge = "إحنا هنا عشان نساعدك.. مش نستغلك! 🤝";

// Update English
enData.home.marketingBadge = "We are here to help you.. not to exploit you! 🤝";

fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));

console.log("Updated copy successfully.");
