import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEnrollments } from "@/hooks/useCourses";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CertificateGenerator from "@/components/certificates/CertificateGenerator";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp,
  Play,
  Loader2,
  Award,
  Bot
} from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const completedCourses = enrollments?.filter(e => e.progress === 100) || [];
  const totalLearningHours = enrollments?.reduce((acc, e) => {
    return acc + (e.course?.duration_hours || 0) * (e.progress / 100);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user.user_metadata?.full_name || "Learner"}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Continue your learning journey where you left off.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enrollments?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(totalLearningHours)}h</p>
                  <p className="text-sm text-muted-foreground">Learning Time</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Day Streak 🔥</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tutor Quick Access */}
          <div className="mb-10 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-hero flex items-center justify-center shrink-0">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-1">Need Help Learning?</h3>
                <p className="text-muted-foreground">Chat with your AI Tutor for instant help with any topic.</p>
              </div>
              <Button variant="hero" asChild>
                <Link to="/ai-tutor">
                  <Bot className="w-4 h-4 mr-2" />
                  Ask AI Tutor
                </Link>
              </Button>
            </div>
          </div>

          {/* Continue Learning Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">Continue Learning</h2>
              <Button variant="outline" onClick={() => navigate("/courses")}>Browse Courses</Button>
            </div>

            {enrollmentsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : enrollments && enrollments.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment) => (
                  <div 
                    key={enrollment.id}
                    className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="relative">
                      <img 
                        src={enrollment.course?.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"} 
                        alt={enrollment.course?.title}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-primary-foreground ml-1" />
                        </div>
                      </div>
                      {enrollment.progress === 100 && (
                        <Badge className="absolute top-3 left-3 bg-success">
                          <Trophy className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {enrollment.course?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {enrollment.course?.instructor?.full_name || "Unknown Instructor"}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{enrollment.course?.duration_hours || 0}h total</span>
                          <span>Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button 
                          className="flex-1" 
                          variant={enrollment.progress === 100 ? "outline" : "default"}
                          onClick={() => navigate(`/learn/${enrollment.course_id}`)}
                        >
                          {enrollment.progress === 100 ? "Review Course" : "Continue Learning"}
                        </Button>
                        {enrollment.progress === 100 && (
                          <CertificateGenerator
                            courseName={enrollment.course?.title || "Course"}
                            studentName={user.user_metadata?.full_name || "Student"}
                            completionDate={new Date(enrollment.completed_at || enrollment.enrolled_at).toLocaleDateString()}
                            courseId={enrollment.course_id}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">Start your learning journey by enrolling in a course!</p>
                <Button onClick={() => navigate("/courses")}>Browse Courses</Button>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "🎯", title: "First Course", desc: "Enroll in your first course", unlocked: (enrollments?.length || 0) > 0 },
                { icon: "📚", title: "Bookworm", desc: "Complete 10 lessons", unlocked: false },
                { icon: "🔥", title: "On Fire", desc: "5 day learning streak", unlocked: false },
                { icon: "⭐", title: "Graduate", desc: "Complete a course", unlocked: completedCourses.length > 0 },
              ].map((achievement, idx) => (
                <div 
                  key={idx}
                  className={`bg-card rounded-xl p-6 border text-center hover:shadow-md transition-shadow ${
                    achievement.unlocked ? "border-primary/50" : "border-border opacity-60"
                  }`}
                >
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h4 className="font-semibold mb-1">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                  {achievement.unlocked && (
                    <Badge className="mt-2 bg-primary/10 text-primary">Unlocked!</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
