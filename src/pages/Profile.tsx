import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  Award,
  Edit2,
  Save,
  X,
  Loader2,
  Shield,
} from "lucide-react";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
  });

  // Fetch profile from user-service
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => api.users.getMe(),
    enabled: !!user,
  });

  // Fetch enrollment count from course-service
  const { data: enrollments } = useQuery({
    queryKey: ["enrollmentCount", user?.id],
    queryFn: () => api.courses.myEnrollments(),
    enabled: !!user,
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => api.users.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      });
    }
    setIsEditing(false);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const enrollmentCount = enrollments?.length || 0;
  const completedCount = enrollments?.filter((e: any) => e.completed_at).length || 0;
  const role = profile?.role || "learner";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Avatar & Stats */}
            <div className="space-y-6">
              {/* Avatar Card */}
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt={formData.full_name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary" />
                  )}
                </div>
                <h2 className="font-semibold text-lg">
                  {formData.full_name || "User"}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>

                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge variant={role === "admin" ? "default" : "secondary"}>
                    <Shield className="w-3 h-3 mr-1" />
                    {role}
                  </Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-card rounded-xl p-6 border border-border space-y-4">
                <h3 className="font-semibold">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>Enrolled Courses</span>
                    </div>
                    <span className="font-semibold">{enrollmentCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                    <span className="font-semibold">{completedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Member Since</span>
                    </div>
                    <span className="font-semibold text-sm">
                      {new Date(profile?.created_at || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Form */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-lg mb-6">Profile Information</h3>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-muted-foreground py-2">
                        {profile?.full_name || "Not set"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center gap-2 py-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    {isEditing ? (
                      <Input
                        id="avatar_url"
                        value={formData.avatar_url}
                        onChange={(e) =>
                          setFormData({ ...formData, avatar_url: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    ) : (
                      <p className="text-muted-foreground py-2">
                        {profile?.avatar_url || "Not set"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-muted-foreground py-2">
                        {profile?.bio || "No bio added yet"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-lg mb-4">Account Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    My Learning
                  </Button>
                  {role === "instructor" && (
                    <Button variant="outline" onClick={() => navigate("/instructor")}>
                      <Award className="w-4 h-4 mr-2" />
                      Instructor Dashboard
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      signOut();
                      navigate("/");
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
