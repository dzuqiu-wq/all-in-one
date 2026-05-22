import { ToolSlug } from "./metadata";

// FAQ item type
interface FAQItem {
  question: string;
  answer: string;
}

// WebApplication schema for each tool
interface WebApplicationSchema {
  "@context": "https://schema.org";
  "@type": "WebApplication";
  name: string;
  operatingSystem: string;
  applicationCategory: string;
  browserRequirements: string;
  url: string;
  description: string;
}

// FAQPage schema
interface FAQPageSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

// Tool schema configurations
interface ToolSchemaConfig {
  name: string;
  description: string;
  applicationCategory: "BusinessApplication" | "DesignApplication";
  faqs: FAQItem[];
}

const toolSchemas: Record<ToolSlug, ToolSchemaConfig> = {
  "word-to-pdf": {
    name: "Word to PDF Converter",
    description:
      "Convert Word documents (.docx, .doc) to PDF format using server-side LibreOffice processing. Features 5-second timeout, memory-only pipeline, and no file storage.",
    applicationCategory: "BusinessApplication",
    faqs: [
      {
        question: "How does the conversion work?",
        answer:
          "Our server uses Gotenberg, a powerful document conversion service powered by LibreOffice. When you upload a Word document, it streams directly to memory, gets processed by LibreOffice, and streams back as PDF. Your file never touches disk — this is a true memory-only pipeline architecture.",
      },
      {
        question: "What is the 5-second timeout?",
        answer:
          "Our server enforces a strict 5-second timeout for all conversions to ensure fair resource sharing and prevent long-running tasks from blocking other users. This timeout ensures predictable performance. If you hit the limit, try a smaller document or simpler formatting.",
      },
      {
        question: "Why is the file size limit 5MB?",
        answer:
          "Combined with the 5-second timeout, the 5MB limit ensures fast conversions and fair resource sharing among all users. For larger documents, consider splitting them first using our PDF Merge & Split tool, or use desktop software like Microsoft Word.",
      },
      {
        question: "Is my document secure during conversion?",
        answer:
          "Yes, security is our top priority. We implement a zero-footprint policy: files are processed entirely in server memory using stream-based pipelines and are never written to disk. Once conversion completes, all memory buffers are immediately freed. No files are stored on our servers.",
      },
      {
        question: "What formats are supported?",
        answer:
          "We support .docx (Office Open XML, the standard format since Microsoft Office 2007) and legacy .doc format. For best results, use .docx with standard fonts. Note that macros are stripped during conversion since PDF does not support them.",
      },
      {
        question: "How does rate limiting work?",
        answer:
          "Each IP address is limited to 5 conversions per minute using a sliding window algorithm. If you hit the limit, you will receive a 429 response with a Retry-After header indicating when you can try again. This prevents abuse and ensures fair access for all users.",
      },
    ],
  },
  "pdf-merge-split": {
    name: "PDF Merge & Split Tool",
    description:
      "Merge multiple PDF files into one document or extract specific pages from PDF files. Pure client-side processing using pdf-lib library — files never leave your browser.",
    applicationCategory: "BusinessApplication",
    faqs: [
      {
        question: "Is my file secure?",
        answer:
          "Absolutely. All processing happens entirely in your browser using the pdf-lib library. Your files are processed via the Canvas API and File API — they never leave your device, never uploaded to any server. This is true client-side processing with zero server communication.",
      },
      {
        question: "What operations are supported?",
        answer:
          "You can merge multiple PDF files into a single document (preserving the order you arrange them in), or extract specific pages from a single PDF. The tool supports drag-and-drop reordering of files before merging, and range notation (e.g., '1-3, 5, 7-10') for page extraction.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "We recommend keeping individual files under 50MB. Larger files may cause browser performance issues due to the memory-intensive nature of PDF processing. If you need to handle very large PDFs, consider using desktop software like Adobe Acrobat.",
      },
      {
        question: "How fast is the processing?",
        answer:
          "Processing speed depends on your device performance, file size, and the number of pages. Most operations complete within seconds. The pdf-lib library processes PDFs entirely in memory using efficient streaming algorithms, avoiding disk I/O for better performance.",
      },
      {
        question: "Will merged PDFs have watermarks?",
        answer:
          "No, we do not add any watermarks, logos, or advertisements to merged PDFs. You will receive completely clean documents. Our tool is funded by non-intrusive ads displayed on our website, not by degrading your output quality.",
      },
    ],
  },
  "image-optimizer": {
    name: "Image Optimizer & Compressor",
    description:
      "Compress images and convert to WebP format. Smart compression reduces file size by up to 80% while preserving visual quality. Pure browser processing with Web Workers.",
    applicationCategory: "DesignApplication",
    faqs: [
      {
        question: "Will EXIF data be preserved?",
        answer:
          "For privacy protection, optimized images automatically remove all EXIF metadata including camera information (ISO, aperture, shutter speed), GPS location data, creation timestamps, and device information. This ensures your photos don't leak personal metadata when shared online.",
      },
      {
        question: "What output formats are supported?",
        answer:
          "You can output to WebP (recommended for best compression), JPEG, or PNG formats. WebP typically provides 25-35% better compression than JPEG at the same quality level, making it ideal for web optimization and faster page loading.",
      },
      {
        question: "How does quality setting affect images?",
        answer:
          "Higher quality values (80-100%) preserve more visual detail but result in larger files. Lower values (10-50%) create smaller files but may introduce visible artifacts. The browser's Canvas API performs quality-adjusted encoding, and our tool uses Web Workers for non-blocking processing.",
      },
      {
        question: "Can I use this on mobile devices?",
        answer:
          "Yes, the image optimizer works on all modern mobile browsers including Chrome and Safari on iOS and Android. The tool uses responsive design and touch-friendly interactions. Performance depends on your device; newer devices with more RAM will process faster.",
      },
      {
        question: "How do I choose the best quality value?",
        answer:
          "For most use cases, 80-85% provides the optimal balance between visual quality and file size. Quality above 90% shows minimal visual improvement but significantly increases file size. Below 70%, you may notice compression artifacts, especially in photographs with smooth gradients.",
      },
    ],
  },
  "qrcode-generator": {
    name: "QR Code Generator",
    description:
      "Generate beautiful QR codes for URLs, text, and contact information. Customizable colors, sizes, and error correction levels. Client-side generation using qrcode.react library.",
    applicationCategory: "DesignApplication",
    faqs: [
      {
        question: "What can I encode in a QR code?",
        answer:
          "You can encode various data types including URLs, plain text, email addresses (mailto:), phone numbers (tel:), SMS messages, WiFi credentials (WIFI:), vCard contact information, and calendar events (VEVENT). The generator handles encoding automatically.",
      },
      {
        question: "What error correction level should I use?",
        answer:
          "Error correction (EC) allows QR codes to be scanned even if partially damaged. Level L (7%) is for clean environments, M (15%) for standard use, Q (25%) for industrial settings, and H (30%) for surfaces that may get damaged. Higher levels create denser QR patterns.",
      },
      {
        question: "Will custom colors affect scannability?",
        answer:
          "Custom colors work if you maintain sufficient contrast ratio (at least 7:1 for QR codes). Light backgrounds with dark foreground modules work best. Avoid red-based colors as many QR scanners have difficulty with red. Our preset color schemes are tested for optimal scanning compatibility.",
      },
      {
        question: "What size should I use?",
        answer:
          "For digital use (websites, emails), 128-256px is sufficient. For print materials, use 512px or higher. When printing, ensure each QR module (the small squares) is at least 2-3mm wide for reliable scanning. Higher resolution images scale better for large prints.",
      },
      {
        question: "Do QR codes expire?",
        answer:
          "Static QR codes generated by this tool never expire — the encoded data is permanently embedded in the QR pattern itself. However, if you encode a URL, that external webpage may change or be removed over time, making the QR code link invalid.",
      },
    ],
  },
};

// Generate WebApplication JSON-LD
function generateWebApplicationSchema(config: ToolSchemaConfig, url: string): string {
  const schema: WebApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: config.name,
    operatingSystem: "All",
    applicationCategory: config.applicationCategory,
    browserRequirements: "Requires HTML5 Canvas API and File API support",
    url: url,
    description: config.description,
  };
  return JSON.stringify(schema);
}

// Generate FAQPage JSON-LD
function generateFAQPageSchema(faqs: FAQItem[]): string {
  const schema: FAQPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
  return JSON.stringify(schema);
}

// Base URL
const BASE_URL = "https://333654.xyz";

// Props for StructuredData component
interface StructuredDataProps {
  tool: ToolSlug;
  locale: "en" | "zh";
}

// Main component
export default function StructuredData({ tool, locale }: StructuredDataProps) {
  const config = toolSchemas[tool];
  const path = locale === "zh" ? `/zh/tools/${tool}` : `/tools/${tool}`;
  const url = `${BASE_URL}${path}`;

  const webAppSchema = generateWebApplicationSchema(config, url);
  const faqSchema = generateFAQPageSchema(config.faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: webAppSchema }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqSchema }}
      />
    </>
  );
}

// Export for testing
export { toolSchemas, generateWebApplicationSchema, generateFAQPageSchema };