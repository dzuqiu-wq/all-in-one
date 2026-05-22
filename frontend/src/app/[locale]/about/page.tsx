import { Metadata } from "next";
import InfoPageLayout, {
  InfoSection,
  InfoCallout,
} from "@/components/InfoPageLayout";

interface Props {
  params: Promise<{ locale: string }>;
}

const BASE_URL = "https://333654.xyz";

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  const title = isZh
    ? "关于我们 | All-in-One Toolbox"
    : "About Us | All-in-One Toolbox";
  const description = isZh
    ? "All-in-One Toolbox 是为您打造的文档、图片及日常效率提升的极客工具箱，坚持零服务器成本的纯前端高能体验。"
    : "All-in-One Toolbox is a geek-grade toolbox for documents, images, and everyday productivity, committed to a zero-server-cost, pure-frontend, high-performance experience.";

  return {
    title,
    description,
    keywords: isZh
      ? ["关于我们", "极客工具箱", "纯前端", "开源", "All-in-One Toolbox"]
      : ["about us", "geek toolbox", "pure frontend", "open source", "All-in-One Toolbox"],
    alternates: {
      canonical: `${BASE_URL}/${locale}/about`,
      languages: {
        "en-US": `${BASE_URL}/en/about`,
        "zh-CN": `${BASE_URL}/zh/about`,
      },
    },
    openGraph: {
      type: "article",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${BASE_URL}/${locale}/about`,
      siteName: "All-in-One Toolbox",
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";

  if (isZh) {
    return (
      <InfoPageLayout
        eyebrow="关于"
        title="关于我们"
        description="为您打造的文档、图片及日常效率提升的极客工具箱，坚持零服务器成本的纯前端高能体验。"
        lastUpdated="2026 年 5 月 22 日"
        lastUpdatedLabel="最近更新"
        backLabel="返回主页"
      >
        <InfoSection heading="我们的信念">
          <p>
            互联网上充斥着以"免费"为名、却以您的隐私换取广告收入的工具站点。它们让您上传文件，号称在服务器侧处理，实则将您的图片、PDF、文档喂给后台的画像引擎，转手卖给广告网络。
          </p>
          <p>
            我们拒绝这种商业模式。
          </p>
          <p>
            All-in-One Toolbox 的存在前提，是相信现代浏览器已经强大到无需出卖用户即可完成绝大多数文档与媒体处理任务。WebAssembly、Canvas、File System Access API、Web Workers——这些被严重低估的浏览器原生能力，足以让我们把"服务器"从架构图中划掉，把"上传"从用户旅程中划掉，把"追踪"从商业模式中划掉。
          </p>
        </InfoSection>

        <InfoSection heading="我们做什么">
          <p>
            四款工具，覆盖普通用户 80% 的日常文档与图片处理需求：
          </p>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong>Word ↔ PDF 转换</strong>——基于服务端 LibreOffice + Gotenberg 内存隔离管道，5 秒超时、5 MB 限速，物理介质零落地；
            </li>
            <li>
              <strong>PDF 合并与拆分</strong>——基于 <code>pdf-lib</code> 的纯浏览器端处理，支持拖拽排序、范围语法 (1-3, 5, 7-10)；
            </li>
            <li>
              <strong>图片无损压缩与 WebP 转换</strong>——基于 Canvas + Web Worker 异步管道，自动剥离 EXIF，最高可减少 80% 体积；
            </li>
            <li>
              <strong>二维码生成</strong>——基于 <code>qrcode.react</code> 客户端 SVG/Canvas 渲染，自定义色彩、纠错级别、Logo 嵌入。
            </li>
          </ul>
        </InfoSection>

        <InfoSection heading="我们如何运营">
          <InfoCallout tone="dark">
            <strong className="text-on-dark">零服务器成本是核心设计目标。</strong>{" "}
            除 Word 转 PDF 这一项受限场景需要 Gotenberg 容器运行外，其余三款工具均为纯静态资源——
            可以在任何 CDN、对象存储甚至 GitHub Pages 上跑起来。
            您每多使用一次图片压缩工具，我们的服务器账单不会增加一分钱。
            这种架构选择直接奠定了"工具完全免费"承诺的可持续性。
          </InfoCallout>
          <p>
            我们通过页面中的 Google AdSense 广告位维持后端容器与域名 SSL 的基础开销。广告组件以非侵入式风格嵌入，绝不弹窗、绝不全屏覆盖、绝不诱导点击。我们承诺四款核心工具的基础能力将永久免费、永远不会被"高级订阅"墙拆走。
          </p>
        </InfoSection>

        <InfoSection heading="我们的工程哲学">
          <p>
            <strong>1. 隐私是默认值，不是功能。</strong>{" "}
            我们不打开发着"加密上传"的口号——我们干脆不让你上传。架构层面无法访问的特权，才是真正的隐私保护。
          </p>
          <p>
            <strong>2. 性能不是优化，是设计选择。</strong>{" "}
            首字节时间 (TTFB) &lt; 200 ms、最大内容绘制 (LCP) &lt; 1.5 s、累积布局偏移 (CLS) &lt; 0.1 是硬指标。我们使用 Next.js 15 App Router + RSC 流式渲染，把 JavaScript 体积压缩到了同类站点的 30%。
          </p>
          <p>
            <strong>3. 开源是义务，不是营销。</strong>{" "}
            本站前端代码以 MIT 协议开源。任何用户都可以在 GitHub 上审计我们对"隐私"的承诺是否兑现——这是无法伪造的可信度。
          </p>
          <p>
            <strong>4. 设计是产品，不是装饰。</strong>{" "}
            视觉系统取材于 Anthropic 的"warm cream + coral"编辑级设计语言，让效率工具也能拥有杂志般的阅读密度。
          </p>
        </InfoSection>

        <InfoSection heading="技术栈一览">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>前端框架：</strong> Next.js 15.1 + React 19 + TypeScript 5.7；</li>
            <li><strong>样式系统：</strong> Tailwind CSS 3.4 + 自研 Claude 设计令牌；</li>
            <li><strong>国际化：</strong> next-intl 3.26（中英双语，<code>localePrefix: always</code>）；</li>
            <li><strong>客户端图像：</strong> browser-image-compression 2.0 + Canvas API；</li>
            <li><strong>PDF 操作：</strong> pdf-lib 1.17（WebAssembly 无关，纯 JS 实现）；</li>
            <li><strong>二维码：</strong> qrcode.react 4.2（SVG/Canvas 双渲染模式）；</li>
            <li><strong>后端转换：</strong> FastAPI + Gotenberg + LibreOffice 容器编排；</li>
            <li><strong>部署：</strong> Docker Compose + Nginx 反代 + 自动化 Let's Encrypt。</li>
          </ul>
        </InfoSection>

        <InfoSection heading="想要联系我们？">
          <p>
            我们是一支匿名的小型工程团队，但每一封邮件都会被认真阅读：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>一般咨询：<a href="mailto:hello@333654.xyz">hello@333654.xyz</a></li>
            <li>隐私事宜：<a href="mailto:privacy@333654.xyz">privacy@333654.xyz</a></li>
            <li>反馈缺陷或贡献代码：通过页脚 GitHub 链接提交 Issue 或 Pull Request</li>
            <li>商业合作（请勿来邮推销 SEO 服务）：<a href="mailto:hello@333654.xyz">hello@333654.xyz</a></li>
          </ul>
        </InfoSection>
      </InfoPageLayout>
    );
  }

  return (
    <InfoPageLayout
      eyebrow="About"
      title="About Us"
      description="A geek-grade toolbox for documents, images, and everyday productivity, committed to a zero-server-cost, pure-frontend, high-performance experience."
      lastUpdated="May 22, 2026"
      lastUpdatedLabel="Last updated"
      backLabel="Back to home"
    >
      <InfoSection heading="Our Belief">
        <p>
          The internet is full of "free" tool sites that exchange your privacy for ad revenue. They invite you to upload, claim server-side processing, then quietly feed your files into profiling engines and sell the signals to ad networks.
        </p>
        <p>
          We refuse that business model.
        </p>
        <p>
          All-in-One Toolbox exists on the premise that modern browsers are powerful enough to handle the vast majority of document and media processing tasks without selling out users. WebAssembly, Canvas, File System Access API, Web Workers — these underrated browser-native capabilities let us remove "the server" from the architecture diagram, remove "upload" from the user journey, and remove "tracking" from the business model.
        </p>
      </InfoSection>

      <InfoSection heading="What We Build">
        <p>Four tools, covering 80% of everyday document and image needs:</p>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong>Word ↔ PDF conversion</strong> — a server-side LibreOffice + Gotenberg memory-isolation pipeline, 5-second timeout, 5 MB limit, zero disk footprint;
          </li>
          <li>
            <strong>PDF merge &amp; split</strong> — pure browser-side via <code>pdf-lib</code>, with drag-and-drop reordering and range syntax (1-3, 5, 7-10);
          </li>
          <li>
            <strong>Lossy &amp; lossless image compression with WebP</strong> — Canvas + Web Worker async pipeline, automatic EXIF stripping, up to 80% size reduction;
          </li>
          <li>
            <strong>QR code generation</strong> — <code>qrcode.react</code> client-side SVG/Canvas rendering with custom colors, error-correction levels, and logo embedding.
          </li>
        </ul>
      </InfoSection>

      <InfoSection heading="How We Operate">
        <InfoCallout tone="dark">
          <strong className="text-on-dark">Zero-server-cost is a core design goal.</strong>{" "}
          Except for the single constrained Word-to-PDF surface, which needs a Gotenberg container, the other three tools are pure static assets — deployable on any CDN, object store, or even GitHub Pages. Every additional image-compression run does not add a cent to our server bill. This architectural choice underwrites the sustainability of the "tools are fully free" promise.
        </InfoCallout>
        <p>
          We cover the modest cost of the backend container and SSL certificates via the in-page Google AdSense placements. Ads are embedded in a non-intrusive style: no pop-ups, no interstitial overlays, no click bait. The four core tools' baseline capabilities will stay free forever — never walled behind a "Pro tier".
        </p>
      </InfoSection>

      <InfoSection heading="Engineering Philosophy">
        <p>
          <strong>1. Privacy is the default, not a feature.</strong>{" "}
          We do not market "encrypted uploads" — we simply do not let you upload. The strongest privacy guarantee is one that is architecturally inaccessible, not contractually promised.
        </p>
        <p>
          <strong>2. Performance is a design choice, not an optimization.</strong>{" "}
          TTFB &lt; 200 ms, LCP &lt; 1.5 s, CLS &lt; 0.1 are hard targets. We use Next.js 15 App Router + RSC streaming, shipping roughly 30% of the JavaScript weight that comparable tool sites carry.
        </p>
        <p>
          <strong>3. Open source is an obligation, not marketing.</strong>{" "}
          The frontend is MIT-licensed and public on GitHub. Anyone can audit whether our privacy claims hold — this is the kind of credibility that cannot be faked.
        </p>
        <p>
          <strong>4. Design is the product, not the wrapper.</strong>{" "}
          The visual system borrows from Anthropic's editorial-grade warm-cream + coral language, giving utility tools the typographic density of a magazine.
        </p>
      </InfoSection>

      <InfoSection heading="Stack at a Glance">
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Frontend framework:</strong> Next.js 15.1 + React 19 + TypeScript 5.7;</li>
          <li><strong>Styling:</strong> Tailwind CSS 3.4 + a custom Claude design-token layer;</li>
          <li><strong>Internationalization:</strong> next-intl 3.26 (EN/ZH, <code>localePrefix: always</code>);</li>
          <li><strong>Client-side images:</strong> browser-image-compression 2.0 + Canvas API;</li>
          <li><strong>PDF operations:</strong> pdf-lib 1.17 (pure JS, no WASM dependency);</li>
          <li><strong>QR codes:</strong> qrcode.react 4.2 (dual SVG/Canvas renderer);</li>
          <li><strong>Backend conversion:</strong> FastAPI + Gotenberg + LibreOffice containers;</li>
          <li><strong>Deployment:</strong> Docker Compose + Nginx reverse proxy + automated Let's Encrypt.</li>
        </ul>
      </InfoSection>

      <InfoSection heading="Get in Touch">
        <p>We are a small, anonymous engineering team, but every email is read carefully:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>General inquiries: <a href="mailto:hello@333654.xyz">hello@333654.xyz</a></li>
          <li>Privacy questions: <a href="mailto:privacy@333654.xyz">privacy@333654.xyz</a></li>
          <li>Bug reports or contributions: file an issue or pull request via the GitHub link in the footer</li>
          <li>Business inquiries (no SEO solicitations, please): <a href="mailto:hello@333654.xyz">hello@333654.xyz</a></li>
        </ul>
      </InfoSection>
    </InfoPageLayout>
  );
}
