// app/konsensus/page.tsx
import MainLayout from "@/components/layout-components/MainLayout";
import { PollPage } from "@/modules/konsensus/pages";

/**
 * /konsensus – Konsensus Center entry route.
 * Wraps the Konsensus poll page in the global MainLayout.
 */
export default function KonsensusPage() {
  return (
    <MainLayout>
      <PollPage />
    </MainLayout>
  );
}
