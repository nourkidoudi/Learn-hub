// Central API client - replaces all Supabase calls

const BASE_URL = "/api";

// --- Auth helpers ---
export const getToken = () => localStorage.getItem("auth_token");

export const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers as Record<string, string> || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.detail || "API error");
  }
  return res.json();
}

// === USER SERVICE (/api/auth, /api/users) ===

export const api = {
  auth: {
    register: (email: string, password: string, full_name: string) =>
      request<{ token: string; id: string; email: string; full_name: string; role: string }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify({ email, password, full_name }) }
      ),
    login: (email: string, password: string) =>
      request<{ token: string; _id: string; email: string; full_name: string; role: string; avatar_url?: string }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      ),
  },

  users: {
    getMe: () => request<{ id: string; email: string; full_name: string; bio?: string; avatar_url?: string; role: string; created_at: string }>("/users/me"),
    updateMe: (data: { full_name?: string; bio?: string; avatar_url?: string }) =>
      request<{ id: string }>("/users/me", { method: "PUT", body: JSON.stringify(data) }),
  },

  // === COURSE SERVICE (/api/courses) ===

  courses: {
    list: () => request<any[]>("/courses/"),
    myCourses: () => request<any[]>("/courses/instructor/me"),
    get: (id: string) => request<any>(`/courses/${id}`),
    create: (data: object) =>
      request<any>("/courses/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: object) =>
      request<any>(`/courses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/courses/${id}`, { method: "DELETE" }),
    enroll: (id: string) =>
      request<any>(`/courses/${id}/enroll`, { method: "POST" }),
    checkEnrollment: (id: string) =>
      request<{ enrolled: boolean; id?: string }>(`/courses/${id}/enrollment`),
    myEnrollments: () => request<any[]>("/courses/enrollments/me"),
    myInstructorEnrollments: () => request<any[]>("/courses/instructor/enrollments"),
    updateProgress: (enrollmentId: string, progress: number, completedAt?: string) =>
      request<any>(`/courses/enrollments/${enrollmentId}`, {
        method: "PUT",
        body: JSON.stringify({ progress, completed_at: completedAt ?? null }),
      }),
  },

  lessons: {
    byCourse: (courseId: string) => request<any[]>(`/lessons/course/${courseId}`),
    create: (courseId: string, data: object) =>
      request<any>(`/lessons/course/${courseId}`, { method: "POST", body: JSON.stringify(data) }),
    update: (lessonId: string, data: object) =>
      request<any>(`/lessons/${lessonId}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (lessonId: string) =>
      request<void>(`/lessons/${lessonId}`, { method: "DELETE" }),
  },

  reviews: {
    byCourse: (courseId: string) => request<any[]>(`/courses/${courseId}/reviews`),
    myReview: (courseId: string) => request<any | null>(`/courses/${courseId}/my-review`),
    submit: (courseId: string, data: { rating: number; comment: string }) =>
      request<any>(`/courses/${courseId}/reviews`, { method: "POST", body: JSON.stringify(data) }),
    update: (reviewId: string, data: { rating: number; comment: string }) =>
      request<any>(`/courses/reviews/${reviewId}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  // === ANALYTICS SERVICE (/api/analytics) ===

  analytics: {
    trackView: (page_url: string, user_id?: string) =>
      request<void>("/analytics/metrics/view", { method: "POST", body: JSON.stringify({ page_url, user_id }) }),
    trackEvent: (event_type: string, entity_id?: string, user_id?: string) =>
      request<void>("/analytics/metrics/event", { method: "POST", body: JSON.stringify({ event_type, entity_id, user_id }) }),
    dashboard: () => request<{ total_enrollments: number; total_views: number; active_users: number }>("/analytics/metrics/dashboard"),
  },

  // === AI TUTOR SERVICE (/api/tutor) ===

  tutor: {
    chatStream: (messages: { role: string; content: string }[], courseContext?: string) =>
      fetch(`${BASE_URL}/tutor/chat/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ messages, courseContext, stream: true }),
      }),
  },
};
