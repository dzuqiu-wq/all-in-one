import { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "图片尺寸调整 (带纵横比锁定) | All-in-One Toolbox"
      : "Image Resizer with Aspect Ratio Lock | All-in-One Toolbox",
    description: isZh
      ? "精确调整图片尺寸，可选锁定纵横比。完全使用 Canvas API 在浏览器中运行，无需上传。"
      : "Resize images precisely with optional aspect-ratio lock. Runs entirely in your browser using Canvas. No upload required.",
    keywords: isZh
      ? ["图片调整", "图片缩放", "图片尺寸", "纵横比"]
      : ["image resizer", "resize image", "image dimensions", "aspect ratio"],
    alternates: {
      canonical: "https://333654.xyz/tools/image-resizer",
      languages: {
        "en-US": "https://333654.xyz/tools/image-resizer",
        "zh-CN": "https://333654.xyz/zh/tools/image-resizer",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      alternateLocale: isZh ? "en_US" : "zh_CN",
      url: "https://333654.xyz/tools/image-resizer",
      siteName: "All-in-One Toolbox",
      title: isZh
        ? "图片尺寸调整 (带纵横比锁定) | All-in-One Toolbox"
        : "Image Resizer with Aspect Ratio Lock | All-in-One Toolbox",
      description: isZh
        ? "精确调整图片尺寸，可选锁定纵横比。完全使用 Canvas API 在浏览器中运行，无需上传。"
        : "Resize images precisely with optional aspect-ratio lock. Runs entirely in your browser using Canvas. No upload required.",
    },
    twitter: {
      card: "summary_large_image",
      title: isZh
        ? "图片尺寸调整 (带纵横比锁定) | All-in-One Toolbox"
        : "Image Resizer with Aspect Ratio Lock | All-in-One Toolbox",
      description: isZh
        ? "精确调整图片尺寸，可选锁定纵横比。完全使用 Canvas API 在浏览器中运行，无需上传。"
        : "Resize images precisely with optional aspect-ratio lock. Runs entirely in your browser using Canvas. No upload required.",
    },
  };
}
