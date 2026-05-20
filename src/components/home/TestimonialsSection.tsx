import { Star, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "Marie Dupont",
    role: "Software Engineer at Google",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content: "The AI Tutor feature is revolutionary! It helped me understand complex DevOps concepts that I struggled with for months. I got promoted within 6 months of completing my certification.",
    rating: 5,
    course: "DevOps Bootcamp"
  },
  {
    name: "Thomas Bernard",
    role: "Data Scientist",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    content: "The course quality is outstanding. The instructors are industry experts and the hands-on projects prepared me perfectly for real-world challenges. Highly recommended!",
    rating: 5,
    course: "Machine Learning"
  },
  {
    name: "Sophie Laurent",
    role: "Full Stack Developer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "I switched careers from marketing to tech thanks to LearnHub. The structured learning path and personalized recommendations made my transition smooth and successful.",
    rating: 5,
    course: "Full Stack Development"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            Success Stories
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What Our Learners Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of successful learners who transformed their careers with us
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div 
              key={idx}
              className="bg-card rounded-2xl p-8 border border-border hover:shadow-xl transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 right-8">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Quote className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              {/* Course Badge */}
              <Badge variant="secondary" className="mt-4">
                Completed: {testimonial.course}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
