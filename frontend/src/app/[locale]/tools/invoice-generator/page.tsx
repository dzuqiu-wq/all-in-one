import InvoiceGeneratorClient from "./InvoiceGeneratorClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export { generateMetadata } from "./metadata";

export default async function InvoiceGeneratorPage({ params }: Props) {
  const { locale } = await params;

  return <InvoiceGeneratorClient locale={locale} />;
}