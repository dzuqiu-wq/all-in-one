// Server component - the locale homepage
import HomeContent from "./HomeContent";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function LocalePage({ params }: Props) {
  await params;
  return <HomeContent />;
}