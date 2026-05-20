/**
 * Zenith — Home / Landing Page
 * Redirects authenticated users to their workspace dashboard.
 * Unauthenticated users see the landing prompt.
 */
import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Zenith — Life OS',
  description: 'منصة إنتاجية متكاملة — تخطيط، معرفة، تركيز، عادات، وذكاء اصطناعي. مجانية للأبد.',
};

export default function HomePage() {
  return (
    <main className={styles['root']} role="main">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles['hero']} aria-labelledby="hero-heading">
        <div className={styles['badge']}>
          <span className={styles['badgeDot']} aria-hidden="true" />
          مجانية للأبد · بدون paywall · مفتوحة المصدر
        </div>

        <h1 id="hero-heading" className={styles['heading']}>
          نظام حياة واحد
          <br />
          <span className={styles['headingAccent']}>يجمع كل شيء</span>
        </h1>

        <p className={styles['subheading']}>
          تخطيط · معرفة · تركيز · عادات · ذكاء اصطناعي بدون تسريب بيانات
        </p>

        <div className={styles['actions']}>
          <Link
            href="/auth/signup"
            className={styles['btnPrimary']}
            id="cta-signup"
            aria-label="إنشاء حساب مجاني في Zenith"
          >
            ابدأ مجاناً
          </Link>
          <Link
            href="/auth/signin"
            className={styles['btnSecondary']}
            id="cta-signin"
          >
            تسجيل الدخول
          </Link>
        </div>
      </section>

      {/* ── Feature grid ─────────────────────────────────────── */}
      <section className={styles['features']} aria-label="مميزات المنصة">
        {FEATURES.map((f) => (
          <article key={f.id} className={styles['featureCard']}>
            <span className={styles['featureIcon']} aria-hidden="true">{f.icon}</span>
            <h2 className={styles['featureTitle']}>{f.title}</h2>
            <p className={styles['featureDesc']}>{f.desc}</p>
          </article>
        ))}
      </section>

      {/* ── Privacy promise ───────────────────────────────────── */}
      <section className={styles['privacy']} aria-label="وعد الخصوصية">
        <div className={styles['privacyInner']}>
          <span className={styles['privacyIcon']} aria-hidden="true">🔒</span>
          <div>
            <h2 className={styles['privacyTitle']}>خزنة Zero-Knowledge</h2>
            <p className={styles['privacyDesc']}>
              بياناتك مشفرة من الطرف للطرف. حتى نحن لا نستطيع قراءتها.
              خوارزمية XChaCha20-Poly1305 · Argon2id · بدون بيانات في الـ AI.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

const FEATURES = [
  {
    id: 'notes',
    icon: '📝',
    title: 'الملاحظات',
    desc: 'كتابة حرة مع editor غني وتنظيم تلقائي.',
  },
  {
    id: 'tasks',
    icon: '✅',
    title: 'المهام',
    desc: 'إدارة مهام بسيطة وسريعة مع تحديدات اليوم.',
  },
  {
    id: 'habits',
    icon: '🔁',
    title: 'العادات',
    desc: 'تتبع العادات اليومية مع streak ومؤشرات التقدم.',
  },
  {
    id: 'goals',
    icon: '🎯',
    title: 'الأهداف',
    desc: 'ربط الأهداف بالمهام والعادات مع XP system.',
  },
  {
    id: 'finance',
    icon: '💰',
    title: 'المالية',
    desc: 'تتبع الإنفاق والدخل بخصوصية تامة.',
  },
  {
    id: 'vault',
    icon: '🔐',
    title: 'الخزنة',
    desc: 'تخزين آمن Zero-Knowledge للبيانات الحساسة.',
  },
] as const;
