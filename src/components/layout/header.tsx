"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  MessageCircle,
  Stethoscope,
  MapPin,
  Loader2,
  Bell,
  History,
  Star,
  Trophy,
  Settings
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

const navItems = [
  { href: "/symptoms", label: "تحليل الأعراض", icon: Stethoscope },
  { href: "/chat", label: "المساعد الذكي", icon: MessageCircle },
  { href: "/doctors", label: "الأطباء", icon: MapPin },
];

const userMenuItems = [
  { href: "/profile", label: "الملف الشخصي", icon: User },
  { href: "/history", label: "سجل التشخيصات", icon: History },
  { href: "/favorites", label: "المفضلون", icon: Star },
  { href: "/reviews", label: "التقييمات", icon: Trophy },
];

interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  points?: number;
}

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: 'include', // Important: include cookies
        });
        const data = await response.json();
        setUser(data.user);
        
        // Fetch notification count
        if (data.user) {
          const notifRes = await fetch("/api/notifications", {
            credentials: 'include',
          });
          const notifs = await notifRes.json();
          setNotificationCount(notifs.filter((n: any) => !n.read).length);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    
    // Re-fetch on focus (when user comes back to tab)
    const handleFocus = () => fetchUser();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    
    if (document.startViewTransition) {
      (document as any).startViewTransition(() => {
        setTheme(newTheme);
      });
    } else {
      setTheme(newTheme);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">شفا</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg"
              >
                <AnimatePresence mode="wait">
                  {theme === "dark" ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            )}

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : user ? (
                <>
                  {/* Points Badge */}
                  <Link href="/profile">
                    <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80">
                      <Trophy className="w-3 h-3 text-yellow-500" />
                      {user.points || 0}
                    </Badge>
                  </Link>

                  {/* Notifications */}
                  <Link href="/notifications">
                    <Button variant="ghost" size="icon" className="rounded-lg relative">
                      <Bell className="w-5 h-5" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </span>
                      )}
                    </Button>
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      className="gap-2 px-2"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden lg:inline">{user.name}</span>
                    </Button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 top-full mt-2 w-56 bg-background border rounded-xl shadow-lg overflow-hidden"
                        >
                          <div className="p-2">
                            {userMenuItems.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <item.icon className="w-4 h-4 text-muted-foreground" />
                                <span>{item.label}</span>
                              </Link>
                            ))}
                          </div>
                          <div className="border-t p-2">
                            <button
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                handleLogout();
                              }}
                              disabled={isLoggingOut}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                            >
                              {isLoggingOut ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <LogOut className="w-4 h-4" />
                              )}
                              <span>تسجيل الخروج</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="rounded-lg">
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="rounded-lg">
                      إنشاء حساب
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="md:hidden rounded-lg"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
                
                {/* User Menu Items (Mobile) */}
                {user && (
                  <div className="pt-4 border-t border-border">
                    {userMenuItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (navItems.length + index) * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  {isLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant="secondary" className="gap-1">
                          <Trophy className="w-3 h-3 text-yellow-500" />
                          {user.points || 0}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full rounded-lg"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري تسجيل الخروج...
                          </>
                        ) : (
                          <>
                            <LogOut className="w-4 h-4 ml-2" />
                            تسجيل الخروج
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Link href="/login" className="flex-1">
                        <Button variant="outline" className="w-full rounded-lg">
                          تسجيل الدخول
                        </Button>
                      </Link>
                      <Link href="/register" className="flex-1">
                        <Button className="w-full rounded-lg">
                          إنشاء حساب
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
