import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Play, CheckCircle, Circle, Menu, X, BookOpen, Clock, FileText, Video, Loader2, Home } from "lucide-react";

interface Lesson {
  id: string; title: string; description: string | null;
  content_type: string; content_url: string | null;
  duration_minutes: number; order_index: number; is_free_preview: boolean;
}

// Converts any YouTube URL format to embed URL
const toEmbedUrl = (url: string): string => {
  if (!url) return url;
  // Already an embed URL
  if (url.includes("youtube.com/embed/")) return url;
  // youtu.be/VIDEO_ID (may have ?si=... or other params)
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  // youtube.com/watch?v=VIDEO_ID
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
  // Return original if not a YouTube URL (e.g. Vimeo or direct mp4)
  return url;
};

const isPdfUrl = (url: string): boolean =>
  url?.toLowerCase().endsWith(".pdf") || url?.includes("/pdf") || url?.includes("pdf.");

// Wrap PDF URLs with Google Docs Viewer to bypass X-Frame-Options restrictions
const toPdfViewerUrl = (url: string): string =>
  `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

const LessonViewer = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["enrollment", user?.id, courseId],
    queryFn: () => api.courses.checkEnrollment(courseId!),
    enabled: !!user && !!courseId,
  });

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => api.courses.get(courseId!),
    enabled: !!courseId,
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ["lessons", courseId],
    queryFn: () => api.lessons.byCourse(courseId!),
    enabled: !!courseId,
  });

  const lessonList = lessons as Lesson[] | undefined;
  const currentLesson = lessonList?.find(l => l.id === lessonId);
  const currentIndex = lessonList?.findIndex(l => l.id === lessonId) ?? -1;
  const prevLesson = currentIndex > 0 ? lessonList?.[currentIndex - 1] : null;
  const nextLesson = currentIndex < ((lessonList?.length ?? 0) - 1) ? lessonList?.[currentIndex + 1] : null;
  const progress = lessonList && lessonList.length > 0 ? Math.round((completedLessons.size / lessonList.length) * 100) : 0;

  const updateProgressMutation = useMutation({
    mutationFn: async (newProgress: number) => {
      if (!enrollment?.id) return;
      return api.courses.updateProgress(enrollment.id, newProgress, newProgress === 100 ? new Date().toISOString() : undefined);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enrollments"] }),
  });

  const markComplete = () => {
    if (!lessonId || completedLessons.has(lessonId)) return;
    const newCompleted = new Set(completedLessons);
    newCompleted.add(lessonId);
    setCompletedLessons(newCompleted);
    if (courseId) localStorage.setItem(`course_${courseId}_progress`, JSON.stringify([...newCompleted]));
    const newProgress = lessonList ? Math.round((newCompleted.size / lessonList.length) * 100) : 0;
    updateProgressMutation.mutate(newProgress);
    toast({ title: "Lesson completed!", description: nextLesson ? "Continue to the next lesson" : "You've completed the course!" });
  };

  useEffect(() => {
    if (courseId) {
      const saved = localStorage.getItem(`course_${courseId}_progress`);
      if (saved) setCompletedLessons(new Set(JSON.parse(saved)));
    }
  }, [courseId]);

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [user, authLoading, navigate]);

  useEffect(() => {
    if (lessonList && lessonList.length > 0 && !lessonId) navigate(`/learn/${courseId}/${lessonList[0].id}`, { replace: true });
  }, [lessons, lessonId, courseId, navigate]);

  const getContentIcon = (type: string) => {
    if (type === "video") return <Video className="w-4 h-4" />;
    if (type === "article") return <FileText className="w-4 h-4" />;
    return <BookOpen className="w-4 h-4" />;
  };

  if (authLoading || enrollmentLoading || lessonsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!enrollment?.enrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Not Enrolled</h1>
          <p className="text-muted-foreground mb-4">You need to enroll in this course to access lessons.</p>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>View Course</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col ${sidebarOpen ? "w-80" : "w-0 lg:w-16"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && <Link to={`/courses/${courseId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" />Back to Course</Link>}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        {sidebarOpen && (
          <>
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold line-clamp-2 mb-2">{course?.title}</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Progress</span><span className="font-medium">{progress}%</span></div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2">
                {lessonList?.map((lesson, idx) => {
                  const isActive = lesson.id === lessonId;
                  const isCompleted = completedLessons.has(lesson.id);
                  return (
                    <button key={lesson.id} onClick={() => navigate(`/learn/${courseId}/${lesson.id}`)}
                      className={`w-full text-left p-3 rounded-lg mb-1 transition-colors flex items-start gap-3 ${isActive ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isCompleted ? "bg-success text-success-foreground" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-medium">{idx + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium line-clamp-2 ${isActive ? "text-primary" : ""}`}>{lesson.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">{getContentIcon(lesson.content_type)}<span>{lesson.duration_minutes} min</span></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="w-5 h-5" /></Button>
            <div>
              <p className="text-sm text-muted-foreground">Lesson {currentIndex + 1} of {lessonList?.length}</p>
              <h1 className="font-semibold line-clamp-1">{currentLesson?.title}</h1>
            </div>
          </div>
          <Link to="/dashboard"><Button variant="ghost" size="sm"><Home className="w-4 h-4 mr-2" />Dashboard</Button></Link>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 lg:p-10">
            {currentLesson?.content_type === "video" && currentLesson.content_url ? (
              <div className="aspect-video bg-foreground/5 rounded-xl overflow-hidden mb-8">
                <iframe
                  src={toEmbedUrl(currentLesson.content_url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (currentLesson?.content_url && (isPdfUrl(currentLesson.content_url) || currentLesson?.content_type === "pdf")) ? (
              <div className="w-full rounded-xl overflow-hidden mb-8 border border-border">
                <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
                  <span className="text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4" /> PDF Document</span>
                  <a href={currentLesson.content_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline">Ouvrir dans un nouvel onglet ↗</a>
                </div>
                <iframe
                  src={toPdfViewerUrl(currentLesson.content_url)}
                  className="w-full"
                  style={{ height: "600px" }}
                  title={currentLesson.title}
                />
              </div>
            ) : currentLesson?.content_type === "article" && currentLesson.content_url ? (
              <div className="aspect-video bg-muted rounded-xl flex flex-col items-center justify-center mb-8 gap-4">
                <FileText className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground">Article / Ressource externe</p>
                <a href={currentLesson.content_url} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  Ouvrir le document →
                </a>
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center mb-8">
                <div className="text-center">{getContentIcon(currentLesson?.content_type || "article")}<p className="text-muted-foreground mt-2">Pas de contenu disponible</p></div>
              </div>
            )}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-3">{currentLesson?.content_type}</Badge>
                <h2 className="font-display text-2xl lg:text-3xl font-bold mb-4">{currentLesson?.title}</h2>
                {currentLesson?.description && <p className="text-muted-foreground text-lg leading-relaxed">{currentLesson.description}</p>}
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button variant="outline" onClick={() => prevLesson && navigate(`/learn/${courseId}/${prevLesson.id}`)} disabled={!prevLesson}>
              <ChevronLeft className="w-4 h-4 mr-2" />Previous
            </Button>
            <Button variant={completedLessons.has(lessonId || "") ? "secondary" : "default"} onClick={markComplete} disabled={completedLessons.has(lessonId || "")}>
              {completedLessons.has(lessonId || "") ? <><CheckCircle className="w-4 h-4 mr-2" />Completed</> : <><Circle className="w-4 h-4 mr-2" />Mark Complete</>}
            </Button>
            <Button variant={nextLesson ? "default" : "outline"} onClick={() => nextLesson && navigate(`/learn/${courseId}/${nextLesson.id}`)} disabled={!nextLesson}>
              {nextLesson ? "Next" : "Finish"}<ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </footer>
      </main>
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

export default LessonViewer;
