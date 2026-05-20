import { Code, Cloud, Brain, Database, Shield, Smartphone, TrendingUp, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categories = [
  { 
    icon: Code, 
    name: "Web Development", 
    courses: 156,
    color: "bg-blue-500/10 text-blue-600"
  },
  { 
    icon: Cloud, 
    name: "Cloud & DevOps", 
    courses: 89,
    color: "bg-cyan-500/10 text-cyan-600"
  },
  { 
    icon: Brain, 
    name: "AI & Machine Learning", 
    courses: 124,
    color: "bg-violet-500/10 text-violet-600"
  },
  { 
    icon: Database, 
    name: "Data Science", 
    courses: 98,
    color: "bg-emerald-500/10 text-emerald-600"
  },
  { 
    icon: Shield, 
    name: "Cybersecurity", 
    courses: 67,
    color: "bg-red-500/10 text-red-600"
  },
  { 
    icon: Smartphone, 
    name: "Mobile Development", 
    courses: 78,
    color: "bg-orange-500/10 text-orange-600"
  },
  { 
    icon: TrendingUp, 
    name: "Business & Analytics", 
    courses: 112,
    color: "bg-amber-500/10 text-amber-600"
  },
  { 
    icon: Palette, 
    name: "UI/UX Design", 
    courses: 94,
    color: "bg-pink-500/10 text-pink-600"
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            Browse Categories
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Explore by Category
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From programming to design, find the perfect course to advance your career
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, idx) => (
            <div 
              key={idx}
              className="group bg-card rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <category.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display font-semibold mb-1 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.courses} courses
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
