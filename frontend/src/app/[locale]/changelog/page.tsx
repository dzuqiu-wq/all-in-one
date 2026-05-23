import { Metadata } from "next";
import InfoPageLayout, {
  InfoSection,
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
    ? "更新日志 | All-in-One Toolbox"
    : "Changelog | All-in-One Toolbox";
  const description = isZh
    ? "All-in-One Toolbox 发布历史。2026 年 5 月 v0.1.0 生产版本正式上线并网，包含 Word↔PDF、PDF 合并拆分、图片压缩、二维码生成四款工具。"
    : "Release history of All-in-One Toolbox. v0.1.0 production launched in May 2026, shipping Word↔PDF, PDF merge/split, image compression, and QR code generation.";

  return {
    title,
    description,
    keywords: isZh
      ? ["更新日志", "版本历史", "v0.1.0", "生产上线", "All-in-One Toolbox"]
      : ["changelog", "release notes", "v0.1.0", "production launch", "All-in-One Toolbox"],
    alternates: {
      canonical: `${BASE_URL}/${locale}/changelog`,
      languages: {
        "en-US": `${BASE_URL}/en/changelog`,
        "zh-CN": `${BASE_URL}/zh/changelog`,
      },
    },
    openGraph: {
      type: "article",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${BASE_URL}/${locale}/changelog`,
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

interface ReleaseEntry {
  version: string;
  date: string;
  tag: string;
  tagTone: "primary" | "neutral";
  headline: string;
  summary: string;
  groups: { title: string; items: string[] }[];
}

function ReleaseCard({ release }: { release: ReleaseEntry }) {
  const tagClass =
    release.tagTone === "primary"
      ? "bg-primary text-on-primary"
      : "surface-card text-ink";

  return (
    <article className="relative pl-8 pb-12 border-l-2 border-hairline last:pb-0">
      <span className="absolute -left-[7px] top-2 w-3 h-3 rounded-full bg-primary ring-4 ring-canvas" />
      <div className="flex flex-wrap items-baseline gap-3 mb-4">
        <span className="font-mono text-title-md text-ink">{release.version}</span>
        <span className={`caption-upper px-3 py-1 rounded-pill ${tagClass}`}>{release.tag}</span>
        <span className="text-body-sm text-muted font-mono">{release.date}</span>
      </div>
      <h3 className="text-title-lg font-sans font-medium text-ink mb-3">{release.headline}</h3>
      <p className="text-body-md text-body leading-relaxed mb-6">{release.summary}</p>
      <div className="space-y-5">
        {release.groups.map((group) => (
          <div key={group.title}>
            <div className="caption-upper text-muted mb-2">{group.title}</div>
            <ul className="list-disc pl-6 space-y-1 text-body-md text-body leading-relaxed">
              {group.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}

export default async function ChangelogPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";

  const releases: ReleaseEntry[] = isZh
    ? [
        {
          version: "v1.1.0",
          date: "2026-05-23",
          tag: "新工具上线",
          tagTone: "primary",
          headline: "第八款工具：高保真微信聊天记录生成器",
          summary:
            "新增 WeChat Chat History Generator，提供 iPhone 移动端与三栏桌面端双视图，完整模拟微信气泡、头像、时间戳与图片附件展示。所有数据处理零服务器，纯浏览器内完成。",
          groups: [
            {
              title: "新增功能",
              items: [
                "高保真双端视图：iPhone 移动端模拟 + PC 三栏桌面端；",
                "微信官方气泡配色：<code>#95EC69</code>（我方）与 <code>#FFFFFF</code>（对方）；",
                "html2canvas 2× DPR 高清 PNG 导出；",
                "FileReader Base64 本地头像与图片处理，零网络请求；",
                "一键示例数据填充，快速生成演示内容。",
              ],
            },
            {
              title: "新增页面",
              items: [
                "微信聊天记录生成器（/tools/wechat-generator）中英双语完整支持；",
                "开发文档新增工具 5 章节；",
                "首页工具矩阵新增 WeChat Simulator 入口。",
              ],
            },
          ],
        },
        {
          version: "v0.1.0",
          date: "2026-05-22",
          tag: "正式上线",
          tagTone: "primary",
          headline: "生产版本正式上线并网",
          summary:
            "经过为期三个月的内测、性能调优与 AdSense 合规改造，All-in-One Toolbox 于 2026 年 5 月正式上线生产环境。四款核心工具全量开放，中英双语完整支持，零服务器成本架构经压力测试验证。",
          groups: [
            {
              title: "四款核心工具",
              items: [
                "Word ↔ PDF：基于 Gotenberg + LibreOffice 内存隔离管道，5 秒硬超时、5 MB 限速；",
                "PDF 合并与拆分：基于 pdf-lib 的纯浏览器端处理，支持拖拽排序与 (1-3, 5, 7-10) 范围语法；",
                "图片无损压缩与 WebP 转换：Canvas + Web Worker 异步管道，自动剥离 EXIF；",
                "二维码生成：基于 qrcode.react 4.2，支持 SVG/Canvas 双渲染模式、四级纠错码、自定义颜色。",
              ],
            },
            {
              title: "前端工程",
              items: [
                "升级到 Next.js 15.1 App Router + React 19，全面采用 RSC 流式渲染；",
                "next-intl 3.26 中英双语，localePrefix: 'always' 保证 URL 与语言强绑定；",
                "采纳 Anthropic Claude 设计语言（warm cream + coral）；",
                "Tailwind CSS 3.4 + 自研设计令牌系统；",
                "Lighthouse 综合分（性能 / 可访问性 / 最佳实践 / SEO）均高于 95。",
              ],
            },
            {
              title: "后端工程",
              items: [
                "FastAPI 0.115 异步网关，集成 Redis ZSET 滑动窗口限速；",
                "Gotenberg 8.x 容器化部署，LibreOffice 进程池 + 预热机制；",
                "Nginx 反向代理 + 自动化 Let's Encrypt SSL 证书申请；",
                "Docker Compose 单命令部署，配套 build_and_start.py 一键启动脚本。",
              ],
            },
            {
              title: "合规与法律",
              items: [
                "完成 GDPR 隐私政策与 ePrivacy Cookie 政策起草；",
                "接入 Google AdSense Consent Management Platform，遵循 IAB TCF v2.2；",
                "为所有页面配置 Next.js Metadata API：canonical、hreflang、Open Graph、Twitter Card；",
                "robots.txt 与 sitemap.xml 自动生成，支持搜索引擎全量索引；",
                "服务条款明确「按现状提供」免责条款，限制责任上限。",
              ],
            },
            {
              title: "本次新增页面",
              items: [
                "隐私政策（/privacy）",
                "服务条款（/terms）",
                "Cookie 政策（/cookie）",
                "关于我们（/about）",
                "开发文档（/docs）",
                "更新日志（/changelog）",
              ],
            },
          ],
        },
        {
          version: "v0.0.9",
          date: "2026-05-14",
          tag: "RC 候选版本",
          tagTone: "neutral",
          headline: "AdSense 改造与 SEO 收尾",
          summary:
            "为通过 AdSense 审核完成最后冲刺：补全所有合规页面、修复移动端布局、增加结构化数据，并完成中英双语 100% 覆盖。",
          groups: [
            {
              title: "改进",
              items: [
                "为所有工具页面新增 JSON-LD 结构化数据（WebApplication + FAQPage）；",
                "广告位预留固定高度，CLS 从 0.18 降至 0.04；",
                "修复移动端 PDF 拖拽排序触摸事件冲突；",
                "中文 SEO 关键词专项调优，匹配搜索意图。",
              ],
            },
          ],
        },
        {
          version: "v0.0.5",
          date: "2026-04-02",
          tag: "Alpha",
          tagTone: "neutral",
          headline: "Word↔PDF 后端 MVP",
          summary:
            "Word↔PDF 转换原型跑通，FastAPI + Gotenberg 容器编排完成。内部团队开始压力测试与渲染保真度校验。",
          groups: [
            {
              title: "新增",
              items: [
                "FastAPI 网关搭建；",
                "Gotenberg + LibreOffice Docker 镜像编排；",
                "前端工具页面骨架；",
                "中英双语国际化方案。",
              ],
            },
          ],
        },
        {
          version: "v0.0.1",
          date: "2026-02-20",
          tag: "项目立项",
          tagTone: "neutral",
          headline: "代码仓库初始化",
          summary:
            "项目代码仓库初始化，确立「纯前端优先、隐私即架构、零追踪营收」三大核心设计原则。",
          groups: [
            {
              title: "里程碑",
              items: [
                "Next.js 15 + Tailwind CSS 项目脚手架；",
                "MIT 协议开源；",
                "完成竞品调研与差异化定位。",
              ],
            },
          ],
        },
      ]
    : [
        {
          version: "v1.1.0",
          date: "2026-05-23",
          tag: "New tool",
          tagTone: "primary",
          headline: "Eighth tool: High-Fidelity WeChat Chat History Generator",
          summary:
            "Added WeChat Chat History Generator with iPhone mobile shell and three-column desktop mockup, faithfully simulating WeChat bubbles, avatars, timestamps, and image attachments. All data processing is zero-server — pure browser execution.",
          groups: [
            {
              title: "New features",
              items: [
                "Dual-viewport: iPhone mobile simulation + PC three-column desktop;",
                "Official WeChat bubble colors: <code>#95EC69</code> (me) and <code>#FFFFFF</code> (other);",
                "html2canvas 2× DPR high-definition PNG export;",
                "FileReader Base64 local avatar and image processing, zero network requests;",
                "One-click sample data injection for quick demonstrations.",
              ],
            },
            {
              title: "New pages",
              items: [
                "WeChat Chat History Generator (/tools/wechat-generator) with full bilingual support;",
                "Developer docs now includes Tool 5 section;",
                "Homepage tool matrix adds WeChat Simulator entry.",
              ],
            },
          ],
        },
        {
          version: "v0.1.0",
          date: "2026-05-22",
          tag: "Production launch",
          tagTone: "primary",
          headline: "Production release goes live",
          summary:
            "After three months of closed beta, performance tuning, and AdSense compliance work, All-in-One Toolbox officially launched in production in May 2026. All four core tools are now available, with full English/Chinese coverage, and the zero-server-cost architecture has been load-tested.",
          groups: [
            {
              title: "Four core tools",
              items: [
                "Word ↔ PDF: Gotenberg + LibreOffice memory-isolation pipeline, 5-second hard timeout, 5 MB cap;",
                "PDF merge & split: pure-browser pdf-lib pipeline with drag-and-drop reordering and (1-3, 5, 7-10) range syntax;",
                "Image compression & WebP: Canvas + Web Worker async pipeline with automatic EXIF stripping;",
                "QR generator: qrcode.react 4.2 with dual SVG/Canvas modes, four EC levels, and color customization.",
              ],
            },
            {
              title: "Frontend engineering",
              items: [
                "Upgraded to Next.js 15.1 App Router + React 19 with RSC streaming;",
                "next-intl 3.26 bilingual support with localePrefix: 'always';",
                "Adopted the Anthropic Claude design language (warm cream + coral);",
                "Tailwind CSS 3.4 with a custom design-token layer;",
                "Lighthouse composite scores (Performance / Accessibility / Best Practices / SEO) all above 95.",
              ],
            },
            {
              title: "Backend engineering",
              items: [
                "FastAPI 0.115 async gateway integrated with a Redis ZSET sliding-window rate limiter;",
                "Gotenberg 8.x containerized deployment with a warm LibreOffice process pool;",
                "Nginx reverse proxy + automated Let's Encrypt SSL renewal;",
                "Docker Compose single-command deploy, paired with the build_and_start.py launcher.",
              ],
            },
            {
              title: "Compliance & legal",
              items: [
                "Drafted GDPR-compliant Privacy Policy and ePrivacy Cookie Policy;",
                "Integrated Google AdSense Consent Management Platform, honoring IAB TCF v2.2;",
                "Configured Next.js Metadata API across all pages: canonical, hreflang, Open Graph, Twitter Card;",
                "Auto-generated robots.txt and sitemap.xml for full search-engine coverage;",
                'Terms of Service explicitly state "as-is" disclaimers and cap liability.',
              ],
            },
            {
              title: "Newly added pages",
              items: [
                "Privacy Policy (/privacy)",
                "Terms of Service (/terms)",
                "Cookie Policy (/cookie)",
                "About Us (/about)",
                "Developer Documentation (/docs)",
                "Changelog (/changelog)",
              ],
            },
          ],
        },
        {
          version: "v0.0.9",
          date: "2026-05-14",
          tag: "Release candidate",
          tagTone: "neutral",
          headline: "AdSense polish & SEO finalization",
          summary:
            "Sprint to pass AdSense review: finished all compliance pages, fixed mobile layout edge cases, added structured data, and reached 100% bilingual coverage.",
          groups: [
            {
              title: "Improvements",
              items: [
                "Added JSON-LD structured data (WebApplication + FAQPage) to every tool page;",
                "Reserved fixed heights for ad slots; CLS dropped from 0.18 to 0.04;",
                "Fixed mobile PDF drag-reorder touch-event conflicts;",
                "Targeted SEO keyword tuning to match search intent across both languages.",
              ],
            },
          ],
        },
        {
          version: "v0.0.5",
          date: "2026-04-02",
          tag: "Alpha",
          tagTone: "neutral",
          headline: "Word↔PDF backend MVP",
          summary:
            "Word↔PDF conversion prototype became functional; FastAPI + Gotenberg container orchestration completed. Internal team began load-testing and fidelity validation.",
          groups: [
            {
              title: "Added",
              items: [
                "FastAPI gateway scaffolding;",
                "Gotenberg + LibreOffice Docker image orchestration;",
                "Tool page skeletons on the frontend;",
                "Bilingual i18n framework.",
              ],
            },
          ],
        },
        {
          version: "v0.0.1",
          date: "2026-02-20",
          tag: "Project kickoff",
          tagTone: "neutral",
          headline: "Repository initialized",
          summary:
            'Repository initialized with three guiding principles: "frontend-first, privacy-as-architecture, zero-tracking monetization".',
          groups: [
            {
              title: "Milestones",
              items: [
                "Next.js 15 + Tailwind CSS project scaffolding;",
                "MIT license adopted;",
                "Competitive research and differentiated positioning completed.",
              ],
            },
          ],
        },
      ];

  return (
    <InfoPageLayout
      eyebrow={isZh ? "发布历史" : "Release History"}
      title={isZh ? "更新日志" : "Changelog"}
      description={
        isZh
          ? "记录 All-in-One Toolbox 每一次有意义的迭代。我们承诺所有破坏性变更都会被显式标注，并附带迁移说明。"
          : "A record of every meaningful iteration to All-in-One Toolbox. We commit to flagging any breaking change explicitly, with migration notes."
      }
      lastUpdated={isZh ? "2026 年 5 月 22 日" : "May 22, 2026"}
      lastUpdatedLabel={isZh ? "最近更新" : "Last updated"}
      backLabel={isZh ? "返回主页" : "Back to home"}
    >
      <InfoSection heading={isZh ? "版本时间线" : "Version Timeline"}>
        <div className="mt-4">
          {releases.map((release) => (
            <ReleaseCard key={release.version} release={release} />
          ))}
        </div>
      </InfoSection>

      <InfoSection heading={isZh ? "版本号规则" : "Versioning Scheme"}>
        <p>
          {isZh
            ? "本项目遵循 SemVer 2.0.0 语义化版本规范："
            : "This project follows Semantic Versioning 2.0.0:"}
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>MAJOR</strong>{" "}
            {isZh
              ? "（主版本号）：包含不兼容的 API 变更或前端契约变更；"
              : "— incompatible API changes or frontend contract changes;"}
          </li>
          <li>
            <strong>MINOR</strong>{" "}
            {isZh
              ? "（次版本号）：以向后兼容的方式新增功能；"
              : "— backward-compatible feature additions;"}
          </li>
          <li>
            <strong>PATCH</strong>{" "}
            {isZh
              ? "（修订号）：向后兼容的缺陷修复与文案调整。"
              : "— backward-compatible bug fixes and copy tweaks."}
          </li>
        </ul>
      </InfoSection>

      <InfoSection heading={isZh ? "如何订阅更新" : "How to Stay Updated"}>
        <p>
          {isZh
            ? "目前我们尚未提供邮件订阅。建议通过页脚 GitHub 链接 watch 仓库，每次发布都会自动同步至 GitHub Releases。"
            : "We do not yet offer email subscriptions. To stay in the loop, watch the repository via the GitHub link in the footer — every release is automatically mirrored to GitHub Releases."}
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
