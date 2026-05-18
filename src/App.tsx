import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Lock, Key, User, Users, GraduationCap, Briefcase, IndianRupee,
  TrendingDown, Car, Activity, Download, Upload, Plus, Save,
  Eye, EyeOff, Search, FileSpreadsheet,
  AlertTriangle, CheckCircle2, Calendar, Heart, Copy, Info, FolderOpen,
  Trash2, Edit3, LogOut, LayoutDashboard, ExternalLink, FileText,
  Monitor, Smartphone, HardDriveDownload, Wifi, WifiOff, CheckCircle, ArrowDown, RefreshCw,
  ChevronDown, ChevronUp, Bell, Zap
} from 'lucide-react';

import {
  PersonalDetails, FamilyDetail, EducationalDetail, ProfessionalDetail,
  SalaryDetail, ExpenseDetail, FinancialDetail, InsuranceDetail,
  InvestmentDetail, VehicleDetail, MedicalDetail, PasswordRecord,
  Attachment, DocumentRecord, ApplianceDetail
} from './types';

import {
  emptySelfData, emptySpouseData, emptyKidsData, emptyFamilyDetails,
  emptyEducationalDetails, emptyProfessionalDetails, emptySalaryDetails,
  emptyExpenseDetails, emptyFinancialDetails, emptyInsuranceDetails,
  emptyInvestmentDetails, emptyVehicleDetails, emptyMedicalDetails,
  emptyPasswords, quickPortals, emergencyProtocols
} from './initialData';

// ─── Tab definitions ───
const TAB_LIST = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'personal', label: 'Personal Details', icon: User },
  { key: 'family', label: 'Family Details', icon: Users },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'professional', label: 'Professional', icon: Briefcase },
  { key: 'salary', label: 'Salary', icon: IndianRupee },
  { key: 'expenses', label: 'Expenses', icon: TrendingDown },
  { key: 'financial', label: 'Loans & EMIs', icon: AlertTriangle },
  { key: 'insurance', label: 'Insurance', icon: CheckCircle2 },
  { key: 'investments', label: 'Investments', icon: FileSpreadsheet },
  { key: 'vehicles', label: 'Vehicles', icon: Car },
  { key: 'medical', label: 'Medical', icon: Activity },
  { key: 'appliances', label: 'Appliances', icon: Zap },
  { key: 'documents', label: 'Documents', icon: FolderOpen },
  { key: 'passwords', label: 'Password Vault', icon: Lock },
  { key: 'emergency', label: 'Emergency Protocol', icon: Heart },
  { key: 'sync', label: '🔄 Sync Data', icon: RefreshCw },
  { key: 'install', label: '⬇ Install App', icon: HardDriveDownload },
] as const;

type TabKey = typeof TAB_LIST[number]['key'];

// ─── Helpers ───
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const INR = (n: number) => '₹' + n.toLocaleString('en-IN');

// ─── Reusable field component ───
function Field({ label, value, onChange, disabled, type = 'text', placeholder }: {
  label: string; value: string | number; onChange: (v: string) => void;
  disabled?: boolean; accent?: string; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-1">{label}</label>
      <input
        type={type}
        disabled={disabled}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={e => { if (type === 'number' && (e.target.value === '0' || e.target.value === '0.0')) e.target.value = ''; }}
        placeholder={placeholder || label}
        className="w-full bg-white border border-slate-200 text-sm rounded-lg px-3 py-2.5 font-mono text-black disabled:opacity-60 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all placeholder:text-slate-400 shadow-sm"
      />
    </div>
  );
}

// ─── CRUD button bar ───
function CrudBar({ onCreate, onSave, onUpdate, onDelete }: {
  onCreate?: () => void; onSave?: () => void; onUpdate?: () => void; onDelete?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {onCreate && (
        <button onClick={onCreate} className="flex items-center gap-1 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/25 text-teal-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer">
          <Plus className="w-3 h-3" /> Create
        </button>
      )}
      {onSave && (
        <button onClick={onSave} className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer">
          <Save className="w-3 h-3" /> Save
        </button>
      )}
      {onUpdate && (
        <button onClick={onUpdate} className="flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer">
          <Edit3 className="w-3 h-3" /> Update
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete} className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      )}
    </div>
  );
}

// ─── Document Scanner with Crop + Enhance + Preview ───
// Steps: 1. Camera → 2. Crop → 3. Enhance & Confirm → Save
function DocScanner({ onCapture, onClose }: { onCapture: (att: Attachment) => void; onClose: () => void }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const [error, setError] = React.useState('');
  const [ready, setReady] = React.useState(false);
  // Steps: 'camera' | 'crop' | 'confirm'
  const [step, setStep] = React.useState<'camera' | 'crop' | 'confirm'>('camera');
  const [rawImage, setRawImage] = React.useState<string>('');
  const [finalImage, setFinalImage] = React.useState<string>('');
  // Crop box (percentage-based: 0-100)
  const [crop, setCrop] = React.useState({ x: 5, y: 5, w: 90, h: 90 });
  const [dragging, setDragging] = React.useState<string | null>(null);
  const dragStart = React.useRef({ mx: 0, my: 0, cx: 0, cy: 0, cw: 0, ch: 0 });
  // Enhance controls
  const [brightness, setBrightness] = React.useState(105);
  const [contrast, setContrast] = React.useState(120);
  const [sharpness, setSharpness] = React.useState(true);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false,
        });
        streamRef.current = s;
        if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); setReady(true); }
      } catch (err: any) { setError(err.message || 'Camera access denied.'); }
    })();
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); document.body.style.overflow = ''; };
  }, []);

  const stopCamera = () => { if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; } };

  // Auto-detect document edges using Sobel edge detection
  const runAutoCrop = (imgSrc: string) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      // Use smaller size for faster processing
      const scale = Math.min(1, 400 / Math.max(img.width, img.height));
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, c.width, c.height);

      const w = c.width, h = c.height;
      const data = ctx.getImageData(0, 0, w, h).data;

      // Convert to grayscale
      const gray = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) {
        gray[i] = data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114;
      }

      // Sobel edge detection — find strong edges
      const edges = new Float32Array(w * h);
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const gx =
            -gray[(y-1)*w+(x-1)] + gray[(y-1)*w+(x+1)]
            -2*gray[y*w+(x-1)] + 2*gray[y*w+(x+1)]
            -gray[(y+1)*w+(x-1)] + gray[(y+1)*w+(x+1)];
          const gy =
            -gray[(y-1)*w+(x-1)] - 2*gray[(y-1)*w+x] - gray[(y-1)*w+(x+1)]
            +gray[(y+1)*w+(x-1)] + 2*gray[(y+1)*w+x] + gray[(y+1)*w+(x+1)];
          edges[y * w + x] = Math.sqrt(gx * gx + gy * gy);
        }
      }

      // Find edge threshold (top 15% of edge values)
      const sorted = Array.from(edges).sort((a, b) => b - a);
      const edgeThreshold = sorted[Math.floor(sorted.length * 0.15)] || 30;

      // Project edges onto rows and columns
      const rowScore = new Float32Array(h);
      const colScore = new Float32Array(w);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (edges[y * w + x] > edgeThreshold) {
            rowScore[y]++;
            colScore[x]++;
          }
        }
      }

      // Find bounding box: first/last rows/cols with significant edges
      const rowThresh = w * 0.05;
      const colThresh = h * 0.05;

      let top = 0, bottom = h - 1, left = 0, right = w - 1;
      for (let y = 0; y < h; y++) { if (rowScore[y] > rowThresh) { top = y; break; } }
      for (let y = h - 1; y >= 0; y--) { if (rowScore[y] > rowThresh) { bottom = y; break; } }
      for (let x = 0; x < w; x++) { if (colScore[x] > colThresh) { left = x; break; } }
      for (let x = w - 1; x >= 0; x--) { if (colScore[x] > colThresh) { right = x; break; } }

      // Add padding
      const padX = Math.round(w * 0.01);
      const padY = Math.round(h * 0.01);
      top = Math.max(0, top - padY);
      bottom = Math.min(h - 1, bottom + padY);
      left = Math.max(0, left - padX);
      right = Math.min(w - 1, right + padX);

      // Convert to percentages
      const cx = (left / w) * 100;
      const cy = (top / h) * 100;
      const cw = ((right - left) / w) * 100;
      const ch = ((bottom - top) / h) * 100;

      // Only apply if the detected region is reasonable
      if (cw > 15 && ch > 15 && (cw < 95 || ch < 95)) {
        setCrop({ x: cx, y: cy, w: cw, h: ch });
      } else {
        setCrop({ x: 2, y: 2, w: 96, h: 96 });
      }
    };
    img.src = imgSrc;
  };

  // Step 1 → 2: Capture raw image from camera
  const captureRaw = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', 0.95);
    setRawImage(dataUrl);
    stopCamera();
    setStep('crop');
    // Run auto-crop detection on the captured image
    runAutoCrop(dataUrl);
  };

  // Step 2 → 3: Apply crop + enhance
  const applyCropAndEnhance = () => {
    const img = imgRef.current, c = cropCanvasRef.current;
    if (!img || !c) return;
    const natW = img.naturalWidth, natH = img.naturalHeight;
    const sx = Math.round(natW * crop.x / 100), sy = Math.round(natH * crop.y / 100);
    const sw = Math.round(natW * crop.w / 100), sh = Math.round(natH * crop.h / 100);
    c.width = sw; c.height = sh;
    const ctx = c.getContext('2d'); if (!ctx) return;
    // Apply brightness/contrast via CSS filter on canvas
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    // Optional sharpening (unsharp mask approximation)
    if (sharpness) {
      ctx.filter = 'none';
      const imgData = ctx.getImageData(0, 0, sw, sh);
      const d = imgData.data;
      // Simple contrast-based sharpening
      for (let i = 0; i < d.length; i += 4) {
        d[i] = Math.min(255, Math.max(0, d[i] + (d[i] - 128) * 0.15));
        d[i+1] = Math.min(255, Math.max(0, d[i+1] + (d[i+1] - 128) * 0.15));
        d[i+2] = Math.min(255, Math.max(0, d[i+2] + (d[i+2] - 128) * 0.15));
      }
      ctx.putImageData(imgData, 0, 0);
    }
    setFinalImage(c.toDataURL('image/jpeg', 0.92));
    setStep('confirm');
  };

  // Step 3: Save final
  const saveFinal = () => {
    const data = finalImage;
    const name = `Scan_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.jpg`;
    const sizeKB = Math.round((data.length * 3) / 4 / 1024);
    onCapture({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name,
      size: sizeKB > 1024 ? (sizeKB / 1024).toFixed(1) + ' MB' : sizeKB + ' KB',
      fileType: 'image/jpeg', fileData: data, uploadDate: new Date().toISOString().split('T')[0] });
    onClose();
  };

  // Crop drag handlers
  const handleCropMouseDown = (e: React.MouseEvent | React.TouchEvent, handle: string) => {
    e.preventDefault(); e.stopPropagation();
    const pt = 'touches' in e ? e.touches[0] : e;
    dragStart.current = { mx: pt.clientX, my: pt.clientY, cx: crop.x, cy: crop.y, cw: crop.w, ch: crop.h };
    setDragging(handle);
  };

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const pt = 'touches' in e ? e.touches[0] : e;
      const container = document.getElementById('crop-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dx = ((pt.clientX - dragStart.current.mx) / rect.width) * 100;
      const dy = ((pt.clientY - dragStart.current.my) / rect.height) * 100;
      const s = dragStart.current;
      setCrop(prev => {
        let { x, y, w, h } = prev;
        if (dragging === 'move') { x = Math.max(0, Math.min(100 - s.cw, s.cx + dx)); y = Math.max(0, Math.min(100 - s.ch, s.cy + dy)); w = s.cw; h = s.ch; }
        else if (dragging === 'tl') { x = Math.max(0, Math.min(s.cx + s.cw - 10, s.cx + dx)); y = Math.max(0, Math.min(s.cy + s.ch - 10, s.cy + dy)); w = s.cw - (x - s.cx); h = s.ch - (y - s.cy); }
        else if (dragging === 'tr') { y = Math.max(0, Math.min(s.cy + s.ch - 10, s.cy + dy)); w = Math.max(10, Math.min(100 - s.cx, s.cw + dx)); h = s.ch - (y - s.cy); }
        else if (dragging === 'bl') { x = Math.max(0, Math.min(s.cx + s.cw - 10, s.cx + dx)); w = s.cw - (x - s.cx); h = Math.max(10, Math.min(100 - s.cy, s.ch + dy)); }
        else if (dragging === 'br') { w = Math.max(10, Math.min(100 - s.cx, s.cw + dx)); h = Math.max(10, Math.min(100 - s.cy, s.ch + dy)); }
        return { x, y, w, h };
      });
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove); window.addEventListener('touchend', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
  }, [dragging]);

  const handleStyle: React.CSSProperties = { width: 20, height: 20, background: '#14b8a6', borderRadius: '50%', position: 'absolute', border: '2px solid #fff', cursor: 'grab', touchAction: 'none', zIndex: 10 };

  const S: Record<string, React.CSSProperties> = {
    wrap: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: '#000', display: 'flex', flexDirection: 'column' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#111', borderBottom: '1px solid #222' },
    title: { color: '#fff', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '13px' },
    closeBtn: { color: '#fff', background: '#333', border: '1px solid #555', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px', overflow: 'auto' },
    bottomBar: { padding: '12px 16px', display: 'flex', justifyContent: 'center', gap: '10px', background: '#111', flexWrap: 'wrap' as const, borderTop: '1px solid #222' },
    tip: { textAlign: 'center' as const, padding: '4px 16px 10px', background: '#111', fontSize: '10px', fontFamily: 'monospace', color: '#4b5563' },
    captureBtn: { background: '#fff', color: '#000', border: 'none', borderRadius: '999px', padding: '14px 40px', fontSize: '14px', fontFamily: 'monospace', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 30px rgba(255,255,255,0.15)' },
    secondaryBtn: { background: '#374151', color: '#fff', border: '1px solid #4b5563', borderRadius: '10px', padding: '10px 20px', fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer', fontWeight: 'bold' },
    primaryBtn: { background: '#14b8a6', color: '#000', border: 'none', borderRadius: '10px', padding: '10px 28px', fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 20px rgba(20,184,166,0.3)' },
    dangerBtn: { background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b', borderRadius: '10px', padding: '10px 20px', fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer', fontWeight: 'bold' },
  };

  return ReactDOM.createPortal(
    <div style={S.wrap}>
      <div style={S.topBar}>
        <span style={S.title}>
          {step === 'camera' ? '📷 Step 1: Capture' : step === 'crop' ? '✂️ Step 2: Crop & Enhance' : '✅ Step 3: Confirm & Save'}
        </span>
        <button onClick={() => { stopCamera(); onClose(); }} style={S.closeBtn}>✕ Close</button>
      </div>

      <div style={S.main}>
        {/* STEP 1: CAMERA */}
        {step === 'camera' && (
          error ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '15px' }}>⚠️ {error}</p>
              <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '11px', marginTop: '10px' }}>Allow camera permission and try again.</p>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '640px', position: 'relative' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: '12px', display: ready ? 'block' : 'none' }} />
              {!ready && <p style={{ color: '#14b8a6', fontFamily: 'monospace', textAlign: 'center', padding: '60px' }}>Starting camera...</p>}
              {ready && <>
                <div style={{ position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, border: '2px dashed rgba(45,212,191,0.5)', borderRadius: 12, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center' }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(45,212,191,0.8)', background: 'rgba(0,0,0,0.7)', padding: '3px 10px', borderRadius: 6 }}>Position document within the frame</span>
                </div>
              </>}
            </div>
          )
        )}

        {/* STEP 2: CROP */}
        {step === 'crop' && rawImage && (
          <div style={{ width: '100%', maxWidth: '640px' }}>
            <div id="crop-container" style={{ position: 'relative', width: '100%', userSelect: 'none', touchAction: 'none' }}>
              <img ref={imgRef} src={rawImage} alt="Crop" style={{ width: '100%', borderRadius: 8, display: 'block' }} draggable={false} />
              {/* Dark overlay outside crop */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                  <defs><mask id="cropmask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect x={crop.x + '%'} y={crop.y + '%'} width={crop.w + '%'} height={crop.h + '%'} fill="black" />
                  </mask></defs>
                  <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#cropmask)" />
                </svg>
              </div>
              {/* Crop border */}
              <div style={{ position: 'absolute', left: crop.x + '%', top: crop.y + '%', width: crop.w + '%', height: crop.h + '%', border: '2px solid #14b8a6', boxSizing: 'border-box', cursor: 'move', touchAction: 'none' }}
                onMouseDown={e => handleCropMouseDown(e, 'move')} onTouchStart={e => handleCropMouseDown(e, 'move')} />
              {/* Corner handles */}
              <div style={{ ...handleStyle, left: `calc(${crop.x}% - 10px)`, top: `calc(${crop.y}% - 10px)` }}
                onMouseDown={e => handleCropMouseDown(e, 'tl')} onTouchStart={e => handleCropMouseDown(e, 'tl')} />
              <div style={{ ...handleStyle, left: `calc(${crop.x + crop.w}% - 10px)`, top: `calc(${crop.y}% - 10px)` }}
                onMouseDown={e => handleCropMouseDown(e, 'tr')} onTouchStart={e => handleCropMouseDown(e, 'tr')} />
              <div style={{ ...handleStyle, left: `calc(${crop.x}% - 10px)`, top: `calc(${crop.y + crop.h}% - 10px)` }}
                onMouseDown={e => handleCropMouseDown(e, 'bl')} onTouchStart={e => handleCropMouseDown(e, 'bl')} />
              <div style={{ ...handleStyle, left: `calc(${crop.x + crop.w}% - 10px)`, top: `calc(${crop.y + crop.h}% - 10px)` }}
                onMouseDown={e => handleCropMouseDown(e, 'br')} onTouchStart={e => handleCropMouseDown(e, 'br')} />
            </div>
            {/* Enhance controls */}
            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
              <label style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                ☀️ Brightness
                <input type="range" min="80" max="140" value={brightness} onChange={e => setBrightness(Number(e.target.value))} style={{ width: 80, accentColor: '#14b8a6' }} />
                <span style={{ color: '#14b8a6', width: 30 }}>{brightness}%</span>
              </label>
              <label style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                🎨 Contrast
                <input type="range" min="80" max="160" value={contrast} onChange={e => setContrast(Number(e.target.value))} style={{ width: 80, accentColor: '#14b8a6' }} />
                <span style={{ color: '#14b8a6', width: 30 }}>{contrast}%</span>
              </label>
              <label style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={sharpness} onChange={e => setSharpness(e.target.checked)} style={{ accentColor: '#14b8a6' }} />
                🔍 Sharpen
              </label>
            </div>
          </div>
        )}

        {/* STEP 3: FINAL CONFIRMATION */}
        {step === 'confirm' && finalImage && (
          <div style={{ width: '100%', maxWidth: '640px', textAlign: 'center' }}>
            <p style={{ color: '#14b8a6', fontFamily: 'monospace', fontSize: 13, marginBottom: 10, fontWeight: 'bold' }}>📋 Final Preview — Does this look good?</p>
            <img src={finalImage} alt="Final" style={{ width: '100%', borderRadius: 10, border: '3px solid #14b8a6', boxShadow: '0 4px 30px rgba(20,184,166,0.15)' }} />
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={S.bottomBar}>
        {step === 'camera' && ready && (
          <button onClick={captureRaw} style={S.captureBtn}>📸 Capture Document</button>
        )}
        {step === 'crop' && <>
          <button onClick={() => { setStep('camera'); setRawImage(''); setCrop({ x: 5, y: 5, w: 90, h: 90 }); }} style={S.secondaryBtn}>🔄 Recapture</button>
          <button onClick={applyCropAndEnhance} style={S.primaryBtn}>✂️ Crop & Enhance →</button>
        </>}
        {step === 'confirm' && <>
          <button onClick={() => { setStep('crop'); setFinalImage(''); }} style={S.secondaryBtn}>← Back to Crop</button>
          <button onClick={() => { setRawImage(''); setFinalImage(''); setCrop({ x: 5, y: 5, w: 90, h: 90 }); setStep('camera'); }} style={S.dangerBtn}>❌ Reject & Retake</button>
          <button onClick={saveFinal} style={S.primaryBtn}>✅ Looks Good — Save</button>
        </>}
      </div>

      <div style={S.tip}>
        {step === 'camera' && '💡 Good lighting • Hold steady • Keep flat • Rear camera recommended'}
        {step === 'crop' && '💡 Drag corners to crop • Adjust brightness/contrast for clarity'}
        {step === 'confirm' && '💡 If the scan is clear and readable, click "Looks Good — Save" to attach it'}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <canvas ref={cropCanvasRef} style={{ display: 'none' }} />
    </div>,
    document.body
  );
}

// ─── Attachment bar with REAL file upload/download + Camera Scanner ───
function AttachmentBar({ attachments, onFilesAdded, onRemove }: {
  attachments: Attachment[];
  onFilesAdded: (files: Attachment[]) => void;
  onRemove?: (id: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [showScanner, setShowScanner] = React.useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const results: Attachment[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const data = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      results.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + i,
        name: file.name,
        size: file.size < 1024 ? file.size + ' B' : file.size < 1048576 ? (file.size / 1024).toFixed(1) + ' KB' : (file.size / 1048576).toFixed(1) + ' MB',
        fileType: file.type || 'application/octet-stream',
        fileData: data,
        uploadDate: new Date().toISOString().split('T')[0],
      });
    }
    onFilesAdded(results);
    e.target.value = '';
  };

  const downloadFile = (att: Attachment) => {
    const link = document.createElement('a');
    link.href = att.fileData;
    link.download = att.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-900 text-xs mt-2 space-y-1.5">
      {showScanner && <DocScanner onCapture={(att) => onFilesAdded([att])} onClose={() => setShowScanner(false)} />}
      <input type="file" ref={inputRef} className="hidden" multiple accept="*/*" onChange={handleFiles} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-zinc-500 text-[11px] flex items-center gap-1">
          📂 Files ({attachments.length}):
        </span>
        <button onClick={() => inputRef.current?.click()}
          className="text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors">
          <Upload className="w-3 h-3" /> Upload
        </button>
        <button onClick={() => setShowScanner(true)}
          className="text-teal-400 hover:text-teal-300 bg-teal-900/20 hover:bg-teal-900/40 border border-teal-700/30 px-2.5 py-1 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors">
          📷 Scan
        </button>
      </div>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {attachments.map(att => {
            const ext = att.name.split('.').pop()?.toLowerCase() || '';
            const isImg = ['jpg','jpeg','png','gif','webp','svg','bmp'].includes(ext);
            return (
              <div key={att.id} className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg text-[11px] font-mono text-zinc-300 group max-w-[220px]">
                <span className="text-zinc-500 flex-shrink-0">{isImg ? '🖼️' : '📄'}</span>
                <span className="truncate" title={att.name}>{att.name}</span>
                <span className="text-[9px] text-zinc-600 flex-shrink-0">({att.size})</span>
                <button onClick={() => downloadFile(att)} className="text-amber-400 hover:text-amber-300 flex-shrink-0 cursor-pointer" title="Download file">
                  <Download className="w-3 h-3" />
                </button>
                {onRemove && (
                  <button onClick={() => onRemove(att.id)} className="text-zinc-600 hover:text-red-400 flex-shrink-0 cursor-pointer" title="Remove file">
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ──────────────────────────────────────────────────────────────────────────────
export default function App() {
  // ─── Multi-User Auth ───
  // Users stored as: ev_users = [{ username, password, displayName }]
  // Each user's data stored as: ev_data_<username> = { ...allModuleData }
  const [isAuth, setIsAuth] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loginDisplayName, setLoginDisplayName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const [activeUser, setActiveUser] = useState<{ username: string; displayName: string; email: string; phone: string; profilePic: string }>({ username: '', displayName: '', email: '', phone: '', profilePic: '' });
  const profilePicRef = useRef<HTMLInputElement>(null);

  // Load all registered users from localStorage
  const getUsers = (): Array<{ username: string; password: string; displayName: string; email?: string; phone?: string }> => {
    try { const s = localStorage.getItem('ev_users'); return s ? JSON.parse(s) : []; } catch { return []; }
  };
  const [users, setUsers] = useState(getUsers);
  const hasAnyUsers = users.length > 0;

  // ─── Perspective ───
  const [perspective, setPerspective] = useState<'him' | 'her'>('him');

  // ─── Year / Month ───
  const currentYear = 2026;
  const years = useMemo(() => Array.from({ length: 101 }, (_, i) => (currentYear + i).toString()), []);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [selYear, setSelYear] = useState('2026');
  const [selMonth, setSelMonth] = useState('January');

  // ─── Active tab ───
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  // ─── PWA Install Prompt ───
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Capture the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Detect if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      notify('🎉 LifeKeepVault installed successfully on your device!', 'ok');
    });

    // Online/Offline detection
    const onOnline = () => { setIsOnline(true); notify('You are back online.', 'info'); };
    const offOffline = () => { setIsOnline(false); notify('You are offline. App still works!', 'info'); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', offOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', offOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        notify('Installing LifeKeepVault...', 'ok');
      }
      setDeferredPrompt(null);
    }
  };

  // ─── Toast ───
  const [toast, setToast] = useState<{ text: string; type: 'ok' | 'info' | 'err' } | null>(null);
  const notify = (text: string, type: 'ok' | 'info' | 'err' = 'ok') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Data states (all empty by default) ───
  const [selfData, setSelfData] = useState<PersonalDetails>({ ...emptySelfData });
  const [spouseData, setSpouseData] = useState<PersonalDetails>({ ...emptySpouseData });
  const [kidsData, setKidsData] = useState<PersonalDetails[]>([...emptyKidsData]);
  const [familyDetails, setFamilyDetails] = useState<FamilyDetail[]>([...emptyFamilyDetails]);
  const [eduDetails, setEduDetails] = useState<EducationalDetail[]>([...emptyEducationalDetails]);
  const [profDetails, setProfDetails] = useState<ProfessionalDetail[]>([...emptyProfessionalDetails]);
  const [salaryDetails, setSalaryDetails] = useState<SalaryDetail[]>([...emptySalaryDetails]);
  const [expenseDetails, setExpenseDetails] = useState<ExpenseDetail[]>([...emptyExpenseDetails]);
  const [finDetails, setFinDetails] = useState<FinancialDetail[]>([...emptyFinancialDetails]);
  const [insDetails, setInsDetails] = useState<InsuranceDetail[]>([...emptyInsuranceDetails]);
  const [invDetails, setInvDetails] = useState<InvestmentDetail[]>([...emptyInvestmentDetails]);
  const [vehDetails, setVehDetails] = useState<VehicleDetail[]>([...emptyVehicleDetails]);
  const [medDetails, setMedDetails] = useState<MedicalDetail[]>([...emptyMedicalDetails]);
  const [passwords, setPasswords] = useState<PasswordRecord[]>([...emptyPasswords]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [appliances, setAppliances] = useState<ApplianceDetail[]>([]);

  // ─── Editing flags ───
  const [editSelf, setEditSelf] = useState(false);
  const [editSpouse, setEditSpouse] = useState(false);
  const [searchPwd, setSearchPwd] = useState('');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [searchDoc, setSearchDoc] = useState('');

  // Dashboard collapsible sections
  const [dashOpen, setDashOpen] = useState<Record<string, boolean>>({ finance: true, modules: true, portals: false, emergency: false });
  const toggleDash = (k: string) => setDashOpen(p => ({ ...p, [k]: !p[k] }));

  // Collapsible records within modules
  const [openRecords, setOpenRecords] = useState<Record<string, boolean>>({});
  const isRecordOpen = (id: string) => openRecords[id] !== false; // default open for new
  const toggleRecord = (id: string) => setOpenRecords(p => ({ ...p, [id]: !(p[id] !== false) }));

  // Tab container ref for scroll
  const tabScrollRef = useRef<HTMLDivElement>(null);

  // ─── Document Manager refs ───
  const fileImportRef = useRef<HTMLInputElement>(null);
  const bulkImportRef = useRef<HTMLInputElement>(null);
  const docReplaceRef = useRef<HTMLInputElement>(null);
  const docReplaceId = useRef<string>('');

  // ─── Sync refs ───
  const syncImportRef = useRef<HTMLInputElement>(null);

  // Handle sync file import (single-user or all-users)
  const handleSyncImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);

      if ((payload.type === 'EternalVault-UserSync' || payload.type === 'LifeKeepVault-UserSync') && payload.user && payload.data) {
        // Single user import
        const existingUsers = getUsers();
        const idx = existingUsers.findIndex(u => u.username === payload.user.username);
        if (idx >= 0) {
          existingUsers[idx] = payload.user; // update existing
        } else {
          existingUsers.push(payload.user); // add new
        }
        localStorage.setItem('ev_users', JSON.stringify(existingUsers));
        localStorage.setItem('ev_data_' + payload.user.username, JSON.stringify(payload.data));
        setUsers(existingUsers);
        // If this is the currently logged-in user, reload their data
        if (payload.user.username === activeUser.username) {
          loadUserData(payload.user.username);
        }
        notify(`Imported vault for "${payload.user.displayName}". They can now sign in on this device.`, 'ok');
      } else if ((payload.type === 'EternalVault-FullSync' || payload.type === 'LifeKeepVault-FullSync') && payload.users && payload.userData) {
        // All users import
        const existingUsers = getUsers();
        payload.users.forEach((u: any) => {
          const idx = existingUsers.findIndex(eu => eu.username === u.username);
          if (idx >= 0) existingUsers[idx] = u;
          else existingUsers.push(u);
        });
        localStorage.setItem('ev_users', JSON.stringify(existingUsers));
        Object.keys(payload.userData).forEach(uname => {
          localStorage.setItem('ev_data_' + uname, JSON.stringify(payload.userData[uname]));
        });
        setUsers(existingUsers);
        // Reload current user data if it was included
        if (payload.userData[activeUser.username]) {
          loadUserData(activeUser.username);
        }
        notify(`Imported ${payload.users.length} user(s) with all data. Everyone can now sign in.`, 'ok');
      } else {
        notify('Unrecognized file format. Use a file exported from LifeKeepVault Sync.', 'err');
      }
    } catch {
      notify('Failed to read sync file. Make sure it\'s a valid .json export.', 'err');
    }
    e.target.value = '';
  };

  // Read a File object into base64 data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // ── Import file(s) from device → creates new document records ──
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newDocs: DocumentRecord[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const dataUrl = await readFileAsDataURL(file);
        newDocs.push({
          id: uid(),
          documentName: file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
          category: guessCategory(file.name),
          belongsTo: '',
          notes: '',
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          fileType: file.type || 'application/octet-stream',
          fileData: dataUrl,
          uploadDate: new Date().toISOString().split('T')[0],
        });
      } catch {
        notify(`Failed to read "${file.name}".`, 'err');
      }
    }
    setDocuments(prev => [...prev, ...newDocs]);
    notify(`${newDocs.length} file(s) imported successfully.`, 'ok');
    e.target.value = ''; // reset input
  };

  // ── Import file into an existing document record (replace/attach) ──
  const handleDocReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !docReplaceId.current) return;
    try {
      const dataUrl = await readFileAsDataURL(file);
      setDocuments(prev => prev.map(d => {
        if (d.id === docReplaceId.current) {
          return {
            ...d,
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            fileType: file.type || 'application/octet-stream',
            fileData: dataUrl,
            documentName: d.documentName || file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
            uploadDate: new Date().toISOString().split('T')[0],
          };
        }
        return d;
      }));
      notify(`"${file.name}" imported into document.`, 'ok');
    } catch {
      notify(`Failed to read "${file.name}".`, 'err');
    }
    docReplaceId.current = '';
    e.target.value = '';
  };

  // ── Export single document → download actual file to device ──
  const handleExportSingleDoc = (doc: DocumentRecord) => {
    if (!doc.fileData) {
      notify('No file attached to export.', 'err');
      return;
    }
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName || (doc.documentName + '.bin');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify(`Exported: ${doc.fileName}`, 'ok');
  };

  // ── Export ALL documents as .json archive (with file data) ──
  const handleExportAll = () => {
    if (documents.length === 0) {
      notify('No documents to export.', 'err');
      return;
    }
    const archive = {
      type: 'LifeKeepVault-DocumentArchive',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      count: documents.length,
      documents: documents,
    };
    const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `LifeKeepVault-Documents-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    notify(`Exported ${documents.length} document(s) as archive.`, 'ok');
  };

  // ── Import/Restore from .json archive ──
  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const archive = JSON.parse(text);
      if ((archive.type === 'EternalVault-DocumentArchive' || archive.type === 'LifeKeepVault-DocumentArchive') && Array.isArray(archive.documents)) {
        const imported = archive.documents.map((d: any) => ({
          ...d,
          id: uid(), // new IDs to avoid conflicts
        }));
        setDocuments(prev => [...prev, ...imported]);
        notify(`Restored ${imported.length} document(s) from backup.`, 'ok');
      } else {
        notify('Invalid archive file. Use a file exported from LifeKeepVault.', 'err');
      }
    } catch {
      notify('Failed to read archive file.', 'err');
    }
    e.target.value = '';
  };

  // Auto-guess category from file name
  const guessCategory = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('aadhaar') || n.includes('pan') || n.includes('passport') || n.includes('voter')) return 'Personal';
    if (n.includes('insurance') || n.includes('policy')) return 'Insurance';
    if (n.includes('salary') || n.includes('bank') || n.includes('loan') || n.includes('tax')) return 'Financial';
    if (n.includes('degree') || n.includes('certificate') || n.includes('mark') || n.includes('school')) return 'Education';
    if (n.includes('medical') || n.includes('prescription') || n.includes('report') || n.includes('blood')) return 'Medical';
    if (n.includes('rc') || n.includes('vehicle') || n.includes('car') || n.includes('bike')) return 'Vehicle';
    if (n.includes('legal') || n.includes('agreement') || n.includes('will') || n.includes('deed')) return 'Legal';
    return 'Other';
  };

  // ─── Persist user data to localStorage (per-user key) ───
  useEffect(() => {
    if (!activeUser.username) return; // don't save unless logged in
    try {
      const payload = JSON.stringify({
        selfData, spouseData, kidsData, familyDetails, eduDetails, profDetails,
        salaryDetails, expenseDetails, finDetails, insDetails, invDetails,
        vehDetails, medDetails, passwords, documents, appliances, perspective, selYear, selMonth,
        profilePic: activeUser.profilePic
      });
      localStorage.setItem('ev_data_' + activeUser.username, payload);
    } catch { /* ignore */ }
  }, [selfData, spouseData, kidsData, familyDetails, eduDetails, profDetails,
    salaryDetails, expenseDetails, finDetails, insDetails, invDetails,
    vehDetails, medDetails, passwords, documents, appliances, perspective, selYear, selMonth, activeUser.username, activeUser.profilePic]);

  // ─── Load user data after login ───
  const loadUserData = (username: string) => {
    try {
      const raw = localStorage.getItem('ev_data_' + username);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.selfData) setSelfData(d.selfData);
        if (d.spouseData) setSpouseData(d.spouseData);
        if (d.kidsData) setKidsData(d.kidsData);
        if (d.familyDetails) setFamilyDetails(d.familyDetails);
        if (d.eduDetails) setEduDetails(d.eduDetails);
        if (d.profDetails) setProfDetails(d.profDetails);
        if (d.salaryDetails) setSalaryDetails(d.salaryDetails);
        if (d.expenseDetails) setExpenseDetails(d.expenseDetails);
        if (d.finDetails) setFinDetails(d.finDetails);
        if (d.insDetails) setInsDetails(d.insDetails);
        if (d.invDetails) setInvDetails(d.invDetails);
        if (d.vehDetails) setVehDetails(d.vehDetails);
        if (d.medDetails) setMedDetails(d.medDetails);
        if (d.passwords) setPasswords(d.passwords);
        if (d.documents) setDocuments(d.documents);
        if (d.appliances) setAppliances(d.appliances);
        if (d.profilePic) setActiveUser(prev => ({ ...prev, profilePic: d.profilePic }));
        if (d.perspective) setPerspective(d.perspective);
        if (d.selYear) setSelYear(d.selYear);
        if (d.selMonth) setSelMonth(d.selMonth);
      }
    } catch { /* ignore */ }
  };

  // ─── Reset all module data to empty (for new user with no saved data) ───
  const resetModuleData = () => {
    setSelfData({ ...emptySelfData });
    setSpouseData({ ...emptySpouseData });
    setKidsData([]);
    setFamilyDetails([]);
    setEduDetails([]);
    setProfDetails([]);
    setSalaryDetails([]);
    setExpenseDetails([]);
    setFinDetails([]);
    setInsDetails([]);
    setInvDetails([]);
    setVehDetails([]);
    setMedDetails([]);
    setPasswords([]);
    setDocuments([]);
    setAppliances([]);
    setPerspective('him');
  };

  // ─── Login handler (multi-user) ───
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = loginUser.trim().toLowerCase();
    const pass = loginPass.trim();

    if (loginMode === 'signup') {
      // SIGN UP
      if (!loginDisplayName.trim() || !uname || !pass) {
        setLoginErr('Please fill your full name, username, and password.');
        return;
      }
      if (pass.length < 4) {
        setLoginErr('Password must be at least 4 characters.');
        return;
      }
      const existing = getUsers();
      if (existing.find(u => u.username === uname)) {
        setLoginErr('Username "' + uname + '" is already taken. Choose another or sign in.');
        return;
      }
      const newUser = { username: uname, password: pass, displayName: loginDisplayName.trim(), email: loginEmail.trim(), phone: loginPhone.trim() };
      const updated = [...existing, newUser];
      localStorage.setItem('ev_users', JSON.stringify(updated));
      setUsers(updated);
      setActiveUser({ username: uname, displayName: newUser.displayName, email: newUser.email, phone: newUser.phone, profilePic: '' });
      resetModuleData();
      setIsAuth(true);
      setLoginErr('');
      notify(`Welcome ${newUser.displayName}! Your vault is ready.`, 'ok');
    } else {
      // LOGIN
      if (!uname || !pass) {
        setLoginErr('Enter your username and password.');
        return;
      }
      const allUsers = getUsers();
      const found = allUsers.find(u => u.username === uname && u.password === pass);
      if (found) {
        setActiveUser({ username: found.username, displayName: found.displayName, email: found.email || '', phone: found.phone || '', profilePic: (found as any).profilePic || '' });
        resetModuleData();
        loadUserData(found.username);
        setIsAuth(true);
        setLoginErr('');
        notify(`Welcome back, ${found.displayName}!`, 'ok');
      } else {
        setLoginErr('Invalid username or password. Check your credentials or sign up.');
      }
    }
  };

  // ─── Financial metrics ───
  const metrics = useMemo(() => {
    const totalInv = invDetails.reduce((s, i) => s + (Number(i.currentValue) || 0), 0);
    const totalPrin = invDetails.reduce((s, i) => s + (Number(i.investedAmount) || 0), 0);
    const totalLoans = finDetails.reduce((s, i) => s + (Number(i.remainingAmount) || 0), 0);
    const totalEmi = finDetails.reduce((s, i) => s + (Number(i.emiAmount) || 0), 0);
    const monthlyExp = expenseDetails.reduce((s, i) => {
      if (i.frequency === 'Annual') return s + (Number(i.amount) || 0) / 12;
      return s + (Number(i.amount) || 0);
    }, 0);
    const monthlyIn = salaryDetails.reduce((s, i) => s + (Number(i.grossMonthly) || 0), 0);
    const lifeCover = insDetails
      .filter(i => i.policyType.toLowerCase().includes('life') || i.policyType.toLowerCase().includes('term'))
      .reduce((s, i) => s + (Number(i.sumAssured) || 0), 0);
    const netWorth = totalInv - totalLoans;
    const surplus = monthlyIn - monthlyExp - totalEmi;
    let score = 10;
    if (passwords.length > 0) score += 15;
    if (insDetails.length > 0) score += 20;
    if (medDetails.length > 0) score += 15;
    if (finDetails.length > 0) score += 10;
    if (documents.length > 0) score += 10;
    if (selfData.name) score += 10;
    if (spouseData.name) score += 10;
    score = Math.min(score, 100);
    return { totalInv, totalPrin, totalLoans, totalEmi, monthlyExp, monthlyIn, lifeCover, netWorth, surplus, score };
  }, [invDetails, finDetails, expenseDetails, salaryDetails, insDetails, passwords, medDetails, documents, selfData, spouseData]);

  const downloadBackup = () => {
    const payload = {
      version: '2026.2', exportedAt: new Date().toLocaleString(), perspective,
      horizon: `${selMonth} ${selYear}`,
      data: { selfData, spouseData, kidsData, familyDetails, eduDetails, profDetails, salaryDetails, expenseDetails, finDetails, insDetails, invDetails, vehDetails, medDetails, passwords, documents, appliances }
    };
    const el = document.createElement('a');
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    el.href = URL.createObjectURL(blob);
    el.download = `LifeKeepVault_Backup_${selYear}.json`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
    notify('Complete vault backup downloaded.', 'ok');
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    notify(`Copied ${label}`, 'info');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // LOGIN SCREEN (Multi-User: Sign In / Sign Up)
  // ──────────────────────────────────────────────────────────────────────────
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 login-bg">
        {toast && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-zinc-900 border-l-4 border-amber-500 text-white px-5 py-3 rounded-lg shadow-2xl">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-mono">{toast.text}</span>
          </div>
        )}
        <div className="w-full max-w-md bg-[#0e1525] border border-slate-800/60 rounded-2xl p-8 shadow-2xl relative overflow-hidden gentle-glow">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent" />
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center rounded-2xl mb-4 float-slow bg-gradient-to-br from-teal-500 to-teal-700 p-4 shadow-lg shadow-teal-900/40">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L6 12v10c0 8 6 14 14 18 8-4 14-10 14-18V12L20 4z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
                <path d="M20 14a3 3 0 0 0-3 3v2h-1a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-1v-2a3 3 0 0 0-3-3zm0 2a1 1 0 0 1 1 1v2h-2v-2a1 1 0 0 1 1-1z" fill="white"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">LIFEKEEPVAULT</h1>
            <p className="text-[11px] text-teal-400/80 mt-1 uppercase tracking-widest font-mono">
              Family Legacy &amp; Continuity Registry
            </p>
          </div>

          {/* Toggle between Sign In / Sign Up */}
          <div className="flex mb-5 bg-slate-900/80 rounded-xl p-1 border border-slate-800/60">
            <button type="button" onClick={() => { setLoginMode('login'); setLoginErr(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${loginMode === 'login' ? 'bg-teal-500 text-black' : 'text-slate-400 hover:text-white'}`}>
              🔑 Sign In
            </button>
            <button type="button" onClick={() => { setLoginMode('signup'); setLoginErr(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${loginMode === 'signup' ? 'bg-teal-500 text-black' : 'text-slate-400 hover:text-white'}`}>
              ✨ Sign Up
            </button>
          </div>

          {loginMode === 'signup' && (
            <div className="mb-4 p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[11px] text-zinc-400 font-mono text-center leading-relaxed">
              Create your own account. Each family member gets their own private vault with separate data.
            </div>
          )}

          {/* Registered users indicator */}
          {hasAnyUsers && loginMode === 'login' && (
            <div className="mb-4 flex flex-wrap gap-1.5 justify-center">
              {users.map(u => (
                <button key={u.username} type="button"
                  onClick={() => { setLoginUser(u.username); setLoginErr(''); }}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                    loginUser === u.username
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white'
                  }`}>
                  👤 {u.displayName}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Sign-Up only: Full Name */}
            {loginMode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 tracking-wider">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input type="text" value={loginDisplayName} onChange={e => setLoginDisplayName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono transition-colors"
                      placeholder="e.g. Ravindra Thamatam" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 tracking-wider">Email (for reminders)</label>
                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono transition-colors"
                      placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 tracking-wider">Mobile (for reminders)</label>
                    <input type="tel" value={loginPhone} onChange={e => setLoginPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono transition-colors"
                      placeholder="+91 98765 43210" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 tracking-wider">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono transition-colors"
                  placeholder={loginMode === 'signup' ? 'Choose a username' : 'Enter your username'}
                  autoFocus required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest transition-colors"
                  placeholder="••••••••" required />
              </div>
            </div>

            {loginErr && (
              <div className="text-xs bg-red-950/40 border border-red-900/50 text-red-400 p-2.5 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /><span>{loginErr}</span>
              </div>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-black font-semibold text-xs uppercase tracking-widest py-3 px-4 rounded-lg transition-all shadow-lg shadow-teal-950/40 flex items-center justify-center gap-2 cursor-pointer font-mono">
              <Key className="w-4 h-4" />
              {loginMode === 'signup' ? 'Create Account & Enter' : 'Unlock Vault'}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-zinc-600 font-mono">
            {loginMode === 'login'
              ? <>Don't have an account? <button type="button" onClick={() => { setLoginMode('signup'); setLoginErr(''); }} className="text-amber-400 underline cursor-pointer">Sign Up</button></>
              : <>Already have an account? <button type="button" onClick={() => { setLoginMode('login'); setLoginErr(''); }} className="text-amber-400 underline cursor-pointer">Sign In</button></>
            }
          </p>

          <p className="mt-4 pt-4 border-t border-zinc-900 text-center text-[11px] text-zinc-500 leading-relaxed">
            All data is stored locally on this device. No servers. No cloud. Each user has their own private vault.
          </p>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MAIN AUTHENTICATED APP
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-slate-800 font-sans antialiased flex flex-col app-bg">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border-l-4 text-sm font-mono backdrop-blur-sm ${
          toast.type === 'ok' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300' :
          toast.type === 'err' ? 'bg-red-950/90 border-red-500 text-red-300' :
          'bg-slate-900/90 border-teal-500 text-teal-300'
        }`}>
          <div className={`h-2 w-2 rounded-full animate-pulse ${
            toast.type === 'ok' ? 'bg-emerald-400' : toast.type === 'err' ? 'bg-red-400' : 'bg-amber-400'
          }`} />
          {toast.text}
        </div>
      )}

      {/* ─── TOP HEADER ─── */}
      <header className="bg-white/95 border-b border-slate-200 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md shadow-teal-900/20">
                <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                  <path d="M20 4L6 12v10c0 8 6 14 14 18 8-4 14-10 14-18V12L20 4z" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2"/>
                  <path d="M20 14a3 3 0 0 0-3 3v2h-1a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-1v-2a3 3 0 0 0-3-3zm0 2a1 1 0 0 1 1 1v2h-2v-2a1 1 0 0 1 1-1z" fill="white"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm tracking-wider text-slate-800">LIFEKEEPVAULT</span>
                  <span className="text-[8px] bg-teal-500/10 text-teal-400 font-mono px-1.5 py-0.5 rounded border border-teal-500/20 uppercase">Secured</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">Family Legacy Reference Ledger</p>
              </div>
            </div>
            <button onClick={() => { setIsAuth(false); setLoginUser(''); setLoginPass(''); }}
              className="lg:hidden text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono px-2 py-1 rounded flex items-center gap-1 cursor-pointer">
              <LogOut className="w-3 h-3" /> Lock
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Year/Month */}
            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              <Calendar className="w-3.5 h-3.5 text-amber-500 ml-1" />
              <select value={selMonth} onChange={e => setSelMonth(e.target.value)}
                className="bg-black text-[11px] font-mono text-white rounded px-1.5 py-1 border border-zinc-700 focus:outline-none cursor-pointer">
                {months.map(m => <option key={m}>{m}</option>)}
              </select>
              <select value={selYear} onChange={e => setSelYear(e.target.value)}
                className="bg-black text-[11px] font-mono text-teal-400 font-bold rounded px-1.5 py-1 border border-teal-500/40 focus:outline-none cursor-pointer">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Logged-in User Greeting */}
            {/* Profile Pic + Greeting */}
            <div className="flex items-center gap-2 bg-teal-50 rounded-lg px-2 py-1 border border-teal-200">
              <input type="file" ref={profilePicRef} className="hidden" accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    // Resize to small thumbnail
                    const img = new Image();
                    img.onload = () => {
                      const c = document.createElement('canvas');
                      c.width = 80; c.height = 80;
                      const ctx = c.getContext('2d');
                      if (!ctx) return;
                      const size = Math.min(img.width, img.height);
                      const sx = (img.width - size) / 2, sy = (img.height - size) / 2;
                      ctx.drawImage(img, sx, sy, size, size, 0, 0, 80, 80);
                      const dataUrl = c.toDataURL('image/jpeg', 0.8);
                      setActiveUser(prev => ({ ...prev, profilePic: dataUrl }));
                      // Also update in stored users
                      const allUsers = getUsers();
                      const idx = allUsers.findIndex(u => u.username === activeUser.username);
                      if (idx >= 0) { (allUsers[idx] as any).profilePic = dataUrl; localStorage.setItem('ev_users', JSON.stringify(allUsers)); }
                    };
                    img.src = reader.result as string;
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />
              <button onClick={() => profilePicRef.current?.click()} className="relative group cursor-pointer flex-shrink-0" title="Click to change profile photo">
                {activeUser.profilePic ? (
                  <img src={activeUser.profilePic} alt="" className="h-8 w-8 rounded-full object-cover border-2 border-teal-300" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-teal-200 border-2 border-teal-300 flex items-center justify-center text-teal-700 font-bold text-sm">
                    {(activeUser.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-[8px]">📷</span>
                </div>
              </button>
              <p className="text-[11px] font-mono text-teal-700 font-bold">Hello, {activeUser.displayName || 'User'}!</p>
            </div>

            <button onClick={downloadBackup}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer">
              <Download className="w-3 h-3 text-amber-400" /> Backup
            </button>

            {/* Install App button — shows when PWA prompt is available */}
            {deferredPrompt && !isInstalled && (
              <button onClick={handleInstallClick}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold font-mono text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-amber-900/30 animate-pulse">
                <ArrowDown className="w-3.5 h-3.5" /> Install App
              </button>
            )}
            {isInstalled && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Installed
              </span>
            )}

            {/* Online/Offline indicator */}
            <span className={`text-[10px] font-mono px-1.5 py-1 rounded flex items-center gap-1 ${isOnline ? 'text-emerald-500' : 'text-amber-400 bg-amber-950/30 border border-amber-900/40 rounded-lg'}`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </span>

            <button onClick={() => { setIsAuth(false); setLoginUser(''); setLoginPass(''); }}
              className="hidden lg:flex bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-300 font-mono text-[11px] px-2.5 py-1.5 rounded-lg transition-colors items-center gap-1 cursor-pointer">
              <LogOut className="w-3 h-3" /> Lock Vault
            </button>
          </div>
        </div>

        {/* ─── HORIZONTAL TAB NAVIGATION ─── */}
        <div className="border-t border-slate-200 bg-white/90 relative">
          <div className="max-w-[1600px] mx-auto flex items-center">
            {/* Scroll left button */}
            <button onClick={() => { if (tabScrollRef.current) tabScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' }); }}
              className="flex-shrink-0 px-1.5 py-2 text-zinc-500 hover:text-amber-400 cursor-pointer hidden md:block"
              aria-label="Scroll tabs left">
              ‹
            </button>
            <div ref={tabScrollRef} className="flex items-center overflow-x-auto scrollbar-hide gap-0.5 px-1 py-1 flex-1">
              {TAB_LIST.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      // Auto-scroll the clicked tab into view
                      setTimeout(() => {
                        const el = document.getElementById('tab-' + tab.key);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                      }, 50);
                    }}
                    id={'tab-' + tab.key}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 border border-teal-200 font-bold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {/* Scroll right button */}
            <button onClick={() => { if (tabScrollRef.current) tabScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' }); }}
              className="flex-shrink-0 px-1.5 py-2 text-zinc-500 hover:text-amber-400 cursor-pointer hidden md:block"
              aria-label="Scroll tabs right">
              ›
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6">

        {/* ══════ DASHBOARD TAB ══════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Metrics */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
              <button onClick={() => toggleDash('finance')} className="w-full flex items-center justify-between cursor-pointer p-5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <h2 className="text-sm font-bold font-mono uppercase text-white">Financial Stability Overview — {selYear}</h2>
                </div>
                {dashOpen.finance ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
              </button>
              {dashOpen.finance && <div className="px-5 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Total Investments', val: INR(metrics.totalInv), sub: `Principal: ${INR(metrics.totalPrin)}`, color: 'text-emerald-400', tag: '📈' },
                  { label: 'Active Loan Balance', val: INR(metrics.totalLoans), sub: `EMI/mo: ${INR(metrics.totalEmi)}`, color: 'text-red-400', tag: '🏦' },
                  { label: 'Net Family Capital', val: INR(metrics.netWorth), sub: 'Assets minus liabilities', color: metrics.netWorth >= 0 ? 'text-teal-400' : 'text-red-400', tag: '💎' },
                  { label: 'Monthly Net Inflow', val: INR(metrics.surplus), sub: 'Salary − EMIs − Bills', color: 'text-cyan-400', tag: '💸' },
                ].map((c, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-3.5 rounded-xl relative card-peaceful">
                    <span className="absolute right-2 top-2 text-lg">{c.tag}</span>
                    <p className="text-[10px] font-mono text-slate-400 uppercase">{c.label}</p>
                    <p className={`text-lg font-bold font-mono mt-1 ${c.color}`}>{c.val}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 font-mono">{c.sub}</p>
                  </div>
                ))}
                <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl col-span-2 md:col-span-1 bg-gradient-to-br from-teal-950/20 to-transparent card-peaceful">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-teal-400 uppercase font-semibold">🛡️ Readiness</span>
                    <span className="text-xs bg-teal-500 text-black px-1.5 rounded font-mono font-bold">{metrics.score}%</span>
                  </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-teal-600 to-teal-400 h-full transition-all duration-700" style={{ width: `${metrics.score}%` }} />
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-1.5 font-mono">
                    {metrics.score >= 80 ? '🔒 Secured.' : '⚠️ Add more details to improve.'}
                  </p>
                </div>
              </div>
              {metrics.lifeCover > 0 && (
                <div className="mt-4 p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-zinc-400">Life Protection Cover:</span>
                    <span className="font-bold text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">{INR(metrics.lifeCover)}</span>
                  </div>
                  <span className="text-zinc-600">Contingency buffer for family continuity.</span>
                </div>
              )}
              </div>}
            </section>

            {/* Quick Module Links */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <button onClick={() => toggleDash('modules')} className="w-full flex items-center justify-between cursor-pointer p-5 pb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <span className="text-base">🧭</span> Quick Module Navigation
                </h3>
                {dashOpen.modules ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
              </button>
              {dashOpen.modules && <div className="px-5 pb-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {([
                    { key: 'personal', emoji: '👤', label: 'Personal' },
                    { key: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family' },
                    { key: 'education', emoji: '🎓', label: 'Education' },
                    { key: 'professional', emoji: '💼', label: 'Professional' },
                    { key: 'salary', emoji: '💰', label: 'Salary' },
                    { key: 'expenses', emoji: '🧾', label: 'Expenses' },
                    { key: 'financial', emoji: '🏦', label: 'Loans & EMIs' },
                    { key: 'insurance', emoji: '🛡️', label: 'Insurance' },
                    { key: 'investments', emoji: '📈', label: 'Investments' },
                    { key: 'vehicles', emoji: '🚗', label: 'Vehicles' },
                    { key: 'medical', emoji: '🏥', label: 'Medical' },
                    { key: 'appliances', emoji: '🏠', label: 'Appliances' },
                    { key: 'documents', emoji: '📁', label: 'Documents' },
                    { key: 'passwords', emoji: '🔐', label: 'Passwords' },
                    { key: 'emergency', emoji: '🆘', label: 'Emergency' },
                    { key: 'sync', emoji: '🔄', label: 'Sync Data' },
                    { key: 'install', emoji: '📲', label: 'Install App' },
                  ] as { key: TabKey; emoji: string; label: string }[]).map(item => (
                    <button key={item.key} onClick={() => setActiveTab(item.key)}
                      className="flex flex-col items-center gap-2 p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-teal-500/20 rounded-xl transition-all cursor-pointer group card-peaceful">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-teal-300 text-center leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>}
            </section>

            {/* External Quick Portals — Organized by Category with collapsible blocks */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <button onClick={() => toggleDash('portals')} className="w-full flex items-center justify-between cursor-pointer p-5 pb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <span className="text-base">🌐</span> Quick Portals — Essential Life Links
                </h3>
                {dashOpen.portals ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
              </button>
              {dashOpen.portals && <div className="px-5 pb-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(quickPortals).map(([category, links]) => {
                    const catKey = 'portal_' + category;
                    const isOpen = dashOpen[catKey] !== false; // default open
                    return (
                      <div key={category} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                        <button onClick={() => setDashOpen(p => ({ ...p, [catKey]: !isOpen }))}
                          className="w-full flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-zinc-800/50 transition-colors">
                          <h4 className="text-[11px] font-mono font-bold text-amber-400">{category}</h4>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-zinc-600">{links.length}</span>
                            {isOpen ? <ChevronUp className="w-3 h-3 text-zinc-500" /> : <ChevronDown className="w-3 h-3 text-zinc-500" />}
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-2 pb-2 space-y-0.5">
                            {links.map((link, li) => (
                              <a key={li} href={link.url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors group text-[11px] font-mono text-zinc-400 hover:text-amber-400">
                                <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 flex-shrink-0" />
                                <span className="truncate">{link.name}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>}
            </section>

            {/* Emergency */}
            <section className="bg-zinc-950 border-l-2 border-amber-500/70 rounded-2xl border border-zinc-800 overflow-hidden">
              <button onClick={() => toggleDash('emergency')} className="w-full flex items-center justify-between cursor-pointer p-5 pb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <span className="text-base">🆘</span> Emergency Continuity Protocol
                </h3>
                {dashOpen.emergency ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
              </button>
              {dashOpen.emergency && <div className="px-5 pb-5">
              <p className="text-[11px] text-zinc-400 mb-3 font-mono">Step-by-step checklist if the primary member is no longer available.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {emergencyProtocols.map((p, i) => (
                  <div key={i} className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <h4 className="text-xs font-mono font-bold text-amber-400 mb-1">{p.title}</h4>
                    <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">{p.steps}</p>
                  </div>
                ))}
              </div>
              </div>}
            </section>
          </div>
        )}

        {/* ══════ PERSONAL DETAILS TAB ══════ */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            {/* Self */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-500" />
                  <span className="font-mono text-xs font-bold text-white uppercase">
                    Self Details ({activeUser.displayName || (perspective === 'him' ? 'Him' : 'Her')})
                  </span>
                </div>
                <CrudBar
                  onCreate={() => { setSelfData({ ...emptySelfData }); setEditSelf(true); notify('New self record created. Fill and save.', 'info'); }}
                  onSave={() => { setEditSelf(false); notify('Self details saved.', 'ok'); }}
                  onUpdate={() => { setEditSelf(true); notify('Self form unlocked for editing.', 'info'); }}
                  onDelete={() => { if (confirm('Delete self data?')) { setSelfData({ ...emptySelfData }); notify('Self data cleared.', 'err'); } }}
                />
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <Field label="Full Name" value={selfData.name} onChange={v => setSelfData({ ...selfData, name: v })} disabled={!editSelf} accent="text-white font-bold" />
                  <Field label="Father's Name" value={selfData.fatherName} onChange={v => setSelfData({ ...selfData, fatherName: v })} disabled={!editSelf} />
                  <Field label="Mother's Name" value={selfData.motherName} onChange={v => setSelfData({ ...selfData, motherName: v })} disabled={!editSelf} />
                  <Field label="Age" value={selfData.age} onChange={v => setSelfData({ ...selfData, age: v })} disabled={!editSelf} />
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wide mb-0.5">Married</label>
                    <select disabled={!editSelf} value={selfData.married} onChange={e => setSelfData({ ...selfData, married: e.target.value })}
                      className="w-full bg-zinc-900/80 border border-zinc-800 text-xs rounded-lg px-2.5 py-2 font-mono disabled:opacity-60 focus:outline-none focus:border-amber-500/70 text-white cursor-pointer">
                      <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                    </select>
                  </div>
                  <Field label="Aadhaar Number" value={selfData.aadhaarNumber} onChange={v => setSelfData({ ...selfData, aadhaarNumber: v })} disabled={!editSelf} accent="text-amber-400" />
                  <Field label="PAN Number" value={selfData.panNumber} onChange={v => setSelfData({ ...selfData, panNumber: v })} disabled={!editSelf} />
                  <Field label="Ration Card" value={selfData.rationCard} onChange={v => setSelfData({ ...selfData, rationCard: v })} disabled={!editSelf} />
                  <Field label="Voter Card" value={selfData.voterCard} onChange={v => setSelfData({ ...selfData, voterCard: v })} disabled={!editSelf} />
                  <Field label="Passport" value={selfData.passport} onChange={v => setSelfData({ ...selfData, passport: v })} disabled={!editSelf} />
                  <div className="md:col-span-2">
                    <Field label="Visa" value={selfData.visa} onChange={v => setSelfData({ ...selfData, visa: v })} disabled={!editSelf} />
                  </div>
                </div>
                <AttachmentBar attachments={selfData.attachments}
                  onFilesAdded={(files) => setSelfData(p => ({ ...p, attachments: [...p.attachments, ...files] }))}
                  onRemove={(id) => setSelfData(p => ({ ...p, attachments: p.attachments.filter(a => a.id !== id) }))} />
              </div>
            </section>

            {/* Spouse */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span className="font-mono text-xs font-bold text-white uppercase">
                    {perspective === 'him' ? `Spouse / Wife Details` : `Husband Details`}
                  </span>
                </div>
                <CrudBar
                  onCreate={() => { setSpouseData({ ...emptySpouseData }); setEditSpouse(true); notify('New spouse record created.', 'info'); }}
                  onSave={() => { setEditSpouse(false); notify('Spouse details saved.', 'ok'); }}
                  onUpdate={() => { setEditSpouse(true); notify('Spouse form unlocked.', 'info'); }}
                  onDelete={() => { if (confirm('Delete spouse data?')) { setSpouseData({ ...emptySpouseData }); notify('Spouse data cleared.', 'err'); } }}
                />
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <Field label="Full Name" value={spouseData.name} onChange={v => setSpouseData({ ...spouseData, name: v })} disabled={!editSpouse} accent="text-white font-bold" />
                  <Field label="Father's Name" value={spouseData.fatherName} onChange={v => setSpouseData({ ...spouseData, fatherName: v })} disabled={!editSpouse} />
                  <Field label="Mother's Name" value={spouseData.motherName} onChange={v => setSpouseData({ ...spouseData, motherName: v })} disabled={!editSpouse} />
                  <Field label="Age" value={spouseData.age} onChange={v => setSpouseData({ ...spouseData, age: v })} disabled={!editSpouse} />
                  <Field label="Aadhaar Number" value={spouseData.aadhaarNumber} onChange={v => setSpouseData({ ...spouseData, aadhaarNumber: v })} disabled={!editSpouse} accent="text-amber-400" />
                  <Field label="PAN Number" value={spouseData.panNumber} onChange={v => setSpouseData({ ...spouseData, panNumber: v })} disabled={!editSpouse} />
                  <Field label="Passport" value={spouseData.passport} onChange={v => setSpouseData({ ...spouseData, passport: v })} disabled={!editSpouse} />
                  <Field label="Visa" value={spouseData.visa} onChange={v => setSpouseData({ ...spouseData, visa: v })} disabled={!editSpouse} />
                </div>
                <AttachmentBar attachments={spouseData.attachments}
                  onFilesAdded={(files) => setSpouseData(p => ({ ...p, attachments: [...p.attachments, ...files] }))}
                  onRemove={(id) => setSpouseData(p => ({ ...p, attachments: p.attachments.filter(a => a.id !== id) }))} />
              </div>
            </section>

            {/* Kids */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-white uppercase">Kids / Dependents</span>
                  <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 font-mono">{kidsData.length}</span>
                </div>
                <button onClick={() => {
                  setKidsData([...kidsData, { id: uid(), type: 'kid', name: '', fatherName: '', motherName: '', age: '', married: 'No', aadhaarNumber: '', panNumber: '', rationCard: '', voterCard: '', passport: '', visa: '', attachments: [] }]);
                  notify('New child record added.', 'info');
                }} className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer">
                  <Plus className="w-3 h-3" /> Add Child
                </button>
              </div>
              <div className="p-5 space-y-4">
                {kidsData.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-6">No children records added yet. Click "Add Child" to begin.</p>}
                {kidsData.map((kid, ki) => (
                  <div key={kid.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                    <button onClick={() => toggleRecord(kid.id)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-amber-400 font-bold">Child #{ki + 1}</span>
                        {kid.name && <span className="text-white">— {kid.name}</span>}
                        {kid.age && <span className="text-zinc-500">Age: {kid.age}</span>}
                      </div>
                      {isRecordOpen(kid.id) ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                    </button>
                    {isRecordOpen(kid.id) && <div className="px-4 pb-4 space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Field label="Name" value={kid.name} onChange={v => { const c = [...kidsData]; c[ki].name = v; setKidsData(c); }} />
                      <Field label="Age" value={kid.age} onChange={v => { const c = [...kidsData]; c[ki].age = v; setKidsData(c); }} />
                      <Field label="Aadhaar" value={kid.aadhaarNumber} onChange={v => { const c = [...kidsData]; c[ki].aadhaarNumber = v; setKidsData(c); }} accent="text-amber-400" />
                      <Field label="Passport" value={kid.passport} onChange={v => { const c = [...kidsData]; c[ki].passport = v; setKidsData(c); }} />
                    </div>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => notify(`Saved child #${ki + 1}`, 'ok')} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded text-[10px] font-mono cursor-pointer">Save</button>
                      <button onClick={() => { setKidsData(p => p.filter(k => k.id !== kid.id)); notify('Child removed.', 'err'); }} className="bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-1 rounded text-[10px] font-mono cursor-pointer">Delete</button>
                    </div>
                  </div>}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ══════ FAMILY DETAILS ══════ */}
        {activeTab === 'family' && (
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-xs font-bold text-white uppercase">Family &amp; Emergency Contacts</span>
                <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 font-mono">{familyDetails.length}</span>
              </div>
              <button onClick={() => {
                setFamilyDetails([...familyDetails, { id: uid(), name: '', relationship: '', phone: '', email: '', address: '', attachments: [] }]);
                notify('New family contact added.', 'info');
              }} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer">
                <Plus className="w-3 h-3" /> Add Contact
              </button>
            </div>
            <div className="p-5 space-y-3">
              {familyDetails.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-6">No family contacts added yet.</p>}
              {familyDetails.map((f, fi) => (
                <div key={f.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={() => toggleRecord(f.id)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-amber-400 font-bold">{f.name || 'New Contact'}</span>
                      {f.relationship && <span className="text-zinc-500">— {f.relationship}</span>}
                    </div>
                    {isRecordOpen(f.id) ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {isRecordOpen(f.id) && <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 items-end">
                    <Field label="Name" value={f.name} onChange={v => { const c = [...familyDetails]; c[fi].name = v; setFamilyDetails(c); }} accent="text-white font-bold" />
                    <Field label="Relationship" value={f.relationship} onChange={v => { const c = [...familyDetails]; c[fi].relationship = v; setFamilyDetails(c); }} accent="text-amber-400" />
                    <Field label="Phone" value={f.phone} onChange={v => { const c = [...familyDetails]; c[fi].phone = v; setFamilyDetails(c); }} />
                    <Field label="Email" value={f.email} onChange={v => { const c = [...familyDetails]; c[fi].email = v; setFamilyDetails(c); }} />
                    <div className="flex items-end gap-1">
                      <button onClick={() => notify(`Saved ${f.name || 'contact'}`, 'ok')} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-2 rounded-lg text-[10px] font-mono cursor-pointer w-full">Save</button>
                      <button onClick={() => { setFamilyDetails(p => p.filter(x => x.id !== f.id)); notify('Removed.', 'err'); }} className="bg-red-500/10 border border-red-500/30 text-red-400 px-2.5 py-2 rounded-lg text-[10px] font-mono cursor-pointer w-full">Delete</button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Field label="Address / Notes" value={f.address} onChange={v => { const c = [...familyDetails]; c[fi].address = v; setFamilyDetails(c); }} />
                  </div>
                  <AttachmentBar attachments={f.attachments}
                    onFilesAdded={(files) => { const c = [...familyDetails]; c[fi].attachments = [...c[fi].attachments, ...files]; setFamilyDetails(c); }}
                    onRemove={(id) => { const c = [...familyDetails]; c[fi].attachments = c[fi].attachments.filter(a => a.id !== id); setFamilyDetails(c); }} />
                  </div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════ EDUCATION ══════ */}
        {activeTab === 'education' && (
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-xs font-bold text-white uppercase">Educational Credentials</span>
              </div>
              <button onClick={() => {
                setEduDetails([...eduDetails, { id: uid(), personName: '', institution: '', degree: '', fieldOfStudy: '', passingYear: '', grade: '', attachments: [] }]);
                notify('New education record added.', 'info');
              }} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer">
                <Plus className="w-3 h-3" /> Add Entry
              </button>
            </div>
            <div className="p-5 space-y-3">
              {eduDetails.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-6">No education records added yet.</p>}
              {eduDetails.map((edu, ei) => (
                <div key={edu.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={() => toggleRecord(edu.id)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-amber-400 font-bold">{edu.degree || 'New Entry'}</span>
                      {edu.institution && <span className="text-zinc-500">— {edu.institution}</span>}
                      {edu.passingYear && <span className="text-zinc-600">({edu.passingYear})</span>}
                    </div>
                    {isRecordOpen(edu.id) ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {isRecordOpen(edu.id) && <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <Field label="Person" value={edu.personName} onChange={v => { const c = [...eduDetails]; c[ei].personName = v; setEduDetails(c); }} accent="text-white font-bold" />
                    <Field label="Degree" value={edu.degree} onChange={v => { const c = [...eduDetails]; c[ei].degree = v; setEduDetails(c); }} />
                    <Field label="Institution" value={edu.institution} onChange={v => { const c = [...eduDetails]; c[ei].institution = v; setEduDetails(c); }} />
                    <Field label="Field of Study" value={edu.fieldOfStudy} onChange={v => { const c = [...eduDetails]; c[ei].fieldOfStudy = v; setEduDetails(c); }} />
                    <Field label="Passing Year" value={edu.passingYear} onChange={v => { const c = [...eduDetails]; c[ei].passingYear = v; setEduDetails(c); }} />
                    <Field label="Grade / Score" value={edu.grade} onChange={v => { const c = [...eduDetails]; c[ei].grade = v; setEduDetails(c); }} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <AttachmentBar attachments={edu.attachments}
                      onFilesAdded={(files) => { const c = [...eduDetails]; c[ei].attachments = [...c[ei].attachments, ...files]; setEduDetails(c); }}
                      onRemove={(id) => { const c = [...eduDetails]; c[ei].attachments = c[ei].attachments.filter(a => a.id !== id); setEduDetails(c); }} />
                    <CrudBar
                      onSave={() => notify('Education saved.', 'ok')}
                      onDelete={() => { setEduDetails(p => p.filter(x => x.id !== edu.id)); notify('Removed.', 'err'); }}
                    />
                  </div>
                  </div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════ PROFESSIONAL ══════ */}
        {activeTab === 'professional' && (
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-amber-500" /><span className="font-mono text-xs font-bold text-white uppercase">Professional &amp; Career</span></div>
              <button onClick={() => {
                setProfDetails([...profDetails, { id: uid(), personName: '', companyName: '', employerName: '', designation: '', joiningDate: '', experience: '', officeLocation: '', managerName: '', managerContact: '', hrContact: '', attachments: [] }]);
              }} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer"><Plus className="w-3 h-3" /> Add</button>
            </div>
            <div className="p-5 space-y-3">
              {profDetails.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-6">No professional records yet.</p>}
              {profDetails.map((p, pi) => (
                <div key={p.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={() => toggleRecord(p.id)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-amber-400 font-bold">{p.companyName || p.employerName || 'New Entry'}</span>
                      {p.designation && <span className="text-zinc-500">— {p.designation}</span>}
                      {p.experience && <span className="text-zinc-600">({p.experience} yrs)</span>}
                    </div>
                    {isRecordOpen(p.id) ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {isRecordOpen(p.id) && <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <Field label="Employee Name" value={p.personName} onChange={v => { const c = [...profDetails]; c[pi].personName = v; setProfDetails(c); }} />
                    <Field label="Company Name" value={p.companyName} onChange={v => { const c = [...profDetails]; c[pi].companyName = v; setProfDetails(c); }} accent="text-white font-bold" />
                    <Field label="Employer / Brand" value={p.employerName} onChange={v => { const c = [...profDetails]; c[pi].employerName = v; setProfDetails(c); }} />
                    <Field label="Designation / Role" value={p.designation} onChange={v => { const c = [...profDetails]; c[pi].designation = v; setProfDetails(c); }} accent="text-amber-400" />
                    <Field label="Joining Date" value={p.joiningDate} onChange={v => { const c = [...profDetails]; c[pi].joiningDate = v; setProfDetails(c); }} />
                    <Field label="Experience (Years)" value={p.experience} onChange={v => { const c = [...profDetails]; c[pi].experience = v; setProfDetails(c); }} />
                    <Field label="Manager Name" value={p.managerName} onChange={v => { const c = [...profDetails]; c[pi].managerName = v; setProfDetails(c); }} accent="text-cyan-400" />
                    <Field label="Manager Contact" value={p.managerContact} onChange={v => { const c = [...profDetails]; c[pi].managerContact = v; setProfDetails(c); }} />
                    <Field label="Office Location" value={p.officeLocation} onChange={v => { const c = [...profDetails]; c[pi].officeLocation = v; setProfDetails(c); }} />
                    <Field label="HR Contact" value={p.hrContact} onChange={v => { const c = [...profDetails]; c[pi].hrContact = v; setProfDetails(c); }} />
                  </div>
                  <AttachmentBar attachments={p.attachments}
                    onFilesAdded={(files) => { const c = [...profDetails]; c[pi].attachments = [...c[pi].attachments, ...files]; setProfDetails(c); }}
                    onRemove={(id) => { const c = [...profDetails]; c[pi].attachments = c[pi].attachments.filter(a => a.id !== id); setProfDetails(c); }} />
                  <div className="flex justify-end mt-3"><CrudBar onSave={() => notify('Saved.', 'ok')} onDelete={() => { setProfDetails(prev => prev.filter(x => x.id !== p.id)); notify('Removed.', 'err'); }} /></div>
                  </div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════ SALARY ══════ */}
        {activeTab === 'salary' && (
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-amber-500" /><span className="font-mono text-xs font-bold text-white uppercase">Salary Breakup</span></div>
              <button onClick={() => {
                setSalaryDetails([...salaryDetails, { id: uid(), personName: '', grossMonthly: 0, basicPay: 0, hra: 0, allowances: 0, deductions: 0, bonusDetails: '', creditedAccount: '', attachments: [] }]);
              }} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer"><Plus className="w-3 h-3" /> Add</button>
            </div>
            <div className="p-5 space-y-3">
              {salaryDetails.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-6">No salary records yet.</p>}
              {salaryDetails.map((s, si) => (
                <div key={s.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={() => toggleRecord(s.id)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-amber-400 font-bold">{s.personName || 'New Entry'}</span>
                      {s.grossMonthly > 0 && <span className="text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded text-[10px]">{INR(s.grossMonthly)}/mo</span>}
                    </div>
                    {isRecordOpen(s.id) ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {isRecordOpen(s.id) && <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Field label="Person" value={s.personName} onChange={v => { const c = [...salaryDetails]; c[si].personName = v; setSalaryDetails(c); }} />
                    <Field label="Gross Monthly (₹)" value={s.grossMonthly} onChange={v => { const c = [...salaryDetails]; c[si].grossMonthly = Number(v) || 0; setSalaryDetails(c); }} type="number" accent="text-emerald-400 font-bold" />
                    <Field label="Basic Pay (₹)" value={s.basicPay} onChange={v => { const c = [...salaryDetails]; c[si].basicPay = Number(v) || 0; setSalaryDetails(c); }} type="number" />
                    <Field label="HRA (₹)" value={s.hra} onChange={v => { const c = [...salaryDetails]; c[si].hra = Number(v) || 0; setSalaryDetails(c); }} type="number" />
                    <Field label="Allowances (₹)" value={s.allowances} onChange={v => { const c = [...salaryDetails]; c[si].allowances = Number(v) || 0; setSalaryDetails(c); }} type="number" />
                    <Field label="Deductions (₹)" value={s.deductions} onChange={v => { const c = [...salaryDetails]; c[si].deductions = Number(v) || 0; setSalaryDetails(c); }} type="number" />
                    <Field label="Credit Account" value={s.creditedAccount} onChange={v => { const c = [...salaryDetails]; c[si].creditedAccount = v; setSalaryDetails(c); }} accent="text-amber-300" />
                    <Field label="Bonus Details" value={s.bonusDetails} onChange={v => { const c = [...salaryDetails]; c[si].bonusDetails = v; setSalaryDetails(c); }} />
                  </div>
                  <AttachmentBar attachments={s.attachments}
                    onFilesAdded={(files) => { const c = [...salaryDetails]; c[si].attachments = [...c[si].attachments, ...files]; setSalaryDetails(c); }}
                    onRemove={(id) => { const c = [...salaryDetails]; c[si].attachments = c[si].attachments.filter(a => a.id !== id); setSalaryDetails(c); }} />
                  <div className="flex justify-end mt-3"><CrudBar onSave={() => notify('Saved.', 'ok')} onDelete={() => { setSalaryDetails(p => p.filter(x => x.id !== s.id)); notify('Removed.', 'err'); }} /></div>
                  </div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════ EXPENSES ══════ */}
        {activeTab === 'expenses' && (
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-amber-500" /><span className="font-mono text-xs font-bold text-white uppercase">Household Expenses</span></div>
              <button onClick={() => {
                setExpenseDetails([...expenseDetails, { id: uid(), category: '', amount: 0, frequency: 'Monthly', dueDate: '', paymentMethod: '', notes: '', month: selMonth, year: selYear }]);
              }} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer"><Plus className="w-3 h-3" /> Add Expense</button>
            </div>
            <div className="p-5">
              {expenseDetails.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-6">No expenses added yet.</p>}
              {/* Month/Year filter info */}
              <div className="p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Showing expenses for <strong className="text-amber-400">{selMonth} {selYear}</strong>. Change month/year in header to view other periods. New entries auto-tag to selected month.
              </div>

              <div className="overflow-x-auto">
                {(() => {
                  const filtered = expenseDetails.filter(e => (!e.month || e.month === selMonth) && (!e.year || e.year === selYear));
                  const otherCount = expenseDetails.length - filtered.length;
                  return (
                    <>
                      {filtered.length > 0 ? (
                        <table className="w-full text-left text-xs font-mono">
                          <thead><tr className="border-b border-zinc-800 text-zinc-500"><th className="p-2">Category</th><th className="p-2">Amount (₹)</th><th className="p-2">Cycle</th><th className="p-2">Due Date</th><th className="p-2">Payment</th><th className="p-2">Actions</th></tr></thead>
                          <tbody>
                            {filtered.map((e) => {
                              const ei = expenseDetails.findIndex(x => x.id === e.id);
                              return (
                                <tr key={e.id} className="border-b border-zinc-900 hover:bg-zinc-900/40">
                                  <td className="p-1.5"><input type="text" className="bg-zinc-900 text-white p-1.5 rounded border border-zinc-800 w-full focus:outline-none focus:border-amber-500/50" value={e.category} onChange={ev => { const c = [...expenseDetails]; c[ei].category = ev.target.value; setExpenseDetails(c); }} placeholder="Category" /></td>
                                  <td className="p-1.5"><input type="number" className="bg-zinc-900 text-red-400 font-bold p-1.5 rounded border border-zinc-800 w-24 focus:outline-none focus:border-amber-500/50" value={e.amount} onChange={ev => { const c = [...expenseDetails]; c[ei].amount = Number(ev.target.value) || 0; setExpenseDetails(c); }} /></td>
                                  <td className="p-1.5"><select className="bg-zinc-900 text-white p-1.5 rounded border border-zinc-800 cursor-pointer focus:outline-none" value={e.frequency} onChange={ev => { const c = [...expenseDetails]; c[ei].frequency = ev.target.value; setExpenseDetails(c); }}><option>Monthly</option><option>Annual</option><option>Quarterly</option></select></td>
                                  <td className="p-1.5"><input type="text" className="bg-zinc-900 text-zinc-300 p-1.5 rounded border border-zinc-800 w-full focus:outline-none focus:border-amber-500/50" value={e.dueDate} onChange={ev => { const c = [...expenseDetails]; c[ei].dueDate = ev.target.value; setExpenseDetails(c); }} placeholder="Due date" /></td>
                                  <td className="p-1.5"><input type="text" className="bg-zinc-900 text-zinc-300 p-1.5 rounded border border-zinc-800 w-full focus:outline-none focus:border-amber-500/50" value={e.paymentMethod} onChange={ev => { const c = [...expenseDetails]; c[ei].paymentMethod = ev.target.value; setExpenseDetails(c); }} placeholder="Method" /></td>
                                  <td className="p-1.5 whitespace-nowrap space-x-1">
                                    <button onClick={() => notify('Saved.', 'ok')} className="text-emerald-400 hover:underline cursor-pointer">Save</button>
                                    <button onClick={() => { setExpenseDetails(p => p.filter(x => x.id !== e.id)); notify('Removed.', 'err'); }} className="text-red-400 hover:underline cursor-pointer">Del</button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-xs text-zinc-500 font-mono text-center py-4">No expenses for {selMonth} {selYear}.</p>
                      )}
                      {otherCount > 0 && <p className="text-[10px] text-zinc-600 font-mono mt-2 text-center">{otherCount} expense(s) in other months (change header date to view)</p>}
                    </>
                  );
                })()}
              </div>
            </div>
          </section>
        )}

        {/* ══════ LOANS & EMIs ══════ */}
        {activeTab === 'financial' && (
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /><span className="font-mono text-xs font-bold text-white uppercase">Loans &amp; EMIs</span></div>
              <button onClick={() => {
                setFinDetails([...finDetails, { id: uid(), loanType: 'Home Loan', lenderBank: '', accountNumber: '', totalAmount: 0, remainingAmount: 0, emiAmount: 0, emiTenureMonths: 0, emiPaid: 0, emiDate: '5', emiStartMonth: selMonth, emiStartYear: selYear, interestRate: 0, endYear: '', attachments: [] }]);
              }} className="flex items-center gap-1 bg-red-500/10 border border-red-500/30 text-red-300 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer"><Plus className="w-3 h-3" /> Add Loan</button>
            </div>
            <div className="p-5 space-y-3">
              {finDetails.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-6">No loans or EMIs added.</p>}
              {finDetails.map((l, li) => (
                <div key={l.id} className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
                  {/* Collapsible header */}
                  <button onClick={() => toggleRecord(l.id)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-900/40 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-amber-400 font-bold">{l.loanType || 'New Loan'}</span>
                      {l.lenderBank && <span className="text-zinc-500">— {l.lenderBank}</span>}
                      {l.emiAmount > 0 && <span className="text-red-400 bg-red-950/30 px-1.5 py-0.5 rounded text-[10px]">{INR(l.emiAmount)}/mo</span>}
                    </div>
                    {isRecordOpen(l.id) ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {isRecordOpen(l.id) && <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wide mb-0.5">Loan Type</label>
                      <select value={l.loanType} onChange={e => { const c = [...finDetails]; c[li].loanType = e.target.value; setFinDetails(c); }}
                        className="w-full bg-zinc-900/80 border border-zinc-800 text-xs rounded-lg px-2.5 py-2 font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500/70 cursor-pointer">
                        {['Home Loan','Car Loan','Personal Loan','Education Loan','Gold Loan','Business Loan','Credit Card EMI','Two-Wheeler Loan','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <Field label="Lender / Bank" value={l.lenderBank} onChange={v => { const c = [...finDetails]; c[li].lenderBank = v; setFinDetails(c); }} />
                    <Field label="Account #" value={l.accountNumber} onChange={v => { const c = [...finDetails]; c[li].accountNumber = v; setFinDetails(c); }} />
                    <Field label="Interest Rate (%)" value={l.interestRate} onChange={v => { const c = [...finDetails]; c[li].interestRate = Number(v) || 0; setFinDetails(c); }} type="number" />
                    <Field label="Total Loan Amount (₹)" value={l.totalAmount} onChange={v => { const c = [...finDetails]; c[li].totalAmount = Number(v) || 0; setFinDetails(c); }} type="number" />
                    <Field label="EMI / Month (₹)" value={l.emiAmount} onChange={v => { const c = [...finDetails]; c[li].emiAmount = Number(v) || 0; setFinDetails(c); }} type="number" />
                    <Field label="Tenure (Months)" value={l.emiTenureMonths} onChange={v => { const c = [...finDetails]; c[li].emiTenureMonths = Number(v) || 0; setFinDetails(c); }} type="number" />
                    <Field label="EMIs Paid" value={l.emiPaid} onChange={v => { const c = [...finDetails]; c[li].emiPaid = Number(v) || 0; setFinDetails(c); }} type="number" accent="text-emerald-400" />
                    <Field label="EMI Date (DD/MM/YYYY)" value={l.emiDate} onChange={v => { const c = [...finDetails]; c[li].emiDate = v; setFinDetails(c); }} placeholder="e.g. 05/07/2026" />
                    <Field label="End Year" value={l.endYear} onChange={v => { const c = [...finDetails]; c[li].endYear = v; setFinDetails(c); }} />
                  </div>
                  {/* EMI Summary */}
                  {l.emiAmount > 0 && l.emiTenureMonths > 0 && (() => {
                    const totalPay = l.emiAmount * l.emiTenureMonths;
                    const remaining = Math.max(0, l.emiTenureMonths - (l.emiPaid || 0));
                    const paidAmt = (l.emiPaid || 0) * l.emiAmount;
                    const remainAmt = remaining * l.emiAmount;
                    // Parse DD/MM/YYYY or just day number
                    const emiParts = (l.emiDate || '').split('/');
                    const emiDay = Number(emiParts[0]) || 5;
                    const emiMon = emiParts.length >= 2 ? Number(emiParts[1]) : (months.indexOf(selMonth) + 1);
                    const emiYr = emiParts.length >= 3 ? Number(emiParts[2]) : Number(selYear);
                    // Next EMI = current EMI date + 1 month
                    const nextM = emiMon < 12 ? emiMon + 1 : 1;
                    const nextY = emiMon < 12 ? emiYr : emiYr + 1;
                    const nextEmiStr = `${String(emiDay).padStart(2,'0')}/${String(nextM).padStart(2,'0')}/${nextY}`;
                    const today = new Date();
                    const isOverdue = remaining > 0 && (today.getMonth() + 1 >= emiMon) && (today.getDate() > emiDay);
                    return (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-center">
                          <div><p className="text-[9px] text-zinc-500 font-mono">Total Payable</p><p className="text-xs font-mono font-bold text-white">{INR(totalPay)}</p></div>
                          <div><p className="text-[9px] text-zinc-500 font-mono">EMIs Paid</p><p className="text-xs font-mono font-bold text-emerald-400">{l.emiPaid || 0} / {l.emiTenureMonths}</p></div>
                          <div><p className="text-[9px] text-zinc-500 font-mono">Amount Paid</p><p className="text-xs font-mono font-bold text-emerald-400">{INR(paidAmt)}</p></div>
                          <div><p className="text-[9px] text-zinc-500 font-mono">Remaining EMIs</p><p className="text-xs font-mono font-bold text-red-400">{remaining}</p></div>
                          <div><p className="text-[9px] text-zinc-500 font-mono">Remaining Amt</p><p className="text-xs font-mono font-bold text-red-400">{INR(remainAmt)}</p></div>
                          <div><p className="text-[9px] text-zinc-500 font-mono">Next EMI</p><p className="text-xs font-mono font-bold text-amber-400">{nextEmiStr}</p></div>
                        </div>
                        {isOverdue && remaining > 0 && (
                          <div className="flex items-center gap-2 p-2 bg-red-950/40 border border-red-900/40 rounded-lg text-xs font-mono text-red-400">
                            <Bell className="w-3.5 h-3.5 flex-shrink-0" /> EMI overdue! Was due {String(emiDay).padStart(2,'0')}/{String(emiMon).padStart(2,'0')}/{emiYr}. Pay immediately.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <AttachmentBar attachments={l.attachments}
                    onFilesAdded={(files) => { const c = [...finDetails]; c[li].attachments = [...c[li].attachments, ...files]; setFinDetails(c); }}
                    onRemove={(id) => { const c = [...finDetails]; c[li].attachments = c[li].attachments.filter(a => a.id !== id); setFinDetails(c); }} />
                  <div className="flex justify-end mt-2"><CrudBar onSave={() => notify('Saved.', 'ok')} onDelete={() => { setFinDetails(p => p.filter(x => x.id !== l.id)); notify('Removed.', 'err'); }} /></div>
                  </div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════ INSURANCE ══════ */}
        {activeTab === 'insurance' && (
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /><span className="font-mono text-xs font-bold text-white uppercase">Insurance Policies</span></div>
              <button onClick={() => {
                setInsDetails([...insDetails, { id: uid(), policyType: 'Term Life', provider: '', policyNumber: '', sumAssured: 0, premiumAmount: 0, frequency: 'Annual', startYear: selYear, policyTermYears: 0, premiumsPaid: 0, dueDate: '', premiumStatus: 'Unpaid', nominee: '', attachments: [] }]);
              }} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer"><Plus className="w-3 h-3" /> Add Policy</button>
            </div>
            <div className="p-5 space-y-3">
              {insDetails.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-6">No insurance policies added.</p>}
              {insDetails.map((ins, ii) => (
                <div key={ins.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={() => toggleRecord(ins.id)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-amber-400 font-bold">{ins.policyType || 'New Policy'}</span>
                      {ins.provider && <span className="text-zinc-500">— {ins.provider}</span>}
                      {ins.sumAssured > 0 && <span className="text-cyan-400 bg-cyan-950/30 px-1.5 py-0.5 rounded text-[10px]">{INR(ins.sumAssured)}</span>}
                      {ins.premiumStatus === 'Unpaid' && <span className="text-red-400 bg-red-950/30 px-1.5 py-0.5 rounded text-[10px]">⚠️ Unpaid</span>}
                    </div>
                    {isRecordOpen(ins.id) ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {isRecordOpen(ins.id) && <div className="px-4 pb-4 space-y-3">
                  {/* Row 1: Policy Type + common fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wide mb-0.5">Policy Type</label>
                      <select value={ins.policyType} onChange={e => { const c = [...insDetails]; c[ii].policyType = e.target.value; setInsDetails(c); }}
                        className="w-full bg-zinc-900/80 border border-zinc-800 text-xs rounded-lg px-2.5 py-2 font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500/70 cursor-pointer">
                        {['Term Life','Whole Life','Endowment','ULIP','Health (Individual)','Health (Family Floater)','Critical Illness','Personal Accident','Vehicle','Home','Travel','Child Plan','Pension/Annuity','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <Field label="Provider" value={ins.provider} onChange={v => { const c = [...insDetails]; c[ii].provider = v; setInsDetails(c); }} />
                    <Field label="Policy Number" value={ins.policyNumber} onChange={v => { const c = [...insDetails]; c[ii].policyNumber = v; setInsDetails(c); }} />
                    <Field label="Nominee" value={ins.nominee} onChange={v => { const c = [...insDetails]; c[ii].nominee = v; setInsDetails(c); }} accent="text-amber-300" />
                  </div>
                  {/* Row 2: Dynamic fields based on Policy Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Life/Endowment/ULIP types show Sum Assured */}
                    {['Term Life','Whole Life','Endowment','ULIP','Child Plan','Critical Illness'].includes(ins.policyType) && (
                      <Field label="Sum Assured / Cover (₹)" value={ins.sumAssured} onChange={v => { const c = [...insDetails]; c[ii].sumAssured = Number(v) || 0; setInsDetails(c); }} type="number" accent="text-cyan-400 font-bold" />
                    )}
                    {/* Health types show Sum Insured */}
                    {['Health (Individual)','Health (Family Floater)','Personal Accident'].includes(ins.policyType) && (
                      <Field label="Sum Insured (₹)" value={ins.sumAssured} onChange={v => { const c = [...insDetails]; c[ii].sumAssured = Number(v) || 0; setInsDetails(c); }} type="number" accent="text-cyan-400 font-bold" />
                    )}
                    {/* Vehicle/Home/Travel show Insured Value */}
                    {['Vehicle','Home','Travel'].includes(ins.policyType) && (
                      <Field label="Insured Value (₹)" value={ins.sumAssured} onChange={v => { const c = [...insDetails]; c[ii].sumAssured = Number(v) || 0; setInsDetails(c); }} type="number" accent="text-cyan-400 font-bold" />
                    )}
                    {/* Other / Pension */}
                    {['Pension/Annuity','Other'].includes(ins.policyType) && (
                      <Field label="Cover Amount (₹)" value={ins.sumAssured} onChange={v => { const c = [...insDetails]; c[ii].sumAssured = Number(v) || 0; setInsDetails(c); }} type="number" accent="text-cyan-400 font-bold" />
                    )}
                    <Field label="Premium Amount (₹)" value={ins.premiumAmount} onChange={v => { const c = [...insDetails]; c[ii].premiumAmount = Number(v) || 0; setInsDetails(c); }} type="number" />
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wide mb-0.5">Frequency</label>
                      <select value={ins.frequency} onChange={e => { const c = [...insDetails]; c[ii].frequency = e.target.value; setInsDetails(c); }}
                        className="w-full bg-zinc-900/80 border border-zinc-800 text-xs rounded-lg px-2.5 py-2 font-mono text-white focus:outline-none focus:border-amber-500/70 cursor-pointer">
                        {['Monthly','Quarterly','Half-Yearly','Annual'].map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <Field label="Start Year" value={ins.startYear} onChange={v => { const c = [...insDetails]; c[ii].startYear = v; setInsDetails(c); }} />
                    {/* Long-term types show Policy Term */}
                    {!['Travel','Vehicle'].includes(ins.policyType) && (
                      <Field label="Policy Term (Years)" value={ins.policyTermYears} onChange={v => { const c = [...insDetails]; c[ii].policyTermYears = Number(v) || 0; setInsDetails(c); }} type="number" />
                    )}
                    <Field label="Premiums Paid (Count)" value={ins.premiumsPaid} onChange={v => { const c = [...insDetails]; c[ii].premiumsPaid = Number(v) || 0; setInsDetails(c); }} type="number" accent="text-emerald-400" />
                    <Field label="Due Date (DD/MM/YYYY)" value={ins.dueDate} onChange={v => { const c = [...insDetails]; c[ii].dueDate = v; setInsDetails(c); }} placeholder="e.g. 15/07/2026" />
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wide mb-0.5">Current Premium Status</label>
                      <select value={ins.premiumStatus} onChange={e => { const c = [...insDetails]; c[ii].premiumStatus = e.target.value; setInsDetails(c); }}
                        className={`w-full bg-zinc-900/80 border border-zinc-800 text-xs rounded-lg px-2.5 py-2 font-mono font-bold focus:outline-none focus:border-amber-500/70 cursor-pointer ${ins.premiumStatus === 'Paid' ? 'text-emerald-400' : 'text-red-400'}`}>
                        <option value="Paid">✅ Paid</option>
                        <option value="Unpaid">❌ Unpaid</option>
                      </select>
                    </div>
                  </div>
                  {/* Premium reminder */}
                  {ins.premiumStatus === 'Unpaid' && ins.dueDate && (
                    <div className="flex items-center gap-2 p-2.5 bg-red-950/40 border border-red-900/40 rounded-lg text-xs font-mono text-red-400">
                      <Bell className="w-3.5 h-3.5 flex-shrink-0" /> ⚠️ Premium UNPAID! Due: {ins.dueDate}. Pay immediately to keep policy active.
                    </div>
                  )}
                  {ins.premiumStatus === 'Paid' && ins.dueDate && (
                    <div className="flex items-center gap-2 p-2 bg-emerald-950/30 border border-emerald-900/30 rounded-lg text-xs font-mono text-emerald-400">
                      ✅ Current premium paid. Next due: {(() => {
                        const parts = ins.dueDate.split('/');
                        if (parts.length === 3) {
                          const nextY = ins.frequency === 'Annual' ? Number(parts[2]) + 1 : Number(parts[2]);
                          const nextM = ins.frequency === 'Monthly' ? (Number(parts[1]) % 12) + 1 : ins.frequency === 'Quarterly' ? ((Number(parts[1]) - 1 + 3) % 12) + 1 : ins.frequency === 'Half-Yearly' ? ((Number(parts[1]) - 1 + 6) % 12) + 1 : Number(parts[1]);
                          return `${parts[0]}/${String(nextM).padStart(2, '0')}/${ins.frequency === 'Annual' ? nextY : parts[2]}`;
                        }
                        return 'Next cycle';
                      })()}
                    </div>
                  )}
                  {/* Payment Summary — based on premiums PAID */}
                  {ins.premiumAmount > 0 && ins.policyTermYears > 0 && (() => {
                    const freqMap: Record<string,number> = { 'Monthly': 12, 'Quarterly': 4, 'Half-Yearly': 2, 'Annual': 1 };
                    const perYear = freqMap[ins.frequency] || 1;
                    const totalPayments = perYear * ins.policyTermYears;
                    const totalCost = ins.premiumAmount * totalPayments;
                    const paid = ins.premiumsPaid || 0;
                    const amtPaid = paid * ins.premiumAmount;
                    const remainingCount = Math.max(0, totalPayments - paid);
                    const amtRemaining = remainingCount * ins.premiumAmount;
                    const startY = Number(ins.startYear) || Number(selYear);
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-center">
                        <div><p className="text-[9px] text-zinc-500 font-mono">Total Premiums</p><p className="text-xs font-mono font-bold text-white">{totalPayments}</p></div>
                        <div><p className="text-[9px] text-zinc-500 font-mono">Total Cost</p><p className="text-xs font-mono font-bold text-white">{INR(totalCost)}</p></div>
                        <div><p className="text-[9px] text-zinc-500 font-mono">Paid ({paid})</p><p className="text-xs font-mono font-bold text-emerald-400">{INR(amtPaid)}</p></div>
                        <div><p className="text-[9px] text-zinc-500 font-mono">Remaining ({remainingCount})</p><p className="text-xs font-mono font-bold text-red-400">{INR(amtRemaining)}</p></div>
                        <div><p className="text-[9px] text-zinc-500 font-mono">Ends</p><p className="text-xs font-mono font-bold text-amber-400">{startY + ins.policyTermYears}</p></div>
                        <div><p className="text-[9px] text-zinc-500 font-mono">Progress</p>
                          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (paid / totalPayments) * 100)}%` }} /></div>
                        </div>
                      </div>
                    );
                  })()}
                  <AttachmentBar attachments={ins.attachments}
                    onFilesAdded={(files) => { const c = [...insDetails]; c[ii].attachments = [...c[ii].attachments, ...files]; setInsDetails(c); }}
                    onRemove={(id) => { const c = [...insDetails]; c[ii].attachments = c[ii].attachments.filter(a => a.id !== id); setInsDetails(c); }} />
                  <div className="flex justify-end mt-3"><CrudBar onSave={() => notify('Saved.', 'ok')} onDelete={() => { setInsDetails(p => p.filter(x => x.id !== ins.id)); notify('Removed.', 'err'); }} /></div>
                  </div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════ INVESTMENTS ══════ */}
        {activeTab === 'investments' && (
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-emerald-400" /><span className="font-mono text-xs font-bold text-white uppercase">Investments Portfolio</span>
                {metrics.totalInv > 0 && <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900">{INR(metrics.totalInv)}</span>}
              </div>
              <button onClick={() => {
                setInvDetails([...invDetails, { id: uid(), investmentType: 'SIP', assetClass: '', platformOrBank: '', frequency: 'Monthly', sipAmount: 0, currentValue: 0, investedAmount: 0, maturityYear: '', accountNumber: '', nominee: '', attachments: [] }]);
              }} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer"><Plus className="w-3 h-3" /> Add Asset</button>
            </div>
            <div className="p-5 space-y-3">
              {invDetails.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-6">No investments added yet.</p>}
              {invDetails.map((inv, ii) => (
                <div key={inv.id} className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={() => toggleRecord(inv.id)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-900/40 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-amber-400 font-bold">{inv.investmentType || 'Investment'}</span>
                      {inv.assetClass && <span className="text-zinc-500">— {inv.assetClass}</span>}
                      {inv.currentValue > 0 && <span className="text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded text-[10px]">{INR(inv.currentValue)}</span>}
                    </div>
                    {isRecordOpen(inv.id) ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {isRecordOpen(inv.id) && <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Investment Type Dropdown */}
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wide mb-0.5">Investment Type</label>
                      <select value={inv.investmentType} onChange={e => {
                        const c = [...invDetails]; c[ii].investmentType = e.target.value;
                        // Auto-populate asset class based on type
                        const typeMap: Record<string,string> = { 'SIP': 'Systematic Investment Plan', 'SWP': 'Systematic Withdrawal Plan', 'Mutual Fund': 'Mutual Fund (Lumpsum)', 'Stocks': 'Equity Shares', 'FD': 'Fixed Deposit', 'RD': 'Recurring Deposit', 'PPF': 'Public Provident Fund', 'NPS': 'National Pension', 'Gold/SGB': 'Gold / Sovereign Gold Bond', 'Crypto': 'Cryptocurrency', 'Real Estate': 'Property / Land', 'EPF': 'Employee Provident Fund', 'Other': '' };
                        c[ii].assetClass = typeMap[e.target.value] || c[ii].assetClass;
                        setInvDetails(c);
                      }} className="w-full bg-zinc-900/80 border border-zinc-800 text-xs rounded-lg px-2.5 py-2 font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500/70 cursor-pointer">
                        {['SIP','SWP','Mutual Fund','Stocks','FD','RD','PPF','NPS','Gold/SGB','Crypto','Real Estate','EPF','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <Field label="Asset Class" value={inv.assetClass} onChange={v => { const c = [...invDetails]; c[ii].assetClass = v; setInvDetails(c); }} accent="text-white" />
                    <Field label="Platform / Bank" value={inv.platformOrBank} onChange={v => { const c = [...invDetails]; c[ii].platformOrBank = v; setInvDetails(c); }} />
                    {/* Frequency — shown for recurring investments */}
                    {(['SIP','SWP','Mutual Fund','RD','PPF','NPS'].includes(inv.investmentType)) && (
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wide mb-0.5">Frequency</label>
                        <select value={inv.frequency} onChange={e => { const c = [...invDetails]; c[ii].frequency = e.target.value; setInvDetails(c); }}
                          className="w-full bg-zinc-900/80 border border-zinc-800 text-xs rounded-lg px-2.5 py-2 font-mono text-white focus:outline-none focus:border-amber-500/70 cursor-pointer">
                          {['Monthly','Quarterly','Half-Yearly','Yearly','One-Time'].map(f => <option key={f}>{f}</option>)}
                        </select>
                      </div>
                    )}
                    {(['SIP','SWP','Mutual Fund','RD'].includes(inv.investmentType)) && (
                      <Field label={inv.investmentType === 'SIP' ? `SIP Amount (₹/${inv.frequency === 'Yearly' ? 'yr' : inv.frequency === 'Quarterly' ? 'qtr' : 'mo'})` : inv.investmentType === 'SWP' ? 'SWP Withdrawal (₹)' : inv.investmentType === 'RD' ? 'RD Installment (₹)' : 'Lumpsum Amount (₹)'} value={inv.sipAmount} onChange={v => { const c = [...invDetails]; c[ii].sipAmount = Number(v) || 0; setInvDetails(c); }} type="number" accent="text-cyan-400" />
                    )}
                    <Field label="Current Value (₹)" value={inv.currentValue} onChange={v => { const c = [...invDetails]; c[ii].currentValue = Number(v) || 0; setInvDetails(c); }} type="number" accent="text-emerald-400 font-bold" />
                    <Field label="Invested Amount (₹)" value={inv.investedAmount} onChange={v => { const c = [...invDetails]; c[ii].investedAmount = Number(v) || 0; setInvDetails(c); }} type="number" />
                    <Field label="Maturity Year" value={inv.maturityYear} onChange={v => { const c = [...invDetails]; c[ii].maturityYear = v; setInvDetails(c); }} />
                    <Field label="Account / Folio #" value={inv.accountNumber} onChange={v => { const c = [...invDetails]; c[ii].accountNumber = v; setInvDetails(c); }} />
                    <Field label="Nominee" value={inv.nominee} onChange={v => { const c = [...invDetails]; c[ii].nominee = v; setInvDetails(c); }} accent="text-amber-300" />
                  </div>
                  {/* Gain/Loss indicator */}
                  {inv.investedAmount > 0 && inv.currentValue > 0 && (() => {
                    const gain = inv.currentValue - inv.investedAmount;
                    const pct = ((gain / inv.investedAmount) * 100).toFixed(1);
                    const isUp = gain >= 0;
                    return (
                      <div className={`p-2.5 rounded-lg border text-center text-xs font-mono ${isUp ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400' : 'bg-red-950/30 border-red-900/40 text-red-400'}`}>
                        {isUp ? '📈' : '📉'} {isUp ? 'Gain' : 'Loss'}: {INR(Math.abs(gain))} ({isUp ? '+' : ''}{pct}%)
                      </div>
                    );
                  })()}
                  <AttachmentBar attachments={inv.attachments}
                    onFilesAdded={(files) => { const c = [...invDetails]; c[ii].attachments = [...c[ii].attachments, ...files]; setInvDetails(c); }}
                    onRemove={(id) => { const c = [...invDetails]; c[ii].attachments = c[ii].attachments.filter(a => a.id !== id); setInvDetails(c); }} />
                  <div className="flex justify-end mt-3"><CrudBar onSave={() => notify('Saved.', 'ok')} onDelete={() => { setInvDetails(p => p.filter(x => x.id !== inv.id)); notify('Removed.', 'err'); }} /></div>
                  </div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════ VEHICLES ══════ */}
        {activeTab === 'vehicles' && (
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><Car className="w-4 h-4 text-amber-500" /><span className="font-mono text-xs font-bold text-white uppercase">Vehicles &amp; Registration</span></div>
              <button onClick={() => {
                setVehDetails([...vehDetails, { id: uid(), ownerName: '', modelName: '', vehicleType: '', registrationNumber: '', insuranceExpiry: '', rcNumber: '', attachments: [] }]);
              }} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer"><Plus className="w-3 h-3" /> Add Vehicle</button>
            </div>
            <div className="p-5 space-y-3">
              {vehDetails.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-6">No vehicles registered.</p>}
              {vehDetails.map((v, vi) => (
                <div key={v.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={() => toggleRecord(v.id)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-amber-400 font-bold">{v.modelName || 'New Vehicle'}</span>
                      {v.registrationNumber && <span className="text-zinc-500">{v.registrationNumber}</span>}
                    </div>
                    {isRecordOpen(v.id) ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {isRecordOpen(v.id) && <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Field label="Owner" value={v.ownerName} onChange={val => { const c = [...vehDetails]; c[vi].ownerName = val; setVehDetails(c); }} />
                    <Field label="Model" value={v.modelName} onChange={val => { const c = [...vehDetails]; c[vi].modelName = val; setVehDetails(c); }} accent="text-white font-bold" />
                    <Field label="Type" value={v.vehicleType} onChange={val => { const c = [...vehDetails]; c[vi].vehicleType = val; setVehDetails(c); }} />
                    <Field label="Registration #" value={v.registrationNumber} onChange={val => { const c = [...vehDetails]; c[vi].registrationNumber = val; setVehDetails(c); }} accent="text-amber-400 font-bold" />
                    <Field label="Insurance Expiry" value={v.insuranceExpiry} onChange={val => { const c = [...vehDetails]; c[vi].insuranceExpiry = val; setVehDetails(c); }} />
                    <Field label="RC Number" value={v.rcNumber} onChange={val => { const c = [...vehDetails]; c[vi].rcNumber = val; setVehDetails(c); }} />
                  </div>
                  <AttachmentBar attachments={v.attachments}
                    onFilesAdded={(files) => { const c = [...vehDetails]; c[vi].attachments = [...c[vi].attachments, ...files]; setVehDetails(c); }}
                    onRemove={(id) => { const c = [...vehDetails]; c[vi].attachments = c[vi].attachments.filter(a => a.id !== id); setVehDetails(c); }} />
                  <div className="flex justify-end mt-3"><CrudBar onSave={() => notify('Saved.', 'ok')} onDelete={() => { setVehDetails(p => p.filter(x => x.id !== v.id)); notify('Removed.', 'err'); }} /></div>
                  </div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════ MEDICAL ══════ */}
        {activeTab === 'medical' && (
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-rose-500" /><span className="font-mono text-xs font-bold text-white uppercase">Medical Records &amp; Prescriptions</span></div>
              <button onClick={() => {
                setMedDetails([...medDetails, { id: uid(), personName: '', bloodGroup: '', conditions: '', medications: '', allergies: '', doctorContact: '', hospitalPreference: '', attachments: [] }]);
              }} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer"><Plus className="w-3 h-3" /> Add Record</button>
            </div>
            <div className="p-5 space-y-3">
              {medDetails.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-6">No medical records yet.</p>}
              {medDetails.map((m, mi) => (
                <div key={m.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={() => toggleRecord(m.id)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-amber-400 font-bold">{m.personName || 'New Record'}</span>
                      {m.bloodGroup && <span className="text-rose-400 bg-rose-950/30 px-1.5 py-0.5 rounded text-[10px]">🩸 {m.bloodGroup}</span>}
                    </div>
                    {isRecordOpen(m.id) ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {isRecordOpen(m.id) && <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <Field label="Person" value={m.personName} onChange={v => { const c = [...medDetails]; c[mi].personName = v; setMedDetails(c); }} accent="text-white font-bold" />
                    <Field label="Blood Group" value={m.bloodGroup} onChange={v => { const c = [...medDetails]; c[mi].bloodGroup = v; setMedDetails(c); }} accent="text-rose-400 font-bold" />
                    <Field label="Conditions" value={m.conditions} onChange={v => { const c = [...medDetails]; c[mi].conditions = v; setMedDetails(c); }} />
                    <Field label="Medications" value={m.medications} onChange={v => { const c = [...medDetails]; c[mi].medications = v; setMedDetails(c); }} accent="text-amber-300" />
                    <Field label="Allergies" value={m.allergies} onChange={v => { const c = [...medDetails]; c[mi].allergies = v; setMedDetails(c); }} />
                    <Field label="Doctor Contact" value={m.doctorContact} onChange={v => { const c = [...medDetails]; c[mi].doctorContact = v; setMedDetails(c); }} />
                    <div className="md:col-span-2"><Field label="Preferred Hospital" value={m.hospitalPreference} onChange={v => { const c = [...medDetails]; c[mi].hospitalPreference = v; setMedDetails(c); }} /></div>
                  </div>
                  <AttachmentBar attachments={m.attachments}
                    onFilesAdded={(files) => { const c = [...medDetails]; c[mi].attachments = [...c[mi].attachments, ...files]; setMedDetails(c); }}
                    onRemove={(id) => { const c = [...medDetails]; c[mi].attachments = c[mi].attachments.filter(a => a.id !== id); setMedDetails(c); }} />
                  <div className="flex justify-end mt-3"><CrudBar onSave={() => notify('Saved.', 'ok')} onDelete={() => { setMedDetails(p => p.filter(x => x.id !== m.id)); notify('Removed.', 'err'); }} /></div>
                  </div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════ APPLIANCES ══════ */}
        {activeTab === 'appliances' && (
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-xs font-bold text-white uppercase">Home Appliances &amp; Warranty Tracker</span>
                <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 font-mono">{appliances.length}</span>
              </div>
              <button onClick={() => {
                setAppliances([...appliances, { id: uid(), category: 'Kitchen', applianceName: '', brand: '', modelNumber: '', serialNumber: '', purchaseDate: '', purchasePrice: 0, warrantyExpiry: '', warrantyStatus: 'Active', condition: 'Working', location: 'Kitchen', serviceContact: '', notes: '', attachments: [] }]);
                notify('New appliance added.', 'info');
              }} className="flex items-center gap-1 bg-teal-500/10 border border-teal-500/25 text-teal-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer">
                <Plus className="w-3 h-3" /> Add Appliance
              </button>
            </div>
            <div className="p-5 space-y-3">
              {appliances.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-6">No appliances registered. Track your home devices, warranties, and service contacts.</p>}
              {appliances.map((ap, ai) => (
                <div key={ap.id} className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                  {/* Collapsible header */}
                  <button onClick={() => toggleRecord(ap.id)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-lg">{
                        ap.category === 'Kitchen' ? '🍳' : ap.category === 'Cooling' ? '❄️' : ap.category === 'Laundry' ? '👕' :
                        ap.category === 'Entertainment' ? '📺' : ap.category === 'Computing' ? '💻' : ap.category === 'Cleaning' ? '🧹' :
                        ap.category === 'Lighting' ? '💡' : ap.category === 'Water' ? '🚿' : '🔌'
                      }</span>
                      <span className="text-amber-400 font-bold">{ap.applianceName || 'New Appliance'}</span>
                      {ap.brand && <span className="text-zinc-500">— {ap.brand}</span>}
                      {ap.warrantyStatus === 'Active' && <span className="text-[9px] bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/40">✅ Warranty</span>}
                      {ap.warrantyStatus === 'Expired' && <span className="text-[9px] bg-red-950/40 text-red-400 px-1.5 py-0.5 rounded border border-red-900/40">⚠️ Expired</span>}
                      {ap.condition === 'Repair Needed' && <span className="text-[9px] bg-amber-950/40 text-amber-400 px-1.5 py-0.5 rounded border border-amber-900/40">🔧 Repair</span>}
                    </div>
                    {isRecordOpen(ap.id) ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>

                  {isRecordOpen(ap.id) && <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Category dropdown */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-1">Category</label>
                        <select value={ap.category} onChange={e => { const c = [...appliances]; c[ai].category = e.target.value; setAppliances(c); }}
                          className="w-full bg-white border border-slate-200 text-sm rounded-lg px-3 py-2.5 font-mono text-black focus:outline-none focus:border-teal-400 cursor-pointer shadow-sm">
                          {['Kitchen','Cooling','Laundry','Entertainment','Computing','Cleaning','Lighting','Water','Furniture','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <Field label="Appliance Name" value={ap.applianceName} onChange={v => { const c = [...appliances]; c[ai].applianceName = v; setAppliances(c); }} placeholder="e.g. Refrigerator, AC, Mixer" />
                      <Field label="Brand" value={ap.brand} onChange={v => { const c = [...appliances]; c[ai].brand = v; setAppliances(c); }} placeholder="e.g. Samsung, LG, Godrej" />
                      <Field label="Model Number" value={ap.modelNumber} onChange={v => { const c = [...appliances]; c[ai].modelNumber = v; setAppliances(c); }} />
                      <Field label="Serial Number" value={ap.serialNumber} onChange={v => { const c = [...appliances]; c[ai].serialNumber = v; setAppliances(c); }} />
                      <Field label="Purchase Date (DD/MM/YYYY)" value={ap.purchaseDate} onChange={v => { const c = [...appliances]; c[ai].purchaseDate = v; setAppliances(c); }} placeholder="e.g. 15/03/2024" />
                      <Field label="Purchase Price (₹)" value={ap.purchasePrice} onChange={v => { const c = [...appliances]; c[ai].purchasePrice = Number(v) || 0; setAppliances(c); }} type="number" />
                      <Field label="Warranty Expiry (DD/MM/YYYY)" value={ap.warrantyExpiry} onChange={v => { const c = [...appliances]; c[ai].warrantyExpiry = v; setAppliances(c); }} placeholder="e.g. 15/03/2027" />
                      {/* Warranty Status */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-1">Warranty Status</label>
                        <select value={ap.warrantyStatus} onChange={e => { const c = [...appliances]; c[ai].warrantyStatus = e.target.value; setAppliances(c); }}
                          className={`w-full bg-white border border-slate-200 text-sm rounded-lg px-3 py-2.5 font-mono font-bold focus:outline-none focus:border-teal-400 cursor-pointer shadow-sm ${ap.warrantyStatus === 'Active' ? 'text-emerald-600' : 'text-red-600'}`}>
                          <option value="Active">✅ Active</option>
                          <option value="Expired">⚠️ Expired</option>
                        </select>
                      </div>
                      {/* Condition */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-1">Condition</label>
                        <select value={ap.condition} onChange={e => { const c = [...appliances]; c[ai].condition = e.target.value; setAppliances(c); }}
                          className={`w-full bg-white border border-slate-200 text-sm rounded-lg px-3 py-2.5 font-mono font-bold focus:outline-none focus:border-teal-400 cursor-pointer shadow-sm ${ap.condition === 'Working' ? 'text-emerald-600' : ap.condition === 'Repair Needed' ? 'text-amber-600' : 'text-red-600'}`}>
                          <option value="Working">✅ Working</option>
                          <option value="Repair Needed">🔧 Repair Needed</option>
                          <option value="Not Working">❌ Not Working</option>
                        </select>
                      </div>
                      {/* Location */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wide mb-1">Location in Home</label>
                        <select value={ap.location} onChange={e => { const c = [...appliances]; c[ai].location = e.target.value; setAppliances(c); }}
                          className="w-full bg-white border border-slate-200 text-sm rounded-lg px-3 py-2.5 font-mono text-black focus:outline-none focus:border-teal-400 cursor-pointer shadow-sm">
                          {['Kitchen','Living Room','Master Bedroom','Bedroom 2','Bedroom 3','Bathroom','Balcony','Dining Room','Study Room','Store Room','Garage','Terrace','Other'].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <Field label="Service/Repair Contact" value={ap.serviceContact} onChange={v => { const c = [...appliances]; c[ai].serviceContact = v; setAppliances(c); }} placeholder="Phone or name" />
                    </div>

                    {/* Notes */}
                    <Field label="Notes (AMC details, service history, etc.)" value={ap.notes} onChange={v => { const c = [...appliances]; c[ai].notes = v; setAppliances(c); }} placeholder="Annual maintenance contract, last service date..." />

                    {/* Warranty reminder */}
                    {ap.warrantyStatus === 'Active' && ap.warrantyExpiry && (() => {
                      const parts = ap.warrantyExpiry.split('/');
                      if (parts.length === 3) {
                        const expDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                        const today = new Date();
                        const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        if (daysLeft > 0 && daysLeft <= 90) {
                          return (
                            <div className="flex items-center gap-2 p-2.5 bg-amber-950/40 border border-amber-900/40 rounded-lg text-xs font-mono text-amber-400">
                              <Bell className="w-3.5 h-3.5 flex-shrink-0" /> ⏰ Warranty expires in {daysLeft} days ({ap.warrantyExpiry}). Consider extending or getting AMC.
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}

                    <AttachmentBar attachments={ap.attachments}
                      onFilesAdded={(files) => { const c = [...appliances]; c[ai].attachments = [...c[ai].attachments, ...files]; setAppliances(c); }}
                      onRemove={(id) => { const c = [...appliances]; c[ai].attachments = c[ai].attachments.filter(a => a.id !== id); setAppliances(c); }} />
                    <div className="flex justify-end mt-2">
                      <CrudBar onSave={() => notify(`${ap.applianceName || 'Appliance'} saved.`, 'ok')} onDelete={() => { setAppliances(p => p.filter(x => x.id !== ap.id)); notify('Appliance removed.', 'err'); }} />
                    </div>
                  </div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════ DOCUMENT MANAGER ══════ */}
        {activeTab === 'documents' && (
          <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Hidden file inputs */}
            <input type="file" ref={fileImportRef} className="hidden" multiple accept="*/*" onChange={handleFileImport} />
            <input type="file" ref={bulkImportRef} className="hidden" accept=".json" onChange={handleBulkImport} />

            {/* Header */}
            <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-xs font-bold text-white uppercase">Document Manager — All Files in One Place</span>
                <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 font-mono">{documents.length} docs</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button onClick={() => {
                  setDocuments([...documents, { id: uid(), documentName: '', category: 'Personal', belongsTo: '', notes: '', fileName: '', fileSize: '', fileType: '', fileData: '', uploadDate: new Date().toISOString().split('T')[0] }]);
                  notify('New document slot created. Fill details and import a file.', 'info');
                }} className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer">
                  <Plus className="w-3 h-3" /> Add Document
                </button>
                <button onClick={() => fileImportRef.current?.click()}
                  className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer">
                  <Upload className="w-3 h-3" /> Import Files
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">

              {/* ── Bulk Import / Export All bar ── */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400 mr-1">Bulk Actions:</span>
                <button onClick={() => fileImportRef.current?.click()}
                  className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Import File(s) from Device
                </button>
                <button onClick={handleExportAll}
                  className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold cursor-pointer transition-colors"
                  title="Export all documents as a single .json archive">
                  <Download className="w-3.5 h-3.5" /> Export All Documents (.json)
                </button>
                <button onClick={() => bulkImportRef.current?.click()}
                  className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-[11px] font-mono cursor-pointer transition-colors"
                  title="Import a previously exported .json document archive">
                  <FolderOpen className="w-3.5 h-3.5" /> Restore from Backup (.json)
                </button>
                {documents.length > 0 && (
                  <span className="text-[10px] font-mono text-zinc-500 ml-auto">
                    {documents.filter(d => d.fileData).length} of {documents.length} have files attached
                  </span>
                )}
              </div>

              {/* Search bar */}
              <div className="relative max-w-sm">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input type="text" placeholder="Search documents..." value={searchDoc} onChange={e => setSearchDoc(e.target.value)}
                  className="bg-zinc-900 text-xs font-mono text-white rounded-lg pl-9 pr-3 py-2 w-full border border-zinc-800 focus:outline-none focus:border-amber-500/50" />
              </div>

              {/* Category quick filter chips */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Personal', 'Financial', 'Insurance', 'Education', 'Medical', 'Legal', 'Vehicle', 'Other'].map(cat => (
                  <button key={cat} onClick={() => setSearchDoc(cat === 'All' ? '' : cat)}
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                      (cat === 'All' && !searchDoc) || searchDoc === cat
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}>{cat}</button>
                ))}
              </div>

              {documents.length === 0 && (
                <div className="text-center py-10 space-y-3">
                  <FolderOpen className="w-12 h-12 text-zinc-700 mx-auto" />
                  <p className="text-xs text-zinc-500 font-mono">No documents stored yet.</p>
                  <p className="text-[11px] text-zinc-600 font-mono max-w-md mx-auto">Click "Import Files" to upload certificates, ID proofs, or any file from your device. Or "Add Document" to create a record first.</p>
                </div>
              )}

              {/* Document cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents
                  .filter(d => !searchDoc || d.documentName.toLowerCase().includes(searchDoc.toLowerCase()) || d.category.toLowerCase().includes(searchDoc.toLowerCase()) || d.belongsTo.toLowerCase().includes(searchDoc.toLowerCase()))
                  .map((doc) => {
                    const realIdx = documents.findIndex(d => d.id === doc.id);
                    const hasFile = !!doc.fileData;
                    const fileExt = doc.fileName ? doc.fileName.split('.').pop()?.toLowerCase() || '' : '';
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(fileExt);
                    return (
                      <div key={doc.id} className={`border rounded-xl p-4 space-y-3 transition-colors ${hasFile ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-900/20 border-dashed border-zinc-700'}`}>
                        {/* Title & category row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${hasFile ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                              {hasFile ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-amber-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <input type="text" placeholder="Document Title" className="bg-transparent text-white font-mono font-bold text-xs focus:outline-none border-b border-transparent focus:border-zinc-700 w-full"
                                value={doc.documentName} onChange={e => { const c = [...documents]; c[realIdx].documentName = e.target.value; setDocuments(c); }} />
                              <div className="flex items-center gap-2 mt-0.5">
                                <select className="bg-transparent text-[10px] font-mono text-amber-400 focus:outline-none cursor-pointer"
                                  value={doc.category} onChange={e => { const c = [...documents]; c[realIdx].category = e.target.value; setDocuments(c); }}>
                                  {['Personal', 'Financial', 'Insurance', 'Education', 'Medical', 'Legal', 'Vehicle', 'Other'].map(cat => (
                                    <option key={cat} value={cat} className="bg-zinc-900 text-white">{cat}</option>
                                  ))}
                                </select>
                                <span className="text-[10px] text-zinc-600">|</span>
                                <span className="text-[10px] font-mono text-zinc-500">{doc.uploadDate}</span>
                                {hasFile && <span className="text-[9px] font-mono text-emerald-500 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40">FILE ATTACHED</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Image preview if applicable */}
                        {hasFile && isImage && (
                          <div className="rounded-lg overflow-hidden border border-zinc-800 bg-black/40 max-h-40 flex items-center justify-center">
                            <img src={doc.fileData} alt={doc.documentName || doc.fileName} className="max-h-40 object-contain" />
                          </div>
                        )}

                        {/* Metadata fields */}
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Belongs To" value={doc.belongsTo} onChange={v => { const c = [...documents]; c[realIdx].belongsTo = v; setDocuments(c); }} placeholder="Person name" />
                          <Field label="Notes" value={doc.notes} onChange={v => { const c = [...documents]; c[realIdx].notes = v; setDocuments(c); }} placeholder="Reference note" />
                        </div>

                        {/* File actions bar */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
                          <div className="flex items-center gap-2 flex-wrap">
                            {hasFile ? (
                              <>
                                <span className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[11px] font-mono text-zinc-300 max-w-[200px]">
                                  📄 <span className="truncate">{doc.fileName}</span> <span className="text-zinc-600 flex-shrink-0">({doc.fileSize})</span>
                                </span>
                                {/* EXPORT / Download this file */}
                                <button onClick={() => handleExportSingleDoc(doc)}
                                  className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-2 py-1 rounded text-[10px] font-mono cursor-pointer transition-colors"
                                  title="Export / Download this file to your device">
                                  <Download className="w-3 h-3" /> Export
                                </button>
                                {/* Replace file */}
                                <button onClick={() => { docReplaceId.current = doc.id; docReplaceRef.current?.click(); }}
                                  className="text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-[10px] font-mono cursor-pointer"
                                  title="Replace with a different file">
                                  🔄 Replace
                                </button>
                              </>
                            ) : (
                              <button onClick={() => { docReplaceId.current = doc.id; docReplaceRef.current?.click(); }}
                                className="flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2.5 py-1.5 rounded text-[10px] font-mono cursor-pointer transition-colors"
                                title="Import a file from your device for this document">
                                <Upload className="w-3 h-3" /> Import File
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => notify(`Document "${doc.documentName || 'Untitled'}" saved.`, 'ok')}
                              className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded text-[10px] font-mono cursor-pointer">Save</button>
                            <button onClick={() => { setDocuments(p => p.filter(x => x.id !== doc.id)); notify('Document removed.', 'err'); }}
                              className="bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-1 rounded text-[10px] font-mono cursor-pointer">Delete</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Hidden input for single doc replace */}
            <input type="file" ref={docReplaceRef} className="hidden" accept="*/*" onChange={handleDocReplace} />
          </section>
        )}

        {/* ══════ PASSWORD VAULT ══════ */}
        {activeTab === 'passwords' && (
          <section className="bg-zinc-950 border border-amber-500/20 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-zinc-900 to-amber-950/20 px-5 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-amber-500" /><span className="font-mono text-xs font-bold text-amber-400 uppercase">🔒 Password Vault — Secure Credential Storage</span></div>
              <button onClick={() => {
                setPasswords([{ id: uid(), category: 'Netbanking', serviceName: '', username: '', passwordKey: '', websiteUrl: '', securityQuestionNotes: '', updatedAt: new Date().toISOString().split('T')[0] }, ...passwords]);
              }} className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-black px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold cursor-pointer"><Plus className="w-3 h-3" /> Add Credentials</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/15 text-[11px] text-zinc-400 font-mono">
                ⚠️ All credentials are stored locally on this device only. In case of emergency, family members can access this vault to manage bank, demat, and government portals.
              </div>
              <div className="relative max-w-sm">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input type="text" placeholder="Search accounts..." value={searchPwd} onChange={e => setSearchPwd(e.target.value)}
                  className="bg-zinc-900 text-xs font-mono text-white rounded-lg pl-9 pr-3 py-2 w-full border border-zinc-800 focus:outline-none focus:border-amber-500/50" />
              </div>

              {passwords.length === 0 && <p className="text-xs text-zinc-500 font-mono text-center py-8">No credentials saved yet. Add your login details securely.</p>}

              <div className="space-y-3">
                {passwords
                  .filter(p => !searchPwd || p.serviceName.toLowerCase().includes(searchPwd.toLowerCase()) || p.category.toLowerCase().includes(searchPwd.toLowerCase()))
                  .map((p) => {
                    const realIdx = passwords.findIndex(x => x.id === p.id);
                    const isRev = revealed[p.id] || false;
                    return (
                      <div key={p.id} className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
                        {/* Collapsible header */}
                        <button onClick={() => toggleRecord(p.id)} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-900/40 transition-colors">
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <span className="text-amber-400 font-bold">{p.serviceName || 'New Credential'}</span>
                            {p.category && <span className="text-[9px] bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">{p.category}</span>}
                            {p.username && <span className="text-zinc-500 truncate max-w-[120px]">({p.username})</span>}
                          </div>
                          {isRecordOpen(p.id) ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                        </button>

                        {isRecordOpen(p.id) && <div className="px-4 pb-4 space-y-3 border-t border-zinc-900">
                        {/* Category + Name + Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                          <div className="flex items-center gap-2">
                            <select value={p.category} onChange={e => { const c = [...passwords]; c[realIdx].category = e.target.value; setPasswords(c); }}
                              className="bg-zinc-900 text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded border border-zinc-800 cursor-pointer focus:outline-none">
                              {['Netbanking', 'Investment', 'Government', 'Email', 'Social Media', 'Shopping', 'Insurance', 'Other'].map(cat => (
                                <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                              ))}
                            </select>
                            <input type="text" placeholder="Service Name" value={p.serviceName} onChange={e => { const c = [...passwords]; c[realIdx].serviceName = e.target.value; setPasswords(c); }}
                              className="bg-transparent text-white font-mono font-bold text-xs focus:outline-none border-b border-transparent focus:border-zinc-700 w-52" />
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => notify(`"${p.serviceName || 'Account'}" saved.`, 'ok')}
                              className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded text-[10px] font-mono cursor-pointer">Save</button>
                            <button onClick={() => { setPasswords(prev => prev.filter(x => x.id !== p.id)); notify('Credential purged.', 'err'); }}
                              className="bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-1 rounded text-[10px] font-mono cursor-pointer">Delete</button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[9px] text-zinc-500 font-mono uppercase block mb-0.5">Username / ID</label>
                            <div className="flex items-center gap-1 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                              <input type="text" value={p.username} onChange={e => { const c = [...passwords]; c[realIdx].username = e.target.value; setPasswords(c); }}
                                className="bg-transparent text-zinc-200 font-mono text-xs w-full focus:outline-none" placeholder="Username" />
                              <Copy className="w-3 h-3 text-zinc-500 hover:text-amber-400 cursor-pointer flex-shrink-0" onClick={() => copyText(p.username, 'username')} />
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] text-zinc-500 font-mono uppercase block mb-0.5">Password</label>
                            <div className="flex items-center gap-1 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                              <input type={isRev ? 'text' : 'password'} value={p.passwordKey} onChange={e => { const c = [...passwords]; c[realIdx].passwordKey = e.target.value; setPasswords(c); }}
                                className="bg-transparent text-amber-400 font-bold font-mono text-xs w-full focus:outline-none tracking-wide" placeholder="Password" />
                              <button onClick={() => setRevealed(prev => ({ ...prev, [p.id]: !isRev }))} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
                                {isRev ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <Copy className="w-3 h-3 text-zinc-500 hover:text-amber-400 cursor-pointer flex-shrink-0" onClick={() => copyText(p.passwordKey, 'password')} />
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] text-zinc-500 font-mono uppercase block mb-0.5">Website URL</label>
                            <input type="text" value={p.websiteUrl} onChange={e => { const c = [...passwords]; c[realIdx].websiteUrl = e.target.value; setPasswords(c); }}
                              className="w-full bg-zinc-900 p-2 rounded-lg border border-zinc-800 text-blue-400 font-mono text-xs focus:outline-none focus:border-amber-500/50" placeholder="https://" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] text-zinc-500 font-mono uppercase block mb-0.5">Security Questions / Recovery Hints</label>
                          <input type="text" value={p.securityQuestionNotes} onChange={e => { const c = [...passwords]; c[realIdx].securityQuestionNotes = e.target.value; setPasswords(c); }}
                            className="w-full bg-zinc-900/60 text-zinc-400 p-2 rounded-lg border border-zinc-900 text-xs font-mono focus:outline-none focus:border-amber-500/50" placeholder="Recovery hints..." />
                        </div>
                        </div>}
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* ══════ EMERGENCY PROTOCOL ══════ */}
        {activeTab === 'emergency' && (
          <div className="space-y-6">
            <section className="bg-zinc-950 border-l-2 border-amber-500/70 rounded-2xl p-6 border border-zinc-800">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-red-400" />
                <h2 className="text-sm font-bold font-mono uppercase text-white">Continuity Protocol — Emergency Family Reference</h2>
              </div>
              <p className="text-xs text-zinc-400 mb-5 font-mono leading-relaxed max-w-3xl">
                If the primary family member is no longer available or has passed away, follow these sequential steps to assume stewardship of family finances, insurance claims, and legal procedures. Keep this section up-to-date.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyProtocols.map((p, i) => (
                  <div key={i} className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <h4 className="text-xs font-mono font-bold text-amber-400 mb-2">{p.title}</h4>
                    <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">{p.steps}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xs font-mono font-bold uppercase text-white mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-zinc-400" /> Desktop &amp; Mobile App Instructions
              </h3>
              <ul className="text-[11px] font-mono text-zinc-400 space-y-2 list-disc pl-5 leading-relaxed">
                <li><strong className="text-white">Windows .EXE:</strong> Use <code className="bg-zinc-900 px-1 text-amber-400">Electron</code> or <code className="bg-zinc-900 px-1 text-amber-400">Tauri</code> to wrap this app into a standalone desktop application.</li>
                <li><strong className="text-white">Mobile App:</strong> Use <code className="bg-zinc-900 px-1 text-amber-400">Capacitor</code> to package as an Android/iOS app with <code className="bg-zinc-900 px-1 text-amber-400">npx cap add android</code>.</li>
                <li><strong className="text-white">Data Privacy:</strong> All data stays 100% local in your browser. No external servers or cloud storage involved.</li>
              </ul>
            </section>

            <div className="flex flex-wrap gap-3">
              <button onClick={downloadBackup} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
                <Download className="w-4 h-4 text-amber-400" /> Download Full Vault Backup (JSON)
              </button>
              <button onClick={() => window.print()} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
                🖨️ Print Vault Summary
              </button>
            </div>
          </div>
        )}

        {/* ══════ SYNC DATA TAB ══════ */}
        {activeTab === 'sync' && (
          <div className="space-y-6 max-w-4xl mx-auto">

            {/* Header */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-amber-500/10 rounded-xl border border-amber-500/30 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold font-mono uppercase text-white">Sync Data Across Devices</h2>
                  <p className="text-[11px] text-zinc-400 font-mono">Transfer your vault between Desktop, Mobile, and other devices</p>
                </div>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[11px] text-zinc-300 font-mono leading-relaxed">
                <strong className="text-amber-400">How it works:</strong> Export your vault data as a secure file on one device, then import it on another. Your username, credentials, and all saved data will be transferred. Works between Desktop ↔ Mobile ↔ any browser.
              </div>
            </section>

            {/* Export Section */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold text-white uppercase">Export — Send Data FROM This Device</span>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-zinc-400 font-mono">Download your complete vault as a file. Take this file to your other device (Desktop or Mobile) and import it there.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Export current user only */}
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
                    <div className="text-center">
                      <User className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                      <h4 className="text-xs font-mono font-bold text-white">Export My Vault</h4>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">
                        Exports only <strong className="text-amber-400">{activeUser.displayName}</strong>'s data and credentials
                      </p>
                    </div>
                    <button onClick={() => {
                      const userData = localStorage.getItem('ev_data_' + activeUser.username);
                      const allUsers = getUsers();
                      const myUser = allUsers.find(u => u.username === activeUser.username);
                      const exportPayload = {
                        type: 'LifeKeepVault-UserSync',
                        version: '2.0',
                        exportedAt: new Date().toISOString(),
                        exportedFrom: navigator.userAgent.includes('Mobi') ? 'Mobile' : 'Desktop',
                        user: myUser,
                        data: userData ? JSON.parse(userData) : {}
                      };
                      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `LifeKeepVault-${activeUser.username}-sync.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(link.href);
                      notify(`Vault exported for ${activeUser.displayName}. Transfer this file to your other device.`, 'ok');
                    }} className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Download My Vault File
                    </button>
                  </div>

                  {/* Export all users */}
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
                    <div className="text-center">
                      <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                      <h4 className="text-xs font-mono font-bold text-white">Export All Users</h4>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">
                        Exports <strong className="text-cyan-400">every registered user</strong>'s credentials and data
                      </p>
                    </div>
                    <button onClick={() => {
                      const allUsers = getUsers();
                      const allData: Record<string, any> = {};
                      allUsers.forEach(u => {
                        const raw = localStorage.getItem('ev_data_' + u.username);
                        allData[u.username] = raw ? JSON.parse(raw) : {};
                      });
                      const exportPayload = {
                        type: 'LifeKeepVault-FullSync',
                        version: '2.0',
                        exportedAt: new Date().toISOString(),
                        exportedFrom: navigator.userAgent.includes('Mobi') ? 'Mobile' : 'Desktop',
                        users: allUsers,
                        userData: allData
                      };
                      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `LifeKeepVault-AllUsers-sync.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(link.href);
                      notify(`Exported ${allUsers.length} user(s). Transfer this file to your other device.`, 'ok');
                    }} className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 py-3 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Download All Users File
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Import Section */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-xs font-bold text-white uppercase">Import — Receive Data ON This Device</span>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-zinc-400 font-mono">Import a vault file exported from your other device. This will add/update user accounts and their data on this device.</p>

                <input type="file" ref={syncImportRef} className="hidden" accept=".json" onChange={handleSyncImport} />

                <button onClick={() => syncImportRef.current?.click()}
                  className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 py-4 rounded-xl text-sm font-mono font-bold cursor-pointer transition-all flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" /> Select Vault File to Import
                </button>

                <div className="bg-zinc-900/60 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-white">Supported file types:</h4>
                  <ul className="text-[11px] text-zinc-400 font-mono space-y-1 list-disc pl-4">
                    <li><code className="text-amber-400">LifeKeepVault-username-sync.json</code> — Single user vault</li>
                    <li><code className="text-cyan-400">LifeKeepVault-AllUsers-sync.json</code> — All users vault</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Step-by-step guide */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xs font-mono font-bold text-white uppercase mb-4">Step-by-Step: Desktop ↔ Mobile Sync</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { step: '1', icon: '💻', title: 'Export from Source', desc: 'Open LifeKeepVault on your Desktop (or Mobile). Go to Sync Data → click "Download My Vault File". Save the .json file.' },
                  { step: '2', icon: '📲', title: 'Transfer the File', desc: 'Send the .json file to your other device via WhatsApp, Email, Google Drive, USB cable, Bluetooth — any method works.' },
                  { step: '3', icon: '✅', title: 'Import on Target', desc: 'Open LifeKeepVault on the other device. Go to Sync Data → click "Select Vault File to Import". Pick the .json file. Done!' },
                ].map(s => (
                  <div key={s.step} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 text-center space-y-2">
                    <div className="text-3xl">{s.icon}</div>
                    <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/15 text-amber-400 font-mono font-bold text-sm">{s.step}</div>
                    <p className="text-xs font-mono font-bold text-white">{s.title}</p>
                    <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* ══════ INSTALL APP TAB ══════ */}
        {activeTab === 'install' && (
          <div className="space-y-6 max-w-4xl mx-auto">

            {/* Status Banner */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
              isInstalled
                ? 'bg-emerald-950/30 border-emerald-500/30'
                : 'bg-amber-950/20 border-amber-500/30'
            }`}>
              {isInstalled ? (
                <>
                  <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-mono font-bold text-emerald-400">LifeKeepVault is Installed!</p>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">Running as a standalone app on this device. Works offline.</p>
                  </div>
                </>
              ) : (
                <>
                  <HardDriveDownload className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-mono font-bold text-amber-400">Install LifeKeepVault on Your Device</p>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">Install as a native app — works offline, has its own icon, no browser needed.</p>
                  </div>
                  {deferredPrompt && (
                    <button onClick={handleInstallClick}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-amber-900/30 flex-shrink-0">
                      <ArrowDown className="w-4 h-4" /> Install Now
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Network Status */}
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-mono ${
              isOnline ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-amber-950/20 border-amber-500/30 text-amber-400'
            }`}>
              {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
              {isOnline ? 'Online — Data syncing to local storage.' : 'Offline — App is working from cache. All data is still accessible.'}
            </div>

            {/* ── DESKTOP INSTALL INSTRUCTIONS ── */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-xs font-bold text-white uppercase">Install on Desktop (Windows / Mac / Linux)</span>
              </div>
              <div className="p-6 space-y-5">

                {deferredPrompt && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 text-center space-y-3">
                    <HardDriveDownload className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-sm font-mono text-white font-bold">One-Click Install Available!</p>
                    <p className="text-xs text-zinc-400 font-mono">Your browser supports direct installation. Click below to install LifeKeepVault as a desktop app.</p>
                    <button onClick={handleInstallClick}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-sm px-8 py-3 rounded-xl cursor-pointer transition-all shadow-lg shadow-amber-900/30 inline-flex items-center gap-2">
                      <ArrowDown className="w-4 h-4" /> Install LifeKeepVault Desktop App
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold text-amber-400 uppercase">Method 1: Install from Browser (Recommended)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        step: '1',
                        title: 'Open in Chrome / Edge',
                        desc: 'Open this app in Google Chrome or Microsoft Edge browser on your computer.',
                        icon: '🌐'
                      },
                      {
                        step: '2',
                        title: 'Click Install Icon',
                        desc: 'Look for the install icon (⊕) in the address bar, or go to Menu → "Install LifeKeepVault".',
                        icon: '📥'
                      },
                      {
                        step: '3',
                        title: 'Launch as Desktop App',
                        desc: 'The app will appear on your desktop/taskbar. Opens in its own window, works offline!',
                        icon: '🖥️'
                      }
                    ].map(s => (
                      <div key={s.step} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center space-y-2">
                        <div className="text-3xl">{s.icon}</div>
                        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/15 text-amber-400 font-mono font-bold text-sm">{s.step}</div>
                        <p className="text-xs font-mono font-bold text-white">{s.title}</p>
                        <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-800 pt-4 space-y-3">
                    <h4 className="text-xs font-mono font-bold text-amber-400 uppercase">Method 2: Build as Native .EXE (Advanced)</h4>
                    <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                      For a true Windows .EXE or Mac .DMG file, you can wrap this app using <strong className="text-white">Electron</strong> or <strong className="text-white">Tauri</strong>:
                    </p>
                    <div className="bg-black rounded-xl border border-zinc-800 p-4 space-y-3 font-mono text-xs">
                      <div>
                        <span className="text-zinc-500"># Option A — Using Electron:</span>
                        <div className="bg-zinc-900 rounded-lg p-3 mt-1 text-amber-400 select-all">
                          npm install -D electron electron-builder<br/>
                          npx electron . <span className="text-zinc-600"># runs as desktop app</span><br/>
                          npx electron-builder build <span className="text-zinc-600"># generates .exe / .dmg</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-zinc-500"># Option B — Using Tauri (lightweight, Rust-based):</span>
                        <div className="bg-zinc-900 rounded-lg p-3 mt-1 text-amber-400 select-all">
                          npm install -D @tauri-apps/cli<br/>
                          npx tauri init<br/>
                          npx tauri build <span className="text-zinc-600"># creates ~5MB .exe or .msi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── MOBILE INSTALL INSTRUCTIONS ── */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-xs font-bold text-white uppercase">Install on Mobile (Android / iPhone / iPad)</span>
              </div>
              <div className="p-6 space-y-5">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Android */}
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🤖</span>
                      <h4 className="text-sm font-mono font-bold text-white">Android</h4>
                    </div>
                    <ol className="text-[11px] text-zinc-400 font-mono space-y-2 list-decimal pl-4 leading-relaxed">
                      <li>Open this page in <strong className="text-white">Google Chrome</strong> on your Android phone.</li>
                      <li>Tap the <strong className="text-white">three-dot menu (⋮)</strong> at the top-right corner.</li>
                      <li>Tap <strong className="text-amber-400">"Install app"</strong> or <strong className="text-amber-400">"Add to Home screen"</strong>.</li>
                      <li>Tap <strong className="text-white">"Install"</strong> on the confirmation popup.</li>
                      <li>LifeKeepVault icon will appear on your home screen — tap to launch!</li>
                    </ol>
                    <div className="bg-emerald-950/30 rounded-lg p-2.5 text-[10px] font-mono text-emerald-400 border border-emerald-900/40">
                      ✅ Works completely offline after first load. No Play Store needed.
                    </div>
                  </div>

                  {/* iPhone / iPad */}
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🍎</span>
                      <h4 className="text-sm font-mono font-bold text-white">iPhone / iPad</h4>
                    </div>
                    <ol className="text-[11px] text-zinc-400 font-mono space-y-2 list-decimal pl-4 leading-relaxed">
                      <li>Open this page in <strong className="text-white">Safari</strong> on your iPhone/iPad.</li>
                      <li>Tap the <strong className="text-white">Share button</strong> (square with arrow ↑) at the bottom.</li>
                      <li>Scroll down and tap <strong className="text-amber-400">"Add to Home Screen"</strong>.</li>
                      <li>Name it "LifeKeepVault" and tap <strong className="text-white">"Add"</strong>.</li>
                      <li>The app icon appears on your home screen — opens fullscreen like a native app!</li>
                    </ol>
                    <div className="bg-amber-950/30 rounded-lg p-2.5 text-[10px] font-mono text-amber-400 border border-amber-900/40">
                      ⚠️ Must use Safari on iOS. Chrome on iPhone doesn't support PWA install.
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-amber-400 uppercase">Advanced: Build Native APK / IPA</h4>
                  <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                    For a real app store package (.apk for Android, .ipa for iOS), use <strong className="text-white">Capacitor</strong>:
                  </p>
                  <div className="bg-black rounded-xl border border-zinc-800 p-4 font-mono text-xs">
                    <div className="bg-zinc-900 rounded-lg p-3 text-amber-400 select-all">
                      npm install @capacitor/core @capacitor/cli<br/>
                      npx cap init LifeKeepVault com.lifekeepvault.app<br/>
                      npm run build<br/>
                      npx cap add android <span className="text-zinc-600"># or: npx cap add ios</span><br/>
                      npx cap copy<br/>
                      npx cap open android <span className="text-zinc-600"># opens in Android Studio</span>
                    </div>
                    <p className="text-zinc-500 mt-2 text-[10px]">Then build APK from Android Studio → Build → Generate Signed APK.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── FEATURES WHEN INSTALLED ── */}
            <section className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xs font-mono font-bold text-white uppercase mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> What You Get When Installed
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: '🖥️', title: 'Own Window', desc: 'Runs in its own app window — no browser tabs or address bar.' },
                  { icon: '📴', title: 'Works Offline', desc: 'Full functionality without internet. Data stored locally on device.' },
                  { icon: '⚡', title: 'Fast Launch', desc: 'Opens instantly from desktop/taskbar/home screen icon.' },
                  { icon: '🔒', title: '100% Private', desc: 'No cloud servers. No data leaves your device. Zero tracking.' },
                  { icon: '🔄', title: 'Auto Updates', desc: 'When online, app updates automatically in background.' },
                  { icon: '💾', title: 'Local Storage', desc: 'All your family data persists in device storage between sessions.' },
                  { icon: '📱', title: 'Mobile Native Feel', desc: 'Fullscreen on phone, swipe gestures, home screen icon.' },
                  { icon: '📦', title: 'Tiny Size', desc: 'Less than 1MB install. No heavy downloads needed.' },
                ].map((f, i) => (
                  <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 text-center space-y-1.5">
                    <div className="text-2xl">{f.icon}</div>
                    <p className="text-[11px] font-mono font-bold text-white">{f.title}</p>
                    <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick data export before install */}
            <div className="flex flex-wrap gap-3">
              <button onClick={downloadBackup} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
                <Download className="w-4 h-4 text-amber-400" /> Download Vault Backup First
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 text-center py-4 px-4 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-600 font-mono">
          <div>
            <p>© 2026 LifeKeepVault™ — Secure Family Legacy Registry. All data stored locally.</p>
            <p className="text-[10px] text-zinc-700 mt-0.5">All intellectual property rights reserved by <span className="text-zinc-500">{activeUser.displayName || 'the registered user'}</span>.</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">Horizon: 2026–2126</span>
            <span className="bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded text-teal-400">Client-Side Only</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
