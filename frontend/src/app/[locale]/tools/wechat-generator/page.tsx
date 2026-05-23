import WechatGeneratorClient from "./WechatGeneratorClient";

export { generateMetadata } from "./metadata";

export default async function WechatGeneratorPage() {
  return <WechatGeneratorClient />;
}