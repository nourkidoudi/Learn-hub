import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, Loader2 } from "lucide-react";

interface ReviewFormProps {
  courseId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  };
  onSuccess?: () => void;
}

const ReviewForm = ({ courseId, existingReview, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const payload = { rating, comment };
      if (existingReview) {
        return api.reviews.update(existingReview.id, payload);
      } else {
        return api.reviews.submit(courseId, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", courseId] });
      queryClient.invalidateQueries({ queryKey: ["userReview", user?.id, courseId] });
      toast({
        title: existingReview ? "Review updated!" : "Review submitted!",
        description: "Thank you for your feedback.",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "fill-accent text-accent"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating > 0 && `${rating} star${rating > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Your Review (optional)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this course..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={mutation.isPending || rating === 0}>
        {mutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        {existingReview ? "Update Review" : "Submit Review"}
      </Button>
    </form>
  );
};

export default ReviewForm;
