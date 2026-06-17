import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.join(__dirname, 'src', 'locales', 'en.json');
const arPath = path.join(__dirname, 'src', 'locales', 'ar.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const arData = JSON.parse(fs.readFileSync(arPath, 'utf-8'));

// Hero Quick Actions
enData.home.quickAction1 = "🔥 Chalets for Sale";
enData.home.quickAction2 = "🏢 Apartments for Rent";
enData.home.quickAction3 = "🏖️ Summer Resorts";

arData.home.quickAction1 = "🔥 شاليهات للبيع";
arData.home.quickAction2 = "🏢 شقق للإيجار";
arData.home.quickAction3 = "🏖️ مصايف";

// Navbar Tour
enData.nav.aboutUsTour = "Discover how we guarantee a 100% safe experience.. Start here!";
arData.nav.aboutUsTour = "اكتشف كيف نضمن لك تجربة آمنة 100%.. ابدأ من هنا!";

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));

console.log("Translations updated successfully!");
