import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import Courses from "./pages/Courses";
import InstructorDashboard from "./pages/InstructorDashboard";
import LessonViewer from "./pages/LessonViewer";
import Profile from "./pages/Profile";
import AITutor from "./pages/AITutor";
import NotFound from "./pages/NotFound";

import { useEffect } from "react";
const queryClient = new QueryClient();

const App = () => {
  console.log("App is rendering...");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/learn/:courseId" element={<LessonViewer />} />
              <Route path="/learn/:courseId/:lessonId" element={<LessonViewer />} />
              <Route path="/instructor" element={<InstructorDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ai-tutor" element={<AITutor />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
