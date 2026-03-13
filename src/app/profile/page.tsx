"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Droplet,
  Camera,
  Save,
  History,
  Trophy,
  Loader2,
  Shield,
  Award
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  bloodType: string | null;
  image: string | null;
  points: number;
  level: number;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ diagnoses: 0, reviews: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    birthDate: "",
    gender: "",
    bloodType: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setProfile(data.user);
      setFormData({
        name: data.user.name || "",
        phone: data.user.phone || "",
        birthDate: data.user.birthDate ? data.user.birthDate.split("T")[0] : "",
        gender: data.user.gender || "",
        bloodType: data.user.bloodType || "",
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("تم حفظ التغييرات");
        fetchProfile();
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await fetch("/api/profile/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: reader.result }),
        });

        if (response.ok) {
          toast.success("تم تحديث الصورة");
          fetchProfile();
        }
      } catch (error) {
        toast.error("حدث خطأ أثناء رفع الصورة");
      }
    };
    reader.readAsDataURL(file);
  };

  const getLevelName = (level: number) => {
    const levels = [
      { min: 1, name: "مبتدئ" },
      { min: 2, name: "مستكشف" },
      { min: 3, name: "مهتم" },
      { min: 4, name: "خبير" },
      { min: 5, name: "محترف" },
    ];
    return levels.find(l => l.min === level)?.name || "مبتدئ";
  };

  const getNextLevelPoints = (currentLevel: number) => {
    return currentLevel * 100;
  };

  const getProgress = (points: number, level: number) => {
    const nextLevel = getNextLevelPoints(level);
    const prevLevel = (level - 1) * 100;
    return ((points - prevLevel) / (nextLevel - prevLevel)) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-6 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/40" />
              <CardContent className="relative pt-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full border-4 border-background bg-muted overflow-hidden">
                      {profile?.image ? (
                        <img
                          src={profile.image}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <User className="w-12 h-12 text-primary" />
                        </div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>

                  {/* Name and Level */}
                  <div className="flex-1 text-center sm:text-right pb-2">
                    <h1 className="text-2xl font-bold">{profile?.name}</h1>
                    <p className="text-muted-foreground">{profile?.email}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <Badge className="bg-yellow-500/10 text-yellow-600">
                        <Trophy className="w-3 h-3 ml-1" />
                        المستوى {profile?.level} - {getLevelName(profile?.level || 1)}
                      </Badge>
                      <Badge variant="secondary">
                        {profile?.points} نقطة
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">التقدم للمستوى التالي</span>
                    <span className="font-medium">{profile?.points} / {getNextLevelPoints(profile?.level || 1)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgress(profile?.points || 0, profile?.level || 1)}%` }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            <Card className="p-4 text-center">
              <History className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.diagnoses}</div>
              <div className="text-sm text-muted-foreground">تشخيص</div>
            </Card>
            <Card className="p-4 text-center">
              <Award className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.reviews}</div>
              <div className="text-sm text-muted-foreground">تقييم</div>
            </Card>
          </motion.div>

          {/* Edit Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الاسم</label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pr-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={profile?.email || ""}
                        disabled
                        className="pr-9 bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">رقم الهاتف</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pr-9"
                        placeholder="01xxxxxxxxx"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">تاريخ الميلاد</label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="pr-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">الجنس</label>
                    <div className="flex gap-2">
                      <Button
                        variant={formData.gender === "male" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setFormData({ ...formData, gender: "male" })}
                      >
                        ذكر
                      </Button>
                      <Button
                        variant={formData.gender === "female" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setFormData({ ...formData, gender: "female" })}
                      >
                        أنثى
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">فصيلة الدم</label>
                    <div className="relative">
                      <Droplet className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                      <select
                        value={formData.bloodType}
                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                        className="w-full h-10 pr-9 pl-3 rounded-md border border-input bg-background"
                      >
                        <option value="">اختر فصيلة الدم</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Save className="w-4 h-4 ml-2" />
                  )}
                  حفظ التغييرات
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
