"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/use-fetch";
import { generateCoverLetter } from "@/actions/cover-letter";
import { coverLetterSchema } from "@/app/lib/schema";

export default function CoverLetterGenerator() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
  });

  const {
    loading,
    data: generatedLetter,
    error,
    fn: generateLetterFn,
  } = useFetch(generateCoverLetter);

  useEffect(() => {
    if (generatedLetter) {
      // Check if the backend caught an AI error and provided a fallback payload
      if (generatedLetter._errorCode) {
        let errorMessage = "AI generation failed. A basic fallback template has been generated.";

        switch (generatedLetter._errorCode) {
          case "RATE_LIMITED":
            errorMessage = "AI quota reached / rate limited. A fallback letter was generated — please try again later.";
            break;
          case "SERVICE_UNAVAILABLE":
            errorMessage = "Gemini service is currently down. A fallback letter was saved for you.";
            break;
          case "TIMEOUT":
            errorMessage = "The AI request timed out. A fallback letter was generated.";
            break;
          default:
            errorMessage = "An unexpected AI error occurred. A fallback letter was generated.";
        }

        toast.warning(errorMessage, { duration: 6000 });
        router.push(`/ai-cover-letter/${generatedLetter.id}`);
        return;
      }

      // Ideal path: AI generation succeeded perfectly
      toast.success("Cover letter generated successfully!");
      router.push(`/ai-cover-letter/${generatedLetter.id}`);
      reset();
    }
  }, [generatedLetter, router, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to generate cover letter");
    }
  }, [error]);

  const onSubmit = async (data) => {
    try {
      await generateLetterFn(data);
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Cover Letter Generator</CardTitle>
          <CardDescription>
            Create a tailored, professional cover letter based on your profile and target job description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Google, Acme Corp"
                  {...register("companyName")}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. Frontend Engineer"
                  {...register("jobTitle")}
                />
                {errors.jobTitle && (
                  <p className="text-sm text-destructive">{errors.jobTitle.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description / Requirements</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job requirements or full description here..."
                className="min-h-[150px]"
                {...register("jobDescription")}
              />
              {errors.jobDescription && (
                <p className="text-sm text-destructive">{errors.jobDescription.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating tailored letter...
                  </>
                ) : (
                  "Generate Cover Letter"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
