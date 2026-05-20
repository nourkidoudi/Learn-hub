import { Award } from "lucide-react";

interface CertificatePreviewProps {
  courseName: string;
  studentName: string;
  completionDate: string;
}

const CertificatePreview = ({
  courseName,
  studentName,
  completionDate,
}: CertificatePreviewProps) => {
  return (
    <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl p-8 border-2 border-primary/30 overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-gradient-hero" />
      <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-hero" />
      <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gradient-hero" />
      <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gradient-hero" />

      <div className="text-center space-y-4">
        {/* Award icon */}
        <div className="mx-auto w-16 h-16 rounded-full border-2 border-primary/50 flex items-center justify-center">
          <Award className="w-8 h-8 text-primary" />
        </div>

        {/* Certificate text */}
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Certificate of Completion
        </p>

        <p className="text-sm text-muted-foreground">This is to certify that</p>

        <h3 className="text-2xl font-bold text-foreground">{studentName}</h3>

        <div className="w-48 h-px mx-auto bg-gradient-hero" />

        <p className="text-sm text-muted-foreground">
          has successfully completed the course
        </p>

        <h4 className="text-xl font-semibold text-gradient">{courseName}</h4>

        <p className="text-xs text-muted-foreground">
          Completed on {completionDate}
        </p>

        <p className="text-xs text-muted-foreground/60 pt-4">
          LearnHub - Empowering Learners Worldwide
        </p>
      </div>
    </div>
  );
};

export default CertificatePreview;
