"use client";

import Link from "next/link";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  الرئيسية: [
    { label: "تحليل الأعراض", href: "/symptoms" },
    { label: "المساعد الذكي", href: "/chat" },
    { label: "البحث عن أطباء", href: "/doctors" },
  ],
  الحساب: [
    { label: "تسجيل الدخول", href: "/login" },
    { label: "إنشاء حساب", href: "/register" },
    { label: "لوحة التحكم", href: "/dashboard" },
  ],
  المزيد: [
    { label: "عن شفا", href: "#about" },
    { label: "الأسئلة الشائعة", href: "#faq" },
    { label: "سياسة الخصوصية", href: "#privacy" },
    { label: "الشروط والأحكام", href: "#terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">شفا</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              منصة طبية ذكية تساعدك في تشخيص الأعراض وتحديد التخصص المناسب باستخدام الذكاء الاصطناعي.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@shifa.ai</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>١٢٣٤-٥٦٧-٨٩٠</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className="font-semibold">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} شفا. جميع الحقوق محفوظة.</p>
            <p className="text-xs">
              ⚠️ هذا التطبيق للإرشاد فقط وليس بديلاً عن الاستشارة الطبية المتخصصة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
