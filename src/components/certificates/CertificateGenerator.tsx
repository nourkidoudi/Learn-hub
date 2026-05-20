import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Award, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CertificateGeneratorProps {
  courseName: string;
  studentName: string;
  completionDate: string;
  courseId: string;
}

const CertificateGenerator = ({
  courseName,
  studentName,
  completionDate,
}: CertificateGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateCertificate = async () => {
    setIsGenerating(true);

    try {
      // Create certificate as SVG and convert to downloadable image
      const certificateSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850">
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#f5af19" />
              <stop offset="50%" style="stop-color:#f12711" />
              <stop offset="100%" style="stop-color:#f5af19" />
            </linearGradient>
            <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f5af19;stop-opacity:0.8" />
              <stop offset="50%" style="stop-color:#f12711;stop-opacity:0.6" />
              <stop offset="100%" style="stop-color:#f5af19;stop-opacity:0.8" />
            </linearGradient>
          </defs>
          
          <!-- Background -->
          <rect width="1200" height="850" fill="url(#bgGradient)"/>
          
          <!-- Decorative border -->
          <rect x="30" y="30" width="1140" height="790" fill="none" stroke="url(#borderGradient)" stroke-width="3" rx="20"/>
          <rect x="50" y="50" width="1100" height="750" fill="none" stroke="url(#borderGradient)" stroke-width="1" rx="15" opacity="0.5"/>
          
          <!-- Corner decorations -->
          <circle cx="80" cy="80" r="8" fill="url(#goldGradient)"/>
          <circle cx="1120" cy="80" r="8" fill="url(#goldGradient)"/>
          <circle cx="80" cy="770" r="8" fill="url(#goldGradient)"/>
          <circle cx="1120" cy="770" r="8" fill="url(#goldGradient)"/>
          
          <!-- Award icon placeholder -->
          <circle cx="600" cy="150" r="50" fill="none" stroke="url(#goldGradient)" stroke-width="3"/>
          <text x="600" y="165" font-family="Arial, sans-serif" font-size="40" fill="url(#goldGradient)" text-anchor="middle">★</text>
          
          <!-- Certificate text -->
          <text x="600" y="260" font-family="Georgia, serif" font-size="24" fill="#888" text-anchor="middle" letter-spacing="8">CERTIFICATE OF COMPLETION</text>
          
          <text x="600" y="330" font-family="Georgia, serif" font-size="20" fill="#aaa" text-anchor="middle">This is to certify that</text>
          
          <text x="600" y="410" font-family="Georgia, serif" font-size="48" fill="#fff" text-anchor="middle" font-weight="bold">${studentName}</text>
          
          <line x1="300" y1="430" x2="900" y2="430" stroke="url(#goldGradient)" stroke-width="2"/>
          
          <text x="600" y="490" font-family="Georgia, serif" font-size="20" fill="#aaa" text-anchor="middle">has successfully completed the course</text>
          
          <text x="600" y="560" font-family="Georgia, serif" font-size="36" fill="url(#goldGradient)" text-anchor="middle" font-weight="bold">${courseName}</text>
          
          <text x="600" y="640" font-family="Georgia, serif" font-size="18" fill="#888" text-anchor="middle">Completed on ${completionDate}</text>
          
          <!-- Signature line -->
          <line x1="200" y1="720" x2="450" y2="720" stroke="#666" stroke-width="1"/>
          <text x="325" y="745" font-family="Georgia, serif" font-size="14" fill="#888" text-anchor="middle">LearnHub</text>
          
          <line x1="750" y1="720" x2="1000" y2="720" stroke="#666" stroke-width="1"/>
          <text x="875" y="745" font-family="Georgia, serif" font-size="14" fill="#888" text-anchor="middle">Date of Issue</text>
          
          <!-- LearnHub branding -->
          <text x="600" y="800" font-family="Arial, sans-serif" font-size="16" fill="#555" text-anchor="middle">LearnHub - Empowering Learners Worldwide</text>
        </svg>
      `;

      // Convert SVG to blob and download
      const blob = new Blob([certificateSVG], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${courseName.toLowerCase().replace(/\s+/g, "-")}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Certificate Downloaded!",
        description: "Your certificate has been saved as an SVG file.",
      });
    } catch (error) {
      console.error("Certificate generation error:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate certificate. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateCertificate}
      disabled={isGenerating}
      className="gap-2"
      variant="hero"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Award className="w-4 h-4" />
          Download Certificate
        </>
      )}
    </Button>
  );
};

export default CertificateGenerator;
