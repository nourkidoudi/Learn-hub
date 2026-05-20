import { Star, Clock, Users, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCourses, useEnrollInCourse, useIsEnrolled, Course } from "@/hooks/useCourses";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Fallback data for when no courses exist yet
const fallbackCourses = [
  {
    id: "1",
    title: "Complete DevOps & Cloud Engineering Bootcamp",
    instructor: { full_name: "Sarah Johnson" },
    image_url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=250&fit=crop",
    price: 89.99,
    original_price: 199.99,
    category: "DevOps",
    level: "Intermediate",
    duration_hours: 42,
  },
  {
    id: "2",
    title: "Machine Learning & AI: From Zero to Hero",
    instructor: { full_name: "Dr. Michael Chen" },
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
    price: 79.99,
    original_price: 179.99,
    category: "AI & ML",
    level: "Beginner",
    duration_hours: 38,
  },
  {
    id: "3",
    title: "Full Stack Web Development with React & Node.js",
    instructor: { full_name: "Alex Rodriguez" },
    image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
    price: 99.99,
    original_price: 249.99,
    category: "Web Dev",
    level: "Beginner",
    duration_hours: 56,
  },
  {
    id: "4",
    title: "Kubernetes & Docker: Container Orchestration",
    instructor: { full_name: "Emma Williams" },
    image_url: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=250&fit=crop",
    price: 69.99,
    original_price: 149.99,
    category: "DevOps",
    level: "Advanced",
    duration_hours: 28,
  },
  {
    id: "5",
    title: "Python Programming Masterclass 2024",
    instructor: { full_name: "David Park" },
    image_url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop",
    price: 0,
    original_price: null,
    category: "Programming",
    level: "Beginner",
    duration_hours: 48,
  },
  {
    id: "6",
    title: "AWS Solutions Architect Certification Prep",
    instructor: { full_name: "Lisa Thompson" },
    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
    price: 119.99,
    original_price: 299.99,
    category: "Cloud",
    level: "Intermediate",
    duration_hours: 35,
  }
];

interface FallbackCourse {
  id: string;
  title: string;
  instructor: { full_name: string };
  image_url: string;
  price: number;
  original_price: number | null;
  category: string;
  level: string;
  duration_hours: number;
}

const CourseCard = ({ course, isFallback = false }: { course: Course | FallbackCourse; isFallback?: boolean }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const enrollMutation = useEnrollInCourse();
  const { data: isEnrolled } = useIsEnrolled(course.id);
  
  const instructorName = 'instructor' in course && course.instructor 
    ? course.instructor.full_name 
    : "Unknown Instructor";
  const imageUrl = course.image_url;
  const durationHours = course.duration_hours || 0;

  const handleEnroll = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (isFallback) return; // Can't enroll in fallback courses
    enrollMutation.mutate(course.id);
  };

  const handleCardClick = () => {
    if (!isFallback) {
      navigate(`/courses/${course.id}`);
    }
  };

  return (
    <div 
      className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/20 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-video">
        <img 
          src={imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"} 
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
            <Play className="w-6 h-6 text-primary-foreground ml-1" />
          </div>
        </div>
        {course.price === 0 && (
          <Badge className="absolute top-3 left-3 bg-success text-success-foreground">Free</Badge>
        )}
        {course.original_price && course.price > 0 && (
          <Badge className="absolute top-3 left-3 bg-gradient-accent text-accent-foreground">
            {Math.round((1 - course.price / course.original_price) * 100)}% OFF
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">{course.category}</Badge>
          <Badge variant="outline" className="text-xs">{course.level}</Badge>
        </div>

        <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4">{instructorName}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-medium text-foreground">4.8</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>1.2k</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{durationHours || 0}h</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-xl text-foreground">
              {course.price === 0 ? 'Free' : `$${course.price}`}
            </span>
            {course.original_price && (
              <span className="text-sm text-muted-foreground line-through">
                ${course.original_price}
              </span>
            )}
          </div>
          <Button 
            size="sm" 
            variant={course.price === 0 ? "hero" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              handleEnroll();
            }}
            disabled={enrollMutation.isPending || isEnrolled || isFallback}
          >
            {enrollMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isEnrolled ? (
              "Enrolled"
            ) : course.price === 0 ? (
              "Enroll Free"
            ) : (
              "Enroll Now"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const FeaturedCourses = () => {
  const { data: courses, isLoading } = useCourses();
  
  // Use fallback data if no courses exist yet
  const displayCourses = courses && courses.length > 0 ? courses : fallbackCourses;
  const isFallback = !courses || courses.length === 0;

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            Popular Courses
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Trending Courses This Week
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of learners already mastering new skills with our expert-led courses
          </p>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCourses.map((course) => (
              <CourseCard key={course.id} course={course as Course} isFallback={isFallback} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Browse All Courses
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
