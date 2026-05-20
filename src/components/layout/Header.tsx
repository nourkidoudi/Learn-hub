import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, Search, User, LogOut, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Learn<span className="text-gradient">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/courses" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Courses
            </Link>
            <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Categories
            </Link>
            <Link to="/ai-tutor" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              AI Tutor
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Pricing
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getInitials(user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.user_metadata?.full_name || "Learner"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <BookOpen className="mr-2 h-4 w-4" />
                      My Learning
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/instructor" className="cursor-pointer">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Teach on LearnHub
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/auth">
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Link to="/courses" className="px-4 py-2 hover:bg-muted rounded-lg transition-colors">
                Courses
              </Link>
              <Link to="/categories" className="px-4 py-2 hover:bg-muted rounded-lg transition-colors">
                Categories
              </Link>
              <Link to="/ai-tutor" className="px-4 py-2 hover:bg-muted rounded-lg transition-colors">
                AI Tutor
              </Link>
              <Link to="/pricing" className="px-4 py-2 hover:bg-muted rounded-lg transition-colors">
                Pricing
              </Link>
              <div className="flex flex-col gap-2 mt-4 px-4">
                {user ? (
                  <>
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      Signed in as {user.email}
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/instructor">Instructor Dashboard</Link>
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button variant="hero" className="w-full" asChild>
                      <Link to="/auth">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
