# رفع المشروع على GitHub

## الخطوات السريعة

### 1. إنشاء مستودع جديد على GitHub
- اذهب إلى github.com
- اضغط "New repository"
- اختر اسم: `oasis-store` (أو أي اسم تريده)
- لا تختار "Initialize with README"
- اضغط "Create repository"

### 2. تهيئة Git في المشروع

```bash
# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# عمل commit أولي
git commit -m "Initial commit: متجر الواحة"

# إضافة remote
git remote add origin https://github.com/YOUR_USERNAME/oasis-store.git

# رفع الملفات
git branch -M main
git push -u origin main
```

### 3. إذا كان لديك مستودع موجود

```bash
git remote add origin https://github.com/YOUR_USERNAME/oasis-store.git
git branch -M main
git push -u origin main
```

## ملاحظات مهمة

✅ **تم إعداد .gitignore** لحماية:
- `node_modules/` - لن يتم رفعه
- `server/data/products.json` - البيانات الحالية
- `server/public/uploads/*` - الصور المرفوعة
- `.env` - ملفات البيئة

✅ **الملفات المرفوعة:**
- جميع ملفات الكود
- `package.json` و `package-lock.json`
- ملفات HTML/CSS/JS
- الشعار في مجلد `ming/`

## بعد الرفع

يمكنك مشاركة الرابط مع الآخرين:
```
https://github.com/YOUR_USERNAME/oasis-store
```

