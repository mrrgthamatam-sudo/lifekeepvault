#!/usr/bin/env node
/**
 * LIFEKEEPVAULT — Mobile App Builder
 * Usage:  node build-mobile.cjs
 */
var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');

function log(m) { console.log('\x1b[36m\x1b[1m[LifeKeepVault]\x1b[0m ' + m); }
function ok(m)  { console.log('\x1b[32m\x1b[1m[LifeKeepVault]\x1b[0m ' + m); }
function warn(m){ console.log('\x1b[33m\x1b[1m[LifeKeepVault]\x1b[0m ' + m); }
function err(m) { console.log('\x1b[31m\x1b[1m[LifeKeepVault]\x1b[0m ' + m); }

function run(cmd, label) {
  warn('  > ' + (label || cmd));
  try { childProcess.execSync(cmd, { stdio: 'inherit', cwd: __dirname }); return true; }
  catch (e) { return false; }
}

console.log('');
ok('================================================================');
ok('  LIFEKEEPVAULT — Mobile App Builder');
ok('================================================================');
console.log('');

// ── Step 1: Install ALL dependencies (do NOT modify package.json) ──
log('Step 1/5: Installing dependencies ...');
run('npm install', 'npm install');

// Verify @capacitor/android exists
var capAndroidPath = path.join(__dirname, 'node_modules', '@capacitor', 'android');
if (!fs.existsSync(capAndroidPath)) {
  warn('  @capacitor/android not found, installing ...');
  run('npm install @capacitor/android @capacitor/core @capacitor/cli --save', 'install capacitor');
}
if (!fs.existsSync(capAndroidPath)) {
  err('  @capacitor/android STILL not installed. Cannot continue.');
  process.exit(1);
}
ok('  All dependencies ready.');
console.log('');

// ── Step 2: Build the web app using npx (avoids package.json script issues) ──
log('Step 2/5: Building web app ...');
if (!run('npx vite build', 'vite build')) {
  err('Vite build failed!');
  process.exit(1);
}
if (!fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
  err('dist/index.html not found after build!');
  process.exit(1);
}
ok('  Web app built.');
console.log('');

// ── Step 3: Add Android platform ──
log('Step 3/5: Setting up Android ...');
var androidDir = path.join(__dirname, 'android');
if (!fs.existsSync(androidDir)) {
  ok('  Adding Android platform ...');
  if (!run('npx cap add android', 'cap add android')) {
    err('cap add android failed!');
    err('');
    err('  Run these manually:');
    err('    npm install @capacitor/android');
    err('    npx cap add android');
    process.exit(1);
  }
} else {
  ok('  Android platform exists.');
}
console.log('');

// ── Step 4: Sync web app to Android ──
log('Step 4/5: Syncing to Android ...');
if (!run('npx cap sync android', 'cap sync android')) {
  err('Sync failed!');
  process.exit(1);
}

// Patch build.gradle for APK name
var appBuildGradle = path.join(androidDir, 'app', 'build.gradle');
if (fs.existsSync(appBuildGradle)) {
  var gc = fs.readFileSync(appBuildGradle, 'utf8');
  if (!gc.includes('archivesBaseName')) {
    gc = gc.replace(/(defaultConfig\s*\{[^}]*)(})/, '$1\n        archivesBaseName = "LifeKeepVault"\n    $2');
    fs.writeFileSync(appBuildGradle, gc);
    ok('  APK will be named LifeKeepVault.');
  }
}
ok('  Synced.');
console.log('');

// ── Step 5: Build APK ──
log('Step 5/5: Building APK ...');
var gradlew = path.join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
var buildCmd = process.platform === 'win32'
  ? 'cd "' + androidDir + '" && gradlew.bat assembleDebug'
  : 'cd "' + androidDir + '" && chmod +x gradlew && ./gradlew assembleDebug';

var buildOk = run(buildCmd, 'Gradle build');

if (buildOk) {
  // Find and rename APK
  var apkDir = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug');
  var finalApk = path.join(apkDir, 'LifeKeepVault.apk');
  var possibles = ['LifeKeepVault-debug.apk', 'app-debug.apk'];
  for (var i = 0; i < possibles.length; i++) {
    var p = path.join(apkDir, possibles[i]);
    if (fs.existsSync(p)) {
      try { fs.copyFileSync(p, finalApk); } catch(e) { finalApk = p; }
      break;
    }
  }

  console.log('');
  ok('================================================================');
  ok('  APK BUILD SUCCESSFUL!');
  ok('================================================================');
  console.log('');
  if (fs.existsSync(finalApk)) {
    var sz = (fs.statSync(finalApk).size / 1048576).toFixed(1);
    ok('  FILE: ' + finalApk);
    ok('  SIZE: ' + sz + ' MB');
  }
  console.log('');
  ok('  TO INSTALL ON PHONE:');
  ok('  1. Send APK via WhatsApp/Email/USB/Drive');
  ok('  2. Tap the file on your phone');
  ok('  3. Allow "Unknown sources" if asked');
  ok('  4. Tap Install → Open LifeKeepVault!');
  console.log('');
  ok('  iPHONE: Use Safari → Share → Add to Home Screen');
  ok('================================================================');

  if (process.platform === 'win32') {
    try { childProcess.exec('explorer "' + apkDir + '"'); } catch(e) {}
  }
} else {
  console.log('');
  warn('  Gradle build failed. Opening Android Studio ...');
  warn('  In Android Studio: Build > Build APK');
  run('npx cap open android', 'open Android Studio');
}
console.log('');
