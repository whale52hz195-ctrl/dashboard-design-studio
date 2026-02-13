

# داشبورد إدارة تطبيق تواصل اجتماعي (Tingle-style)

## التصميم العام
- **ثيم داكن (Dark Theme)** بألوان بنفسجية/أرجوانية كما في الصور
- **Sidebar جانبي** ثابت مع أقسام مقسمة بعناوين (User Management, Banner, Content, Engagement, إلخ)
- **شريط علوي** يحتوي على بحث وأيقونة المستخدم
- تصميم responsive يتناسب مع الشاشات المختلفة

## الصفحات المطلوبة

### 1. صفحة تسجيل الدخول (Login)
- تصميم split-screen: الجهة اليسرى صورة ترحيبية بخلفية بنفسجية، الجهة اليمنى فورم تسجيل الدخول
- حقول: Email, Password مع خيار "Remember me" و "Forgot Password"
- زر Login وزر Demo Login

### 2. صفحة الداشبورد الرئيسية (Dashboard)
- بطاقات إحصائيات (Total Users, VIP Users, Total Hosts, إلخ)
- رسم بياني Activity Overview (باستخدام Recharts)
- قائمة Top Contributors و Recent Users و Top Likers في الجانب الأيمن
- Top Earning Hosts و Top Performing Agencies

### 3. إدارة المستخدمين (User Management)
- بطاقات ملخص (Total Users, Males, Females, VIP)
- فلاتر (Real Users, Status, Role)
- جدول بيانات المستخدمين مع أعمدة: User, Role, User Type, Coin, Status, UniqueID, Gender, Age, Country, Followers
- بحث وفلترة بالتاريخ

### 4. التحقق من المستخدمين (User Verification)
- تابات: Pending, Approved, Rejected
- جدول بأعمدة: User, UniqueID, IDProof, IDProof Image, Selfie Image, Status, Address, Application Date, Action

### 5. طلبات الاستضافة (Host Application)
- تابات: Pending, Approved, Rejected
- جدول بأعمدة: User, Agency, Status, Application Date

### 6. إدارة المضيفين (Host Management)
- بطاقات ملخص (Total Hosts, Males, Females, VIP Hosts)
- جدول بيانات المضيفين مع: Agency, Host, UniqueID, Gender, Age, Coin, Country, Followers, Followings, Friends

### 7. إدارة الوكالات (Agencies)
- جدول بأعمدة: Agency, User, Country, Contact Email, Mobile, Commission, Hosts, Host Earnings
- زر "+ Create Agency" يفتح Dialog لإنشاء وكالة جديدة
- فورم الإنشاء: Select User, Agency Name, Contact Email, Mobile, Commission Rate, Country, Description, Agency Logo

### 8. تجار العملات (Coin Traders)
- جدول بأعمدة: User, UniqueID, Coin Balance, Spent Coins, Mobile, Created Date, Status, Actions
- زر "+ Add Coin Trader"
- فلترة بالتاريخ وبحث

### 9. إدارة البانرات (Splash Banner)
- جدول بأعمدة: Image, Redirect URL, Status (toggle), Created Date, Last Updated, Actions
- زر "+ Add Banner"
- إمكانية تعديل وحذف

## البيانات
- جميع البيانات ستكون وهمية (mock data) مدمجة في الكود
- لا يوجد backend أو قاعدة بيانات

