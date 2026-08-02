// Play Store icin telefon ekran goruntusu uretir (1080x1920, tam 9:16).
//
// Kullanim:
//   1) Dev sunucusunu baslat:  npm run web        (localhost:8081)
//   2) Bagimliligi kur:        npm i -D puppeteer-core
//   3) Calistir:               node scripts/capture-screenshots.js
//
// Sistemde kurulu Chrome'u headless surer; ayri bir Chromium indirmez.
// CHROME yolunu kendi kurulumunuza gore guncelleyin.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:8081';
const OUT = 'C:\\Users\\AVITA\\Zikirmatik\\store-assets\\screenshots';

// Play Store telefon ekran goruntusu: tam 9:16 -> 360x640 CSS @3x = 1080x1920
const VIEWPORT = { width: 360, height: 640, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Uygulamayi "kullanilmis" halde gostermek icin yerel ilerleme verisi.
// Yalnizca kullanicinin KENDI cihaz verisi (zikir sayaci, motif ilerlemesi)
// uretiliyor; sahte topluluk/dua icerigi uydurulmuyor.
function buildSeed() {
  const dailyLog = {};
  for (let i = 44; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    let count;
    if (i < 12) {
      count = 33 + Math.round(Math.sin(i * 1.7) * 20 + 40); // son 12 gun kesintisiz seri
    } else if (i % 4 === 0) {
      count = 0;
    } else {
      count = 20 + ((i * 37) % 70);
    }
    if (count > 0) dailyLog[dateKey(d)] = count;
  }

  const motifProgress = {
    'sukur-cicegi': 500,
    'rahmet-halkasi': 700,
    'affetme-gulu': 900,
    'safa-havuzu': 600,
    'kanaat-yaprakligi': 500,
    'letafet-cemberi': 650,
    'sabir-yildizi': 640,
    'niyet-nuru': 815,
    'muhabbet-gulu': 402,
    'zikir-dugumu': 310,
    'huzur-yildizi': 220,
  };

  return {
    state: {
      activeMotifId: 'niyet-nuru',
      motifProgress,
      selectedDhikrId: 'subhanallah',
      sessionCount: 21,
      sessionTarget: 33,
      dailyLog,
      dailyWirds: [
        { id: 'w1', dhikrId: 'subhanallah', target: 100, progress: 74 },
        { id: 'w2', dhikrId: 'estagfirullah', target: 100, progress: 41 },
        { id: 'w3', dhikrId: 'salavat', target: 100, progress: 88 },
      ],
      activeGroupId: null,
    },
    version: 0,
  };
}

const SHOTS = [
  { name: '1-zikirmatik', url: `${BASE}/zikirmatik` },
  { name: '2-bahce', url: `${BASE}/bahce` },
  { name: '3-galeri', url: `${BASE}/galeri` },
  { name: '4-gelisim', url: `${BASE}/analiz` },
  { name: '5-onboarding', url: `${BASE}/onboarding` },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    defaultViewport: VIEWPORT,
    args: ['--hide-scrollbars', '--force-device-scale-factor=3', '--force-color-profile=srgb'],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // 1) Uygulamayi bir kez actirip AsyncStorage'in web'de hangi anahtari
  //    kullandigini kesfet.
  await page.goto(`${BASE}/zikirmatik`, { waitUntil: 'domcontentloaded', timeout: 180000 });
  await new Promise((r) => setTimeout(r, 6000));
  const keys = await page.evaluate(() => Object.keys(window.localStorage));
  console.log('localStorage anahtarlari:', JSON.stringify(keys));

  const storeKey = keys.find((k) => k.includes('niyet-storage')) || 'niyet-storage';
  console.log('kullanilan anahtar:', storeKey);

  // 2) Ilerleme verisini yaz ve yeniden yukle.
  await page.evaluate(
    (k, v) => window.localStorage.setItem(k, v),
    storeKey,
    JSON.stringify(buildSeed())
  );

  for (const shot of SHOTS) {
    await page.goto(shot.url, { waitUntil: 'domcontentloaded', timeout: 180000 });
    // Metro dev sunucusu paketi derlerken ekran bos kalabiliyor; yazi
    // gorunene kadar bekle, sonra fontlar/animasyonlar otursun diye biraz daha.
    await page
      .waitForFunction(() => document.body && document.body.innerText.trim().length > 20, { timeout: 180000 })
      .catch(() => console.log('uyari: metin bekleme zaman asimi -', shot.name));
    await new Promise((r) => setTimeout(r, 6000));
    const file = path.join(OUT, `${shot.name}.png`);
    await page.screenshot({ path: file });
    console.log('yazildi:', file);
  }

  await browser.close();
  console.log('TAMAM');
})().catch((e) => {
  console.error('HATA:', e.message);
  process.exit(1);
});
