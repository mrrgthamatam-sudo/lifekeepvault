#!/usr/bin/env node
/**
 * LIFEKEEPVAULT — Build + Install on this PC
 * Usage:  node build-and-install.cjs
 */
var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');
var os = require('os');

function log(m) { console.log('\x1b[36m\x1b[1m[LifeKeepVault]\x1b[0m ' + m); }
function ok(m)  { console.log('\x1b[32m\x1b[1m[LifeKeepVault]\x1b[0m ' + m); }
function warn(m){ console.log('\x1b[33m\x1b[1m[LifeKeepVault]\x1b[0m ' + m); }
function err(m) { console.log('\x1b[31m\x1b[1m[LifeKeepVault]\x1b[0m ' + m); }

function run(cmd, label) {
  warn('  > ' + (label || cmd));
  try { childProcess.execSync(cmd, { stdio: 'inherit', cwd: __dirname }); return true; }
  catch (e) { return false; }
}
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  var entries = fs.readdirSync(src, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var s = path.join(src, entries[i].name), d = path.join(dest, entries[i].name);
    if (entries[i].isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

console.log('');
ok('==============================================================');
ok('  LIFEKEEPVAULT — Build & Install on This PC');
ok('==============================================================');
console.log('');

log('Step 1/6: Preparing package.json ...');
var pkgPath = path.join(__dirname, 'package.json');
var originalPkg = fs.readFileSync(pkgPath, 'utf8');
var pkg = JSON.parse(originalPkg);
pkg.main = 'electron/main.cjs';
pkg.name = 'lifekeepvault';
pkg.version = '2.0.0';
pkg.author = 'LifeKeepVault';
delete pkg.type;
if (!pkg.devDependencies) pkg.devDependencies = {};
['electron', 'electron-builder', '@electron/packager'].forEach(function(d) {
  if (pkg.dependencies && pkg.dependencies[d]) { pkg.devDependencies[d] = pkg.dependencies[d]; delete pkg.dependencies[d]; }
});
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
ok('  Done.'); console.log('');

log('Step 2/6: Building web app ...');
run('npm install --no-audit --no-fund', 'npm install');
var v = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
v.type = 'module';
fs.writeFileSync(pkgPath, JSON.stringify(v, null, 2));
if (!run('npx vite build', 'vite build')) { err('Vite build failed!'); fs.writeFileSync(pkgPath, originalPkg); process.exit(1); }
var p2 = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
delete p2.type; p2.main = 'electron/main.cjs';
fs.writeFileSync(pkgPath, JSON.stringify(p2, null, 2));
ok('  Web app built.'); console.log('');

log('Step 3/6: Verifying files ...');
['dist/index.html', 'electron/main.cjs', 'electron/preload.cjs'].forEach(function(f) {
  if (!fs.existsSync(path.join(__dirname, f))) { err('  MISSING: ' + f); fs.writeFileSync(pkgPath, originalPkg); process.exit(1); }
  ok('  ' + f);
});
console.log('');

log('Step 4/6: Packaging desktop app ...');
warn('  First run downloads Electron (~85 MB). Please wait ...');
console.log('');
var outDir = path.join(__dirname, 'release');
var appDir = path.join(outDir, 'LifeKeepVault-win32-x64');
if (!run([
  'npx @electron/packager . LifeKeepVault',
  '--platform=win32 --arch=x64',
  '--out=release --overwrite',
  '--app-version=2.0.0',
  '--ignore="^/src$"', '--ignore="^/public$"', '--ignore="^/release$"',
  '--ignore="\\.bat$"', '--ignore="\\.md$"',
  '--ignore="^/tsconfig"', '--ignore="^/vite\\.config"',
  '--ignore="^/build-"', '--ignore="^/index\\.html$"'
].join(' '), '@electron/packager')) { err('Packaging failed!'); fs.writeFileSync(pkgPath, originalPkg); process.exit(1); }

var exeSrc = path.join(appDir, 'LifeKeepVault.exe');
if (!fs.existsSync(exeSrc)) { err('LifeKeepVault.exe not found!'); fs.writeFileSync(pkgPath, originalPkg); process.exit(1); }
ok('  App packaged successfully.'); console.log('');

log('Step 5/6: Installing to your system ...');
var installDir = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'LifeKeepVault');
warn('  Copying to: ' + installDir);
try {
  if (fs.existsSync(installDir)) fs.rmSync(installDir, { recursive: true, force: true });
  copyDir(appDir, installDir);
  ok('  App files installed.');
} catch (e) { err('  Copy failed: ' + e.message); warn('  Manually copy: ' + appDir + '  ->  ' + installDir); }
console.log('');

log('Step 6/6: Creating shortcuts ...');
var exeInstalled = path.join(installDir, 'LifeKeepVault.exe');
var desktopDir = path.join(os.homedir(), 'Desktop');
var startMenuDir = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Microsoft', 'Windows', 'Start Menu', 'Programs');

function makeShortcut(lnkPath, targetExe, desc) {
  var psScript = [
    '$WshShell = New-Object -ComObject WScript.Shell',
    '$Shortcut = $WshShell.CreateShortcut("' + lnkPath.replace(/\\/g, '\\\\') + '")',
    '$Shortcut.TargetPath = "' + targetExe.replace(/\\/g, '\\\\') + '"',
    '$Shortcut.WorkingDirectory = "' + path.dirname(targetExe).replace(/\\/g, '\\\\') + '"',
    '$Shortcut.Description = "' + desc + '"',
    '$Shortcut.Save()'
  ].join('\r\n');
  var psFile = path.join(__dirname, '_tmp_shortcut.ps1');
  try {
    fs.writeFileSync(psFile, psScript, 'utf8');
    childProcess.execSync('powershell -ExecutionPolicy Bypass -File "' + psFile + '"', { stdio: 'pipe' });
    fs.unlinkSync(psFile); return true;
  } catch (e) { try { fs.unlinkSync(psFile); } catch(x) {} return false; }
}

var desktopLnk = path.join(desktopDir, 'LifeKeepVault.lnk');
if (makeShortcut(desktopLnk, exeInstalled, 'LifeKeepVault - Family Legacy Registry')) {
  ok('  Desktop shortcut created.');
} else {
  warn('  Desktop shortcut failed. Creating launcher ...');
  try { fs.writeFileSync(path.join(desktopDir, 'LifeKeepVault.bat'), '@echo off\r\nstart "" "' + exeInstalled + '"\r\n');
    ok('  Desktop launcher created.');
  } catch (e2) { warn('  Could not create desktop launcher.'); }
}
var startLnk = path.join(startMenuDir, 'LifeKeepVault.lnk');
if (makeShortcut(startLnk, exeInstalled, 'LifeKeepVault - Family Legacy Registry')) { ok('  Start Menu shortcut created.'); }
else { warn('  Start Menu shortcut skipped.'); }
console.log('');

fs.writeFileSync(pkgPath, originalPkg);

console.log('');
ok('==============================================================');
ok('   INSTALLATION COMPLETE!');
ok('==============================================================');
console.log('');
ok('  LifeKeepVault has been installed on your system.');
console.log('');
ok('  HOW TO LAUNCH:');
ok('    Option 1: Double-click "LifeKeepVault" on your Desktop');
ok('    Option 2: Search "LifeKeepVault" in Start Menu');
ok('    Option 3: Open ' + exeInstalled);
console.log('');
ok('  INSTALLED TO: ' + installDir);
console.log('');
ok('  All data stays on YOUR device. 100% private.');
ok('==============================================================');
console.log('');

try { childProcess.exec('start "" "' + exeInstalled + '"'); ok('  Launching LifeKeepVault ...'); }
catch (e) { ok('  Double-click the Desktop shortcut to start!'); }
console.log('');
