import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string | null;
  image_url: string | null;
  price: number;
  original_price: number | null;
  category: string;
  level: string;
  duration_hours: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  instructor?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
  course?: Course;
}

const API_URL = "/api";

const authHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/courses/`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      return (data.courses || data) as Course[];
    },
  });
};

export const useEnrollments = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enrollments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`${API_URL}/courses/enrollments/me`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      const data = await res.json();
      return (data.enrollments || data) as Enrollment[];
    },
    enabled: !!user,
  });
};

export const useEnrollInCourse = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("Must be logged in to enroll");
      const res = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.detail || "Enrollment failed");
      return data;
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      api.analytics.trackEvent("enrollment", courseId, user?.id).catch(console.error);
      toast({
        title: "Enrolled successfully!",
        description: "You can now access the course from your dashboard.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment failed",
        description: error.message.includes("already") ? "You're already enrolled in this course." : error.message,
        variant: "destructive",
      });
    },
  });
};

export const useIsEnrolled = (courseId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enrollment", user?.id, courseId],
    queryFn: async () => {
      if (!user) return false;
      const res = await fetch(`${API_URL}/courses/${courseId}/enrollment`, { headers: authHeaders() });
      if (res.status === 404) return false;
      if (!res.ok) throw new Error("Failed to check enrollment");
      const data = await res.json();
      return !!(data.enrolled || data.id);
    },
    enabled: !!user,
  });
};