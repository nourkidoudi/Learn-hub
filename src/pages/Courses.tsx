import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "@/hooks/useCourses";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  Clock,
  Users,
  Filter,
  X,
  Loader2,
  BookOpen,
} from "lucide-react";

const categories = [
  "All Categories",
  "Programming",
  "Web Development",
  "DevOps",
  "Cloud",
  "AI & ML",
  "Data Science",
  "Mobile Development",
  "Cybersecurity",
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const Courses = () => {
  const navigate = useNavigate();
  const { data: courses, isLoading } = useCourses();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [level, setLevel] = useState("All Levels");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    let filtered = [...courses];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower) ||
          c.category.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (category !== "All Categories") {
      filtered = filtered.filter((c) => c.category === category);
    }

    // Level filter
    if (level !== "All Levels") {
      filtered = filtered.filter((c) => c.level === level);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      // For popular, we'd need enrollment count - keeping newest as default
    }

    return filtered;
  }, [courses, search, category, level, sortBy]);

  const activeFilters = [
    category !== "All Categories" ? category : null,
    level !== "All Levels" ? level : null,
  ].filter(Boolean);

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setLevel("All Levels");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Explore Courses
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover {courses?.length || 0} courses to advance your skills
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Filter Toggle (Mobile) */}
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilters.length > 0 && (
                  <Badge className="ml-2 bg-primary">{activeFilters.length}</Badge>
                )}
              </Button>

              {/* Desktop Filters */}
              <div className="hidden md:flex gap-3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px] h-12">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="w-[150px] h-12">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-12">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="md:hidden grid grid-cols-2 gap-3 p-4 bg-card rounded-xl border border-border">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Active Filters */}
            {(activeFilters.length > 0 || search) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {search && (
                  <Badge variant="secondary" className="gap-1">
                    "{search}"
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSearch("")}
                    />
                  </Badge>
                )}
                {activeFilters.map((filter) => (
                  <Badge key={filter} variant="secondary" className="gap-1">
                    {filter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => {
                        if (filter === category) setCategory("All Categories");
                        if (filter === level) setLevel("All Levels");
                      }}
                    />
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredCourses.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="relative aspect-video">
                      <img
                        src={course.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 left-3 bg-card/90 text-foreground">
                        {course.category}
                      </Badge>
                      {course.price === 0 && (
                        <Badge className="absolute top-3 right-3 bg-success">
                          Free
                        </Badge>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {course.level}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {course.duration_hours || 0}h
                        </div>
                      </div>

                      <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="text-sm font-medium">
                            {course.average_rating ? Number(course.average_rating).toFixed(1) : course.reviews?.length > 0 ? (course.reviews.reduce((s: number, r: any) => s + r.rating, 0) / course.reviews.length).toFixed(1) : "Nouveau"}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                          {course.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${course.original_price}
                            </span>
                          )}
                          <span className="font-bold text-lg">
                            {course.price === 0 ? "Free" : `$${course.price}`}
                          </span>
                        </div>
                      </div>

                      {course.instructor && (
                        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {(course.instructor.full_name || "I")[0]}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {course.instructor.full_name || "Instructor"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-xl mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
