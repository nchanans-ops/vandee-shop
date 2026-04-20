import { useState, useRef, useEffect, useCallback } from "react";
import THAI_ADDR_DB from "./thaiAddr";
import {
  fbGetOrders, fbUpsertOrder, fbDeleteOrder,
  fbGetSetting, fbSetSetting,
  fbGetProducts, fbSetProducts,
  fbOnOrders, fbOnExpenses, fbOnExpenseCats,
} from "./firebase";

/* ═══════════════════════════════════════════
   SVG ICON SYSTEM
   ═══════════════════════════════════════════ */
const Icon = ({ name, size = 18, color = "currentColor", sw = 1.8 }) => {
  const d = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <><path d="M5 12h14" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    loader: <><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>,
    mapPin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
    map: <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    creditCard: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    shoppingCart: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>,
    package: <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
    arrowLeft: <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    arrowRight: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    truck: <><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>,
    clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></>,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
    coffee: <><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></>,
    refreshCw: <><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
    list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    dollarSign: <><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12a2 2 0 0 0 2 2h14v-4" /><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" /></>,
    chevDown: <><polyline points="6 9 12 15 18 9" /></>,
    chevUp: <><polyline points="18 15 12 9 6 15" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    logOut: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
    printer: <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
    barChart: <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d[name]}</svg>;
};

/* ═══════════════════════════════════════════
   COLOR TOKENS
   ═══════════════════════════════════════════ */
const C = {
  // Brand: VANDEE dark red
  green50: "#fdf2f2", green100: "#fce7e7", green200: "#f5c4c4", green500: "#a52222", green600: "#8B1A1A", green700: "#701515",
  // Status green (kept for "completed" badges)
  statusGreen100: "#dcfce7", statusGreen600: "#16a34a", statusGreen700: "#15803d",
  gray50: "#f9fafb", gray100: "#f3f4f6", gray200: "#e5e7eb", gray300: "#d1d5db", gray400: "#9ca3af", gray500: "#6b7280", gray600: "#4b5563", gray700: "#374151", gray800: "#1f2937", gray900: "#111827",
  red50: "#fef2f2", red500: "#ef4444", red600: "#dc2626",
  amber50: "#fffbeb", amber100: "#fef3c7", amber600: "#d97706", amber700: "#b45309",
  blue50: "#eff6ff", blue500: "#3b82f6", blue600: "#2563eb",
  white: "#fff",
};

/* ═══════════════════════════════════════════
   INITIAL DATA
   ═══════════════════════════════════════════ */
const INIT_CATS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "snack", label: "ขนม" },
  { key: "dried", label: "ของแห้ง" },
  { key: "herbal", label: "สมุนไพร" },
  { key: "craft", label: "งานฝีมือ" },
  { key: "souvenir", label: "ของที่ระลึก" },
];

const INIT_PRODUCTS = [
  { id: 1, name: "ทุเรียนทอด", desc: "ทุเรียนทอดกรอบ หอมมัน คัดเกรดพรีเมียม", price: 189, cat: "snack", img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop", active: true, stock: 50 },
  { id: 2, name: "มะม่วงอบแห้ง", desc: "มะม่วงอบแห้งหวานธรรมชาติ ไม่ใส่น้ำตาล", price: 129, cat: "dried", img: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=300&fit=crop", active: true, stock: 30 },
  { id: 3, name: "น้ำพริกเผา", desc: "น้ำพริกเผาสูตรโบราณ รสเข้มข้น", price: 99, cat: "dried", img: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop", active: true, stock: 40 },
  { id: 4, name: "กล้วยตาก", desc: "กล้วยตากพลังงานแสงอาทิตย์ เหนียวนุ่ม", price: 79, cat: "snack", img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop", active: true, stock: 60 },
  { id: 5, name: "ลูกอมมะขาม", desc: "ลูกอมมะขามเปียก เปรี้ยวหวาน สูตรดั้งเดิม", price: 59, cat: "snack", img: "https://images.unsplash.com/photo-1581441117193-63e8f0f67e8e?w=400&h=300&fit=crop", active: true, stock: 100 },
  { id: 6, name: "ชาสมุนไพร", desc: "ชาสมุนไพรผสมตะไคร้ ใบเตย อัญชัน", price: 149, cat: "herbal", img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop", active: true, stock: 25 },
  { id: 7, name: "ยาหม่องสมุนไพร", desc: "ยาหม่องสมุนไพรไทย สูตรพื้นบ้าน", price: 89, cat: "herbal", img: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=300&fit=crop", active: true, stock: 35 },
  { id: 8, name: "สบู่สมุนไพร", desc: "สบู่ขมิ้นผสมน้ำผึ้ง บำรุงผิว", price: 119, cat: "herbal", img: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=300&fit=crop", active: true, stock: 45 },
  { id: 9, name: "กระเป๋าผ้าทอมือ", desc: "กระเป๋าผ้าทอมือ ลายไทยร่วมสมัย", price: 259, cat: "craft", img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=300&fit=crop", active: true, stock: 15 },
  { id: 10, name: "พวงกุญแจช้างไทย", desc: "พวงกุญแจช้างแกะสลัก งานแฮนด์เมด", price: 69, cat: "souvenir", img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop", active: true, stock: 80 },
  { id: 11, name: "แม่เหล็กติดตู้เย็น", desc: "แม่เหล็กรูปสถานที่ท่องเที่ยวไทย", price: 49, cat: "souvenir", img: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=300&fit=crop", active: true, stock: 120 },
  { id: 12, name: "ผ้าพันคอผ้าไหม", desc: "ผ้าพันคอไหมไทย ย้อมสีธรรมชาติ", price: 399, cat: "craft", img: "https://images.unsplash.com/photo-1601924921557-45e6dea0c834?w=400&h=300&fit=crop", active: true, stock: 10 },
];

/* ═══════════════════════════════════════════
   THAI ADDRESS DATA
   ═══════════════════════════════════════════ */
const THAI_PROVINCES = ["กรุงเทพมหานคร","สมุทรปราการ","นนทบุรี","ปทุมธานี","พระนครศรีอยุธยา","อ่างทอง","ลพบุรี","สิงห์บุรี","ชัยนาท","สระบุรี","ชลบุรี","ระยอง","จันทบุรี","ตราด","ฉะเชิงเทรา","ปราจีนบุรี","นครนายก","สระแก้ว","นครราชสีมา","บุรีรัมย์","สุรินทร์","ศรีสะเกษ","อุบลราชธานี","ยโสธร","ชัยภูมิ","อำนาจเจริญ","บึงกาฬ","หนองบัวลำภู","ขอนแก่น","อุดรธานี","เลย","หนองคาย","มหาสารคาม","ร้อยเอ็ด","กาฬสินธุ์","สกลนคร","นครพนม","มุกดาหาร","เชียงใหม่","ลำพูน","ลำปาง","อุตรดิตถ์","แพร่","น่าน","พะเยา","เชียงราย","แม่ฮ่องสอน","นครสวรรค์","อุทัยธานี","กำแพงเพชร","ตาก","สุโขทัย","พิษณุโลก","พิจิตร","เพชรบูรณ์","ราชบุรี","กาญจนบุรี","สุพรรณบุรี","นครปฐม","สมุทรสาคร","สมุทรสงคราม","เพชรบุรี","ประจวบคีรีขันธ์","นครศรีธรรมราช","กระบี่","พังงา","ภูเก็ต","สุราษฎร์ธานี","ระนอง","ชุมพร","สงขลา","สตูล","ตรัง","พัทลุง","ปัตตานี","ยะลา","นราธิวาส"];


const STEPS = { MENU: 0, ADDRESS: 1, SLIP: 2, SUMMARY: 3 };

/* ═══════════════════════════════════════════
   SHARED UI COMPONENTS
   ═══════════════════════════════════════════ */
const inp = { width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" };
const focus = (e) => e.target.style.borderColor = C.green600;
const blur = (e) => e.target.style.borderColor = C.gray200;
const BtnP = ({ children, disabled, onClick, style: s }) => (
  <button onClick={disabled ? undefined : () => { sfx.tap(); onClick?.(); }} style={{ padding: "11px 22px", borderRadius: 8, border: "none", background: disabled ? C.gray300 : C.green600, color: C.white, fontWeight: 600, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.15s", ...s }}>{children}</button>
);
const BtnO = ({ children, onClick, style: s }) => (
  <button onClick={() => { sfx.tap(); onClick?.(); }} style={{ padding: "11px 20px", borderRadius: 8, border: `1.5px solid ${C.gray200}`, background: C.white, color: C.gray600, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6, ...s }}>{children}</button>
);
const Img = ({ product, style: s, imgErr, setImgErr }) => imgErr[product.id]
  ? <div style={{ ...s, background: `linear-gradient(145deg, ${C.gray100}, ${C.gray50})`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="package" size={Math.min(s.width || 36, 36)} color={C.gray300} sw={1.2} /></div>
  : <img src={product.img} alt={product.name} loading="lazy" onError={() => setImgErr(p => ({ ...p, [product.id]: true }))} style={{ ...s, objectFit: "cover" }} />;

/* ═══════════════════════════════════════════
   FIREBASE CLIENT + SYNC
   ═══════════════════════════════════════════ */
const sb = {
  getOrders: fbGetOrders,
  upsertOrder: fbUpsertOrder,
  deleteOrder: fbDeleteOrder,
  getSetting: fbGetSetting,
  setSetting: fbSetSetting,
  getProducts: fbGetProducts,
  setProducts: fbSetProducts,
};

// Also keep localStorage as local cache + session/remember
const STORE_KEYS = { orders: "vandee:orders", products: "vandee:products", categories: "vandee:categories", shipping: "vandee:shipping", credentials: "vandee:credentials", expenses: "vandee:expenses", expenseCats: "vandee:expenseCats" };
const DEFAULT_CREDS = { user: "back-vandee", pass: "vandeesouvenir2026" };

/* Sound effects */
let _audioCtx = null;
const getCtx = () => { if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return _audioCtx; };
const sfx = {
  tap() { // iPhone-style haptic tap
    try { const c = getCtx(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 1200; o.type = "sine"; g.gain.setValueAtTime(0.08, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04); o.start(); o.stop(c.currentTime + 0.04); } catch {}
  },
  success() { // Notification ding
    try { const c = getCtx(); const p = (f, s, d, v) => { const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = f; o.type = "sine"; g.gain.setValueAtTime(v, c.currentTime + s); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + s + d); o.start(c.currentTime + s); o.stop(c.currentTime + s + d); }; p(880,0,0.12,0.15); p(1320,0.1,0.15,0.15); p(1760,0.22,0.25,0.12); } catch {}
  },
  remove() { // iPhone delete swoosh
    try { const c = getCtx(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.type = "sine"; o.frequency.setValueAtTime(600, c.currentTime); o.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.12); g.gain.setValueAtTime(0.1, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12); o.start(); o.stop(c.currentTime + 0.12); } catch {}
  },
};

async function loadStore(key, fallback) {
  try {
    const result = await window.storage.get(key);
    return result ? JSON.parse(result.value) : fallback;
  } catch { return fallback; }
}

async function saveStore(key, data) {
  try { await window.storage.set(key, JSON.stringify(data)); } catch (e) { console.error("Save error:", e); }
}

/* ═══════════════════════════════════════════
   CSV / EXCEL EXPORT
   ═══════════════════════════════════════════ */
function downloadCSV(filename, headers, rows) {
  const BOM = "\uFEFF";
  const csv = BOM + [headers.join(","), ...rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportOrdersCSV(orders, filename) {
  const headers = ["หมายเลขออเดอร์", "วันที่", "สถานะ", "ชื่อผู้รับ", "โทรศัพท์", "ที่อยู่", "จังหวัด", "รหัสไปรษณีย์", "วิธีจัดส่ง", "รายการสินค้า", "จำนวนชิ้นรวม", "ค่าสินค้า", "ส่วนลด (฿)", "ส่วนลด (%)", "ค่าส่ง", "ยอดรวม"];
  const rows = orders.map(o => [
    o.id, o.date,
    ({ pending: "รอตรวจสอบ", shipped: "จัดส่งแล้ว", completed: "สำเร็จ", cancelled: "ยกเลิก" })[o.status] || o.status,
    o.address?.name, o.address?.phone,
    `${o.address?.addr || ""} ${o.address?.district || ""}`.trim(),
    o.address?.province, o.address?.zip,
    o.shippingLabel || "-",
    o.items?.map(i => `${i.name} x${i.qty}`).join("; "),
    o.items?.reduce((s, i) => s + i.qty, 0),
    o.subtotal, o.discount || 0, o.discountPct || 0, o.shipping, o.total,
  ]);
  downloadCSV(filename, headers, rows);
}

function exportOrdersExcel(orders, filename) {
  const headers = ["หมายเลขออเดอร์", "วันที่", "สถานะ", "ชื่อผู้รับ", "โทรศัพท์", "ที่อยู่", "จังหวัด", "รหัสไปรษณีย์", "วิธีจัดส่ง", "รายการสินค้า", "จำนวนชิ้นรวม", "ค่าสินค้า", "ส่วนลด (฿)", "ส่วนลด (%)", "ค่าส่ง", "ยอดรวม"];
  const statusTh = { pending: "รอตรวจสอบ", shipped: "จัดส่งแล้ว", completed: "สำเร็จ", cancelled: "ยกเลิก" };
  const rows = orders.map(o => [
    o.id, o.date, statusTh[o.status] || o.status,
    o.address?.name || "", o.address?.phone || "",
    `${o.address?.addr || ""} ${o.address?.district || ""}`.trim(),
    o.address?.province || "", o.address?.zip || "",
    o.shippingLabel || "-",
    o.items?.map(i => `${i.name} x${i.qty}`).join("; ") || "",
    o.items?.reduce((s, i) => s + i.qty, 0) || 0,
    o.subtotal || 0, o.discount || 0, o.discountPct || 0, o.shipping || 0, o.total || 0,
  ]);

  // Build XML Spreadsheet (opens in Excel natively)
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
  xml += '<Styles><Style ss:ID="hdr"><Font ss:Bold="1" ss:Size="11"/><Interior ss:Color="#16A34A" ss:Pattern="Solid"/><Font ss:Color="#FFFFFF" ss:Bold="1"/></Style>';
  xml += '<Style ss:ID="num"><NumberFormat ss:Format="#,##0"/></Style></Styles>\n';
  xml += '<Worksheet ss:Name="Orders"><Table>\n';
  // Header
  xml += '<Row>';
  headers.forEach(h => { xml += `<Cell ss:StyleID="hdr"><Data ss:Type="String">${h}</Data></Cell>`; });
  xml += '</Row>\n';
  // Data
  rows.forEach(row => {
    xml += '<Row>';
    row.forEach((val, i) => {
      const isNum = i >= 10;
      xml += isNum ? `<Cell ss:StyleID="num"><Data ss:Type="Number">${val}</Data></Cell>` : `<Cell><Data ss:Type="String">${String(val).replace(/&/g,"&amp;").replace(/</g,"&lt;")}</Data></Cell>`;
    });
    xml += '</Row>\n';
  });
  xml += '</Table></Worksheet></Workbook>';

  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportDashboardCSV(data, period, filename) {
  const headers = ["ช่วงเวลา", "รายรับรวม (บาท)", "จำนวนออเดอร์", "สินค้าขายได้ (ชิ้น)", "ยอดเฉลี่ย/ออเดอร์"];
  const rows = [[period, data.revenue, data.orderCount, data.itemCount, data.avg]];
  // Add chart breakdown
  const headers2 = ["\n\nรายละเอียดตามช่วง", "ยอด (บาท)"];
  const rows2 = data.chartData.map(d => [d.label, d.value]);
  // Add top products
  const headers3 = ["\n\nสินค้าขายดี", "จำนวน (ชิ้น)", "รายรับ (บาท)"];
  const rows3 = data.topProducts.map(p => [p.name, p.qty, p.revenue]);

  const BOM = "\uFEFF";
  const lines = [
    headers.join(","),
    rows[0].map(c => `"${String(c ?? "")}"`).join(","),
    "", "",
    "รายละเอียดตามช่วง,ยอด (บาท)",
    ...rows2.map(r => r.map(c => `"${String(c ?? "")}"`).join(",")),
    "", "",
    "สินค้าขายดี,จำนวน (ชิ้น),รายรับ (บาท)",
    ...rows3.map(r => r.map(c => `"${String(c ?? "")}"`).join(",")),
  ];
  const csv = BOM + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════
   GOOGLE SHEET SYNC
   ═══════════════════════════════════════════ */
const SHEET_URL_KEY = "vandee:sheet_url";

async function syncOrderToSheet(url, order) {
  if (!url) return { ok: false, error: "ยังไม่ได้ตั้งค่า URL" };
  try {
    const statusTh = { pending: "รอตรวจสอบ", shipped: "จัดส่งแล้ว", completed: "สำเร็จ", cancelled: "ยกเลิก" };
    const res = await fetch(url, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        orderId: order.id,
        date: order.date,
        status: statusTh[order.status] || order.status,
        customerName: order.address?.name || "",
        phone: order.address?.phone || "",
        address: `${order.address?.addr || ""} ${order.address?.district || ""} ${order.address?.province || ""} ${order.address?.zip || ""}`.trim(),
        note: order.address?.note || "",
        shippingMethod: order.shippingLabel || "-",
        items: order.items?.map(i => `${i.name} x${i.qty}`).join(", ") || "",
        totalItems: order.items?.reduce((s, i) => s + i.qty, 0) || 0,
        subtotal: order.subtotal || 0,
        discount: order.discount || 0,
        discountPct: order.discountPct || 0,
        shippingCost: order.shipping || 0,
        total: order.total || 0,
        slipData: order.slipData || "",
        slipName: order.slipName || "",
      }),
    });
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
}

async function syncAllOrdersToSheet(url, orders) {
  if (!url) return { ok: false, error: "ยังไม่ได้ตั้งค่า URL" };
  try {
    const statusTh = { pending: "รอตรวจสอบ", shipped: "จัดส่งแล้ว", completed: "สำเร็จ", cancelled: "ยกเลิก" };
    const rows = orders.map(o => ({
      orderId: o.id, date: o.date, status: statusTh[o.status] || o.status,
      customerName: o.address?.name || "", phone: o.address?.phone || "",
      address: `${o.address?.addr || ""} ${o.address?.district || ""} ${o.address?.province || ""} ${o.address?.zip || ""}`.trim(),
      note: o.address?.note || "", shippingMethod: o.shippingLabel || "-",
      items: o.items?.map(i => `${i.name} x${i.qty}`).join(", ") || "",
      totalItems: o.items?.reduce((s, i) => s + i.qty, 0) || 0,
      subtotal: o.subtotal || 0, discount: o.discount || 0, discountPct: o.discountPct || 0, shippingCost: o.shipping || 0, total: o.total || 0,
    }));
    await fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "syncAll", orders: rows }) });
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
}


/* ═══════════════════════════════════════════
   PASSWORD CHANGE COMPONENT
   ═══════════════════════════════════════════ */
/* Auto-load slip from Supabase */
const SlipLoader = ({ orderId, slipName, onLoaded }) => {
  const [status, setStatus] = useState("loading"); // loading | found | notfound
  const [slipUrl, setSlipUrl] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await sb.getSetting(`slip:${orderId}`);
        if (data) { setSlipUrl(data); setStatus("found"); onLoaded(data); }
        else setStatus("notfound");
      } catch { setStatus("notfound"); }
    })();
  }, [orderId]);

  if (status === "loading") return <div style={{ fontSize: 12, color: C.gray400, display: "flex", alignItems: "center", gap: 6 }}><Icon name="loader" size={13} color={C.gray300} /> กำลังโหลดสลิป...</div>;
  if (status === "notfound") return <div style={{ fontSize: 12, color: C.gray400 }}>{slipName || "slip.jpg"} (ไม่พบรูปสลิปในระบบ)</div>;
  return null;
};

const ChangePasswordSection = ({ credentials, changePassword }) => {
  const [cp, setCp] = useState("");
  const [np, setNp] = useState("");
  const [np2, setNp2] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  const save = () => {
    setMsg(""); setOk(false);
    if (cp !== credentials.pass) { setMsg("รหัสผ่านเดิมไม่ถูกต้อง"); return; }
    if (!np || np.length < 6) { setMsg("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    if (np !== np2) { setMsg("รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน"); return; }
    if (confirmPw !== credentials.pass) { setMsg("รหัสผ่านยืนยันการเปลี่ยนไม่ถูกต้อง"); return; }
    changePassword(credentials.user, np);
    setCp(""); setNp(""); setNp2(""); setConfirmPw("");
    setOk(true); setTimeout(() => setOk(false), 3000);
  };

  return (
    <div style={{ background: C.white, borderRadius: 12, padding: 24, border: `1px solid ${C.gray100}`, marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: C.amber50, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="lock" size={20} color={C.amber600} /></div>
        <div><div style={{ fontWeight: 700, fontSize: 16 }}>เปลี่ยนรหัสผ่าน</div><div style={{ fontSize: 12, color: C.gray400 }}>ชื่อผู้ใช้: <strong style={{ color: C.gray700 }}>{credentials.user}</strong> (ไม่สามารถเปลี่ยนได้)</div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
        <div><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>รหัสผ่านเดิม</label><input type="password" value={cp} onChange={e => { setCp(e.target.value); setMsg(""); }} placeholder="กรอกรหัสผ่านเดิม" style={inp} onFocus={focus} onBlur={blur} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>รหัสผ่านใหม่</label><input type="password" value={np} onChange={e => { setNp(e.target.value); setMsg(""); }} placeholder="อย่างน้อย 6 ตัวอักษร" style={inp} onFocus={focus} onBlur={blur} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>กรอกรหัสผ่านใหม่อีกครั้ง</label><input type="password" value={np2} onChange={e => { setNp2(e.target.value); setMsg(""); }} placeholder="ยืนยันรหัสผ่านใหม่" style={inp} onFocus={focus} onBlur={blur} /></div>
        </div>
        <div style={{ borderTop: `1px solid ${C.gray200}`, paddingTop: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.amber700, marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}><Icon name="lock" size={13} color={C.amber600} /> ยืนยันการเปลี่ยนรหัสผ่าน (กรอกรหัสผ่านปัจจุบันอีกครั้ง)</label>
          <input type="password" value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setMsg(""); }} placeholder="กรอกรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยน" style={{ ...inp, borderColor: C.amber600 }} onFocus={e => e.target.style.borderColor = C.amber600} onBlur={e => e.target.style.borderColor = C.amber600} />
        </div>
      </div>
      {msg && <div style={{ marginTop: 10, fontSize: 12, color: C.red500, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><Icon name="info" size={13} color={C.red500} /> {msg}</div>}
      {ok && <div style={{ marginTop: 10, fontSize: 12, color: C.green600, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><Icon name="checkCircle" size={13} color={C.green600} /> เปลี่ยนรหัสผ่านสำเร็จ</div>}
      <BtnP onClick={save} style={{ marginTop: 14, padding: "10px 20px" }}><Icon name="save" size={14} /> บันทึกรหัสผ่านใหม่</BtnP>
    </div>
  );
};

/* ═══════════════════════════════════════════
   SHARED FORM COMPONENTS (outside App to prevent re-mount)
   ═══════════════════════════════════════════ */
const Field = ({ label, icon, value, onChange, placeholder, full, multi }) => (
  <div style={{ gridColumn: full ? "1/-1" : undefined }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}><Icon name={icon} size={13} color={C.gray400} /> {label}</label>
    {multi ? <textarea value={value} onChange={onChange} placeholder={placeholder} style={{ ...inp, minHeight: 64, resize: "vertical" }} onFocus={focus} onBlur={blur} />
      : <input value={value} onChange={onChange} placeholder={placeholder} style={inp} onFocus={focus} onBlur={blur} />}
  </div>
);

const Section = ({ icon, title, children }) => (
  <div style={{ background: C.white, borderRadius: 10, padding: 20, marginBottom: 12, border: `1px solid ${C.gray100}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><Icon name={icon} size={17} color={C.gray500} /><span style={{ fontWeight: 700, fontSize: 15, color: C.gray800 }}>{title}</span></div>
    {children}
  </div>
);

export default function App() {
  /* Auth */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState(DEFAULT_CREDS);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(STORE_KEYS.credentials); if (r) setCredentials(JSON.parse(r.value)); } catch {}
      try { const s = await window.storage.get("vandee:session"); if (s && s.value === "active") setIsLoggedIn(true); } catch {}
      try {
        const rem = await window.storage.get("vandee:remember");
        if (rem) {
          const d = JSON.parse(rem.value);
          setLoginUser(d.user || ""); setLoginPass(d.pass || ""); setRememberMe(true);
        }
      } catch {}
      setAuthLoaded(true);
    })();
  }, []);

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = () => {
    if (loginUser === credentials.user && loginPass === credentials.pass) {
      setLoginError("");
      setLoginLoading(true);
      setTimeout(() => {
        setLoginLoading(false);
        setLoginSuccess(true);
        try { window.storage.set("vandee:session", "active"); } catch {}
        if (rememberMe) {
          try { window.storage.set("vandee:remember", JSON.stringify({ user: loginUser, pass: loginPass })); } catch {}
        } else {
          try { window.storage.delete("vandee:remember"); } catch {}
        }
        setTimeout(() => {
          setIsLoggedIn(true);
          setLoginSuccess(false);
          setLoginUser(""); setLoginPass("");
        }, 1200);
      }, 1500);
    } else { setLoginError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"); }
  };

  const handleLogout = () => { setIsLoggedIn(false); try { window.storage.delete("vandee:session"); } catch {}
    // restore saved credentials to login fields if remember was on
    (async () => { try { const rem = await window.storage.get("vandee:remember"); if (rem) { const d = JSON.parse(rem.value); setLoginUser(d.user || ""); setLoginPass(d.pass || ""); setRememberMe(true); } else { setLoginUser(""); setLoginPass(""); setRememberMe(false); } } catch { setLoginUser(""); setLoginPass(""); } })();
  };

  const changePassword = async (newUser, newPass) => {
    const newCreds = { user: newUser, pass: newPass };
    setCredentials(newCreds);
    try { await window.storage.set(STORE_KEYS.credentials, JSON.stringify(newCreds)); } catch {}
    sb.setSetting("credentials", newCreds);
  };

  /* Navigation: shop | orders | products */
  const [page, setPage] = useState("dashboard");

  /* Product catalog (shared across pages) */
  const [products, setProducts] = useState([]);
  const [nextId, setNextId] = useState(13);
  const [categories, setCategories] = useState(INIT_CATS.filter(c => c.key !== "all"));
  const allCats = [{ key: "all", label: "ทั้งหมด" }, ...categories];

  /* Orders state */
  const [orders, setOrders] = useState([]);

  /* Expenses state */
  const INIT_EXPENSE_CATS = ["ต้นทุนสินค้า","ค่าแพ็คกิ้ง","ค่าขนส่ง","ค่าการตลาด","ค่าสาธารณูปโภค","เงินเดือนพนักงาน","อื่น ๆ"];
  const [expenses, setExpenses] = useState([]);
  const [expenseCats, setExpenseCats] = useState(INIT_EXPENSE_CATS);
  const [expenseForm, setExpenseForm] = useState({ name: "", amount: "", date: new Date().toISOString().slice(0,10), cat: "", note: "" });
  const [newExpCat, setNewExpCat] = useState("");
  const [expFilter, setExpFilter] = useState("month");
  const [expCatFilter, setExpCatFilter] = useState("all");
  const [expDateFrom, setExpDateFrom] = useState("");
  const [expDateTo, setExpDateTo] = useState("");
  const [analyticsFilter, setAnalyticsFilter] = useState("month");

  /* Shipping methods */
  const [shippingMethods, setShippingMethods] = useState([
    { id: "standard", label: "จัดส่งทั่วประเทศ", desc: "Kerry / Flash Express (2-3 วัน)", price: 50, icon: "truck", active: true },
    { id: "ems", label: "EMS ด่วนพิเศษ", desc: "ไปรษณีย์ EMS (1-2 วัน)", price: 80, icon: "package", active: true },
    { id: "local", label: "ส่งในพื้นที่", desc: "Grab / Lineman (ภายในวัน)", price: 40, icon: "mapPin", active: true },
    { id: "pickup", label: "รับหน้าร้าน", desc: "มารับสินค้าด้วยตนเอง", price: 0, icon: "home", active: true },
    { id: "offline", label: "สั่งผ่านช่องทางออฟไลน์", desc: "Line / โทรศัพท์ / Walk-in (คิดค่าส่งภายหลัง)", price: 0, icon: "phone", active: true },
  ]);
  const [selectedShipping, setSelectedShipping] = useState("standard");

  /* Shop state */
  const [step, setStep] = useState(STEPS.MENU);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountInput, setDiscountInput] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [address, setAddress] = useState({ name: "", phone: "", addr: "", district: "", amphoe: "", province: "", zip: "", note: "" });
  /* Thai address data - embedded locally via static import */
  const thaiGeo = useRef(null);
  const [geoReady, setGeoReady] = useState(false);
  useEffect(() => {
    if (!THAI_ADDR_DB || Object.keys(THAI_ADDR_DB).length === 0) { setGeoReady(true); return; }
    const flat = [];
    for (const [prov, districts] of Object.entries(THAI_ADDR_DB)) {
      for (const [dist, subs] of Object.entries(districts)) {
        for (const [sub, zip] of Object.entries(subs)) {
          flat.push({ provinceNameTh: prov, districtNameTh: dist, subdistrictNameTh: sub, postalCode: zip });
        }
      }
    }
    thaiGeo.current = flat;
    setGeoReady(true);
  }, []);
  // Memoize province list
  const geoProvincesRef = useRef(THAI_PROVINCES);
  useEffect(() => { if (thaiGeo.current) geoProvincesRef.current = [...new Set(thaiGeo.current.map(g => g.provinceNameTh))].sort((a, b) => a === "กรุงเทพมหานคร" ? -1 : b === "กรุงเทพมหานคร" ? 1 : a.localeCompare(b, "th")); }, [geoReady]);
  const geoProvinces = geoProvincesRef.current;
  const geoDistricts = useCallback((prov) => thaiGeo.current ? [...new Set(thaiGeo.current.filter(g => g.provinceNameTh === prov && g.districtNameTh).map(g => g.districtNameTh))].sort((a, b) => a.localeCompare(b, "th")) : [], [geoReady]);
  const geoSubdistricts = useCallback((prov, dist) => thaiGeo.current ? thaiGeo.current.filter(g => g.provinceNameTh === prov && g.districtNameTh === dist && g.subdistrictNameTh) : [], [geoReady]);
  const geoZip = useCallback((prov, dist, sub) => { const r = thaiGeo.current?.find(g => g.provinceNameTh === prov && g.districtNameTh === dist && g.subdistrictNameTh === sub); return r?.postalCode ? String(r.postalCode) : ""; }, [geoReady]);
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [imgErr, setImgErr] = useState({});
  const fileRef = useRef();

  /* ═══════════════════════════════════════════
     DATA PERSISTENCE - Simple & Reliable
     ═══════════════════════════════════════════ */
  const [loaded, setLoaded] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [slipModal, setSlipModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const deletedIds = useRef(new Set());
  const isEditing = useRef(false);

  // Load data once on mount
  useEffect(() => {
    (async () => {
      const [sbOrders, sbProducts, sbCats, sbShipping, sbSheetUrl, sbCreds, sbExpenses, sbExpenseCats] = await Promise.all([
        sb.getOrders(), sb.getProducts(), sb.getSetting("categories"), sb.getSetting("shipping"), sb.getSetting("sheetUrl"), sb.getSetting("credentials"), sb.getSetting("expenses"), sb.getSetting("expenseCats"),
      ]);
      if (sbOrders && sbOrders.length > 0) setOrders(sbOrders);
      else { const so = await loadStore(STORE_KEYS.orders, null); if (so && so.length > 0) setOrders(so); }
      if (sbProducts && sbProducts.length > 0) { setProducts(sbProducts); setNextId(Math.max(...sbProducts.map(p => p.id), 0) + 1); }
      else { const sp = await loadStore(STORE_KEYS.products, null); if (sp && sp.length > 0) { setProducts(sp); setNextId(Math.max(...sp.map(p => p.id), 0) + 1); } else { setProducts(INIT_PRODUCTS); setNextId(13); } }
      if (sbCats && sbCats.length > 0) setCategories(sbCats);
      else { const sc = await loadStore(STORE_KEYS.categories, null); if (sc) setCategories(sc); }
      if (sbShipping && sbShipping.length > 0) setShippingMethods(sbShipping);
      else { const ss = await loadStore(STORE_KEYS.shipping, null); if (ss) setShippingMethods(ss); }
      if (sbSheetUrl) setSheetUrl(sbSheetUrl);
      else { try { const r = await window.storage.get(SHEET_URL_KEY); if (r) setSheetUrl(r.value); } catch {} }
      if (sbCreds) setCredentials(sbCreds);
      if (sbExpenses && sbExpenses.length > 0) setExpenses(sbExpenses);
      else { const se = await loadStore(STORE_KEYS.expenses, null); if (se && se.length > 0) setExpenses(se); }
      if (sbExpenseCats && sbExpenseCats.length > 0) setExpenseCats(sbExpenseCats);
      else { const sec = await loadStore(STORE_KEYS.expenseCats, null); if (sec && sec.length > 0) setExpenseCats(sec); }
      setLoaded(true);
    })();
  }, []);

  // Save to localStorage immediately, Supabase debounced
  const sbSaveTimer = useRef(null);
  const saveToFirebase = useCallback(() => {
    clearTimeout(sbSaveTimer.current);
    sbSaveTimer.current = setTimeout(() => {
      if (products.length > 0) sb.setProducts(products);
      sb.setSetting("categories", categories);
      sb.setSetting("shipping", shippingMethods);
    }, 2000);
  }, [products, categories, shippingMethods]);

  useEffect(() => { if (loaded) { saveStore(STORE_KEYS.orders, orders.map(o => { const { slipData, ...rest } = o; return rest; })); } }, [orders, loaded]);
  useEffect(() => { if (loaded) { saveStore(STORE_KEYS.products, products); saveToFirebase(); } }, [products, loaded]);
  useEffect(() => { if (loaded) { saveStore(STORE_KEYS.categories, categories); saveToFirebase(); } }, [categories, loaded]);
  useEffect(() => { if (loaded) { saveStore(STORE_KEYS.shipping, shippingMethods); saveToFirebase(); } }, [shippingMethods, loaded]);
  useEffect(() => { if (loaded) { saveStore(STORE_KEYS.expenses, expenses); sb.setSetting("expenses", expenses); } }, [expenses, loaded]);
  useEffect(() => { if (loaded) { saveStore(STORE_KEYS.expenseCats, expenseCats); sb.setSetting("expenseCats", expenseCats); } }, [expenseCats, loaded]);

  // Real-time listener via Firebase onSnapshot
  useEffect(() => {
    if (!loaded) return;
    const unsub = fbOnOrders((incoming) => {
      if (isEditing.current) return;
      const filtered = incoming.filter(o => !deletedIds.current.has(o.id));
      setOrders(prev => {
        const prevKey = prev.map(o => o.id + o.status).join(",");
        const newKey = filtered.map(o => o.id + o.status).join(",");
        return prevKey !== newKey ? filtered : prev;
      });
    });
    const unsubExp = fbOnExpenses((incoming) => {
      if (isEditing.current) return;
      setExpenses(prev => {
        const prevKey = prev.map(e => e.id).join(",");
        const newKey = incoming.map(e => e.id).join(",");
        return prevKey !== newKey ? incoming : prev;
      });
    });
    const unsubExpCats = fbOnExpenseCats((incoming) => {
      if (isEditing.current) return;
      setExpenseCats(prev => JSON.stringify(prev) !== JSON.stringify(incoming) ? incoming : prev);
    });
    const cleanDel = setInterval(() => deletedIds.current.clear(), 60000);
    return () => { unsub(); unsubExp(); unsubExpCats(); clearInterval(cleanDel); };
  }, [loaded]);

  const saveSheetUrl = async (url) => { setSheetUrl(url); try { await window.storage.set(SHEET_URL_KEY, url); } catch {} sb.setSetting("sheetUrl", url); };
  const syncOrder = async (order) => { if (!sheetUrl) return; setSyncStatus("syncing"); const r = await syncOrderToSheet(sheetUrl, order); setSyncStatus(r.ok ? "success" : "error"); setTimeout(() => setSyncStatus(""), 3000); };
  const syncAll = async () => { if (!sheetUrl) return; setSyncStatus("syncing"); const r = await syncAllOrdersToSheet(sheetUrl, orders); setSyncStatus(r.ok ? "success" : "error"); setTimeout(() => setSyncStatus(""), 3000); };

  const syncExpenseToSheet = async (expense) => {
    if (!sheetUrl) return;
    try {
      await fetch(sheetUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "expense", expense }) });
    } catch {}
  };

  const syncAllExpensesToSheet = async () => {
    if (!sheetUrl) return;
    try {
      await fetch(sheetUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "expenseSyncAll", expenses }) });
    } catch {}
  };

  /* Cart helpers */
  const addToCart = (p) => setCart(prev => {
    const ex = prev.find(i => i.id === p.id);
    const currentQty = ex ? ex.qty : 0;
    const stock = p.stock ?? 999;
    if (currentQty >= stock) return prev;
    return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
  });
  const updateQty = (id, d) => setCart(prev => prev.map(i => {
    if (i.id !== id) return i;
    const newQty = Math.max(0, i.qty + d);
    const prod = products.find(p => p.id === id);
    const stock = prod?.stock ?? 999;
    return { ...i, qty: Math.min(newQty, stock) };
  }).filter(i => i.qty > 0));
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingMethod = shippingMethods.find(m => m.id === selectedShipping) || shippingMethods[0];
  const shipping = shippingMethod?.price || 0;
  const discountAmt = Math.min(Math.max(0, discount), subtotal);
  const discountPct = subtotal > 0 ? ((discountAmt / subtotal) * 100).toFixed(1) : "0.0";
  const total = subtotal - discountAmt + shipping;
  const activeProducts = products.filter(p => p.active);
  const filtered = activeProducts.filter(p => (activeCat === "all" || p.cat === activeCat) && (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.includes(search)));
  const addressValid = address.name && address.phone && address.addr && address.province && address.zip;
  const handleSlip = (e) => { const f = e.target.files[0]; if (!f) return; setSlipFile(f); const r = new FileReader(); r.onload = (ev) => setSlipPreview(ev.target.result); r.readAsDataURL(f); };

  const confirmOrder = () => {
    const now = new Date();
    const newOrder = {
      id: "ORD-" + Date.now().toString(36).toUpperCase().slice(-6),
      date: now.toLocaleDateString("th-TH") + " " + now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      ts: now.getTime(),
      status: "pending",
      address: { ...address, district: `${address.district || ""} ${address.amphoe || ""}`.trim() },
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      subtotal, discount: discountAmt, discountPct: parseFloat(discountPct), shipping, total,
      shippingLabel: shippingMethod?.label || "-",
      slipName: slipFile?.name || "slip.jpg",
      slipData: slipPreview || "",
    };
    setOrders(prev => [newOrder, ...prev]);
    // Save slip separately to Supabase (data field can hold large base64)
    if (slipPreview) sb.setSetting(`slip:${newOrder.id}`, slipPreview);
    // Deduct stock
    setProducts(prev => prev.map(p => {
      const item = cart.find(i => i.id === p.id);
      if (!item) return p;
      return { ...p, stock: Math.max(0, (p.stock ?? 0) - item.qty) };
    }));
    setConfirmed(true);
    sfx.success();
    // Save order directly to Supabase
    const { slipData: _sd, ...orderClean } = newOrder;
    sb.upsertOrder(orderClean);
    syncOrder(newOrder);
  };

  const resetShop = () => { setCart([]); setDiscount(0); setDiscountInput(""); setAddress({ name: "", phone: "", addr: "", district: "", amphoe: "", province: "", zip: "", note: "" }); setSlipFile(null); setSlipPreview(null); setConfirmed(false); setSelectedShipping("standard"); setStep(STEPS.MENU); };

  const statusMap = { pending: { label: "รอตรวจสอบ", bg: C.amber100, color: C.amber700 }, shipped: { label: "จัดส่งแล้ว", bg: C.blue50, color: C.blue600 }, completed: { label: "สำเร็จ", bg: C.statusGreen100, color: C.statusGreen700 }, cancelled: { label: "ยกเลิก", bg: C.red50, color: C.red600 } };

  /* ════════════════════════════════════════════════════
     PAGE: SHOP (Storefront with 4-step checkout)
     ════════════════════════════════════════════════════ */

  const renderShop = () => {
    const stepLabels = ["เลือกสินค้า", "ที่อยู่จัดส่ง", "แนบสลิป", "สรุปออเดอร์"];
    const stepIcons = ["shoppingCart", "mapPin", "creditCard", "clipboard"];

    return (
      <div data-page="shop">
        {/* Step bar */}
        <div style={{ background: C.white, borderRadius: 10, padding: "14px 24px", marginBottom: 20, border: `1px solid ${C.gray100}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div onClick={() => { if (i < step) setStep(i); }} style={{ display: "flex", alignItems: "center", gap: 6, cursor: i < step ? "pointer" : "default", opacity: i <= step ? 1 : 0.3 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: i <= step ? C.green600 : C.gray200, color: i <= step ? C.white : C.gray500, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i < step ? <Icon name="check" size={13} color={C.white} sw={2.5} /> : <Icon name={stepIcons[i]} size={13} />}
                </div>
                <span style={{ fontSize: 12, fontWeight: i === step ? 700 : 500, color: i === step ? C.green600 : C.gray500, display: i <= step ? "block" : "none" }}>{label}</span>
              </div>
              {i < 3 && <div style={{ width: 28, height: 1.5, background: i < step ? C.green600 : C.gray200 }} />}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {step === STEPS.MENU && <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ position: "relative", marginBottom: 14 }}>
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.gray400 }}><Icon name="search" size={16} /></div>
                  <input placeholder="ค้นหาสินค้า..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: 40 }} onFocus={focus} onBlur={blur} />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {allCats.map(cat => <button key={cat.key} onClick={() => setActiveCat(cat.key)} style={{ padding: "7px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", background: activeCat === cat.key ? C.green600 : C.white, color: activeCat === cat.key ? C.white : C.gray600, border: `1.5px solid ${activeCat === cat.key ? C.green600 : C.gray200}`, transition: "all 0.15s" }}>{cat.label}</button>)}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                {filtered.map(p => {
                  const c = cart.find(i => i.id === p.id);
                  return (
                    <div key={p.id} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray100}`, overflow: "hidden", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                      <div style={{ position: "relative" }}>
                        <Img product={p} style={{ width: "100%", height: 140, display: "block" }} imgErr={imgErr} setImgErr={setImgErr} />
                        {c && <div style={{ position: "absolute", top: 8, right: 8, background: C.green600, color: C.white, borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{c.qty} ชิ้น</div>}
                      </div>
                      <div style={{ padding: "12px 14px 14px" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.gray900, marginBottom: 2 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: C.gray400, marginBottom: 10, lineHeight: 1.5 }}>{p.desc}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <span style={{ fontSize: 18, fontWeight: 800, color: C.green600 }}>{p.price}฿</span><span style={{ fontSize: 11, color: C.gray400, marginLeft: 2 }}>/ชิ้น</span>
                            <div style={{ fontSize: 10, color: (p.stock ?? 0) <= 5 ? C.red500 : C.gray400, fontWeight: 600, marginTop: 2 }}>
                              {(p.stock ?? 0) <= 0 ? "สินค้าหมด" : `เหลือ ${p.stock} ชิ้น`}
                            </div>
                          </div>
                          {(p.stock ?? 0) <= 0 && !c ? (
                            <div style={{ padding: "6px 12px", borderRadius: 8, background: C.gray100, color: C.gray400, fontSize: 11, fontWeight: 700 }}>สินค้าหมด</div>
                          ) : c ? (
                            <div style={{ display: "flex", alignItems: "center", borderRadius: 8, overflow: "hidden", border: `1.5px solid ${C.green100}` }}>
                              <button onClick={() => updateQty(p.id, -1)} style={{ width: 30, height: 30, border: "none", cursor: "pointer", background: c.qty === 1 ? C.red50 : C.green50, color: c.qty === 1 ? C.red500 : C.green600, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={c.qty === 1 ? "trash" : "minus"} size={13} /></button>
                              <div style={{ width: 34, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, background: C.white, borderLeft: `1px solid ${C.green100}`, borderRight: `1px solid ${C.green100}` }}>{c.qty}</div>
                              <button onClick={() => updateQty(p.id, 1)} disabled={c.qty >= (p.stock ?? 999)} style={{ width: 30, height: 30, border: "none", cursor: c.qty >= (p.stock ?? 999) ? "not-allowed" : "pointer", background: c.qty >= (p.stock ?? 999) ? C.gray100 : C.green50, color: c.qty >= (p.stock ?? 999) ? C.gray300 : C.green600, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={13} /></button>
                            </div>
                          ) : (
                            <button onClick={() => { sfx.tap(); addToCart(p); }} style={{ width: 32, height: 32, borderRadius: 8, cursor: "pointer", background: C.green50, color: C.green600, border: `1.5px solid ${C.green100}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = C.green600; e.currentTarget.style.color = C.white; }}
                              onMouseLeave={e => { e.currentTarget.style.background = C.green50; e.currentTarget.style.color = C.green600; }}
                            ><Icon name="plus" size={15} /></button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filtered.length === 0 && <div style={{ textAlign: "center", padding: 60, color: C.gray400 }}><Icon name="search" size={36} color={C.gray300} /><div style={{ marginTop: 12 }}>ไม่พบสินค้าที่ค้นหา</div></div>}
            </>}
            {step === STEPS.ADDRESS && <div style={{ background: C.white, borderRadius: 12, padding: 28, border: `1px solid ${C.gray100}` }}>
              {/* Shipping method selector */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}><div style={{ width: 42, height: 42, borderRadius: 10, background: C.blue50, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="truck" size={20} color={C.blue600} /></div><div><div style={{ fontWeight: 700, fontSize: 17 }}>วิธีจัดส่ง</div><div style={{ fontSize: 12, color: C.gray400 }}>เลือกวิธีรับสินค้า</div></div></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {shippingMethods.filter(m => m.active).map(m => {
                    const sel = selectedShipping === m.id;
                    return (
                      <div key={m.id} onClick={() => setSelectedShipping(m.id)} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10,
                        border: `1.5px solid ${sel ? C.green600 : C.gray200}`,
                        background: sel ? C.green50 : C.white,
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                        onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = C.green500; }}
                        onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = C.gray200; }}
                      >
                        {/* Radio */}
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${sel ? C.green600 : C.gray300}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                          {sel && <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.green600 }} />}
                        </div>
                        {/* Icon */}
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: sel ? C.green100 : C.gray100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon name={m.icon} size={17} color={sel ? C.green700 : C.gray400} />
                        </div>
                        {/* Label */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: sel ? C.green700 : C.gray800 }}>{m.label}</div>
                          <div style={{ fontSize: 12, color: C.gray400, marginTop: 1 }}>{m.desc}</div>
                        </div>
                        {/* Price */}
                        <div style={{ fontWeight: 700, fontSize: 15, color: sel ? C.green600 : C.gray500, flexShrink: 0 }}>
                          {m.price === 0 ? "ฟรี" : `${m.price}฿`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Address form */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}><div style={{ width: 42, height: 42, borderRadius: 10, background: C.green50, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="mapPin" size={20} color={C.green600} /></div><div><div style={{ fontWeight: 700, fontSize: 17 }}>ที่อยู่จัดส่ง</div><div style={{ fontSize: 12, color: C.gray400 }}>กรอกข้อมูลผู้รับสินค้า</div></div></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="ชื่อ-นามสกุลผู้รับ" icon="user" value={address.name} onChange={e => setAddress(p => ({ ...p, name: e.target.value }))} placeholder="ชื่อจริง นามสกุล" />
                <Field label="เบอร์โทรศัพท์" icon="phone" value={address.phone} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} placeholder="0xx-xxx-xxxx" />
                <Field label="ที่อยู่ (บ้านเลขที่ ซอย ถนน)" icon="home" value={address.addr} onChange={e => setAddress(p => ({ ...p, addr: e.target.value }))} placeholder="123/45 ซอย... ถนน..." full />
                {/* จังหวัด dropdown */}
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon name="mapPin" size={13} color={C.gray400} /> จังหวัด
                    {!geoReady && <span style={{ fontSize: 10, color: C.amber600, fontWeight: 500 }}>(กำลังโหลด...)</span>}
                  </label>
                  <select value={address.province} onChange={e => setAddress(p => ({ ...p, province: e.target.value, amphoe: "", district: "", zip: "" }))} style={{ ...inp, cursor: "pointer", color: address.province ? C.gray900 : C.gray400 }}>
                    <option value="">-- เลือกจังหวัด --</option>
                    {geoProvinces.map(pv => <option key={pv} value={pv}>{pv}</option>)}
                  </select>
                </div>
                {/* อำเภอ/เขต */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}><Icon name="map" size={13} color={C.gray400} /> {address.province === "กรุงเทพมหานคร" ? "เขต" : "อำเภอ"}</label>
                  {geoReady && address.province && geoDistricts(address.province).length > 0 ? (
                    <select value={address.amphoe || ""} onChange={e => { const v = e.target.value; const subs = geoSubdistricts(address.province, v); const firstZip = subs[0] ? String(subs[0].postalCode || "") : ""; setAddress(p => ({ ...p, amphoe: v, district: "", zip: "" })); }} style={{ ...inp, cursor: "pointer" }}>
                      <option value="">-- เลือก{address.province === "กรุงเทพมหานคร" ? "เขต" : "อำเภอ"} --</option>
                      {geoDistricts(address.province).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
                    <input value={address.amphoe || ""} onChange={e => setAddress(p => ({ ...p, amphoe: e.target.value }))} placeholder={address.province === "กรุงเทพมหานคร" ? "เขต..." : "อำเภอ..."} style={inp} onFocus={focus} onBlur={blur} />
                  )}
                </div>
                {/* ตำบล/แขวง */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}><Icon name="map" size={13} color={C.gray400} /> {address.province === "กรุงเทพมหานคร" ? "แขวง" : "ตำบล"}</label>
                  {geoReady && address.province && address.amphoe && geoSubdistricts(address.province, address.amphoe).length > 0 ? (
                    <select value={address.district} onChange={e => { const v = e.target.value; const z = geoZip(address.province, address.amphoe, v); setAddress(p => ({ ...p, district: v, zip: z })); }} style={{ ...inp, cursor: "pointer" }}>
                      <option value="">-- เลือก{address.province === "กรุงเทพมหานคร" ? "แขวง" : "ตำบล"} --</option>
                      {geoSubdistricts(address.province, address.amphoe).map(s => <option key={s.subdistrictNameTh} value={s.subdistrictNameTh}>{s.subdistrictNameTh}</option>)}
                    </select>
                  ) : (
                    <input value={address.district} onChange={e => setAddress(p => ({ ...p, district: e.target.value }))} placeholder={address.province === "กรุงเทพมหานคร" ? "แขวง..." : "ตำบล..."} style={inp} onFocus={focus} onBlur={blur} />
                  )}
                </div>
                {/* รหัสไปรษณีย์ - auto filled */}
                <Field label="รหัสไปรษณีย์" icon="mail" value={address.zip} onChange={e => setAddress(p => ({ ...p, zip: e.target.value }))} placeholder="10xxx" />
                <Field label="หมายเหตุ (ถ้ามี)" icon="fileText" value={address.note} onChange={e => setAddress(p => ({ ...p, note: e.target.value }))} placeholder="จุดสังเกต, เวลาที่สะดวกรับของ" full multi />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}><BtnO onClick={() => setStep(STEPS.MENU)}><Icon name="arrowLeft" size={15} /> ย้อนกลับ</BtnO><BtnP onClick={() => setStep(STEPS.SLIP)} disabled={!addressValid} style={{ flex: 1 }}>ถัดไป: แนบสลิป <Icon name="arrowRight" size={15} /></BtnP></div>
            </div>}
            {step === STEPS.SLIP && <div style={{ background: C.white, borderRadius: 12, padding: 28, border: `1px solid ${C.gray100}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}><div style={{ width: 42, height: 42, borderRadius: 10, background: C.amber50, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="creditCard" size={20} color={C.amber600} /></div><div><div style={{ fontWeight: 700, fontSize: 17 }}>ชำระเงินและแนบสลิป</div><div style={{ fontSize: 12, color: C.gray400 }}>โอนเงินแล้วแนบหลักฐาน</div></div></div>
              <div style={{ background: C.green50, borderRadius: 10, padding: 20, marginBottom: 20, border: `1px solid ${C.green100}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.green700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Icon name="creditCard" size={14} color={C.green700} /> ข้อมูลการโอนเงิน</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", fontSize: 13 }}><div><span style={{ color: C.gray500 }}>ธนาคาร</span><br /><strong>กสิกรไทย (KBank)</strong></div><div><span style={{ color: C.gray500 }}>เลขบัญชี</span><br /><strong>xxx-x-xxxxx-x</strong></div><div><span style={{ color: C.gray500 }}>ชื่อบัญชี</span><br /><strong>บจก. ร้านค้าออนไลน์</strong></div><div><span style={{ color: C.gray500 }}>ยอดโอน</span><br /><strong style={{ color: C.green600, fontSize: 20 }}>{total.toLocaleString()}฿</strong></div></div>
              </div>
              <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${slipPreview ? C.green500 : C.gray300}`, borderRadius: 12, padding: slipPreview ? 0 : 48, textAlign: "center", cursor: "pointer", background: slipPreview ? "transparent" : C.gray50, overflow: "hidden", position: "relative" }}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleSlip} style={{ display: "none" }} />
                {slipPreview ? <div style={{ position: "relative" }}><img src={slipPreview} alt="slip" style={{ width: "100%", maxHeight: 380, objectFit: "contain", display: "block" }} /><button onClick={(e) => { e.stopPropagation(); setSlipFile(null); setSlipPreview(null); }} style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={13} color={C.white} /></button><div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "20px 16px 12px", display: "flex", alignItems: "center", gap: 8, color: C.white }}><Icon name="checkCircle" size={15} color="#86efac" /><div><div style={{ fontSize: 13, fontWeight: 700 }}>แนบสลิปเรียบร้อย</div><div style={{ fontSize: 11, opacity: 0.7 }}>{slipFile?.name}</div></div></div></div>
                  : <><div style={{ color: C.gray300, marginBottom: 12 }}><Icon name="upload" size={36} /></div><div style={{ fontWeight: 600, color: C.gray600, marginBottom: 4 }}>คลิกเพื่ออัปโหลดสลิปโอนเงิน</div><div style={{ fontSize: 12, color: C.gray400 }}>รองรับ JPG, PNG ขนาดไม่เกิน 5MB</div></>}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}><BtnO onClick={() => setStep(STEPS.ADDRESS)}><Icon name="arrowLeft" size={15} /> ย้อนกลับ</BtnO><BtnP onClick={() => setStep(STEPS.SUMMARY)} style={{ flex: 1 }}>ถัดไป: สรุปออเดอร์ <Icon name="arrowRight" size={15} /></BtnP></div>
            </div>}
            {step === STEPS.SUMMARY && <div>
              {confirmed ? <div style={{ background: C.white, borderRadius: 12, padding: 48, border: `1px solid ${C.gray100}`, textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.green50, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}><Icon name="checkCircle" size={36} color={C.green600} /></div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.green600, marginBottom: 6 }}>สั่งซื้อสำเร็จ</div>
                <div style={{ color: C.gray500, fontSize: 14, marginBottom: 4 }}>หมายเลขออเดอร์: <strong style={{ color: C.gray900 }}>{orders[0]?.id}</strong></div>
                <div style={{ color: C.gray400, fontSize: 13, marginBottom: 24 }}>เราจะตรวจสอบการชำระเงินและจัดส่งสินค้าให้เร็วที่สุด</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <BtnP onClick={resetShop}><Icon name="refreshCw" size={15} /> สั่งซื้อรายการใหม่</BtnP>
                  <BtnO onClick={() => { resetShop(); setPage("orders"); }}>ดูรายการคำสั่งซื้อ <Icon name="arrowRight" size={15} /></BtnO>
                </div>
              </div> : <>
                <div style={{ background: C.green600, borderRadius: 12, padding: "22px 28px", color: C.white, marginBottom: 16 }}><div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><Icon name="clipboard" size={14} color="rgba(255,255,255,0.8)" /> สรุปออเดอร์</div><div style={{ fontSize: 22, fontWeight: 800 }}>ตรวจสอบข้อมูลก่อนยืนยัน</div></div>
                <Section icon="mapPin" title="ข้อมูลผู้รับสินค้า"><div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "8px 16px", fontSize: 13 }}><span style={{ color: C.gray400, fontWeight: 600 }}>ชื่อผู้รับ</span><span style={{ fontWeight: 700 }}>{address.name}</span><span style={{ color: C.gray400, fontWeight: 600 }}>โทรศัพท์</span><span style={{ fontWeight: 700 }}>{address.phone}</span><span style={{ color: C.gray400, fontWeight: 600 }}>ที่อยู่</span><span>{address.addr} {address.district} {address.amphoe} {address.province} {address.zip}</span>{address.note && <><span style={{ color: C.gray400, fontWeight: 600 }}>หมายเหตุ</span><span>{address.note}</span></>}</div></Section>
                <Section icon="package" title={`รายการสินค้า (${totalItems} ชิ้น)`}>
                  {cart.map((item, i) => <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < cart.length - 1 ? `1px solid ${C.gray100}` : "none" }}><Img product={item} style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0 }} imgErr={imgErr} setImgErr={setImgErr} /><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div><div style={{ fontSize: 12, color: C.gray400 }}>{item.price}฿ x {item.qty} ชิ้น</div></div><div style={{ fontWeight: 700, fontSize: 15, color: C.green600 }}>{(item.price * item.qty).toLocaleString()}฿</div></div>)}
                  <div style={{ borderTop: `2px solid ${C.gray100}`, marginTop: 8, paddingTop: 10, display: "grid", gridTemplateColumns: "1fr auto", gap: "6px 20px", fontSize: 13 }}><span style={{ color: C.gray500 }}>ค่าสินค้ารวม</span><span style={{ textAlign: "right", fontWeight: 600 }}>{subtotal.toLocaleString()}฿</span>{discountAmt > 0 && <><span style={{ color: C.red500, fontWeight: 600 }}>ส่วนลด ({discountPct}%)</span><span style={{ textAlign: "right", fontWeight: 700, color: C.red500 }}>-{discountAmt.toLocaleString()}฿</span></>}<span style={{ color: C.gray500 }}>ค่าจัดส่ง ({shippingMethod?.label})</span><span style={{ textAlign: "right", fontWeight: 600 }}>{shipping === 0 ? "ฟรี" : `${shipping}฿`}</span><span style={{ fontWeight: 800, fontSize: 16, paddingTop: 8, borderTop: `1px solid ${C.gray200}` }}>ยอดรวมทั้งหมด</span><span style={{ fontWeight: 800, fontSize: 20, color: C.green600, textAlign: "right", paddingTop: 8, borderTop: `1px solid ${C.gray200}` }}>{total.toLocaleString()}฿</span></div>
                </Section>
                <Section icon="creditCard" title="หลักฐานการโอนเงิน">{slipPreview && <img src={slipPreview} alt="slip" style={{ width: "100%", maxHeight: 250, objectFit: "contain", borderRadius: 8, background: C.gray50 }} />}</Section>
                <div style={{ display: "flex", gap: 10 }}><BtnO onClick={() => setStep(STEPS.SLIP)}><Icon name="arrowLeft" size={15} /> แก้ไข</BtnO><BtnP onClick={confirmOrder} style={{ flex: 1, padding: "13px 20px", fontSize: 15, fontWeight: 700 }}><Icon name="check" size={16} /> ยืนยันสั่งซื้อ</BtnP></div>
              </>}
            </div>}
          </div>

          {/* Cart sidebar */}
          <div style={{ width: 320, flexShrink: 0, background: C.white, borderRadius: 12, border: `1px solid ${C.gray100}`, position: "sticky", top: 80, maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${C.gray100}`, display: "flex", alignItems: "center", gap: 8 }}><Icon name="shoppingCart" size={16} color={C.gray600} /><div><div style={{ fontWeight: 700, fontSize: 15 }}>ตะกร้าสินค้า</div><div style={{ fontSize: 11, color: C.gray400 }}>{totalItems} รายการ</div></div></div>
            {cart.length === 0 ? <div style={{ padding: 36, textAlign: "center" }}><Icon name="shoppingCart" size={28} color={C.gray200} /><div style={{ marginTop: 10, fontSize: 13, color: C.gray400 }}>ยังไม่มีสินค้าในตะกร้า</div></div> : <>
              <div style={{ padding: "6px 20px", maxHeight: 280, overflowY: "auto" }}>
                {cart.map(item => <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.gray50}` }}>
                  <Img product={item} style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} imgErr={imgErr} setImgErr={setImgErr} />
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div><div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}><button onClick={() => updateQty(item.id, -1)} style={{ width: 22, height: 22, borderRadius: 5, border: `1px solid ${C.gray200}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="minus" size={10} color={C.gray500} /></button><span style={{ fontWeight: 700, fontSize: 12, minWidth: 18, textAlign: "center" }}>{item.qty}</span><button onClick={() => updateQty(item.id, 1)} style={{ width: 22, height: 22, borderRadius: 5, border: `1px solid ${C.gray200}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={10} color={C.green600} /></button></div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, fontSize: 13, color: C.green600 }}>{(item.price * item.qty).toLocaleString()}฿</div><button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", color: C.gray300, cursor: "pointer", fontSize: 11, padding: 0, marginTop: 2, fontFamily: "inherit" }}>ลบ</button></div>
                </div>)}
              </div>
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.gray100}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.gray500, marginBottom: 3 }}><span>ค่าสินค้า</span><span>{subtotal.toLocaleString()}฿</span></div>
                {/* Discount input */}
                <div style={{ marginBottom: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>ส่วนลด</span>
                    {discountAmt > 0 && <span style={{ color: C.green600, fontWeight: 700 }}>-{discountPct}%</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      type="number" min="0" placeholder="0"
                      value={discountInput}
                      onChange={e => { const v = e.target.value; setDiscountInput(v); setDiscount(parseFloat(v) || 0); }}
                      style={{ ...inp, padding: "7px 10px", fontSize: 13, flex: 1 }}
                      onFocus={focus} onBlur={blur}
                    />
                    <span style={{ display: "flex", alignItems: "center", fontSize: 13, color: C.gray500, fontWeight: 600, paddingRight: 4 }}>฿</span>
                  </div>
                  {discountAmt > 0 && <div style={{ fontSize: 11, color: C.red500, fontWeight: 600, marginTop: 3 }}>-{discountAmt.toLocaleString()}฿ ({discountPct}%)</div>}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.gray500, marginBottom: 3 }}><span>ค่าจัดส่ง <span style={{ fontSize: 11, color: C.gray400 }}>({shippingMethod?.label})</span></span><span>{shipping === 0 ? <span style={{ color: C.green600, fontWeight: 600 }}>ฟรี</span> : `${shipping}฿`}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, paddingTop: 10, borderTop: `2px solid ${C.gray100}` }}><span>รวม</span><span style={{ color: C.green600 }}>{total.toLocaleString()}฿</span></div>
                {step === STEPS.MENU && <BtnP onClick={() => setStep(STEPS.ADDRESS)} disabled={cart.length === 0} style={{ width: "100%", marginTop: 12 }}>ดำเนินการสั่งซื้อ <Icon name="arrowRight" size={15} /></BtnP>}
              </div>
            </>}
          </div>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════
     PAGE: ORDERS DASHBOARD
     ════════════════════════════════════════════════════ */
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderFilter, setOrderFilter] = useState("all");
  const [editingOrder, setEditingOrder] = useState(null); // { id, date, status, address: {...} }

  const filteredOrders = orderFilter === "all" ? orders : orders.filter(o => o.status === orderFilter);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter(o => o.status === "pending").length;

  const renderOrders = () => (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "คำสั่งซื้อทั้งหมด", value: orders.length, icon: "clipboard", bg: C.blue50, ic: C.blue600 },
          { label: "รอตรวจสอบ", value: pendingCount, icon: "clock", bg: C.amber50, ic: C.amber600 },
          { label: "จัดส่งแล้ว", value: orders.filter(o => o.status === "shipped").length, icon: "truck", bg: C.green50, ic: C.green600 },
          { label: "ยอดขายรวม", value: `${totalRevenue.toLocaleString()}฿`, icon: "dollarSign", bg: C.green50, ic: C.green700 },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 10, padding: "16px 18px", border: `1px solid ${C.gray100}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: C.gray500, fontWeight: 600 }}>{s.label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={s.icon} size={16} color={s.ic} /></div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.gray900 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        {[{ k: "all", l: "ทั้งหมด" }, { k: "pending", l: "รอตรวจสอบ" }, { k: "shipped", l: "จัดส่งแล้ว" }, { k: "completed", l: "สำเร็จ" }, { k: "cancelled", l: "ยกเลิก" }].map(f => (
          <button key={f.k} onClick={() => setOrderFilter(f.k)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", background: orderFilter === f.k ? C.green600 : C.white, color: orderFilter === f.k ? C.white : C.gray600, border: `1.5px solid ${orderFilter === f.k ? C.green600 : C.gray200}` }}>{f.l}</button>
        ))}
        <div style={{ flex: 1 }} />
        <BtnO onClick={() => exportOrdersCSV(filteredOrders, `vandee_orders_${orderFilter}.csv`)} style={{ padding: "6px 14px", fontSize: 12 }}><Icon name="download" size={14} /> CSV</BtnO>
        <BtnO onClick={() => exportOrdersExcel(filteredOrders, `vandee_orders_${orderFilter}.xls`)} style={{ padding: "6px 14px", fontSize: 12 }}><Icon name="download" size={14} /> Excel</BtnO>
      </div>

      {/* Order cards */}
      {filteredOrders.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: C.gray400 }}><Icon name="clipboard" size={36} color={C.gray300} /><div style={{ marginTop: 12 }}>ไม่มีคำสั่งซื้อ</div></div> :
        filteredOrders.map(o => {
          const st = statusMap[o.status];
          const open = expandedOrder === o.id;
          const totalQty = o.items.reduce((s, i) => s + i.qty, 0);
          return (
            <div key={o.id} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray100}`, marginBottom: 12, overflow: "hidden", transition: "box-shadow 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.04)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              {/* Header row */}
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                <div onClick={() => setExpandedOrder(open ? null : o.id)} style={{ flex: 1, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: C.gray900 }}>{o.id}</span>
                    <span style={{ background: st.bg, color: st.color, padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.gray400, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="clock" size={12} color={C.gray400} /> {o.date}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="user" size={12} color={C.gray400} /> {o.address.name}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="package" size={12} color={C.gray400} /> {totalQty} ชิ้น</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", marginRight: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: C.green600 }}>{o.total.toLocaleString()}฿</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setEditingOrder(editingOrder?.id === o.id ? null : { id: o.id, date: o.date, status: o.status, address: { ...o.address } }); setExpandedOrder(o.id); }} style={{ background: editingOrder?.id === o.id ? C.green50 : "none", border: `1px solid ${editingOrder?.id === o.id ? C.green600 : C.gray200}`, borderRadius: 7, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <Icon name="edit" size={15} color={editingOrder?.id === o.id ? C.green600 : C.gray400} />
                </button>
                <div onClick={() => setExpandedOrder(open ? null : o.id)} style={{ cursor: "pointer" }}>
                  <Icon name={open ? "chevUp" : "chevDown"} size={18} color={C.gray400} />
                </div>
              </div>

              {/* Expanded detail */}
              {open && (
                <div style={{ borderTop: `1px solid ${C.gray100}`, padding: "0 20px 20px" }}>

                  {/* EDIT MODE */}
                  {editingOrder?.id === o.id ? (
                    <div style={{ paddingTop: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.green700, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                        <Icon name="edit" size={14} color={C.green600} /> แก้ไขข้อมูล order
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>วันที่/เวลา</label>
                          <input value={editingOrder.date} onChange={e => setEditingOrder(p => ({ ...p, date: e.target.value }))} style={{ ...inp, fontSize: 13 }} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>สถานะ</label>
                          <select value={editingOrder.status} onChange={e => setEditingOrder(p => ({ ...p, status: e.target.value }))} style={{ ...inp, fontSize: 13, background: C.white }}>
                            <option value="pending">รอตรวจสอบ</option>
                            <option value="shipped">จัดส่งแล้ว</option>
                            <option value="completed">สำเร็จ</option>
                            <option value="cancelled">ยกเลิก</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>ชื่อผู้รับ</label>
                          <input value={editingOrder.address.name || ""} onChange={e => setEditingOrder(p => ({ ...p, address: { ...p.address, name: e.target.value } }))} style={{ ...inp, fontSize: 13 }} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>โทรศัพท์</label>
                          <input value={editingOrder.address.phone || ""} onChange={e => setEditingOrder(p => ({ ...p, address: { ...p.address, phone: e.target.value } }))} style={{ ...inp, fontSize: 13 }} onFocus={focus} onBlur={blur} />
                        </div>
                        <div style={{ gridColumn: "1/-1" }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>ที่อยู่</label>
                          <input value={editingOrder.address.addr || ""} onChange={e => setEditingOrder(p => ({ ...p, address: { ...p.address, addr: e.target.value } }))} style={{ ...inp, fontSize: 13 }} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>จังหวัด</label>
                          <input value={editingOrder.address.province || ""} onChange={e => setEditingOrder(p => ({ ...p, address: { ...p.address, province: e.target.value } }))} style={{ ...inp, fontSize: 13 }} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>รหัสไปรษณีย์</label>
                          <input value={editingOrder.address.zip || ""} onChange={e => setEditingOrder(p => ({ ...p, address: { ...p.address, zip: e.target.value } }))} style={{ ...inp, fontSize: 13 }} onFocus={focus} onBlur={blur} />
                        </div>
                        <div style={{ gridColumn: "1/-1" }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>หมายเหตุ</label>
                          <input value={editingOrder.address.note || ""} onChange={e => setEditingOrder(p => ({ ...p, address: { ...p.address, note: e.target.value } }))} placeholder="หมายเหตุ (ถ้ามี)" style={{ ...inp, fontSize: 13 }} onFocus={focus} onBlur={blur} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <BtnP onClick={() => {
                          const updated = { ...o, date: editingOrder.date, status: editingOrder.status, address: editingOrder.address };
                          isEditing.current = true;
                          setOrders(prev => prev.map(x => x.id === o.id ? updated : x));
                          const { slipData: _sd, ...orderClean } = updated;
                          sb.upsertOrder(orderClean);
                          syncOrder(updated);
                          setEditingOrder(null);
                          sfx.success();
                          setTimeout(() => { isEditing.current = false; }, 2000);
                        }} style={{ padding: "9px 20px" }}>
                          <Icon name="save" size={14} /> บันทึก
                        </BtnP>
                        <BtnO onClick={() => setEditingOrder(null)} style={{ padding: "9px 16px" }}>ยกเลิก</BtnO>
                      </div>
                    </div>
                  ) : (<>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 16 }}>
                    {/* Recipient */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.gray500, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <Icon name="mapPin" size={13} color={C.gray400} /> ข้อมูลผู้รับ
                        <button onClick={() => { const txt = `${o.address.name}\n${o.address.phone}\n${o.address.addr}\n${o.address.district} ${o.address.province} ${o.address.zip}${o.address.note ? "\n" + o.address.note : ""}`; navigator.clipboard.writeText(txt).then(() => { sfx.success(); const el = document.getElementById("copy-addr-" + o.id); if (el) { el.textContent = "คัดลอกแล้ว"; setTimeout(() => el.textContent = "คัดลอก", 1500); } }); }} style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 6, border: `1px solid ${C.gray200}`, background: C.white, color: C.gray500, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4, transition: "all 0.15s" }}><Icon name="clipboard" size={11} color={C.gray400} /><span id={"copy-addr-" + o.id}>คัดลอก</span></button>
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                        <div><strong>{o.address.name}</strong></div>
                        <div style={{ color: C.gray500 }}>{o.address.phone}</div>
                        <div style={{ color: C.gray500 }}>{o.address.addr}</div>
                        <div style={{ color: C.gray500 }}>{o.address.district} {o.address.province} {o.address.zip}</div>
                        {o.address.note && <div style={{ color: C.amber700, marginTop: 4, fontSize: 12 }}>หมายเหตุ: {o.address.note}</div>}
                      </div>
                    </div>
                    {/* Items */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.gray500, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Icon name="package" size={13} color={C.gray400} /> รายการสินค้า</div>
                      {o.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < o.items.length - 1 ? `1px solid ${C.gray100}` : "none", fontSize: 13 }}>
                          <span>{item.name} <span style={{ color: C.gray400 }}>x{item.qty}</span></span>
                          <span style={{ fontWeight: 600 }}>{(item.price * item.qty).toLocaleString()}฿</span>
                        </div>
                      ))}
                      <div style={{ borderTop: `2px solid ${C.gray100}`, marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: C.gray500 }}>ค่าสินค้า</span><span style={{ fontWeight: 600 }}>{(o.subtotal || 0).toLocaleString()}฿</span>
                      </div>
                      {o.discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 3 }}>
                        <span style={{ color: C.red500, fontWeight: 600 }}>ส่วนลด ({o.discountPct || 0}%)</span><span style={{ fontWeight: 700, color: C.red500 }}>-{(o.discount || 0).toLocaleString()}฿</span>
                      </div>}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 3 }}>
                        <span style={{ color: C.gray500 }}>ค่าส่ง ({o.shippingLabel || "จัดส่งทั่วไป"})</span><span style={{ fontWeight: 600 }}>{o.shipping === 0 ? "ฟรี" : `${o.shipping}฿`}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, marginTop: 6 }}>
                        <span>รวม</span><span style={{ color: C.green600 }}>{o.total.toLocaleString()}฿</span>
                      </div>
                    </div>
                  </div>
                  {/* Slip viewer */}
                  {(o.slipData || o.slipName) && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.gray100}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.gray500, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                        <Icon name="creditCard" size={13} color={C.gray400} /> หลักฐานการโอนเงิน
                      </div>
                      {o.slipData ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <img src={o.slipData} alt="สลิป" style={{ height: 80, borderRadius: 8, border: `1px solid ${C.gray200}`, cursor: "pointer" }} onClick={() => setSlipModal(o.slipData)} />
                          <div>
                            <div style={{ fontSize: 12, color: C.gray500 }}>{o.slipName || "slip.jpg"}</div>
                            <button onClick={() => setSlipModal(o.slipData)} style={{ marginTop: 4, padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.green600}`, background: C.white, color: C.green600, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><Icon name="search" size={12} /> ดูสลิป</button>
                          </div>
                        </div>
                      ) : (
                        <SlipLoader orderId={o.id} slipName={o.slipName} onLoaded={(data) => { setOrders(prev => prev.map(x => x.id === o.id ? { ...x, slipData: data } : x)); }} />
                      )}
                    </div>
                  )}
                  {/* Status Selector */}
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.gray100}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.gray500, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="truck" size={13} color={C.gray400} /> อัปเดตสถานะการจัดส่ง
                    </div>
                    <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1.5px solid ${C.gray200}` }}>
                      {[
                        { key: "pending", label: "รอตรวจสอบ", icon: "clock", activeBg: C.amber100, activeColor: C.amber700, activeBorder: C.amber600 },
                        { key: "shipped", label: "จัดส่งแล้ว", icon: "truck", activeBg: C.blue50, activeColor: C.blue600, activeBorder: C.blue600 },
                        { key: "completed", label: "สำเร็จ", icon: "checkCircle", activeBg: C.green100, activeColor: C.green700, activeBorder: C.green600 },
                        { key: "cancelled", label: "ยกเลิก", icon: "x", activeBg: C.red50, activeColor: C.red600, activeBorder: C.red500 },
                      ].map((s, idx) => {
                        const active = o.status === s.key;
                        return (
                          <button
                            key={s.key}
                            onClick={() => { const updated = { ...o, status: s.key }; setOrders(prev => prev.map(x => x.id === o.id ? updated : x)); sb.upsertOrder(updated); syncOrder(updated); }}
                            style={{
                              flex: 1, padding: "10px 8px", border: "none",
                              borderRight: idx < 3 ? `1px solid ${C.gray200}` : "none",
                              background: active ? s.activeBg : C.white,
                              color: active ? s.activeColor : C.gray400,
                              fontWeight: active ? 700 : 500, fontSize: 12,
                              cursor: "pointer", fontFamily: "inherit",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                              transition: "all 0.15s",
                              boxShadow: active ? `inset 0 -2px 0 ${s.activeBorder}` : "none",
                            }}
                            onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.gray50; }}
                            onMouseLeave={e => { if (!active) e.currentTarget.style.background = C.white; }}
                          >
                            <Icon name={s.icon} size={14} color={active ? s.activeColor : C.gray300} />
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Delete order */}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.gray100}`, display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={() => {
                      setConfirmModal({
                        title: "ลบคำสั่งซื้อ",
                        message: `ต้องการลบคำสั่งซื้อ ${o.id} ใช่หรือไม่?`,
                        details: [
                          { label: "ผู้รับ", value: o.address?.name },
                          { label: "ยอดรวม", value: `${o.total?.toLocaleString()}฿` },
                          { label: "สถานะ", value: statusMap[o.status]?.label },
                        ],
                        warning: "การลบจะไม่สามารถกู้คืนได้",
                        onConfirm: async () => {
                          deletedIds.current.add(o.id);
                          await sb.deleteOrder(o.id);
                          setOrders(prev => prev.filter(x => x.id !== o.id));
                          setExpandedOrder(null);
                          setConfirmModal(null);
                        },
                      });
                    }} style={{
                      padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${C.red500}`,
                      background: C.white, color: C.red500, fontWeight: 600, fontSize: 12,
                      cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5,
                      transition: "all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.red50; }}
                      onMouseLeave={e => { e.currentTarget.style.background = C.white; }}
                    ><Icon name="trash" size={14} color={C.red500} /> ลบคำสั่งซื้อ</button>
                  </div>
                  </>)}
                </div>
              )}
            </div>
          );
        })
      }
    </div>
  );

  /* ════════════════════════════════════════════════════
     PAGE: PRODUCT MANAGEMENT
     ════════════════════════════════════════════════════ */
  const [editProduct, setEditProduct] = useState(null); // null | "new" | product object
  const [prodForm, setProdForm] = useState({ name: "", desc: "", price: "", cat: "snack", img: "", stock: "" });

  const startAdd = () => { setProdForm({ name: "", desc: "", price: "", cat: "snack", img: "", stock: "" }); setEditProduct("new"); };
  const startEdit = (p) => { setProdForm({ name: p.name, desc: p.desc, price: String(p.price), cat: p.cat, img: p.img, stock: String(p.stock ?? 0) }); setEditProduct(p); };
  const cancelEdit = () => setEditProduct(null);
  const saveProduct = () => {
    isEditing.current = true;
    const data = { name: prodForm.name, desc: prodForm.desc, price: Number(prodForm.price), cat: prodForm.cat, img: prodForm.img || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop", active: true, stock: Number(prodForm.stock) || 0 };
    if (editProduct === "new") {
      setProducts(prev => [...prev, { ...data, id: nextId }]);
      setNextId(n => n + 1);
    } else {
      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...data } : p));
    }
    setEditProduct(null);
    setTimeout(() => isEditing.current = false, 2000);
  };
  const deleteProduct = (p) => {
    isEditing.current = true;
    setConfirmModal({
      title: "ลบสินค้า",
      message: `ต้องการลบสินค้า "${p.name}" ใช่หรือไม่?`,
      details: [{ label: "ราคา", value: `${p.price}฿` }, { label: "สต็อก", value: `${p.stock ?? 0} ชิ้น` }],
      warning: "การลบจะไม่สามารถกู้คืนได้",
      onConfirm: () => { setProducts(prev => prev.filter(x => x.id !== p.id)); setConfirmModal(null); setTimeout(() => isEditing.current = false, 2000); },
    });
  };
  const toggleActive = (id) => setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const formValid = prodForm.name && prodForm.desc && prodForm.price && Number(prodForm.price) > 0;

  const renderProducts = () => (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><div style={{ fontWeight: 700, fontSize: 18 }}>จัดการสินค้า</div><div style={{ fontSize: 12, color: C.gray400 }}>สินค้าทั้งหมด {products.length} รายการ (เปิดขาย {products.filter(p => p.active).length})</div></div>
        <BtnP onClick={startAdd}><Icon name="plus" size={15} /> เพิ่มสินค้าใหม่</BtnP>
      </div>

      {/* Add/Edit Form */}
      {editProduct && (
        <div style={{ background: C.white, borderRadius: 12, padding: 24, border: `1.5px solid ${C.green200}`, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name={editProduct === "new" ? "plus" : "edit"} size={16} color={C.green600} />
            {editProduct === "new" ? "เพิ่มสินค้าใหม่" : `แก้ไข: ${editProduct.name}`}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>ชื่อสินค้า</label><input value={prodForm.name} onChange={e => setProdForm(p => ({ ...p, name: e.target.value }))} placeholder="เช่น Espresso" style={inp} onFocus={focus} onBlur={blur} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>ราคา (บาท)</label><input type="number" value={prodForm.price} onChange={e => setProdForm(p => ({ ...p, price: e.target.value }))} placeholder="0" style={inp} onFocus={focus} onBlur={blur} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>จำนวนสต็อก (ชิ้น)</label><input type="number" value={prodForm.stock} onChange={e => setProdForm(p => ({ ...p, stock: e.target.value }))} placeholder="0" style={inp} onFocus={focus} onBlur={blur} /></div>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>รายละเอียด</label><input value={prodForm.desc} onChange={e => setProdForm(p => ({ ...p, desc: e.target.value }))} placeholder="คำอธิบายสั้น ๆ" style={inp} onFocus={focus} onBlur={blur} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>หมวดหมู่</label><select value={prodForm.cat} onChange={e => setProdForm(p => ({ ...p, cat: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>{categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>URL รูปภาพ (ถ้ามี)</label><input value={prodForm.img} onChange={e => setProdForm(p => ({ ...p, img: e.target.value }))} placeholder="https://..." style={inp} onFocus={focus} onBlur={blur} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <BtnO onClick={cancelEdit}><Icon name="x" size={14} /> ยกเลิก</BtnO>
            <BtnP onClick={saveProduct} disabled={!formValid}><Icon name="save" size={14} /> บันทึก</BtnP>
          </div>
        </div>
      )}

      {/* Product table */}
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray100}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.gray50, borderBottom: `1px solid ${C.gray200}` }}>
              {["สินค้า", "หมวดหมู่", "ราคา", "สต็อก", "สถานะ", "จัดการ"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: C.gray500, fontSize: 12 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const catLabel = categories.find(c => c.key === p.cat)?.label || p.cat;
              return (
                <tr key={p.id} style={{ borderBottom: `1px solid ${C.gray100}` }} onMouseEnter={e => e.currentTarget.style.background = C.gray50} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Img product={p} style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} imgErr={imgErr} setImgErr={setImgErr} />
                      <div><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 11, color: C.gray400, marginTop: 1 }}>{p.desc}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 16px", color: C.gray500 }}>{catLabel}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 700, color: C.green600 }}>{p.price}฿</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ fontWeight: 700, color: (p.stock ?? 0) <= 5 ? C.red500 : (p.stock ?? 0) <= 20 ? C.amber600 : C.gray700 }}>{p.stock ?? 0}</span>
                    <span style={{ fontSize: 11, color: C.gray400, marginLeft: 3 }}>ชิ้น</span>
                    {(p.stock ?? 0) <= 5 && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: C.red500, background: C.red50, padding: "1px 6px", borderRadius: 8 }}>ใกล้หมด</span>}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <button onClick={() => toggleActive(p.id)} style={{
                      padding: "3px 12px", borderRadius: 12, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none",
                      background: p.active ? C.green100 : C.gray100, color: p.active ? C.green700 : C.gray500,
                    }}>{p.active ? "เปิดขาย" : "ปิดขาย"}</button>
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => startEdit(p)} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.gray200}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="edit" size={14} color={C.gray500} /></button>
                      <button onClick={() => deleteProduct(p)} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.gray200}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="trash" size={14} color={C.red500} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════
     PAGE: CATEGORY MANAGEMENT
     ════════════════════════════════════════════════════ */
  const [newCatLabel, setNewCatLabel] = useState("");
  const [editCatIdx, setEditCatIdx] = useState(null);
  const [editCatLabel, setEditCatLabel] = useState("");

  const addCategory = () => {
    if (!newCatLabel.trim()) return;
    isEditing.current = true;
    const key = newCatLabel.trim().toLowerCase().replace(/\s+/g, "_") + "_" + Date.now().toString(36);
    setCategories(prev => [...prev, { key, label: newCatLabel.trim() }]);
    setNewCatLabel("");
    setTimeout(() => isEditing.current = false, 2000);
  };
  const startEditCat = (idx) => { setEditCatIdx(idx); setEditCatLabel(categories[idx].label); };
  const saveEditCat = () => {
    if (!editCatLabel.trim()) return;
    isEditing.current = true;
    setCategories(prev => prev.map((c, i) => i === editCatIdx ? { ...c, label: editCatLabel.trim() } : c));
    setEditCatIdx(null); setEditCatLabel("");
    setTimeout(() => isEditing.current = false, 2000);
  };
  const deleteCat = (idx) => {
    const cat = categories[idx];
    const usedCount = products.filter(p => p.cat === cat.key).length;
    isEditing.current = true;
    setConfirmModal({
      title: "ลบหมวดหมู่",
      message: `ต้องการลบหมวดหมู่ "${cat.label}" ใช่หรือไม่?`,
      details: [{ label: "สินค้าในหมวด", value: `${usedCount} รายการ` }],
      warning: usedCount > 0 ? `มีสินค้า ${usedCount} รายการในหมวดนี้ สินค้าจะไม่ถูกลบแต่จะไม่มีหมวด` : "การลบจะไม่สามารถกู้คืนได้",
      onConfirm: () => { setCategories(prev => prev.filter((_, i) => i !== idx)); if (editCatIdx === idx) { setEditCatIdx(null); setEditCatLabel(""); } setConfirmModal(null); setTimeout(() => isEditing.current = false, 2000); },
    });
  };
  const moveCat = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= categories.length) return;
    isEditing.current = true;
    setCategories(prev => {
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
    if (editCatIdx === idx) setEditCatIdx(newIdx);
    else if (editCatIdx === newIdx) setEditCatIdx(idx);
    setTimeout(() => isEditing.current = false, 2000);
  };

  const renderCategories = () => (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>จัดการหมวดหมู่</div>
        <div style={{ fontSize: 12, color: C.gray400 }}>เพิ่ม ลบ แก้ไข หรือจัดลำดับหมวดหมู่สินค้า</div>
      </div>

      {/* Add new */}
      <div style={{ background: C.white, borderRadius: 12, padding: 20, border: `1px solid ${C.gray100}`, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.gray700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="plus" size={14} color={C.green600} /> เพิ่มหมวดหมู่ใหม่
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={newCatLabel}
            onChange={e => setNewCatLabel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCategory()}
            placeholder="ชื่อหมวดหมู่ เช่น เครื่องดื่มเย็น"
            style={{ ...inp, flex: 1 }}
            onFocus={focus} onBlur={blur}
          />
          <BtnP onClick={addCategory} disabled={!newCatLabel.trim()} style={{ padding: "10px 20px" }}>
            <Icon name="plus" size={15} /> เพิ่ม
          </BtnP>
        </div>
      </div>

      {/* Preview */}
      <div style={{ background: C.white, borderRadius: 12, padding: 20, border: `1px solid ${C.gray100}`, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.gray700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="eye" size={14} color={C.gray400} /> ตัวอย่างที่หน้าร้าน
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {allCats.map(cat => (
            <div key={cat.key} style={{
              padding: "7px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: cat.key === "all" ? C.green600 : C.white,
              color: cat.key === "all" ? C.white : C.gray600,
              border: `1.5px solid ${cat.key === "all" ? C.green600 : C.gray200}`,
            }}>{cat.label}</div>
          ))}
        </div>
      </div>

      {/* Category list */}
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray100}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.gray100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.gray700 }}>หมวดหมู่ทั้งหมด ({categories.length})</span>
          <span style={{ fontSize: 11, color: C.gray400 }}>ลากจัดลำดับด้วยปุ่มลูกศร</span>
        </div>

        {/* Fixed "ทั้งหมด" row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${C.gray100}`, background: C.gray50 }}>
          <div style={{ width: 56 }} />
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.green50, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="list" size={15} color={C.green600} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>ทั้งหมด</span>
            <span style={{ fontSize: 11, color: C.gray400, marginLeft: 8 }}>ค่าเริ่มต้น (ไม่สามารถลบได้)</span>
          </div>
        </div>

        {/* Dynamic categories */}
        {categories.map((cat, idx) => {
          const count = products.filter(p => p.cat === cat.key).length;
          const isEditing = editCatIdx === idx;
          return (
            <div key={cat.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderBottom: `1px solid ${C.gray100}`, background: isEditing ? C.green50 : "transparent", transition: "background 0.15s" }}
              onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = C.gray50; }}
              onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = "transparent"; }}
            >
              {/* Reorder */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button onClick={() => moveCat(idx, -1)} disabled={idx === 0} style={{ width: 24, height: 18, borderRadius: 4, border: `1px solid ${C.gray200}`, background: C.white, cursor: idx === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: idx === 0 ? 0.3 : 1 }}>
                  <Icon name="chevUp" size={12} color={C.gray500} />
                </button>
                <button onClick={() => moveCat(idx, 1)} disabled={idx === categories.length - 1} style={{ width: 24, height: 18, borderRadius: 4, border: `1px solid ${C.gray200}`, background: C.white, cursor: idx === categories.length - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: idx === categories.length - 1 ? 0.3 : 1 }}>
                  <Icon name="chevDown" size={12} color={C.gray500} />
                </button>
              </div>

              {/* Icon */}
              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.gray100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="grid" size={15} color={C.gray400} />
              </div>

              {/* Name / Edit */}
              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      value={editCatLabel}
                      onChange={e => setEditCatLabel(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && saveEditCat()}
                      style={{ ...inp, padding: "6px 12px", fontSize: 13, flex: 1 }}
                      onFocus={focus} onBlur={blur}
                      autoFocus
                    />
                    <button onClick={saveEditCat} style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: C.green600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="check" size={13} color={C.white} sw={2.5} />
                    </button>
                    <button onClick={() => { setEditCatIdx(null); setEditCatLabel(""); }} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.gray200}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="x" size={13} color={C.gray500} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{cat.label}</span>
                    <span style={{ fontSize: 11, color: C.gray400, background: C.gray100, borderRadius: 10, padding: "1px 8px" }}>{count} สินค้า</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isEditing && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => startEditCat(idx)} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.gray200}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="edit" size={14} color={C.gray500} />
                  </button>
                  <button onClick={() => deleteCat(idx)} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.gray200}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="trash" size={14} color={C.red500} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {categories.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: C.gray400 }}>
            <Icon name="list" size={32} color={C.gray200} />
            <div style={{ marginTop: 10, fontSize: 13 }}>ยังไม่มีหมวดหมู่ กรุณาเพิ่มหมวดหมู่ใหม่</div>
          </div>
        )}
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════
     PAGE: SHIPPING MANAGEMENT
     ════════════════════════════════════════════════════ */
  const [editShipId, setEditShipId] = useState(null);
  const [shipForm, setShipForm] = useState({ label: "", desc: "", price: "", icon: "truck" });
  const shipIcons = [
    { key: "truck", label: "รถขนส่ง" }, { key: "package", label: "พัสดุ" }, { key: "mapPin", label: "ในพื้นที่" },
    { key: "home", label: "รับหน้าร้าน" }, { key: "phone", label: "ออฟไลน์" }, { key: "mail", label: "ไปรษณีย์" },
  ];

  const startAddShip = () => { setShipForm({ label: "", desc: "", price: "", icon: "truck" }); setEditShipId("new"); };
  const startEditShip = (m) => { setShipForm({ label: m.label, desc: m.desc, price: String(m.price), icon: m.icon }); setEditShipId(m.id); };
  const cancelShipEdit = () => { setEditShipId(null); };
  const saveShip = () => {
    isEditing.current = true;
    const data = { label: shipForm.label, desc: shipForm.desc, price: Number(shipForm.price) || 0, icon: shipForm.icon, active: true };
    if (editShipId === "new") {
      const id = "ship_" + Date.now().toString(36);
      setShippingMethods(prev => [...prev, { ...data, id }]);
    } else {
      setShippingMethods(prev => prev.map(m => m.id === editShipId ? { ...m, ...data } : m));
    }
    setEditShipId(null);
    setTimeout(() => isEditing.current = false, 2000);
  };
  const deleteShip = (ship) => {
    isEditing.current = true;
    setConfirmModal({
      title: "ลบวิธีจัดส่ง",
      message: `ต้องการลบ "${ship.label}" ใช่หรือไม่?`,
      details: [{ label: "ค่าส่ง", value: ship.price === 0 ? "ฟรี" : `${ship.price}฿` }],
      warning: "การลบจะไม่สามารถกู้คืนได้",
      onConfirm: () => { setShippingMethods(prev => prev.filter(m => m.id !== ship.id)); setConfirmModal(null); setTimeout(() => isEditing.current = false, 2000); },
    });
  };
  const toggleShip = (id) => setShippingMethods(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
  const shipFormValid = shipForm.label && shipForm.desc;

  const renderShipping = () => (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><div style={{ fontWeight: 700, fontSize: 18 }}>จัดการวิธีจัดส่ง</div><div style={{ fontSize: 12, color: C.gray400 }}>เพิ่ม ลบ แก้ไขวิธีจัดส่งและราคา เปิด/ปิดตัวเลือกที่หน้าร้าน</div></div>
        <BtnP onClick={startAddShip}><Icon name="plus" size={15} /> เพิ่มวิธีจัดส่ง</BtnP>
      </div>

      {/* Add / Edit form */}
      {editShipId && (
        <div style={{ background: C.white, borderRadius: 12, padding: 24, border: `1.5px solid ${C.green200}`, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name={editShipId === "new" ? "plus" : "edit"} size={16} color={C.green600} />
            {editShipId === "new" ? "เพิ่มวิธีจัดส่งใหม่" : "แก้ไขวิธีจัดส่ง"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>ชื่อวิธีจัดส่ง</label><input value={shipForm.label} onChange={e => setShipForm(p => ({ ...p, label: e.target.value }))} placeholder="เช่น จัดส่งด่วน" style={inp} onFocus={focus} onBlur={blur} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>ราคา (บาท, 0 = ฟรี)</label><input type="number" value={shipForm.price} onChange={e => setShipForm(p => ({ ...p, price: e.target.value }))} placeholder="0" style={inp} onFocus={focus} onBlur={blur} /></div>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>รายละเอียด</label><input value={shipForm.desc} onChange={e => setShipForm(p => ({ ...p, desc: e.target.value }))} placeholder="เช่น Kerry / Flash Express (2-3 วัน)" style={inp} onFocus={focus} onBlur={blur} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>ไอคอน</label>
              <div style={{ display: "flex", gap: 6 }}>
                {shipIcons.map(ic => (
                  <button key={ic.key} onClick={() => setShipForm(p => ({ ...p, icon: ic.key }))} title={ic.label} style={{
                    width: 38, height: 38, borderRadius: 8, border: `1.5px solid ${shipForm.icon === ic.key ? C.green600 : C.gray200}`,
                    background: shipForm.icon === ic.key ? C.green50 : C.white, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}><Icon name={ic.key} size={17} color={shipForm.icon === ic.key ? C.green600 : C.gray400} /></button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <BtnO onClick={cancelShipEdit}><Icon name="x" size={14} /> ยกเลิก</BtnO>
            <BtnP onClick={saveShip} disabled={!shipFormValid}><Icon name="save" size={14} /> บันทึก</BtnP>
          </div>
        </div>
      )}

      {/* Shipping methods table */}
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray100}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.gray50, borderBottom: `1px solid ${C.gray200}` }}>
              {["วิธีจัดส่ง", "รายละเอียด", "ราคา", "สถานะ", "จัดการ"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: C.gray500, fontSize: 12 }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {shippingMethods.map(m => (
              <tr key={m.id} style={{ borderBottom: `1px solid ${C.gray100}` }} onMouseEnter={e => e.currentTarget.style.background = C.gray50} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gray100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={m.icon} size={17} color={C.gray500} /></div>
                    <span style={{ fontWeight: 600 }}>{m.label}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", color: C.gray500, fontSize: 12 }}>{m.desc}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: m.price === 0 ? C.green600 : C.gray800 }}>{m.price === 0 ? "ฟรี" : `${m.price}฿`}</td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={() => toggleShip(m.id)} style={{
                    padding: "3px 12px", borderRadius: 12, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none",
                    background: m.active ? C.green100 : C.gray100, color: m.active ? C.green700 : C.gray500,
                  }}>{m.active ? "เปิดใช้" : "ปิดใช้"}</button>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEditShip(m)} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.gray200}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="edit" size={14} color={C.gray500} /></button>
                    <button onClick={() => deleteShip(m)} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.gray200}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="trash" size={14} color={C.red500} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shippingMethods.length === 0 && <div style={{ padding: 40, textAlign: "center", color: C.gray400 }}><Icon name="truck" size={32} color={C.gray200} /><div style={{ marginTop: 10, fontSize: 13 }}>ยังไม่มีวิธีจัดส่ง</div></div>}
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════
     PAGE: DASHBOARD
     ════════════════════════════════════════════════════ */
  const [dashPeriod, setDashPeriod] = useState("month"); // day | week | month | year | custom
  const [dashDateFrom, setDashDateFrom] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; });
  const [dashDateTo, setDashDateTo] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; });

  const getDateRange = () => {
    const now = new Date();
    let from, to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    if (dashPeriod === "day") { from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); }
    else if (dashPeriod === "week") { const d = now.getDay(); from = new Date(now); from.setDate(now.getDate() - (d === 0 ? 6 : d - 1)); from.setHours(0,0,0,0); }
    else if (dashPeriod === "month") { from = new Date(now.getFullYear(), now.getMonth(), 1); }
    else if (dashPeriod === "year") { from = new Date(now.getFullYear(), 0, 1); }
    else { from = new Date(dashDateFrom + "T00:00:00"); to = new Date(dashDateTo + "T23:59:59"); }
    return { from: from.getTime(), to: to.getTime() };
  };

  const { from: rangeFrom, to: rangeTo } = getDateRange();
  const getTs = (o) => {
    if (o.ts) return typeof o.ts === "number" ? o.ts : Number(o.ts);
    if (o.date) {
      // date format: "17/3/2569 10:37" (th-TH locale, พ.ศ.)
      const m = o.date.match(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+)/);
      if (m) { let y = +m[3]; if (y > 2500) y -= 543; return new Date(y, +m[2]-1, +m[1], +m[4], +m[5]).getTime(); }
    }
    return 0;
  };
  const dashOrders = orders.filter(o => { const t = getTs(o); return t && t >= rangeFrom && t <= rangeTo; });
  const dashCompleted = dashOrders.filter(o => o.status !== "cancelled");
  const dashRevenue = dashCompleted.reduce((s, o) => s + o.total, 0);
  const dashItemCount = dashCompleted.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.qty, 0), 0);
  const dashAvg = dashCompleted.length > 0 ? Math.round(dashRevenue / dashCompleted.length) : 0;

  // Group revenue by sub-period for chart
  const getChartData = () => {
    const groups = {};
    dashCompleted.forEach(o => {
      const d = new Date(getTs(o));
      let key, sortKey;
      if (dashPeriod === "day") { key = `${d.getHours().toString().padStart(2,"0")}:00`; sortKey = d.getHours(); }
      else if (dashPeriod === "week" || dashPeriod === "custom" || dashPeriod === "month") { key = `${d.getDate()}/${d.getMonth()+1}`; sortKey = d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate(); }
      else { key = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."][d.getMonth()]; sortKey = d.getMonth(); }
      if (!groups[key]) groups[key] = { value: 0, sortKey };
      groups[key].value += o.total;
    });
    return Object.entries(groups).map(([k, v]) => ({ label: k, value: v.value, sortKey: v.sortKey })).sort((a, b) => a.sortKey - b.sortKey);
  };
  const chartData = getChartData();
  const chartMax = Math.max(...chartData.map(d => d.value), 1);

  // Top products
  const getTopProducts = () => {
    const map = {};
    dashCompleted.forEach(o => o.items.forEach(i => {
      if (!map[i.name]) map[i.name] = { name: i.name, qty: 0, revenue: 0 };
      map[i.name].qty += i.qty;
      map[i.name].revenue += i.price * i.qty;
    }));
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  };
  const topProducts = getTopProducts();
  const topMax = Math.max(...topProducts.map(p => p.revenue), 1);

  // Status breakdown
  const statusBreakdown = [
    { key: "pending", label: "รอตรวจสอบ", count: dashOrders.filter(o => o.status === "pending").length, color: C.amber600 },
    { key: "shipped", label: "จัดส่งแล้ว", count: dashOrders.filter(o => o.status === "shipped").length, color: C.blue600 },
    { key: "completed", label: "สำเร็จ", count: dashOrders.filter(o => o.status === "completed").length, color: C.statusGreen600 },
    { key: "cancelled", label: "ยกเลิก", count: dashOrders.filter(o => o.status === "cancelled").length, color: C.red500 },
  ];

  const periodLabel = { day: "วันนี้", week: "สัปดาห์นี้", month: "เดือนนี้", year: "ปีนี้", custom: "กำหนดเอง" };

  const renderDashboard = () => (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><div style={{ fontWeight: 700, fontSize: 18 }}>แดชบอร์ดสรุปรายรับ</div><div style={{ fontSize: 12, color: C.gray400 }}>ข้อมูลรายรับและคำสั่งซื้อ ช่วง: {periodLabel[dashPeriod]}</div></div>
        <div style={{ display: "flex", gap: 8 }}>
          <BtnO onClick={() => exportOrdersCSV(dashCompleted, `vandee_orders_${dashPeriod}.csv`)} style={{ padding: "8px 14px", fontSize: 12 }}><Icon name="download" size={14} /> ออเดอร์ CSV</BtnO>
          <BtnO onClick={() => exportDashboardCSV({ revenue: dashRevenue, orderCount: dashCompleted.length, itemCount: dashItemCount, avg: dashAvg, chartData, topProducts }, periodLabel[dashPeriod], `vandee_dashboard_${dashPeriod}.csv`)} style={{ padding: "8px 14px", fontSize: 12 }}><Icon name="download" size={14} /> สรุปรายรับ CSV</BtnO>
        </div>
      </div>

      {/* Period selector */}
      <div style={{ background: C.white, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.gray100}`, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.gray500, marginRight: 4 }}>ช่วงเวลา:</span>
          {["day", "week", "month", "year", "custom"].map(p => (
            <button key={p} onClick={() => setDashPeriod(p)} style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
              background: dashPeriod === p ? C.green600 : C.white,
              color: dashPeriod === p ? C.white : C.gray600,
              border: `1.5px solid ${dashPeriod === p ? C.green600 : C.gray200}`,
              transition: "all 0.15s",
            }}>{periodLabel[p]}</button>
          ))}
          {dashPeriod === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
              <input type="date" value={dashDateFrom} onChange={e => setDashDateFrom(e.target.value)} style={{ ...inp, width: 150, padding: "6px 10px", fontSize: 12 }} />
              <span style={{ color: C.gray400, fontSize: 12 }}>ถึง</span>
              <input type="date" value={dashDateTo} onChange={e => setDashDateTo(e.target.value)} style={{ ...inp, width: 150, padding: "6px 10px", fontSize: 12 }} />
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "รายรับรวม", value: `${dashRevenue.toLocaleString()}฿`, sub: `${dashCompleted.length} ออเดอร์`, icon: "dollarSign", grad: "linear-gradient(135deg, #fce7e7, #fdf2f2)", ic: C.green600, accent: C.green600 },
          { label: "จำนวนออเดอร์", value: dashOrders.length, sub: `${dashOrders.filter(o=>o.status!=="cancelled").length} ที่ไม่ยกเลิก`, icon: "clipboard", grad: "linear-gradient(135deg, #dbeafe, #eff6ff)", ic: C.blue600, accent: C.blue600 },
          { label: "สินค้าขายได้", value: `${dashItemCount} ชิ้น`, sub: `จาก ${dashCompleted.length} ออเดอร์`, icon: "package", grad: "linear-gradient(135deg, #fef3c7, #fffbeb)", ic: C.amber600, accent: C.amber600 },
          { label: "ยอดเฉลี่ย/ออเดอร์", value: `${dashAvg.toLocaleString()}฿`, sub: "ไม่รวมยกเลิก", icon: "barChart", grad: "linear-gradient(135deg, #fce7e7, #fdf2f2)", ic: C.green700, accent: C.green700 },
        ].map((s, i) => (
          <div className="card-hover" key={i} style={{ background: C.white, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.gray100}`, position: "relative", overflow: "hidden", animation: `countUp 0.4s ease-out ${i * 0.1}s both` }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: s.grad, borderRadius: "0 14px 0 40px", opacity: 0.7 }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, position: "relative" }}>
              <span style={{ fontSize: 12, color: C.gray500, fontWeight: 600 }}>{s.label}</span>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.grad, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={s.icon} size={17} color={s.ic} /></div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.gray900, letterSpacing: -0.5, position: "relative" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.gray400, marginTop: 3, position: "relative" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Revenue chart */}
        <div style={{ background: C.white, borderRadius: 12, padding: 20, border: `1px solid ${C.gray100}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.gray800, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><Icon name="barChart" size={15} color={C.gray500} /> รายรับ ({periodLabel[dashPeriod]})</div>
          {chartData.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: C.gray400 }}><Icon name="barChart" size={32} color={C.gray200} /><div style={{ marginTop: 8, fontSize: 13 }}>ไม่มีข้อมูลในช่วงนี้</div></div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 180, padding: "0 4px" }}>
                {chartData.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 10, color: C.gray500, fontWeight: 600 }}>{(d.value/1000).toFixed(1)}k฿</div>
                    <div style={{
                      width: "100%", maxWidth: 48, borderRadius: "6px 6px 2px 2px",
                      height: `${Math.max((d.value / chartMax) * 140, 4)}px`,
                      background: `linear-gradient(180deg, ${C.green500}, ${C.green600})`,
                      transition: "height 0.3s ease",
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 6, padding: "0 4px" }}>
                {chartData.map((d, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: C.gray400 }}>{d.label}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div style={{ background: C.white, borderRadius: 12, padding: 20, border: `1px solid ${C.gray100}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.gray800, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><Icon name="clipboard" size={15} color={C.gray500} /> สถานะออเดอร์</div>
          {statusBreakdown.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 3 ? `1px solid ${C.gray100}` : "none" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: C.gray600 }}>{s.label}</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: C.gray900 }}>{s.count}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `2px solid ${C.gray100}`, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.gray700 }}>รวม</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.gray900 }}>{dashOrders.length}</span>
          </div>
        </div>
      </div>

      {/* Top products */}
      <div style={{ background: C.white, borderRadius: 12, padding: 20, border: `1px solid ${C.gray100}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.gray800, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><Icon name="package" size={15} color={C.gray500} /> สินค้าขายดี Top 5</div>
        {topProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: 30, color: C.gray400, fontSize: 13 }}>ไม่มีข้อมูลในช่วงนี้</div>
        ) : (
          <div>
            {topProducts.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < topProducts.length - 1 ? `1px solid ${C.gray100}` : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? C.green50 : C.gray50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: i === 0 ? C.green600 : C.gray500, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: C.green600 }}>{p.revenue.toLocaleString()}฿</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: C.gray100, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${(p.revenue / topMax) * 100}%`, height: "100%", background: i === 0 ? `linear-gradient(90deg, ${C.green500}, ${C.green600})` : C.gray300, borderRadius: 3, transition: "width 0.3s" }} />
                    </div>
                    <span style={{ fontSize: 11, color: C.gray400, flexShrink: 0 }}>{p.qty} ชิ้น</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════
     PAGE: PRINT LABELS (PeriPage)
     ════════════════════════════════════════════════════ */
  const [printSize, setPrintSize] = useState("57mm");
  const [printSearch, setPrintSearch] = useState("");
  const [printFilter, setPrintFilter] = useState("pending");

  const printableOrders = orders.filter(o => {
    const matchStatus = printFilter === "all" || o.status === printFilter;
    const matchSearch = !printSearch || o.id.toLowerCase().includes(printSearch.toLowerCase()) || o.address?.name?.includes(printSearch) || o.address?.phone?.includes(printSearch);
    return matchStatus && matchSearch;
  });

  const paperSizes = [
    { key: "57mm", label: "57mm", desc: "PeriPage A6 / A9", w: "57mm", cssW: 215 },
    { key: "77mm", label: "77mm", desc: "PeriPage A9 Max", w: "77mm", cssW: 291 },
    { key: "a4", label: "A4", desc: "PeriPage A40 / P80", w: "210mm", cssW: 595 },
  ];
  const currentPaper = paperSizes.find(p => p.key === printSize) || paperSizes[0];

  const drawLabelToCanvas = (order) => {
    const statusTh = { pending: "รอตรวจสอบ", shipped: "จัดส่งแล้ว", completed: "สำเร็จ", cancelled: "ยกเลิก" };
    const dpi = 2;
    const w = currentPaper.cssW * dpi;
    const isSmall = printSize !== "a4";
    const pad = (isSmall ? 12 : 24) * dpi;
    const fs = (isSmall ? 11 : 14) * dpi;
    const fsS = (isSmall ? 9 : 12) * dpi;
    const fsL = (isSmall ? 14 : 20) * dpi;
    const lh = (isSmall ? 16 : 22) * dpi;
    const totalQty = order.items?.reduce((s, i) => s + i.qty, 0) || 0;

    // Measure height first
    const lines = [];
    lines.push({ type: "bold", size: fsL, text: "VANDEE SHOP" });
    lines.push({ type: "text", size: fsS, text: `${order.id}  |  ${order.date}  |  ${statusTh[order.status] || order.status}`, color: "#888" });
    lines.push({ type: "dash" });
    lines.push({ type: "bold", size: fs, text: "ผู้รับ" });
    lines.push({ type: "bold", size: fs, text: order.address?.name || "-" });
    lines.push({ type: "text", size: fs, text: order.address?.phone || "-", color: "#444" });
    if (order.address?.addr) lines.push({ type: "text", size: fs, text: order.address.addr, color: "#444" });
    const distLine = [order.address?.district, order.address?.province, order.address?.zip].filter(Boolean).join(" ");
    if (distLine) lines.push({ type: "text", size: fs, text: distLine, color: "#444" });
    if (order.address?.note) lines.push({ type: "text", size: fsS, text: "หมายเหตุ: " + order.address.note, color: "#b45309" });
    lines.push({ type: "dash" });
    lines.push({ type: "bold", size: fs, text: `รายการสินค้า (${totalQty} ชิ้น)` });
    (order.items || []).forEach(i => lines.push({ type: "row", size: fs, left: `${i.name} x${i.qty}`, right: `${(i.price * i.qty).toLocaleString()}฿` }));
    lines.push({ type: "line" });
    lines.push({ type: "row", size: fsS, left: "ค่าสินค้า", right: `${(order.subtotal || 0).toLocaleString()}฿`, color: "#666" });
    if (order.discount > 0) lines.push({ type: "row", size: fsS, left: `ส่วนลด (${order.discountPct || 0}%)`, right: `-${(order.discount || 0).toLocaleString()}฿`, color: "#dc2626" });
    lines.push({ type: "row", size: fsS, left: `ค่าส่ง (${order.shippingLabel || "-"})`, right: order.shipping === 0 ? "ฟรี" : `${order.shipping}฿`, color: "#666" });
    lines.push({ type: "dash" });
    lines.push({ type: "row", size: fsL, left: "รวม", right: `${(order.total || 0).toLocaleString()}฿`, bold: true });

    let h = pad;
    lines.forEach(l => { h += l.type === "dash" || l.type === "line" ? lh * 0.7 : lh; });
    h += pad;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);

    let y = pad;
    lines.forEach(l => {
      if (l.type === "dash") {
        ctx.setLineDash([4 * dpi, 3 * dpi]);
        ctx.strokeStyle = "#aaa";
        ctx.lineWidth = dpi;
        ctx.beginPath(); ctx.moveTo(pad, y + lh * 0.3); ctx.lineTo(w - pad, y + lh * 0.3); ctx.stroke();
        ctx.setLineDash([]);
        y += lh * 0.7; return;
      }
      if (l.type === "line") {
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = dpi;
        ctx.beginPath(); ctx.moveTo(pad, y + lh * 0.3); ctx.lineTo(w - pad, y + lh * 0.3); ctx.stroke();
        y += lh * 0.7; return;
      }
      ctx.fillStyle = l.color || "#111";
      ctx.font = `${l.bold || l.type === "bold" ? "bold" : "normal"} ${l.size}px sans-serif`;
      if (l.type === "row") {
        ctx.textAlign = "left"; ctx.fillText(l.left, pad, y + l.size);
        ctx.textAlign = "right"; ctx.fillText(l.right, w - pad, y + l.size);
        ctx.textAlign = "left";
      } else {
        ctx.fillText(l.text, pad, y + l.size);
      }
      y += lh;
    });

    return canvas;
  };

  const printLabel = (order) => {
    const canvas = drawLabelToCanvas(order);
    const link = document.createElement("a");
    link.download = `${order.id}_${currentPaper.label}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  const printMultiple = (ordersList) => {
    ordersList.forEach((order, i) => {
      setTimeout(() => {
        const canvas = drawLabelToCanvas(order);
        const link = document.createElement("a");
        link.download = `${order.id}_${currentPaper.label}.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.95);
        link.click();
      }, i * 300);
    });
  };

  const renderPrint = () => (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><div style={{ fontWeight: 700, fontSize: 18 }}>พิมพ์ที่อยู่จัดส่ง</div><div style={{ fontSize: 12, color: C.gray400 }}>เลือกออเดอร์แล้วพิมพ์ผ่าน PeriPage หรือเครื่องพิมพ์ thermal</div></div>
        {printableOrders.length > 0 && <BtnP onClick={() => printMultiple(printableOrders)} style={{ padding: "9px 18px", fontSize: 13 }}><Icon name="download" size={15} /> ดาวน์โหลดทั้งหมด ({printableOrders.length})</BtnP>}
      </div>

      {/* Paper size selector */}
      <div style={{ background: C.white, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.gray100}`, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.gray500 }}>ขนาดกระดาษ:</span>
          {paperSizes.map(p => (
            <button key={p.key} onClick={() => setPrintSize(p.key)} style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer",
              background: printSize === p.key ? C.green600 : C.white,
              color: printSize === p.key ? C.white : C.gray600,
              border: `1.5px solid ${printSize === p.key ? C.green600 : C.gray200}`,
              fontWeight: 600, transition: "all 0.15s",
            }}>
              <div>{p.label}</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 1 }}>{p.desc}</div>
            </button>
          ))}

          <div style={{ flex: 1 }} />

          {/* Filter + Search */}
          <select value={printFilter} onChange={e => setPrintFilter(e.target.value)} style={{ ...inp, width: 140, padding: "7px 10px", fontSize: 12, cursor: "pointer" }}>
            <option value="all">ทุกสถานะ</option>
            <option value="pending">รอตรวจสอบ</option>
            <option value="shipped">จัดส่งแล้ว</option>
            <option value="completed">สำเร็จ</option>
          </select>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.gray400 }}><Icon name="search" size={13} /></div>
            <input value={printSearch} onChange={e => setPrintSearch(e.target.value)} placeholder="ค้นหา..." style={{ ...inp, width: 160, padding: "7px 10px 7px 32px", fontSize: 12 }} onFocus={focus} onBlur={blur} />
          </div>
        </div>
      </div>

      {/* Preview + print list */}
      {printableOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: C.gray400 }}><Icon name="printer" size={36} color={C.gray300} /><div style={{ marginTop: 12 }}>ไม่มีออเดอร์ที่ตรงเงื่อนไข</div></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: printSize === "a4" ? "1fr" : "1fr 1fr", gap: 14 }}>
          {printableOrders.map(o => {
            const st = statusMap[o.status];
            const totalQty = o.items?.reduce((s, i) => s + i.qty, 0) || 0;
            return (
              <div key={o.id} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.gray100}`, overflow: "hidden" }}>
                {/* Preview label */}
                <div style={{ padding: 16, fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>VANDEE SHOP</span>
                    <span style={{ fontSize: 11, color: C.gray400 }}>{o.id}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.gray400, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{o.date}</span>
                    <span style={{ background: st?.bg, color: st?.color, padding: "1px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{st?.label}</span>
                  </div>

                  <div style={{ borderTop: `1px dashed ${C.gray300}`, paddingTop: 8, marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{o.address?.name}</div>
                    <div style={{ fontSize: 12, color: C.gray500 }}>{o.address?.phone}</div>
                    <div style={{ fontSize: 12, color: C.gray500 }}>{o.address?.addr}</div>
                    <div style={{ fontSize: 12, color: C.gray500 }}>{o.address?.district} {o.address?.province} {o.address?.zip}</div>
                    {o.address?.note && <div style={{ fontSize: 11, color: C.amber700, marginTop: 2 }}>หมายเหตุ: {o.address.note}</div>}
                  </div>

                  <div style={{ borderTop: `1px dashed ${C.gray300}`, paddingTop: 6 }}>
                    {o.items?.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0" }}>
                        <span>{item.name} <span style={{ color: C.gray400 }}>x{item.qty}</span></span>
                        <span style={{ fontWeight: 600 }}>{(item.price * item.qty).toLocaleString()}฿</span>
                      </div>
                    ))}
                    <div style={{ borderTop: `1px solid ${C.gray200}`, marginTop: 4, paddingTop: 4, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
                      <span>รวม ({totalQty} ชิ้น)</span>
                      <span style={{ color: C.green600 }}>{(o.total || 0).toLocaleString()}฿</span>
                    </div>
                  </div>
                </div>

                {/* Print button */}
                <div style={{ borderTop: `1px solid ${C.gray100}`, padding: "10px 16px", display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => printLabel(o)} style={{
                    padding: "7px 16px", borderRadius: 8, border: "none",
                    background: C.green600, color: C.white, fontWeight: 600, fontSize: 12,
                    cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5,
                  }}><Icon name="download" size={13} /> JPEG ({currentPaper.label})</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ════════════════════════════════════════════════════
     PAGE: SETTINGS (Google Sheet Sync)
     ════════════════════════════════════════════════════ */
  const [tempSheetUrl, setTempSheetUrl] = useState("");
  useEffect(() => { if (sheetUrl) setTempSheetUrl(sheetUrl); }, [sheetUrl]);

  const renderSettings = () => (
    <div>
      <div style={{ marginBottom: 20 }}><div style={{ fontWeight: 700, fontSize: 18 }}>ตั้งค่าระบบ</div><div style={{ fontSize: 12, color: C.gray400 }}>เชื่อมต่อ Google Sheet สำหรับสำรองข้อมูล</div></div>

      {/* Google Sheet Connection */}
      <div style={{ background: C.white, borderRadius: 12, padding: 24, border: `1px solid ${C.gray100}`, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: C.green50, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="fileText" size={20} color={C.green600} /></div>
          <div><div style={{ fontWeight: 700, fontSize: 16 }}>เชื่อมต่อ Google Sheet</div><div style={{ fontSize: 12, color: C.gray400 }}>ข้อมูลออเดอร์จะถูกส่งไป Google Sheet อัตโนมัติ</div></div>
          {sheetUrl && <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: C.green50, padding: "4px 12px", borderRadius: 20 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green500 }} /><span style={{ fontSize: 12, fontWeight: 600, color: C.green700 }}>เชื่อมต่อแล้ว</span></div>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 6, display: "block" }}>Google Apps Script Web App URL</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={tempSheetUrl} onChange={e => setTempSheetUrl(e.target.value)} placeholder="https://script.google.com/macros/s/xxxx/exec" style={{ ...inp, flex: 1, fontSize: 13 }} onFocus={focus} onBlur={blur} />
            <BtnP onClick={() => saveSheetUrl(tempSheetUrl)} disabled={!tempSheetUrl.trim()} style={{ padding: "10px 20px" }}><Icon name="save" size={14} /> บันทึก</BtnP>
          </div>
        </div>

        {sheetUrl && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <BtnP onClick={syncAll} style={{ padding: "10px 18px", fontSize: 13 }}><Icon name="refreshCw" size={14} /> Sync ข้อมูลทั้งหมดไป Sheet</BtnP>
            {syncStatus === "syncing" && <span style={{ fontSize: 12, color: C.amber600, fontWeight: 600 }}>กำลัง sync...</span>}
            {syncStatus === "success" && <span style={{ fontSize: 12, color: C.green600, fontWeight: 600 }}>sync สำเร็จ</span>}
            {syncStatus === "error" && <span style={{ fontSize: 12, color: C.red500, fontWeight: 600 }}>sync ผิดพลาด</span>}
          </div>
        )}
      </div>

      {/* Change Password */}
      <ChangePasswordSection credentials={credentials} changePassword={changePassword} syncStatus={syncStatus} setSyncStatus={setSyncStatus} />

      {/* Logout */}
      <div style={{ marginTop: 20 }}>
        <button onClick={handleLogout} style={{ padding: "11px 22px", borderRadius: 8, border: `1.5px solid ${C.red500}`, background: C.white, color: C.red500, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="logOut" size={15} /> ออกจากระบบ</button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════
     LAYOUT
     ════════════════════════════════════════════════════ */
  /* ════════════════════════════════════════════════════
     PAGE: EXPENSES
     ════════════════════════════════════════════════════ */
  const renderExpenses = () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const lastMonth = (() => { const d = new Date(now.getFullYear(), now.getMonth()-1, 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; })();

    const filterByPeriod = (list) => {
      if (expFilter === "today") { const today = now.toISOString().slice(0,10); return list.filter(e => e.date === today); }
      if (expFilter === "week") {
        const day = now.getDay();
        const monday = new Date(now); monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1)); monday.setHours(0,0,0,0);
        const mondayStr = monday.toISOString().slice(0,10);
        const todayStr = now.toISOString().slice(0,10);
        return list.filter(e => e.date >= mondayStr && e.date <= todayStr);
      }
      if (expFilter === "month") return list.filter(e => e.date?.slice(0,7) === thisMonth);
      if (expFilter === "lastmonth") return list.filter(e => e.date?.slice(0,7) === lastMonth);
      if (expFilter === "3months") {
        const cutoff = new Date(now.getFullYear(), now.getMonth()-2, 1).toISOString().slice(0,7);
        return list.filter(e => e.date?.slice(0,7) >= cutoff);
      }
      if (expFilter === "year") return list.filter(e => e.date?.slice(0,4) === String(now.getFullYear()));
      if (expFilter === "custom") {
        return list.filter(e => {
          if (!e.date) return false;
          if (expDateFrom && e.date < expDateFrom) return false;
          if (expDateTo && e.date > expDateTo) return false;
          return true;
        });
      }
      return list;
    };

    const periodExpenses = filterByPeriod(expenses);
    const filteredExpenses = expCatFilter === "all" ? periodExpenses : periodExpenses.filter(e => e.cat === expCatFilter);
    const totalAmt = periodExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const filteredTotal = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);

    // หมวดหมู่ breakdown
    const catBreakdown = expenseCats.map(cat => {
      const amt = periodExpenses.filter(e => e.cat === cat).reduce((s, e) => s + (e.amount || 0), 0);
      return { cat, amt, pct: totalAmt > 0 ? Math.round(amt / totalAmt * 100) : 0 };
    }).filter(c => c.amt > 0).sort((a, b) => b.amt - a.amt);

    const topCat = catBreakdown[0];

    const addExpense = () => {
      if (!expenseForm.name || !expenseForm.amount || !expenseForm.date) return;
      const newExp = {
        id: "EXP-" + Date.now().toString(36).toUpperCase().slice(-6),
        name: expenseForm.name,
        amount: parseFloat(expenseForm.amount) || 0,
        date: expenseForm.date,
        cat: expenseForm.cat || expenseCats[0] || "อื่น ๆ",
        note: expenseForm.note,
        ts: Date.now(),
      };
      isEditing.current = true;
      setExpenses(prev => [newExp, ...prev]);
      setExpenseForm({ name: "", amount: "", date: new Date().toISOString().slice(0,10), cat: expenseForm.cat, note: "" });
      sfx.success();
      syncExpenseToSheet(newExp);
      setTimeout(() => { isEditing.current = false; }, 2000);
    };

    const deleteExpense = (id) => {
      setConfirmModal({
        title: "ลบรายจ่าย",
        message: "ต้องการลบรายการนี้ใช่ไหม?",
        onConfirm: () => {
          isEditing.current = true;
          setExpenses(prev => prev.filter(e => e.id !== id));
          setConfirmModal(null);
          sfx.remove();
          setTimeout(() => { isEditing.current = false; }, 2000);
        },
      });
    };

    const addExpCat = () => {
      const t = newExpCat.trim();
      if (!t || expenseCats.includes(t)) return;
      isEditing.current = true;
      setExpenseCats(prev => [...prev, t]);
      setNewExpCat("");
      setTimeout(() => { isEditing.current = false; }, 2000);
    };

    const removeExpCat = (cat) => {
      isEditing.current = true;
      setExpenseCats(prev => prev.filter(c => c !== cat));
      setTimeout(() => { isEditing.current = false; }, 2000);
    };

    const exportExpensesCSV = () => {
      const headers = ["รหัส","วันที่","รายการ","หมวดหมู่","จำนวน (฿)","หมายเหตุ"];
      const rows = filteredExpenses.map(e => [e.id, e.date, e.name, e.cat, e.amount, e.note || ""]);
      downloadCSV(`รายจ่าย_${expFilter}_${new Date().toLocaleDateString("th-TH")}.csv`, headers, rows);
    };

    const catColors = { "ต้นทุนสินค้า": { bg: "#fce7e7", color: "#8B1A1A" }, "ค่าแพ็คกิ้ง": { bg: "#fce7e7", color: "#a52222" }, "ค่าขนส่ง": { bg: "#f0fdf4", color: "#166534" }, "ค่าการตลาด": { bg: "#eff6ff", color: "#1e40af" }, "ค่าสาธารณูปโภค": { bg: "#fefce8", color: "#854d0e" }, "เงินเดือนพนักงาน": { bg: "#f5f3ff", color: "#5b21b6" } };
    const getCatColor = (cat) => catColors[cat] || { bg: C.gray100, color: C.gray600 };

    return (
      <div data-page="expenses">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.gray900 }}>รายจ่าย</div>
            <div style={{ fontSize: 13, color: C.gray400, marginTop: 2 }}>ติดตามต้นทุนและค่าใช้จ่ายร้านค้า</div>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, marginBottom: 20 }}>
          <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, color: C.gray400, fontWeight: 600, marginBottom: 6 }}>รายจ่ายช่วงนี้</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.gray900 }}>{totalAmt.toLocaleString()}฿</div>
            <div style={{ fontSize: 11, color: C.gray400, marginTop: 4 }}>{periodExpenses.length} รายการ</div>
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, color: C.gray400, fontWeight: 600, marginBottom: 6 }}>หมวดหมู่สูงสุด</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.gray900 }}>{topCat?.cat || "-"}</div>
            <div style={{ fontSize: 11, color: C.gray400, marginTop: 4 }}>{topCat ? `${topCat.amt.toLocaleString()}฿ · ${topCat.pct}%` : "ยังไม่มีข้อมูล"}</div>
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, color: C.gray400, fontWeight: 600, marginBottom: 6 }}>หมวดหมู่ทั้งหมด</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.gray900 }}>{expenseCats.length}</div>
            <div style={{ fontSize: 11, color: C.gray400, marginTop: 4 }}>หมวดหมู่</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "320px minmax(0,1fr)", gap: 16, alignItems: "flex-start" }}>

          {/* Left: form + category manager */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Add expense form */}
            <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.gray900, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="plus" size={15} color={C.green600} /> บันทึกรายจ่ายใหม่
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>รายการ</label>
                  <input value={expenseForm.name} onChange={e => setExpenseForm(p => ({ ...p, name: e.target.value }))} placeholder="เช่น ค่าแพ็คกิ้ง, ซื้อสต็อก..." style={{ ...inp, fontSize: 13 }} onFocus={focus} onBlur={blur} onKeyDown={e => e.key === "Enter" && addExpense()} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>จำนวนเงิน (฿)</label>
                    <input type="number" min="0" value={expenseForm.amount} onChange={e => setExpenseForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" style={{ ...inp, fontSize: 13 }} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>วันที่</label>
                    <input type="date" value={expenseForm.date} onChange={e => setExpenseForm(p => ({ ...p, date: e.target.value }))} style={{ ...inp, fontSize: 13 }} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>หมวดหมู่</label>
                  <select value={expenseForm.cat || expenseCats[0] || ""} onChange={e => setExpenseForm(p => ({ ...p, cat: e.target.value }))} style={{ ...inp, fontSize: 13, background: C.white }}>
                    {expenseCats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.gray500, marginBottom: 4, display: "block" }}>หมายเหตุ (ไม่บังคับ)</label>
                  <input value={expenseForm.note} onChange={e => setExpenseForm(p => ({ ...p, note: e.target.value }))} placeholder="รายละเอียดเพิ่มเติม..." style={{ ...inp, fontSize: 13 }} onFocus={focus} onBlur={blur} />
                </div>
                <BtnP onClick={addExpense} disabled={!expenseForm.name || !expenseForm.amount} style={{ width: "100%", marginTop: 4 }}>
                  <Icon name="plus" size={14} /> บันทึกรายจ่าย
                </BtnP>
              </div>
            </div>

            {/* Category manager */}
            <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.gray900, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="grid" size={15} color={C.gray500} /> จัดการหมวดหมู่
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input value={newExpCat} onChange={e => setNewExpCat(e.target.value)} placeholder="ชื่อหมวดหมู่ใหม่..." style={{ ...inp, fontSize: 12, flex: 1 }} onFocus={focus} onBlur={blur} onKeyDown={e => e.key === "Enter" && addExpCat()} />
                <BtnP onClick={addExpCat} style={{ padding: "8px 14px", flexShrink: 0 }}><Icon name="plus" size={14} /></BtnP>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {expenseCats.map(cat => (
                  <div key={cat} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 20, background: C.gray100, fontSize: 12, fontWeight: 600, color: C.gray700 }}>
                    {cat}
                    {expenseCats.length > 1 && (
                      <button onClick={() => removeExpCat(cat)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: C.gray400 }}>
                        <Icon name="x" size={11} color={C.gray400} sw={2.5} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Category breakdown */}
              {catBreakdown.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.gray100}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.gray400, marginBottom: 10 }}>สัดส่วนหมวดหมู่ (ช่วงนี้)</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {catBreakdown.map(c => (
                      <div key={c.cat}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                          <span style={{ color: C.gray700 }}>{c.cat}</span>
                          <span style={{ color: C.gray400 }}>{c.amt.toLocaleString()}฿ · {c.pct}%</span>
                        </div>
                        <div style={{ background: C.gray100, borderRadius: 4, height: 5 }}>
                          <div style={{ background: C.green600, width: `${c.pct}%`, height: 5, borderRadius: 4, transition: "width 0.3s" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: expense list */}
          <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, overflow: "hidden" }}>
            {/* Filter bar */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.gray100}`, display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Period button group */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.gray400, marginRight: 4 }}>ช่วงเวลา:</span>
                {[
                  { key: "today", label: "วันนี้" },
                  { key: "week", label: "สัปดาห์นี้" },
                  { key: "month", label: "เดือนนี้" },
                  { key: "year", label: "ปีนี้" },
                  { key: "custom", label: "กำหนดเอง" },
                ].map(opt => (
                  <button key={opt.key} onClick={() => setExpFilter(opt.key)} style={{
                    padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${expFilter === opt.key ? C.green600 : C.gray200}`,
                    background: expFilter === opt.key ? C.green600 : C.white,
                    color: expFilter === opt.key ? C.white : C.gray600,
                    fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}>{opt.label}</button>
                ))}
                {expFilter === "custom" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
                    <input type="date" value={expDateFrom} onChange={e => setExpDateFrom(e.target.value)} style={{ ...inp, width: 140, padding: "6px 10px", fontSize: 12 }} onFocus={focus} onBlur={blur} />
                    <span style={{ fontSize: 12, color: C.gray400 }}>ถึง</span>
                    <input type="date" value={expDateTo} onChange={e => setExpDateTo(e.target.value)} style={{ ...inp, width: 140, padding: "6px 10px", fontSize: 12 }} onFocus={focus} onBlur={blur} />
                  </div>
                )}
              </div>
              {/* Category filter + actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.gray400, marginRight: 4 }}>หมวดหมู่:</span>
                {["all", ...expenseCats].map(c => (
                  <button key={c} onClick={() => setExpCatFilter(c)} style={{
                    padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${expCatFilter === c ? C.green600 : C.gray200}`,
                    background: expCatFilter === c ? C.green50 : C.white,
                    color: expCatFilter === c ? C.green700 : C.gray500,
                    fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}>{c === "all" ? "ทั้งหมด" : c}</button>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.gray400 }}>{filteredExpenses.length} รายการ</span>
                  <BtnO onClick={exportExpensesCSV} style={{ padding: "6px 12px", fontSize: 12 }}><Icon name="download" size={13} /> CSV</BtnO>
                  {sheetUrl && <BtnO onClick={syncAllExpensesToSheet} style={{ padding: "6px 12px", fontSize: 12 }}><Icon name="refreshCw" size={13} /> Sync Sheet</BtnO>}
                </div>
              </div>
            </div>

            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 100px 90px 36px", padding: "9px 20px", background: C.gray50, fontSize: 11, fontWeight: 600, color: C.gray400 }}>
              <span>รายการ</span><span>หมวดหมู่</span><span>วันที่</span><span style={{ textAlign: "right" }}>จำนวน</span><span />
            </div>

            {/* Rows */}
            {filteredExpenses.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center" }}>
                <Icon name="fileText" size={28} color={C.gray200} />
                <div style={{ marginTop: 10, fontSize: 13, color: C.gray400 }}>ยังไม่มีรายจ่ายในช่วงเวลานี้</div>
              </div>
            ) : (
              <div>
                {filteredExpenses.map((e, i) => {
                  const cc = getCatColor(e.cat);
                  return (
                    <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 100px 90px 36px", padding: "12px 20px", borderBottom: i < filteredExpenses.length - 1 ? `1px solid ${C.gray100}` : "none", alignItems: "center", fontSize: 13 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: C.gray900 }}>{e.name}</div>
                        {e.note && <div style={{ fontSize: 11, color: C.gray400, marginTop: 1 }}>{e.note}</div>}
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center" }}>
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: cc.bg, color: cc.color, fontWeight: 600 }}>{e.cat}</span>
                      </span>
                      <span style={{ color: C.gray400, fontSize: 12 }}>{e.date ? new Date(e.date).toLocaleDateString("th-TH") : "-"}</span>
                      <span style={{ textAlign: "right", fontWeight: 700, color: C.gray900 }}>{(e.amount || 0).toLocaleString()}฿</span>
                      <button onClick={() => deleteExpense(e.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="trash" size={14} color={C.gray300} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer total */}
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.gray100}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.gray50 }}>
              <span style={{ fontSize: 13, color: C.gray400 }}>รวม {filteredExpenses.length} รายการที่แสดง</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.gray900 }}>{filteredTotal.toLocaleString()}฿</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════════════════
     PAGE: ANALYTICS
     ════════════════════════════════════════════════════ */
  const renderAnalytics = () => {
    const now = new Date();
    const thisYear = String(now.getFullYear());
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

    const filterOrders = (list) => {
      if (analyticsFilter === "month") return list.filter(o => o.date?.slice(0,7) === thisMonth || (o.ts && new Date(o.ts).toISOString().slice(0,7) === thisMonth));
      if (analyticsFilter === "3months") {
        const cutoff = new Date(now.getFullYear(), now.getMonth()-2, 1);
        return list.filter(o => o.ts && new Date(o.ts) >= cutoff);
      }
      if (analyticsFilter === "year") return list.filter(o => o.date?.slice(0,4) === thisYear || (o.ts && new Date(o.ts).getFullYear() === now.getFullYear()));
      return list;
    };

    const filterExpenses = (list) => {
      if (analyticsFilter === "month") return list.filter(e => e.date?.slice(0,7) === thisMonth);
      if (analyticsFilter === "3months") {
        const cutoff = new Date(now.getFullYear(), now.getMonth()-2, 1).toISOString().slice(0,7);
        return list.filter(e => e.date?.slice(0,7) >= cutoff);
      }
      if (analyticsFilter === "year") return list.filter(e => e.date?.slice(0,4) === thisYear);
      return list;
    };

    const filtOrders = filterOrders(orders.filter(o => o.status !== "cancelled"));
    const filtExpenses = filterExpenses(expenses);

    const totalRevenue = filtOrders.reduce((s, o) => s + (o.total || 0), 0);
    const totalExpenses = filtExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalDiscount = filtOrders.reduce((s, o) => s + (o.discount || 0), 0);
    const grossProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0.0";

    // สินค้าขายดี
    const productSales = {};
    filtOrders.forEach(o => {
      (o.items || []).forEach(item => {
        if (!productSales[item.name]) productSales[item.name] = { qty: 0, revenue: 0 };
        productSales[item.name].qty += item.qty;
        productSales[item.name].revenue += item.price * item.qty;
      });
    });
    const topProducts = Object.entries(productSales).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
    const maxRevenue = topProducts[0]?.[1].revenue || 1;

    // รายจ่ายแยกหมวด
    const expByCat = {};
    filtExpenses.forEach(e => { expByCat[e.cat] = (expByCat[e.cat] || 0) + e.amount; });
    const expCatList = Object.entries(expByCat).sort((a, b) => b[1] - a[1]);
    const costOfGoods = expByCat["ต้นทุนสินค้า"] || 0;
    const otherExp = totalExpenses - costOfGoods;

    // กราฟรายเดือน (6 เดือนล่าสุด)
    const chartMonths = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`, label: d.toLocaleDateString("th-TH", { month: "short" }) };
    });
    const chartRevenue = chartMonths.map(m => orders.filter(o => o.status !== "cancelled" && (o.date?.slice(0,7) === m.key || (o.ts && new Date(o.ts).toISOString().slice(0,7) === m.key))).reduce((s, o) => s + (o.total || 0), 0));
    const chartExpenses = chartMonths.map(m => expenses.filter(e => e.date?.slice(0,7) === m.key).reduce((s, e) => s + (e.amount || 0), 0));
    const chartProfit = chartMonths.map((_, i) => chartRevenue[i] - chartExpenses[i]);

    const donutColors = ["#8B1A1A","#a52222","#c44040","#d97706","#6b7280","#374151"];

    const filterLabels = [
      { key: "month", label: "เดือนนี้" },
      { key: "3months", label: "3 เดือน" },
      { key: "year", label: "ปีนี้" },
      { key: "all", label: "ทั้งหมด" },
    ];

    return (
      <div data-page="analytics">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.gray900 }}>วิเคราะห์</div>
            <div style={{ fontSize: 13, color: C.gray400, marginTop: 2 }}>รายรับ · รายจ่าย · กำไรสุทธิ</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {filterLabels.map(f => (
              <button key={f.key} onClick={() => setAnalyticsFilter(f.key)} style={{
                padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${analyticsFilter === f.key ? C.green600 : C.gray200}`,
                background: analyticsFilter === f.key ? C.green600 : C.white,
                color: analyticsFilter === f.key ? C.white : C.gray600,
                fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}>{f.label}</button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "รายรับ", value: `${totalRevenue.toLocaleString()}฿`, sub: `${filtOrders.length} ออเดอร์`, color: C.green600 },
            { label: "รายจ่ายรวม", value: `${totalExpenses.toLocaleString()}฿`, sub: `${filtExpenses.length} รายการ`, color: C.gray600 },
            { label: "กำไรสุทธิ", value: `${grossProfit.toLocaleString()}฿`, sub: `margin ${margin}%`, color: C.green700 },
            { label: "ส่วนลดที่ให้", value: `${totalDiscount.toLocaleString()}฿`, sub: `${filtOrders.filter(o => o.discount > 0).length} ออเดอร์`, color: C.amber600 },
          ].map((k, i) => (
            <div key={i} style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: C.gray400, fontWeight: 600, marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: C.gray400, marginTop: 4 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart row */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)", gap: 16, marginBottom: 16 }}>

          {/* Bar chart */}
          <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.gray900, marginBottom: 8 }}>รายรับ vs รายจ่าย vs กำไร (6 เดือนล่าสุด)</div>
            <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
              {[["#8B1A1A","รายรับ"],["#d1d5db","รายจ่าย"],["#701515","กำไร"]].map(([c,l]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.gray500 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }} />{l}
                </span>
              ))}
            </div>
            <div style={{ position: "relative", height: 200 }}>
              <canvas id="analyticsBar" role="img" aria-label="กราฟแท่งรายรับ รายจ่าย กำไร 6 เดือนล่าสุด">รายรับ รายจ่าย กำไร</canvas>
            </div>
          </div>

          {/* Donut รายจ่าย */}
          <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.gray900, marginBottom: 12 }}>สัดส่วนรายจ่าย</div>
            {expCatList.length > 0 ? <>
              <div style={{ position: "relative", height: 150 }}>
                <canvas id="analyticsDonut" role="img" aria-label="สัดส่วนรายจ่ายแยกหมวด">สัดส่วนรายจ่าย</canvas>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 12 }}>
                {expCatList.slice(0,5).map(([cat, amt], i) => (
                  <span key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: C.gray500 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: donutColors[i] || C.gray300, display: "inline-block" }} />{cat}
                    </span>
                    <span>{totalExpenses > 0 ? Math.round(amt/totalExpenses*100) : 0}%</span>
                  </span>
                ))}
              </div>
            </> : <div style={{ padding: "40px 0", textAlign: "center", color: C.gray300, fontSize: 13 }}>ยังไม่มีรายจ่าย</div>}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>

          {/* สินค้าขายดี */}
          <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.gray900, marginBottom: 14 }}>สินค้าขายดี (รายได้)</div>
            {topProducts.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topProducts.map(([name, data]) => (
                  <div key={name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: C.gray700 }}>{name}</span>
                      <span style={{ color: C.gray400 }}>{data.revenue.toLocaleString()}฿ · {data.qty} ชิ้น</span>
                    </div>
                    <div style={{ background: C.gray100, borderRadius: 4, height: 5 }}>
                      <div style={{ background: C.green600, width: `${Math.round(data.revenue/maxRevenue*100)}%`, height: 5, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <div style={{ padding: "40px 0", textAlign: "center", color: C.gray300, fontSize: 13 }}>ยังไม่มีออเดอร์</div>}
          </div>

          {/* ตารางสรุป */}
          <div style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.gray900, marginBottom: 14 }}>สรุปภาพรวม</div>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              {[
                { label: "รายรับรวม", value: `${totalRevenue.toLocaleString()}฿`, color: C.green600 },
                { label: "ต้นทุนสินค้า", value: `-${costOfGoods.toLocaleString()}฿`, color: C.gray600 },
                { label: "ค่าใช้จ่ายอื่น", value: `-${otherExp.toLocaleString()}฿`, color: C.gray600 },
                { label: "ส่วนลดที่ให้", value: `-${totalDiscount.toLocaleString()}฿`, color: C.amber600 },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.gray100}` }}>
                  <td style={{ padding: "9px 0", color: C.gray500 }}>{r.label}</td>
                  <td style={{ padding: "9px 0", textAlign: "right", color: r.color, fontWeight: 600 }}>{r.value}</td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: "12px 0 0", fontWeight: 800, fontSize: 15, color: C.gray900 }}>กำไรสุทธิ</td>
                <td style={{ padding: "12px 0 0", textAlign: "right", fontWeight: 800, fontSize: 20, color: grossProfit >= 0 ? C.green600 : C.gray700 }}>{grossProfit.toLocaleString()}฿</td>
              </tr>
            </table>
            <div style={{ marginTop: 16, padding: "10px 14px", background: C.green50, borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: C.green600, fontWeight: 700 }}>Gross Margin {margin}%</div>
              <div style={{ background: C.gray200, borderRadius: 4, height: 5, marginTop: 6 }}>
                <div style={{ background: C.green600, width: `${Math.min(parseFloat(margin),100)}%`, height: 5, borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Chart.js script */}
        <div id="analytics-charts-container" data-revenue={JSON.stringify(chartRevenue)} data-expenses={JSON.stringify(chartExpenses)} data-profit={JSON.stringify(chartProfit)} data-labels={JSON.stringify(chartMonths.map(m => m.label))} data-catnames={JSON.stringify(expCatList.map(c => c[0]))} data-catvals={JSON.stringify(expCatList.map(c => c[1]))} />
      </div>
    );
  };

  useEffect(() => {
    if (page !== "analytics") return;
    const container = document.getElementById("analytics-charts-container");
    if (!container) return;
    const revenue = JSON.parse(container.dataset.revenue || "[]");
    const expensesData = JSON.parse(container.dataset.expenses || "[]");
    const profit = JSON.parse(container.dataset.profit || "[]");
    const labels = JSON.parse(container.dataset.labels || "[]");
    const catNames = JSON.parse(container.dataset.catnames || "[]");
    const catVals = JSON.parse(container.dataset.catvals || "[]");

    const loadChartJs = () => {
      if (window.Chart) { drawCharts(); return; }
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
      s.onload = drawCharts;
      document.head.appendChild(s);
    };

    const drawCharts = () => {
      const barEl = document.getElementById("analyticsBar");
      const donutEl = document.getElementById("analyticsDonut");
      if (barEl) {
        if (barEl._chartInstance) barEl._chartInstance.destroy();
        barEl._chartInstance = new window.Chart(barEl, {
          type: "bar",
          data: {
            labels,
            datasets: [
              { label: "รายรับ", data: revenue, backgroundColor: "#8B1A1A" },
              { label: "รายจ่าย", data: expensesData, backgroundColor: "#d1d5db" },
              { label: "กำไร", data: profit, backgroundColor: "#701515" },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 11 } } },
              y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { font: { size: 11 }, callback: v => v >= 1000 ? (v/1000).toFixed(0)+"k" : v } },
            },
          },
        });
      }
      if (donutEl && catNames.length > 0) {
        if (donutEl._chartInstance) donutEl._chartInstance.destroy();
        const donutColors = ["#8B1A1A","#a52222","#c44040","#d97706","#6b7280","#374151"];
        donutEl._chartInstance = new window.Chart(donutEl, {
          type: "doughnut",
          data: { labels: catNames, datasets: [{ data: catVals, backgroundColor: catNames.map((_, i) => donutColors[i] || "#9ca3af"), borderWidth: 0 }] },
          options: { responsive: true, maintainAspectRatio: false, cutout: "65%", plugins: { legend: { display: false } } },
        });
      }
    };

    setTimeout(loadChartJs, 100);
  }, [page, analyticsFilter, orders, expenses]);

  const navItems = [
    { key: "dashboard", label: "แดชบอร์ด", icon: "barChart" },
    { key: "shop", label: "หน้าร้าน", icon: "shoppingCart" },
    { key: "orders", label: "คำสั่งซื้อ", icon: "clipboard" },
    { key: "analytics", label: "วิเคราะห์", icon: "dollarSign" },
    { key: "expenses", label: "รายจ่าย", icon: "creditCard" },
    { key: "products", label: "จัดการสินค้า", icon: "grid" },
    { key: "categories", label: "จัดการหมวดหมู่", icon: "list" },
    { key: "shipping", label: "วิธีจัดส่ง", icon: "truck" },
    { key: "print", label: "พิมพ์ที่อยู่", icon: "printer" },
    { key: "settings", label: "ตั้งค่า", icon: "save" },
  ];

  /* ════════ CONFIRM MODAL ════════ */
  const ConfirmModalEl = confirmModal ? (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.2s ease-out" }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }`}</style>
      <div style={{ width: 400, background: C.white, borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "slideUp 0.3s ease-out" }}>
        {/* Red header */}
        <div style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", padding: "24px 28px", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Icon name="trash" size={24} color={C.white} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.white }}>{confirmModal.title}</div>
        </div>
        {/* Content */}
        <div style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.gray700, marginBottom: 16 }}>{confirmModal.message}</div>
          {confirmModal.details && (
            <div style={{ background: C.gray50, borderRadius: 10, padding: 14, marginBottom: 16 }}>
              {confirmModal.details.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, borderBottom: i < confirmModal.details.length - 1 ? `1px solid ${C.gray200}` : "none" }}>
                  <span style={{ color: C.gray500 }}>{d.label}</span>
                  <span style={{ fontWeight: 600, color: C.gray700 }}>{d.value}</span>
                </div>
              ))}
            </div>
          )}
          {confirmModal.warning && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: C.red50, border: `1px solid ${C.red100 || "#fecaca"}` }}>
              <Icon name="info" size={16} color={C.red500} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.red500 }}>{confirmModal.warning}</span>
            </div>
          )}
        </div>
        {/* Buttons */}
        <div style={{ padding: "0 28px 24px", display: "flex", gap: 12 }}>
          <button onClick={() => setConfirmModal(null)} style={{ flex: 1, padding: "12px 20px", borderRadius: 10, border: `1.5px solid ${C.gray200}`, background: C.white, color: C.gray600, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.gray50}
            onMouseLeave={e => e.currentTarget.style.background = C.white}
          >ยกเลิก</button>
          <button onClick={() => { sfx.remove(); confirmModal.onConfirm(); }} style={{ flex: 1, padding: "12px 20px", borderRadius: 10, border: "none", background: "#ef4444", color: C.white, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#dc2626"}
            onMouseLeave={e => e.currentTarget.style.background = "#ef4444"}
          ><Icon name="trash" size={15} /> ยืนยันลบ</button>
        </div>
      </div>
    </div>
  ) : null;

  /* ════════ SLIP MODAL ════════ */
  const SlipModal = slipModal ? (
    <div onClick={() => setSlipModal(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "pointer" }}>
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", maxWidth: 500, maxHeight: "90vh", background: C.white, borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <img src={slipModal} alt="สลิป" style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", display: "block" }} />
        <button onClick={() => setSlipModal(null)} style={{ position: "absolute", top: 10, right: 10, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={18} color={C.white} /></button>
      </div>
    </div>
  ) : null;

  /* ════════ LOGIN SCREEN ════════ */
  if (!authLoaded) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Sans Thai', sans-serif", color: C.gray400 }}><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet" />กำลังโหลด...</div>;

  if (!isLoggedIn) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #4a0e0e 0%, #8B1A1A 50%, #c44040 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Sans Thai', 'Noto Sans Thai', sans-serif", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes float1 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(10deg); } }
        @keyframes float2 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(-8deg); } }
        @keyframes float3 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-40px) scale(1.1); } }
        @keyframes cardIn { 0% { opacity: 0; transform: translateY(40px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      {/* Floating background shapes */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", animation: "float1 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "60%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)", animation: "float2 10s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "30%", width: 150, height: 150, borderRadius: "30%", background: "rgba(255,255,255,0.06)", animation: "float3 6s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "30%", right: "25%", width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)", animation: "float1 12s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", bottom: "30%", left: "10%", width: 120, height: 120, borderRadius: "40%", background: "rgba(255,255,255,0.03)", animation: "float2 9s ease-in-out infinite 1s" }} />
      </div>

      {/* Loading overlay */}
      {loginLoading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.95)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <img src={import.meta.env.BASE_URL + "vandee-logo.jpg"} alt="VANDEE" style={{ width: 56, height: 56, borderRadius: 14, objectFit: "cover", animation: "pulse 1.5s infinite" }} />
          <div style={{ width: 40, height: 40, border: `3px solid ${C.gray200}`, borderTopColor: C.green600, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ fontSize: 14, color: C.gray500, fontWeight: 600 }}>กำลังเข้าสู่ระบบ...</div>
        </div>
      )}

      {/* Success overlay */}
      {loginSuccess && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.97)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.green100, display: "flex", alignItems: "center", justifyContent: "center", animation: "scaleIn 0.5s ease-out" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.green600} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.green700, animation: "fadeInUp 0.4s ease-out" }}>เข้าสู่ระบบเรียบร้อย</div>
          <div style={{ fontSize: 13, color: C.gray400, animation: "fadeInUp 0.5s ease-out" }}>ยินดีต้อนรับ VANDEE SHOP</div>
        </div>
      )}

      <div style={{ width: 400, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderRadius: 20, padding: "44px 40px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.3)", animation: "cardIn 0.6s ease-out", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={import.meta.env.BASE_URL + "vandee-logo.jpg"} alt="VANDEE" style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover", marginBottom: 14, boxShadow: "0 8px 24px rgba(139,26,26,0.3)" }} />
          <div style={{ fontWeight: 700, fontSize: 22, color: C.gray900, letterSpacing: -0.5 }}>VANDEE SHOP</div>
          <div style={{ fontSize: 13, color: C.gray400, marginTop: 4 }}>ระบบจัดการร้านค้าของฝาก</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}><Icon name="user" size={13} color={C.gray400} /> ชื่อผู้ใช้</label>
          <input value={loginUser} onChange={e => { setLoginUser(e.target.value); setLoginError(""); }} placeholder="ชื่อผู้ใช้" disabled={loginLoading} style={{ ...inp, padding: "12px 14px", opacity: loginLoading ? 0.5 : 1 }} onFocus={focus} onBlur={blur} onKeyDown={e => e.key === "Enter" && document.getElementById("pw-input")?.focus()} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.gray500, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}><Icon name="lock" size={13} color={C.gray400} /> รหัสผ่าน</label>
          <input id="pw-input" type="password" value={loginPass} onChange={e => { setLoginPass(e.target.value); setLoginError(""); }} placeholder="รหัสผ่าน" disabled={loginLoading} style={{ ...inp, padding: "12px 14px", opacity: loginLoading ? 0.5 : 1 }} onFocus={focus} onBlur={blur} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <div onClick={() => !loginLoading && setRememberMe(!rememberMe)} style={{ width: 20, height: 20, borderRadius: 5, border: `1.5px solid ${rememberMe ? C.green600 : C.gray300}`, background: rememberMe ? C.green600 : C.white, display: "flex", alignItems: "center", justifyContent: "center", cursor: loginLoading ? "default" : "pointer", transition: "all 0.15s", flexShrink: 0 }}>
            {rememberMe && <Icon name="check" size={13} color={C.white} sw={2.5} />}
          </div>
          <span onClick={() => !loginLoading && setRememberMe(!rememberMe)} style={{ fontSize: 13, color: C.gray600, cursor: loginLoading ? "default" : "pointer", userSelect: "none" }}>จดจำรหัสผ่าน</span>
        </div>
        {loginError && <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: C.red50, color: C.red500, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><Icon name="info" size={14} color={C.red500} /> {loginError}</div>}
        <button onClick={() => { sfx.tap(); handleLogin(); }} disabled={loginLoading} style={{ width: "100%", padding: "14px 20px", borderRadius: 12, border: "none", background: loginLoading ? C.gray300 : "linear-gradient(135deg, #8B1A1A, #701515)", color: C.white, fontWeight: 700, fontSize: 15, cursor: loginLoading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: loginLoading ? "none" : "0 4px 16px rgba(139,26,26,0.3)" }}
          onMouseEnter={e => { if (!loginLoading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(139,26,26,0.4)"; } }}
          onMouseLeave={e => { if (!loginLoading) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(139,26,26,0.3)"; } }}
        ><Icon name="lock" size={16} /> {loginLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6f8", fontFamily: "'IBM Plex Sans Thai', 'Noto Sans Thai', -apple-system, sans-serif", color: C.gray900, display: "flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes countUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .card-hover { transition: all 0.2s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06) !important; }
        .nav-btn { transition: all 0.15s ease !important; }
        .nav-btn:hover { transform: translateX(3px); }
        .page-content > * { animation: fadeIn 0.3s ease-out; }
      `}</style>

      {/* Left sidebar nav */}
      <div style={{ width: 230, flexShrink: 0, background: "linear-gradient(180deg, #ffffff 0%, #f8faf9 100%)", borderRight: `1px solid ${C.gray100}`, padding: "20px 14px", position: "sticky", top: 0, height: "100vh", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 28 }}>
          <img src={import.meta.env.BASE_URL + "vandee-logo.jpg"} alt="VANDEE" style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", boxShadow: "0 4px 12px rgba(139,26,26,0.25)" }} />
          <div><div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.3 }}>VANDEE SHOP</div><div style={{ fontSize: 10, color: C.gray400, marginTop: -1 }}>ระบบจัดการร้านค้า</div></div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
          {navItems.map(n => (
            <button className="nav-btn" key={n.key} onClick={() => { sfx.tap(); setPage(n.key); }} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
              border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
              background: page === n.key ? C.green50 : "transparent",
              color: page === n.key ? C.green700 : C.gray500,
              transition: "all 0.15s",
              borderLeft: page === n.key ? `3px solid ${C.green600}` : "3px solid transparent",
            }}>
              <Icon name={n.icon} size={17} color={page === n.key ? C.green600 : C.gray400} />
              {n.label}
              {n.key === "orders" && pendingCount > 0 && <span style={{ marginLeft: "auto", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: C.white, borderRadius: 10, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{pendingCount}</span>}
            </button>
          ))}
        </nav>
        {/* User profile */}
        <div style={{ borderTop: `1px solid ${C.gray200}`, paddingTop: 14, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: C.gray50 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #8B1A1A, #c44040)", display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{credentials.user?.charAt(0)?.toUpperCase() || "V"}</div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: C.gray700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{credentials.user}</div><div style={{ fontSize: 10, color: C.gray400 }}>ผู้ดูแลระบบ</div></div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="page-content" style={{ flex: 1, padding: "24px 28px", minWidth: 0, maxWidth: 1100, overflow: "hidden" }}>
        {page === "dashboard" && renderDashboard()}
        {page === "analytics" && renderAnalytics()}
        {page === "shop" && renderShop()}
        {page === "orders" && renderOrders()}
        {page === "products" && renderProducts()}
        {page === "categories" && renderCategories()}
        {page === "shipping" && renderShipping()}
        {page === "expenses" && renderExpenses()}
        {page === "print" && renderPrint()}
        {page === "settings" && renderSettings()}
      </div>
      {SlipModal}
      {ConfirmModalEl}
    </div>
  );
}
