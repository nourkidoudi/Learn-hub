import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useEnrollInCourse, useIsEnrolled } from "@/hooks/useCourses";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReviewForm from "@/components/course/ReviewForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  Clock, 
  Users, 
  Play, 
  CheckCircle, 
  Lock,
  BookOpen,
  Award,
  Globe,
  Loader2,
  ArrowLeft,
  Edit2,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  duration_minutes: number;
  order_index: number;
  is_free_preview: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const enrollMutation = useEnrollInCourse();
  const { data: isEnrolled } = useIsEnrolled(id || "");

  useEffect(() => {
    if (id) {
      api.analytics.trackView(`/courses/${id}`, user?.id).catch(console.error);
    }
  }, [id, user?.id]);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => api.courses.get(id!),
    enabled: !!id,
  });

  const { data: lessons } = useQuery({
    queryKey: ["lessons", id],
    queryFn: () => api.lessons.byCourse(id!),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => api.reviews.byCourse(id!),
    enabled: !!id,
  });

  const { data: enrollmentCount } = useQuery({
    queryKey: ["enrollmentCount", id],
    queryFn: async () => {
      const enrollments = await api.courses.myEnrollments();
      return enrollments.filter((e: any) => e.course_id === id).length;
    },
    enabled: !!id,
  });

  const { data: userReview } = useQuery({
    queryKey: ["userReview", user?.id, id],
    queryFn: () => api.reviews.myReview(id!),
    enabled: !!user && !!id,
  });

  const handleEnroll = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (id) {
      enrollMutation.mutate(id);
    }
  };

  const handleStartLearning = () => {
    navigate(`/learn/${id}`);
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const avgRating = reviews && reviews.length > 0 
    ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length 
    : 4.8;
  const totalDuration = (lessons as Lesson[] | undefined)?.reduce((acc, l) => acc + (l.duration_minutes || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
          <div className="container mx-auto px-4">
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Course Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge variant="outline">{course.level}</Badge>
                </div>

                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
                  {course.title}
                </h1>

                <p className="text-lg text-muted-foreground">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <span className="font-semibold">{avgRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({reviews?.length || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span>{enrollmentCount?.toLocaleString() || 0} students</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-5 h-5" />
                    <span>{course.duration_hours || Math.round(totalDuration / 60)} hours</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <BookOpen className="w-5 h-5" />
                    <span>{lessons?.length || 0} lessons</span>
                  </div>
                </div>

                {course.instructor && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {course.instructor.avatar_url ? (
                        <img 
                          src={course.instructor.avatar_url} 
                          alt={course.instructor.full_name || "Instructor"}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {(course.instructor.full_name || "I")[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created by</p>
                      <p className="font-semibold">{course.instructor.full_name || "Instructor"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enrollment Card */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl shadow-xl border border-border overflow-hidden sticky top-24">
                  <div className="aspect-video relative">
                    <img 
                      src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-3xl font-bold">
                        {course.price === 0 ? "Free" : `$${course.price}`}
                      </span>
                      {course.original_price && (
                        <span className="text-lg text-muted-foreground line-through">
                          ${course.original_price}
                        </span>
                      )}
                      {course.original_price && course.price > 0 && (
                        <Badge className="bg-success">
                          {Math.round((1 - course.price / course.original_price) * 100)}% OFF
                        </Badge>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      size="xl"
                      variant={course.price === 0 ? "hero" : "default"}
                      onClick={handleEnroll}
                      disabled={enrollMutation.isPending || isEnrolled}
                    >
                      {enrollMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isEnrolled ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Enrolled - Go to Dashboard
                        </>
                      ) : course.price === 0 ? (
                        "Enroll for Free"
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>

                    {isEnrolled && (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={handleStartLearning}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Learning
                      </Button>
                    )}

                    <Separator />

                    <div className="space-y-3 text-sm">
                      <h4 className="font-semibold">This course includes:</h4>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration_hours || Math.round(totalDuration / 60)} hours of content</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span>{lessons?.length || 0} lessons</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Award className="w-4 h-4" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <span>Lifetime access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h2 className="font-display text-2xl font-bold mb-6">Course Curriculum</h2>
              
              <div className="space-y-2">
                {(lessons as Lesson[] | undefined)?.map((lesson, idx) => (
                  <div 
                    key={lesson.id}
                    className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{lesson.title}</h4>
                        {lesson.is_free_preview && (
                          <Badge variant="outline" className="text-xs">Preview</Badge>
                        )}
                      </div>
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground">{lesson.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {lesson.duration_minutes} min
                      </span>
                      {lesson.is_free_preview || isEnrolled ? (
                        <Play className="w-5 h-5 text-primary" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reviews Section */}
              <div className="mt-16">
                <h2 className="font-display text-2xl font-bold mb-6">Student Reviews</h2>
                
                {isEnrolled && (
                  <div className="mb-8 p-6 bg-card rounded-xl border border-border">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      {userReview ? (
                        <>
                          <Edit2 className="w-4 h-4" />
                          Update Your Review
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4" />
                          Write a Review
                        </>
                      )}
                    </h3>
                    <ReviewForm 
                      courseId={id!} 
                      existingReview={userReview ? {
                        id: userReview.id,
                        rating: userReview.rating,
                        comment: userReview.comment
                      } : undefined}
                    />
                  </div>
                )}

                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="p-6 bg-card rounded-xl border border-border">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-semibold text-primary">
                              {(review.user?.full_name || "U")[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{review.user?.full_name || "Anonymous"}</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? "fill-accent text-accent" : "text-muted"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                            {review.comment && (
                              <p className="text-muted-foreground">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-card rounded-xl border border-border">
                    <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetail;
