import { AdminMlView } from "@/features/recommendations/components/admin-ml-view";

export const metadata = { title: "Recommendation Models — Admin" };

export default function RecommendationMlPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Recommendation ML Models</h1>
      <p className="text-sm text-gray-500">
        Register, promote, and monitor ML ranking models. Shadow models are scored
        but never affect learner results. Canary models are rolled out by percentage.
        The rollback switch instantly disables any model.
      </p>
      <AdminMlView />
    </div>
  );
}
