import { useEffect, useState, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BookOpen, Users, DollarSign, TrendingUp, Plus, Pencil, Trash2,
  Loader2, Eye, EyeOff, Layers,
} from "lucide-react";
import LessonManager from "@/components/instructor/LessonManager";

interface CourseFormData {
  title: string; description: string; image_url: string;
  price: number; original_price: number | null;
  category: string; level: string; duration_hours: number; is_published: boolean;
}

const defaultFormData: CourseFormData = {
  title: "", description: "", image_url: "", price: 0, original_price: null,
  category: "Programming", level: "Beginner", duration_hours: 0, is_published: false,
};

const categories = ["Programming", "Web Development", "DevOps", "Cloud", "AI & ML", "Data Science", "Mobile Development", "Cybersecurity"];
const levels = ["Beginner", "Intermediate", "Advanced"];

const InstructorDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [managingLessons, setManagingLessons] = useState<{ id: string; title: string } | null>(null);
  const [formData, setFormData] = useState<CourseFormData>(defaultFormData);

  // Role is stored in auth_user localStorage from the login response
  // Also try fetching from user-service if available (for role updates like DB promotion)
  const { data: profile, isLoading: roleLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => api.users.getMe(),
    enabled: !!user,
    retry: false, // don't retry if user-service is not updated yet
  });

  // Fallback: use role directly from login token if profile fetch fails
  const isInstructor = profile?.role === "instructor" || profile?.role === "admin"
    || user?.role === "instructor" || user?.role === "admin";

  // Fetch courses created by this instructor
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["myCourses", user?.id],
    queryFn: () => api.courses.myCourses(),
    enabled: !!user && isInstructor,
  });

  // Fetch all enrollments for instructor's courses
  const { data: allEnrollments } = useQuery({
    queryKey: ["allEnrollments"],
    queryFn: () => api.courses.myInstructorEnrollments(),
    enabled: !!user && isInstructor,
  });

  // Compute stats from real enrollment data
  const analyticsData = useMemo(() => {
    const enrollments = allEnrollments || [];
    const uniqueStudents = new Set(enrollments.map((e: any) => e.user_id)).size;
    
    const revenue = enrollments.reduce((acc: number, e: any) => {
      const course = (courses || []).find((c: any) => c.id === e.course_id);
      return acc + (course?.price || 0);
    }, 0);

    return { 
      total: uniqueStudents, 
      revenue, 
      views: 0 // Will stay 0 unless we integrate analytics service further
    };
  }, [allEnrollments, courses]);

  // Create/Update course
  const courseMutation = useMutation({
    mutationFn: (data: CourseFormData) => {
      if (editingCourse) return api.courses.update(editingCourse, data);
      return api.courses.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCourses", user?.id] });
      toast({ title: editingCourse ? "Course updated!" : "Course created!", description: editingCourse ? "Your course has been updated successfully." : "Your new course has been created." });
      setIsDialogOpen(false);
      setEditingCourse(null);
      setFormData(defaultFormData);
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  // Delete course
  const deleteMutation = useMutation({
    mutationFn: (courseId: string) => api.courses.delete(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCourses", user?.id] });
      toast({ title: "Course deleted", description: "The course has been removed." });
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  // Toggle publish
  const togglePublishMutation = useMutation({
    mutationFn: ({ courseId, isPublished }: { courseId: string; isPublished: boolean }) =>
      api.courses.update(courseId, { is_published: isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCourses", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [user, loading, navigate]);

  if (loading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!user) return null;

  if (!isInstructor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <BookOpen className="w-16 h-16 mx-auto text-primary mb-6" />
            <h1 className="font-display text-3xl font-bold mb-4">Become an Instructor</h1>
            <p className="text-muted-foreground mb-8">
              Share your knowledge with thousands of students worldwide. Create engaging courses and earn money while making an impact.
            </p>
            <Button size="lg" onClick={async () => {
              try {
                await api.users.updateMe({ full_name: profile?.full_name || "" });
                toast({ title: "Welcome, Instructor!", description: "Contact an admin to upgrade your role." });
              } catch (e) {
                toast({ title: "Error", description: "Could not upgrade. Please contact an admin.", variant: "destructive" });
              }
            }}>
              Become an Instructor
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleEditCourse = (course: any) => {
    setEditingCourse(course.id);
    setFormData({
      title: course.title, description: course.description || "", image_url: course.image_url || "",
      price: Number(course.price) || 0, original_price: course.original_price ? Number(course.original_price) : null,
      category: course.category, level: course.level, duration_hours: course.duration_hours || 0, is_published: course.is_published || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); courseMutation.mutate(formData); };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Instructor Dashboard</h1>
              <p className="text-muted-foreground">Manage your courses and track student engagement</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingCourse(null); setFormData(defaultFormData); } }}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Create Course</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
                  <DialogDescription>{editingCourse ? "Update your course details" : "Fill in the details to create a new course"}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Complete React Developer Course" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Cover Image URL</Label>
                    <Input id="image_url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{levels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input id="price" type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="original_price">Original Price ($)</Label>
                      <Input id="original_price" type="number" min="0" step="0.01" value={formData.original_price || ""} onChange={(e) => setFormData({ ...formData, original_price: e.target.value ? parseFloat(e.target.value) : null })} placeholder="For discount display" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration_hours">Duration (hours)</Label>
                      <Input id="duration_hours" type="number" min="0" value={formData.duration_hours} onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="is_published" checked={formData.is_published} onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })} />
                      <Label htmlFor="is_published">Publish immediately</Label>
                    </div>
                    <Button type="submit" disabled={courseMutation.isPending}>
                      {courseMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      {editingCourse ? "Update Course" : "Create Course"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Total Courses", value: courses?.length || 0, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
              { label: "Total Students", value: analyticsData?.total || 0, icon: Users, color: "text-success", bg: "bg-success/10" },
              { label: "Total Views", value: analyticsData?.views || 0, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Total Revenue", value: `$${analyticsData?.revenue?.toFixed(2) || "0.00"}`, icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}><Icon className={`w-6 h-6 ${color}`} /></div>
                  <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
                </div>
              </div>
            ))}
          </div>

          {/* Courses list */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Your Courses</h2>
            {coursesLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : courses && courses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                  <div key={course.id} className="bg-card rounded-xl overflow-hidden border border-border">
                    <div className="aspect-video relative">
                      <img src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400"} alt={course.title} className="w-full h-full object-cover" />
                      <Badge className={`absolute top-3 left-3 ${course.is_published ? "bg-success" : "bg-muted"}`}>{course.is_published ? "Published" : "Draft"}</Badge>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                        <Badge variant="outline" className="text-xs">{course.level}</Badge>
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-lg font-bold mb-4">{Number(course.price) === 0 ? "Free" : `$${course.price}`}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditCourse(course)}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
                        <Button size="sm" variant="outline" onClick={() => setManagingLessons({ id: course.id, title: course.title })}><Layers className="w-4 h-4 mr-1" />Lessons</Button>
                        <Button size="sm" variant="outline" onClick={() => togglePublishMutation.mutate({ courseId: course.id, isPublished: !course.is_published })}>
                          {course.is_published ? <><EyeOff className="w-4 h-4 mr-1" />Unpublish</> : <><Eye className="w-4 h-4 mr-1" />Publish</>}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete this course?")) deleteMutation.mutate(course.id); }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">Create your first course to start teaching!</p>
                <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />Create Course</Button>
              </div>
            )}
          </div>

          {/* Lesson Management Dialog */}
          <Dialog open={!!managingLessons} onOpenChange={(open) => !open && setManagingLessons(null)}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Manage Lessons</DialogTitle>
                <DialogDescription>Add and organize lessons for your course</DialogDescription>
              </DialogHeader>
              {managingLessons && <LessonManager courseId={managingLessons.id} courseName={managingLessons.title} />}
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InstructorDashboard;
