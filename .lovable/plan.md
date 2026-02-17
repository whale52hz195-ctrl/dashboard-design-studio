

# اضافة اللغة العربية + تغيير اللون الاساسي للفيروزي

## ملخص التغييرات
1. تغيير اللون الاساسي من البنفسجي الى الفيروزي (`#36BDbe` / `hsl(177 59% 48%)`)
2. اضافة دعم اللغة العربية (RTL) مع زر تبديل اللغة في الشريط العلوي
3. اصلاح خطأ `vite.config.ts`

## التفاصيل

### 1. اصلاح vite.config.ts
- تغيير `allowedHosts: true` الى `allowedHosts: true as const` او ازالتها
- تغيير البورت الى 8080

### 2. تغيير اللون الاساسي
- تحديث `src/index.css`: تغيير كل الالوان البنفسجية (`purple-600`, `purple-700`, الخ) الى اللون الفيروزي `hsl(177 59% 48%)`
- اللون الاساسي `--primary` موجود بالفعل كـ `177 59% 48%` في CSS variables لكن الكود يستخدم `purple-600` بشكل مباشر (hardcoded) في عدة اماكن
- تحديث كل الملفات التي تستخدم `bg-purple-600`, `text-purple-400`, `hover:bg-purple-700`, `border-purple-500` الخ واستبدالها بـ `bg-primary`, `text-primary`, `hover:bg-primary/90`

**الملفات المتأثرة:**
- `src/pages/Settings.tsx` - ازرار وتابات بنفسجية
- `src/pages/Login.tsx` - زر Login وروابط
- `src/pages/Dashboard.tsx` - الوان الرسم البياني
- `src/components/layout/AppSidebar.tsx` - الوان القائمة
- جميع صفحات الداشبورد الاخرى التي تستخدم الوان بنفسجية مباشرة

### 3. نظام الترجمة (i18n)
- انشاء ملف `src/lib/i18n.ts` يحتوي على:
  - قاموس ترجمة (English/Arabic) لكل النصوص المستخدمة في الداشبورد
  - Context Provider (`LanguageProvider`) لمشاركة اللغة الحالية
  - Hook (`useLanguage`) للوصول للترجمة وتبديل اللغة
  - دالة `t(key)` للحصول على الترجمة

- تحديث `src/App.tsx`: لف التطبيق بـ `LanguageProvider`

### 4. زر تبديل اللغة
- تحديث `src/components/layout/TopBar.tsx`: اضافة زر `Globe` بجانب ايقونة الاشعارات
  - عند الضغط يتبدل بين EN و AR
  - تغيير اتجاه الصفحة `dir="rtl"` عند اختيار العربية

### 5. تطبيق RTL
- تحديث `src/index.css`: اضافة CSS rules لدعم RTL
- عند اختيار العربية:
  - `document.documentElement.dir = "rtl"`
  - `document.documentElement.lang = "ar"`
  - خط Cairo يعمل تلقائيا مع العربية

### 6. ترجمة الصفحات
- تحديث كل صفحة لاستخدام `useLanguage()` و `t()` بدلا من النصوص الثابتة
- الصفحات الرئيسية: Login, Dashboard, Settings, UserManagement, Sidebar, TopBar, وباقي الصفحات

## التفاصيل التقنية

### الملفات الجديدة
1. `src/lib/i18n.tsx` - نظام الترجمة (Context + translations)

### الملفات المعدلة
1. `vite.config.ts` - اصلاح الخطأ + تغيير البورت
2. `src/index.css` - اضافة RTL styles
3. `src/App.tsx` - اضافة LanguageProvider
4. `src/components/layout/TopBar.tsx` - زر تبديل اللغة
5. `src/components/layout/AppSidebar.tsx` - ترجمة القائمة + تغيير الالوان
6. `src/pages/Login.tsx` - ترجمة + تغيير الالوان
7. `src/pages/Dashboard.tsx` - ترجمة + تغيير الالوان
8. `src/pages/Settings.tsx` - ترجمة + تغيير الالوان
9. `src/pages/UserManagement.tsx` - ترجمة + تغيير الالوان
10. باقي الصفحات (~25 صفحة) - ترجمة + تغيير الالوان من البنفسجي للفيروزي

