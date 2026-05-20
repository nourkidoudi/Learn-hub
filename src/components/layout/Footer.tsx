import { forwardRef } from "react";
import { GraduationCap, Twitter, Github, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer ref={ref} className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-background">
                Learn<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="text-background/70 mb-6 max-w-sm">
              Empowering learners worldwide with AI-powered education. Master new skills and transform your career.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/courses" className="text-background/70 hover:text-background transition-colors">Browse Courses</Link></li>
              <li><Link to="/categories" className="text-background/70 hover:text-background transition-colors">Categories</Link></li>
              <li><Link to="/ai-tutor" className="text-background/70 hover:text-background transition-colors">AI Tutor</Link></li>
              <li><Link to="/pricing" className="text-background/70 hover:text-background transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-background/70 hover:text-background transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-background/70 hover:text-background transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="text-background/70 hover:text-background transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-background/70 hover:text-background transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-background/70 hover:text-background transition-colors">Help Center</Link></li>
              <li><Link to="/privacy" className="text-background/70 hover:text-background transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-background/70 hover:text-background transition-colors">Terms of Service</Link></li>
              <li><Link to="/faq" className="text-background/70 hover:text-background transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © 2026 LearnHub. All rights reserved.
          </p>
          <p className="text-background/50 text-sm">
            Made for learners worldwide
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
