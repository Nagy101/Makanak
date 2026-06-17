import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const arPath = path.join(__dirname, 'src', 'locales', 'ar.json');
const enPath = path.join(__dirname, 'src', 'locales', 'en.json');

const arData = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

// Arabic
arData.home.step3Title = "3. دفع جدية الحجز";
arData.home.step3Desc = "ادفع جدية الحجز عبر الإنترنت لإظهار التفاصيل.";
arData.about.tenantStep4 = "دفع جدية الحجز";
arData.about.ownerStep4 = "انتظار تأكيد جدية الحجز";

// English
enData.home.step3Title = "3. Pay Booking Earnest Money";
enData.home.step3Desc = "Pay the booking earnest money online to reveal details.";
enData.about.tenantStep4 = "Pay Booking Earnest Money";
enData.about.ownerStep4 = "Wait for Earnest Money Confirmation";

fs.writeFileSync(arPath, JSON.stringify(arData, null, 2));
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));

console.log("Updated copy successfully.");
