// app/page.tsx
import PageContainer from "@/components/PageContainer";

export const metadata = {
  title: "Accueil",
  description: "Point d’entrée",
};

export default function Page() {
  return (
    <PageContainer title="Accueil">
      <p>Bienvenue. Cette page affiche uniquement le PageContainer et son contenu.</p>
    </PageContainer>
  );
}
