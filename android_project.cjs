// Android paketi (TWA) projesini üretir: node tools/android_project.cjs
// Oyun https://paintline.lol/ adresinden tam ekran açılır; ayrı oyun kodu yok. Bubblewrap çekirdeği ~/.bubblewrap/node'da.
// Çıktı: android/ (Gradle projesi). Sürüm yükseltmek için aşağıdaki VERSION_CODE'u artır, betiği yeniden çalıştır.
const path = require('path'), os = require('os'), fs = require('fs');
const core = require(path.join(os.homedir(), '.bubblewrap', 'node', 'node_modules', '@bubblewrap', 'core'));
const { TwaManifest, TwaGenerator, ConsoleLog } = core;

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'android');
const VERSION_CODE = 1, VERSION_NAME = '1.0.0';

(async () => {
  const m = await TwaManifest.fromWebManifest('https://paintline.lol/manifest.webmanifest');
  Object.assign(m, {
    packageId: 'lol.paintline.app', // Play'de kalıcı kimlik; yayından sonra değişmez
    host: 'paintline.lol',
    name: 'Paintline',
    launcherName: 'Paintline',
    startUrl: '/',
    minSdkVersion: 24, // androidbrowserhelper 2.7 en az 24 istiyor
    display: 'standalone',
    orientation: 'portrait',
    themeColor: m.themeColor, navigationColor: m.themeColor, navigationColorDark: m.themeColor,
    backgroundColor: m.backgroundColor,
    enableNotifications: false,
    fallbackType: 'customtabs',
    splashScreenFadeOutDuration: 300,
    appVersionCode: VERSION_CODE,
    appVersionName: VERSION_NAME,
    signingKey: { path: path.join(ROOT, 'android', 'paintline-upload.jks'), alias: 'paintline' },
    shortcuts: [],
    webManifestUrl: new URL('https://paintline.lol/manifest.webmanifest'),
    generatorApp: 'paintline-tools',
  });
  const err = m.validate(); if (err) throw new Error(err);
  fs.mkdirSync(OUT, { recursive: true });
  await new TwaGenerator().createTwaProject(OUT, m, new ConsoleLog('twa'));
  await m.saveToFile(path.join(OUT, 'twa-manifest.json'));
  console.log('Android projesi:', OUT, m.packageId, VERSION_NAME, '(' + VERSION_CODE + ')');
})().catch(e => { console.error(e); process.exit(1); });
