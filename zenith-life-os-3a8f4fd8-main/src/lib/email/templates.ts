/**
 * Zenith Email Templates — W04 (Z3)
 * HTML strings للإرسال عبر Resend API
 */

const base = (content: string) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin:0; background:#030504; color:#F4F7F5; font-family:'Cairo',Arial,sans-serif; }
    .container { max-width:520px; margin:40px auto; background:rgba(10,16,13,0.92);
                 border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:40px; }
    .logo { font-size:24px; font-weight:800; color:#4ADE80; margin-bottom:24px; }
    h1 { font-size:22px; font-weight:700; margin:0 0 12px; }
    p  { font-size:15px; color:#A7B3AB; line-height:1.7; margin:0 0 20px; }
    .btn { display:inline-block; background:#22C55E; color:#030504; font-weight:700;
           font-size:15px; padding:12px 28px; border-radius:8px; text-decoration:none; }
    .footer { margin-top:32px; font-size:12px; color:#647067; text-align:center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡ Zenith</div>
    ${content}
    <div class="footer">Zenith Life OS · هذا البريد أُرسل تلقائياً · لا ترد عليه</div>
  </div>
</body>
</html>`;

export function verifyEmailTemplate({ url, name }: { url: string; name?: string }) {
  return base(`
    <h1>مرحباً ${name ?? 'بك'}!</h1>
    <p>شكراً لتسجيلك في Zenith. اضغط الزر أدناه لتفعيل بريدك الإلكتروني.</p>
    <p><a href="${url}" class="btn">تفعيل البريد الإلكتروني</a></p>
    <p style="font-size:13px">الرابط صالح لمدة 24 ساعة. إذا لم تطلب هذا، تجاهل البريد.</p>
  `);
}

export function resetPasswordTemplate({ url }: { url: string }) {
  return base(`
    <h1>إعادة تعيين كلمة المرور</h1>
    <p>طُلب إعادة تعيين كلمة المرور لحسابك. اضغط أدناه للمتابعة.</p>
    <p><a href="${url}" class="btn">تعيين كلمة مرور جديدة</a></p>
    <p style="font-size:13px">الرابط صالح لمدة 60 دقيقة. إذا لم تطلب هذا، تجاهل البريد.</p>
  `);
}

export function magicLinkTemplate({ url }: { url: string }) {
  return base(`
    <h1>رابطك السحري</h1>
    <p>اضغط أدناه لتسجيل الدخول الفوري بدون كلمة مرور.</p>
    <p><a href="${url}" class="btn">الدخول الآن</a></p>
    <p style="font-size:13px">الرابط صالح لمدة 15 دقيقة لاستخدام واحد فقط.</p>
  `);
}

export function invitationTemplate({ url, inviterName }: { url: string; inviterName: string }) {
  return base(`
    <h1>دعوة للانضمام إلى Zenith</h1>
    <p>دعاك <strong>${inviterName}</strong> للانضمام إلى Zenith Life OS.</p>
    <p><a href="${url}" class="btn">قبول الدعوة</a></p>
    <p style="font-size:13px">الرابط صالح لمدة 48 ساعة.</p>
  `);
}

export function newDeviceLoginTemplate({ device, time, ip }: { device: string; time: string; ip: string }) {
  return base(`
    <h1>تسجيل دخول من جهاز جديد</h1>
    <p>لاحظنا تسجيل دخول من جهاز غير معروف:</p>
    <p><strong>الجهاز:</strong> ${device}<br/>
       <strong>الوقت:</strong> ${time}<br/>
       <strong>IP:</strong> ${ip}</p>
    <p>إذا كنت أنت، يمكنك تجاهل هذا البريد. إذا لم تكن أنت، <a href="#" style="color:#4ADE80">أوقف الجلسات</a> فوراً.</p>
  `);
}
