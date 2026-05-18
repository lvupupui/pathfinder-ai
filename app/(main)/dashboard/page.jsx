import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { isOnboarded, user } = await getUserOnboardingStatus();

  // If the request is unauthenticated (no Clerk user), redirect to sign-in.
  if (!user) {
    redirect("/sign-in");
  }

  // If authenticated but not onboarded, send them to onboarding
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} />
    </div>
  );
}
