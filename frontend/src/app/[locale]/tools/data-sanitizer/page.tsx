import DataSanitizerClient from "./DataSanitizerClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export { generateMetadata } from "./metadata";

export default async function DataSanitizerPage({ params }: Props) {
  const { locale } = await params;

  return <DataSanitizerClient locale={locale} />;
}