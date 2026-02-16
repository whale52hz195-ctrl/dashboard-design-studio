

# صفحة Settings كاملة

## الوصف
بناء صفحة Settings شاملة بنفس التصميم الموجود في الصور، تحتوي على 10 تابات (tabs) مع محتوى كل تاب.

## الهيكل العام
- صفحة واحدة `src/pages/Settings.tsx` تحتوي على شريط تابات أفقي قابل للتمرير
- التابات: General, Payment, Content Moderation, Report Reasons, Currency, Withdrawal, Profile Management, Audio Management, Video Management, Game
- كل تاب يعرض محتوى مختلف مع زر "Save Changes" بنفسجي في الأعلى

## تفاصيل كل تاب

### 1. General Setting
- Call Rate Setting: حقلين (Private Video Call Rate, Private Audio Call Rate) بوحدة coins/minute
- App Setting: حقول (Login Bonus, Duration of Shorts, PK End Time, Admin Rate)
- Agora Setting: حقلين (Agora App ID, Agora App Certificate)
- Banner Announcement Setting: حقلين (Minimum Gift/Game announcement coin)
- Fake Data Setting: toggle لتفعيل Fake Data
- Policy Links: حقلين (Privacy Policy Link, Terms of Use Policy Link)
- Shorts Effect Setting: toggle + حقلين License Key
- Watermark Setting: toggle + منطقة رفع صورة
- Lucky Gift Setting: حقلين (Admin Tax Percent, Receiver Share Percent)
- Firebase Notification Setting: textarea لـ Private Key JSON

### 2. Payment Setting
- Stripe Setting: toggle + حقلين (Publishable Key, Secret Key)
- Razorpay Setting: toggle + حقلين (ID, Secret Key)
- Flutterwave Setting: toggle + حقل (Flutterwave ID)
- Google Play Setting: toggle + حقلين (Service Account Email, Private Key)

### 3. Content Moderation
- Sightengine config: حقلين (User, API Secret)
- Content Moderation Keywords: select منسدلين (Video Banned Keywords, Post Banned Keywords)

### 4. Report Reasons
- جدول بأعمدة: Title, Created At, Updated At, Actions (edit/delete)
- زر "+ Add New Reason"
- Dialog للتعديل/الإضافة بحقل Reason Title

### 5. Currency Setting
- جدول بأعمدة: Name, Symbol, Country Code, Currency Code, Default (star), Actions
- زر "+ Add Currency"

### 6. Withdrawal Setting
- Minimum Coin Setting: حقول (Currency, Coins, Minimum Coins Payout For User, Minimum Coins Payout For Agency)

### 7. Profile Management
- شبكة صور دائرية مع زر رفع صورة (dashed circle) وزر "Remove" تحت كل صورة

### 8. Audio Management
- منطقة رفع ملف صوتي (dashed circle) مع عرض الملف المرفوع بشكل دائري بنفسجي مع زر تشغيل وشريط تقدم

### 9. Video Management
- نفس فكرة Audio Management لكن لملفات الفيديو

### 10. Game (Game Bet Management)
- حقول Bet 1-5 بوحدة Coin مع وصف

## التفاصيل التقنية

### الملفات المطلوبة
1. **`src/pages/Settings.tsx`** - الصفحة الرئيسية مع كل التابات والمحتوى
2. **`src/data/mockSettingsData.ts`** - البيانات الوهمية (report reasons, currencies, profile images, etc.)
3. **تعديل `src/App.tsx`** - إضافة route `/settings`
4. **تعديل `src/components/layout/AppSidebar.tsx`** - تحديث رابط Setting ليشير لـ `/settings`

### التصميم
- نفس الثيم الداكن البنفسجي المستخدم في باقي الداشبورد
- كل section محاط بـ border مع عنوان وأيقونة info
- الحقول بخلفية داكنة مع labels بلون رمادي فاتح
- الـ toggles بلون بنفسجي عند التفعيل
- التابات النشطة بلون بنفسجي مع underline

### المكونات المستخدمة
- Tabs من shadcn/ui للتنقل بين الأقسام
- Switch للـ toggles
- Input للحقول النصية والرقمية
- Dialog لتعديل/إضافة Report Reasons و Currencies
- Table لعرض Report Reasons و Currencies
- Select للـ dropdowns

