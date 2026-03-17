# VANDEE SHOP — ระบบจัดการร้านค้าของฝาก

ระบบ POS ออนไลน์ครบวงจร สำหรับร้านขายของฝาก พร้อม PWA รองรับทุกแพลตฟอร์ม

## ฟีเจอร์

- **แดชบอร์ด** — สรุปรายรับ เลือกช่วงเวลา (รายวัน/สัปดาห์/เดือน/ปี/กำหนดเอง) กราฟแท่ง Top 5 สินค้า
- **หน้าร้าน** — สั่งซื้อ 4 ขั้นตอน (เลือกสินค้า → ที่อยู่+วิธีจัดส่ง → แนบสลิป → สรุป)
- **คำสั่งซื้อ** — ดูออเดอร์ทั้งหมด เปลี่ยนสถานะ ดาวน์โหลด CSV
- **จัดการสินค้า** — เพิ่ม/ลบ/แก้ไข เปิด-ปิดขาย
- **จัดการหมวดหมู่** — เพิ่ม/ลบ/แก้ไข จัดลำดับ
- **วิธีจัดส่ง** — เพิ่ม/ลบ/แก้ไข ตั้งราคา เปิด-ปิด
- **ตั้งค่า** — เชื่อมต่อ Google Sheet, เปลี่ยนรหัสผ่าน, ออกจากระบบ
- **PWA** — ติดตั้งเป็นแอปบน Windows, macOS, iOS, Android
- **ข้อมูลคงอยู่** — เก็บใน localStorage ไม่หายเมื่อ refresh
- **ล็อกอิน** — จดจำรหัสผ่าน, เปลี่ยนรหัสได้

## วิธีติดตั้งและ Deploy

### 1. สร้าง Repository บน GitHub

1. ไปที่ [github.com/new](https://github.com/new)
2. ตั้งชื่อ repository: `vandee-shop`
3. เลือก Public
4. กด Create repository

### 2. Push โค้ดขึ้น GitHub

```bash
cd vandee-shop
git init
git add .
git commit -m "VANDEE SHOP v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vandee-shop.git
git push -u origin main
```

### 3. เปิด GitHub Pages

1. ไปที่ repository → Settings → Pages
2. Source เลือก **GitHub Actions**
3. รอ 2-3 นาที GitHub จะ build และ deploy อัตโนมัติ
4. เว็บจะอยู่ที่: `https://YOUR_USERNAME.github.io/vandee-shop/`

### 4. ติดตั้งเป็นแอป (PWA)

#### iPhone / iPad
1. เปิด Safari ไปที่ URL ข้างบน
2. กดปุ่ม Share (กล่องมีลูกศรชี้ขึ้น)
3. กด "เพิ่มไปยังหน้าจอหลัก"
4. กด "เพิ่ม"

#### Android
1. เปิด Chrome ไปที่ URL
2. กดเมนู 3 จุด → "ติดตั้งแอป" หรือ "เพิ่มไปหน้าจอหลัก"
3. กด "ติดตั้ง"

#### Windows / macOS
1. เปิด Chrome/Edge ไปที่ URL
2. กดไอคอน Install ใน address bar (หรือเมนู → Install app)
3. กด "Install"

## พัฒนาในเครื่อง

```bash
npm install
npm run dev
```

เปิด `http://localhost:5173/vandee-shop/`

## ข้อมูลล็อกอินเริ่มต้น

- **User:** back-vandee
- **Password:** vandeesouvenir2026

## เทคโนโลยี

- React 18 + Vite
- PWA (vite-plugin-pwa)
- localStorage สำหรับ persistent data
- Google Apps Script สำหรับ sync ไป Google Sheet
- GitHub Actions สำหรับ auto-deploy

## สำคัญ: เปลี่ยนชื่อ Repository

ถ้าตั้งชื่อ repository ไม่ใช่ `vandee-shop` ต้องแก้ `base` ใน `vite.config.js`:

```js
base: '/ชื่อ-repo-ของคุณ/',
```

และแก้ path ใน `index.html` ด้วย
