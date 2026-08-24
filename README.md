# ATEFEH Modern

واجهة تفاعلية حديثة لتدريب الاستماع باللغة الألمانية لمستوى B1. تضم أربعة أقسام و337 تسجيلًا و424 سؤالًا، والمشروع جاهز للحفظ في GitHub والنشر المجاني على Cloudflare Pages.

## المزايا

- تصميم زجاجي متجاوب مع الحاسوب والهاتف.
- تشغيل التسجيلات والتنقل داخل المقطع الصوتي.
- أسئلة متعددة الخيارات مع التصحيح الفوري.
- عرض النصوص، نسخ المحتوى، النتيجة، الوقت والطباعة.
- تنقل بلوحة المفاتيح وتحسينات لسهولة الوصول.
- بطاقة مشاركة وإعدادات جاهزة لـ Cloudflare Pages.

## التشغيل على الحاسوب

يلزم تثبيت Node.js 22 أو أحدث. بعد تنزيل المشروع افتح مجلده في Terminal ثم نفّذ:

```bash
npm install
npm run dev
```

سيعرض Terminal رابط المعاينة المحلية. لإجراء فحص نهائي:

```bash
npm run build
npm run preview
```

## تعديل الأسئلة

توجد الأسئلة والتسجيلات والنصوص في ملفات الأقسام:

```text
src/content/b1/teil-1.ts
src/content/b1/teil-2.ts
src/content/b1/teil-3.ts
src/content/b1/teil-4.ts
```

كل سؤال يتبع البنية التالية:

```ts
{
  id: "b1-teil-1-001",
  audioPath: "Audioeins/1.mp3",
  transcript: "النص المسموع",
  questions: [{
    id: "b1-teil-1-001-q1",
    prompt: "نص السؤال",
    options: ["الخيار الأول", "الخيار الثاني", "الخيار الثالث"],
    correctAnswer: "الخيار الصحيح كما هو مكتوب تمامًا"
  }]
}
```

لتعديل الألوان والتصميم استخدم:

```text
src/index.css
```

## بنية المشروع

```text
src/components/       مكوّنات الواجهة القابلة لإعادة الاستخدام
src/config/           الإعدادات المركزية، ومنها رابط التسجيلات
src/content/b1/       بيانات أقسام B1 الأربعة
src/pages/            واجهة B1 وواجهة جلسة الاختبار
src/types/            أنواع TypeScript المشتركة
src/utils/            الأدوات العامة
src/App.tsx           اختيار الصفحة وتحميل القسم المطلوب
```

لتغيير مكان جميع التسجيلات لاحقًا، عدّل الثابت `AUDIO_BASE_URL` في:

```text
src/config/audio.ts
```

## رفع المشروع إلى GitHub

1. أنشئ مستودعًا خاصًا باسم `atefeh-modern`.
2. ارفع محتويات هذا المجلد إلى جذر المستودع، وليس ملف ZIP نفسه.
3. تأكد من وجود `package.json` و`src` مباشرة في الصفحة الأولى للمستودع.

أو من خلال Terminal:

```bash
git init
git add .
git commit -m "Initial ATEFEH Modern release"
git branch -M main
git remote add origin https://github.com/USERNAME/atefeh-modern.git
git push -u origin main
```

استبدل `USERNAME` باسم حسابك في GitHub.

## نشر المشروع على Cloudflare Pages

من لوحة Cloudflare افتح `Workers & Pages` ثم:

1. اختر `Create application`.
2. اختر `Pages`.
3. اختر `Import an existing Git repository`.
4. اربط حساب GitHub وحدد مستودع `atefeh-modern`.
5. استخدم إعدادات البناء التالية:

| الإعداد | القيمة |
|---|---|
| Production branch | `main` |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

6. اضغط `Save and Deploy`.

سيكون الرابط شبيهًا بـ:

```text
https://atefeh-modern.pages.dev
```

بعد ذلك، كل تعديل ترفعه إلى فرع `main` في GitHub سيُنشر تلقائيًا على الرابط نفسه.

## ملاحظات

- روابط ملفات الصوت الحالية خارجية وموجودة داخل `src/App.tsx`.
- مجلد `dist` يُنشأ تلقائيًا، ولذلك لا ترفعه إلى GitHub.
- لا تضع كلمات مرور أو مفاتيح سرية داخل ملفات المشروع.
- إذا أردت تقييد الموقع لشخص محدد، فعّل Cloudflare Access بعد النشر.

© 2026 Hassan Alhashimy
