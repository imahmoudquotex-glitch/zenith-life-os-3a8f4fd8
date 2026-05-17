/**
 * i18n — Zenith W04
 * خفيف بدون مكتبات خارجية. يدعم ar/en مع RTL/LTR تلقائي.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const ar = {
  auth: {
    signIn:           'تسجيل الدخول',
    signUp:           'إنشاء حساب',
    signOut:          'تسجيل الخروج',
    email:            'البريد الإلكتروني',
    password:         'كلمة المرور',
    forgotPassword:   'نسيت كلمة المرور؟',
    resetPassword:    'إعادة تعيين كلمة المرور',
    magicLink:        'رابط سحري',
    continueWithGoogle: 'المتابعة مع Google',
    continueWithGitHub: 'المتابعة مع GitHub',
    orContinueWith:   'أو المتابعة بـ',
    checkEmail:       'تحقق من بريدك الإلكتروني',
    verifyEmail:      'تفعيل البريد الإلكتروني',
  },
  onboarding: {
    welcome:   'مرحباً بك في Zenith',
    step1:     'اختر لغتك',
    step2:     'أخبرنا عنك',
    step3:     'منطقتك الزمنية',
    finish:    'ابدأ رحلتك',
    next:      'التالي',
    back:      'السابق',
  },
  nav: {
    dashboard: 'لوحة التحكم',
    habits:    'العادات',
    goals:     'الأهداف',
    notes:     'الملاحظات',
    calendar:  'التقويم',
    kanban:    'كانبان',
    vault:     'الخزنة',
    expenses:  'المصاريف',
    settings:  'الإعدادات',
    analytics: 'التحليلات',
  },
  common: {
    save:    'حفظ',
    cancel:  'إلغاء',
    delete:  'حذف',
    edit:    'تعديل',
    create:  'إنشاء',
    search:  'بحث',
    loading: 'جارٍ التحميل...',
    error:   'حدث خطأ',
    success: 'تمّ بنجاح',
  },
};

type Messages = {
  auth: { [K in keyof typeof ar.auth]: string };
  onboarding: { [K in keyof typeof ar.onboarding]: string };
  nav: { [K in keyof typeof ar.nav]: string };
  common: { [K in keyof typeof ar.common]: string };
};

const en: Messages = {
  auth: {
    signIn:           'Sign In',
    signUp:           'Sign Up',
    signOut:          'Sign Out',
    email:            'Email',
    password:         'Password',
    forgotPassword:   'Forgot password?',
    resetPassword:    'Reset Password',
    magicLink:        'Magic Link',
    continueWithGoogle: 'Continue with Google',
    continueWithGitHub: 'Continue with GitHub',
    orContinueWith:   'Or continue with',
    checkEmail:       'Check your email',
    verifyEmail:      'Verify your email',
  },
  onboarding: {
    welcome:   'Welcome to Zenith',
    step1:     'Choose your language',
    step2:     'Tell us about you',
    step3:     'Your timezone',
    finish:    'Start your journey',
    next:      'Next',
    back:      'Back',
  },
  nav: {
    dashboard: 'Dashboard',
    habits:    'Habits',
    goals:     'Goals',
    notes:     'Notes',
    calendar:  'Calendar',
    kanban:    'Kanban',
    vault:     'Vault',
    expenses:  'Expenses',
    settings:  'Settings',
    analytics: 'Analytics',
  },
  common: {
    save:    'Save',
    cancel:  'Cancel',
    delete:  'Delete',
    edit:    'Edit',
    create:  'Create',
    search:  'Search',
    loading: 'Loading...',
    error:   'Something went wrong',
    success: 'Done!',
  },
};

export type Locale = 'ar' | 'en';
const messages: Record<Locale, Messages> = { ar: ar as Messages, en } as const;

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Messages;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'ar';
    const saved = localStorage.getItem('zenith-locale');
    return (saved === 'ar' || saved === 'en') ? saved : 'ar';
  });

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
    localStorage.setItem('zenith-locale', locale);
  }, [locale, dir]);

  const setLocale = (l: Locale) => setLocaleState(l);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: messages[locale], dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
