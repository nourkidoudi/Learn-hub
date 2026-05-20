import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
import { Plus, Pencil, Trash2, Video, FileText, BookOpen, Loader2, Eye } from "lucide-react";

interface Lesson {
  id: string; title: string; description: string | null;
  content_type: string; content_url: string | null;
  duration_minutes: number; order_index: number; is_free_preview: boolean;
}

interface LessonFormData {
  title: string; description: string; content_type: string;
  content_url: string; duration_minutes: number; is_free_preview: boolean;
}

const defaultFormData: LessonFormData = {
  title: "", description: "", content_type: "video", content_url: "", duration_minutes: 10, is_free_preview: false,
};

interface LessonManagerProps {
  courseId: string;
  courseName: string;
}

const LessonManager = ({ courseId, courseName }: LessonManagerProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [formData, setFormData] = useState<LessonFormData>(defaultFormData);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["courseLessons", courseId],
    queryFn: () => api.lessons.byCourse(courseId),
  });

  const lessonMutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      if (editingLesson) {
        return api.lessons.update(editingLesson, data);
      } else {
        const lessonList = lessons as Lesson[] | undefined;
        const maxOrder = lessonList?.reduce((max, l) => Math.max(max, l.order_index), -1) ?? -1;
        return api.lessons.create(courseId, { ...data, order_index: maxOrder + 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseLessons", courseId] });
      toast({ title: editingLesson ? "Lesson updated!" : "Lesson created!", description: editingLesson ? "Your lesson has been updated." : "New lesson added to the course." });
      setIsDialogOpen(false);
      setEditingLesson(null);
      setFormData(defaultFormData);
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (lessonId: string) => api.lessons.delete(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseLessons", courseId] });
      toast({ title: "Lesson deleted", description: "The lesson has been removed." });
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson.id);
    setFormData({ title: lesson.title, description: lesson.description || "", content_type: lesson.content_type, content_url: lesson.content_url || "", duration_minutes: lesson.duration_minutes, is_free_preview: lesson.is_free_preview });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); lessonMutation.mutate(formData); };

  const getContentIcon = (type: string) => {
    if (type === "video") return <Video className="w-4 h-4" />;
    if (type === "article") return <FileText className="w-4 h-4" />;
    return <BookOpen className="w-4 h-4" />;
  };

  const lessonList = lessons as Lesson[] | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Lessons</h3>
          <p className="text-sm text-muted-foreground">Manage lessons for "{courseName}"</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingLesson(null); setFormData(defaultFormData); } }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Lesson</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
              <DialogDescription>{editingLesson ? "Update the lesson details" : "Create a new lesson for this course"}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Lesson Title</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Introduction to React Hooks" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={formData.content_type} onValueChange={(value) => setFormData({ ...formData, content_type: value })}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">🎬 Video (YouTube/URL)</SelectItem>
                      <SelectItem value="pdf">📄 PDF Document</SelectItem>
                      <SelectItem value="article">🔗 Article / Lien externe</SelectItem>
                      <SelectItem value="quiz">📝 Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" min="1" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 1 })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content_url">Content URL</Label>
                <Input id="content_url" value={formData.content_url} onChange={(e) => setFormData({ ...formData, content_url: e.target.value })} placeholder="https://youtube.com/embed/..." />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Switch id="is_free_preview" checked={formData.is_free_preview} onCheckedChange={(checked) => setFormData({ ...formData, is_free_preview: checked })} />
                  <Label htmlFor="is_free_preview">Free Preview</Label>
                </div>
                <Button type="submit" disabled={lessonMutation.isPending}>
                  {lessonMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingLesson ? "Update" : "Add Lesson"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : lessonList && lessonList.length > 0 ? (
        <div className="space-y-2">
          {lessonList.map((lesson, idx) => (
            <div key={lesson.id} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">{idx + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium truncate">{lesson.title}</h4>
                  {lesson.is_free_preview && <Badge variant="outline" className="text-xs"><Eye className="w-3 h-3 mr-1" />Preview</Badge>}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">{getContentIcon(lesson.content_type)}{lesson.content_type}</span>
                  <span>{lesson.duration_minutes} min</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(lesson)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this lesson?")) deleteMutation.mutate(lesson.id); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-muted/50 rounded-lg border border-dashed border-border">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No lessons yet</p>
          <p className="text-sm text-muted-foreground">Add your first lesson to get started</p>
        </div>
      )}
      {lessonList && lessonList.length > 0 && (
        <div className="text-sm text-muted-foreground text-right">
          Total: {lessonList.reduce((sum, l) => sum + l.duration_minutes, 0)} minutes ({lessonList.length} lessons)
        </div>
      )}
    </div>
  );
};

export default LessonManager;
