import { Metadata } from "next";
import { getToolMetadata } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return getToolMetadata("image-optimizer");
}