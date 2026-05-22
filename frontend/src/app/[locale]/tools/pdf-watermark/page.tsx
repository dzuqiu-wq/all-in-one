import PdfWatermarkClient from "./PdfWatermarkClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export { generateMetadata } from "./metadata";

export default async function PdfWatermarkPage({ params }: Props) {
  const { locale } = await params;

  return <PdfWatermarkClient locale={locale} />;
}