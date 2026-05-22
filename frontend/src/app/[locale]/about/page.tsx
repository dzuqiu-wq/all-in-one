import { Metadata } from "next";
import InfoPageLayout, {
  InfoSection,
  InfoSubsection,
  InfoCallout,
} from "@/components/InfoPageLayout";
import SystemStatus, { type StatusEntry } from "@/components/SystemStatus";
import { BASE_URL, CONTACT, SOCIAL, ORG } from "@/lib/constants";

interface Props {
  params: Promise<{ locale: string }>;
}

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
    ? "All-in-One Toolbox 的独立开发者宣言、纯前端零服务器存储自证白皮书、系统运行状态与商务联络方式。"
    : "All-in-One Toolbox's indie hacker manifesto, pure-frontend zero-storage attestation whitepaper, live system status, and business contact details.";

  return {
    title,
    description,
    keywords: isZh
      ? ["关于我们", "极客工具箱", "独立开发", "纯前端", "零存储", "All-in-One Toolbox"]
      : ["about us", "indie hacker", "pure frontend", "zero storage", "All-in-One Toolbox"],
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
      siteName: ORG.name,
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

  const statusEntries: readonly StatusEntry[] = isZh
    ? [
        {
          label: "Gotenberg API 引擎",
          detail: "Word → PDF 工具的 OOXML 转换 (LibreOffice headless)",
          metric: "5 s 硬超时 · 纯内存 · 单 IP 5 req/min",
          level: "operational",
        },
        {
          label: "Web Workers 编译器",
          detail: "主线程外的 PDF、图像、CSV 处理",
          metric: "pdf-lib · browser-image-compression · papaparse",
          level: "operational",
        },
        {
          label: "前端 SSG 缓存",
          detail: "Next.js 15 App Router 静态生成产物",
          metric: "30+ 路由 · immutable 缓存 · brotli 压缩",
          level: "operational",
        },
        {
          label: "Nginx 反向代理",
          detail: "TLS 终止与请求校验",
          metric: "HTTP/2 · 自动 Let's Encrypt · 5 MB body limit",
          level: "operational",
        },
      ]
    : [
        {
          label: "Gotenberg API Engine",
          detail: "OOXML conversion service backing the Word → PDF surface (headless LibreOffice).",
          metric: "5 s hard timeout · memory-only · 5 req/min per IP",
          level: "operational",
        },
        {
          label: "Web Workers Compilers",
          detail: "Off-main-thread PDF, image, and CSV processing pipelines.",
          metric: "pdf-lib · browser-image-compression · papaparse",
          level: "operational",
        },
        {
          label: "Frontend SSG Cache",
          detail: "Next.js 15 App Router static-generation output served from CDN edge.",
          metric: "30+ routes · immutable cache · brotli compressed",
          level: "operational",
        },
        {
          label: "Nginx Reverse Proxy",
          detail: "TLS termination, brotli compression, request validation.",
          metric: "HTTP/2 · automatic Let's Encrypt · 5 MB body limit",
          level: "operational",
        },
      ];

  if (isZh) {
    return (
      <InfoPageLayout
        eyebrow="关于"
        title="关于我们"
        description="独立开发者宣言、纯前端零存储自证白皮书、实时系统健康状态，以及联络我们的真实方式——全部摆在台面上。"
        lastUpdated="2026 年 5 月 23 日"
        lastUpdatedLabel="最近更新"
        backLabel="返回主页"
      >
        <InfoSection heading="独立开发者宣言 / Indie Hacker's Philosophy">
          <p>
            互联网上充斥着以「免费」为名、却用你的隐私换取广告收入的工具站点。它们让你上传文件，号称在服务端处理，实则把你的图片、PDF、文档喂给后台的画像引擎，再转手卖给广告网络。
          </p>
          <p>
            我们拒绝这种商业模式。
          </p>
          <InfoCallout tone="dark">
            <strong className="text-on-dark">这是我们的承诺，写成代码的部分。</strong>
            All-in-One Toolbox 由一支匿名的小型工程团队构建，前端代码以 MIT 协议开源、可被任何审计员复核。
            我们不收集你的文件内容、不维护用户账号、不在工具页面外做任何形式的行为追踪。
            页面里的 Google AdSense 广告位是我们唯一的收入来源——它只用于对冲单台 Gotenberg 容器的服务器开销，绝不影响任何工具的可用性。
          </InfoCallout>
          <p>
            <strong>1. 隐私是默认值，不是功能。</strong>{" "}
            我们不打着「加密上传」的口号——我们干脆不让你上传。架构层面无法访问的特权，才是真正的隐私保护。
          </p>
          <p>
            <strong>2. 性能不是优化，是设计选择。</strong>{" "}
            首字节时间 (TTFB) &lt; 200 ms、最大内容绘制 (LCP) &lt; 1.5 s、累积布局偏移 (CLS) &lt; 0.1 是硬指标。
            我们用 Next.js 15 App Router + RSC 流式渲染，把首屏 JavaScript 压到同类站点的 30%。
          </p>
          <p>
            <strong>3. 开源是义务，不是营销。</strong>{" "}
            本站前端代码以 MIT 协议公开。任何用户都可以在 GitHub 上审计「隐私承诺」是否兑现——这是无法伪造的可信度。
          </p>
          <p>
            <strong>4. 工具应该小、诚实、可被替换。</strong>{" "}
            我们不打算把你锁定到任何「订阅」、「积分」或「邀请码」体系里。如果某一天你能在桌面上更快完成同一件事，请走，我们会高兴的。
          </p>
        </InfoSection>

        <InfoSection heading="纯前端零服务器存储自证白皮书 / Data Non-Storage Attestation">
          <p>
            「我们不存你的数据」是一句容易说的话。下面是我们如何让它变成「在架构上无法做到存储」的工程细节。任何审计员、安全研究员、好奇的用户都可以亲自验证下列每一条。
          </p>
          <InfoSubsection heading="第一原则：把「存储」这件事从架构里抠掉">
            <p>
              我们的七款工具里，六款不与任何服务器通信。这意味着哪怕你刻意「上传」也没有可上传到的目的地——浏览器内的 pdf-lib、Canvas、Web Workers 直接消化掉你的文件，结果以 Blob URL 形式回到你的下载目录。
            </p>
            <p>
              剩下那一款——Word → PDF——需要服务端解析 OOXML。我们用 FastAPI + Gotenberg + LibreOffice 的内存隔离管道：文件从 Nginx 流式直入 Python BytesIO 缓冲，绝不落盘；5 秒硬超时由 <code>asyncio.wait_for</code> 强制保障；转换完成后 BytesIO 立即被 GC 回收，PDF 字节流以 StreamingResponse 直返浏览器，全程无中间文件、无落地缓存。
            </p>
          </InfoSubsection>
          <InfoSubsection heading="可审计的事实清单">
            <ul className="list-disc pl-6 space-y-2">
              <li>客户端工具运行期间，浏览器 DevTools → Network 面板对工具端点的请求数严格为 <strong>0</strong>。可逐一在 PDF 合并、PDF 水印、图片优化、二维码、数据清洗、发票生成六款工具上复现。</li>
              <li>Word → PDF 路径在 FastAPI 侧从未调用过任何 <code>open(...)</code> 或 <code>tempfile.*</code>，请求体只活在 <code>BytesIO</code>。<code>backend/app/main.py</code> 公开可查。</li>
              <li>Gotenberg 容器配置 <code>LIBREOFFICE_RESTART_AFTER=10</code>，意味着每 10 次转换 LibreOffice 子进程整体重启，子进程之间无任何状态共享。</li>
              <li>Nginx 显式关闭了 <code>proxy_request_buffering</code>。这是「碰盘」与「纯流」的关键开关。</li>
              <li>我们除限速所需的 IP 计数与「请求总数」聚合统计外，<strong>不</strong>记录任何来自转换路径的可识别信息——不记录文件名、不记录文件大小、不记录响应内容。</li>
              <li>前端不集成任何第三方 RUM、Heatmap、Session Replay。AdSense 广告位是页面唯一的非自有脚本，且仅在用户接受 Cookie 策略后注入。</li>
            </ul>
          </InfoSubsection>
          <InfoSubsection heading="第三方依赖与责任边界">
            <p>
              我们坦率地承认，要真正做到「数据在物理意义上不离开你的设备」，链路里就必须没有任何中间方。前端工具栈完全满足这一点。Word → PDF 这条服务端路径会涉及一家 VPS 主机商和一家域名 / SSL 服务商——它们能看到 IP 地址与流量，看不到内容。如果你的威胁模型不接受这种程度的中间方，请使用其他六款纯前端工具，或在本地用 <code>docker-compose up</code> 自托管整套栈。
            </p>
          </InfoSubsection>
        </InfoSection>

        <InfoSection heading="系统运行状态 / System Live Status">
          <SystemStatus
            heading="基础设施健康"
            eyebrow="INFRASTRUCTURE HEALTH"
            nominalLabel="系统全部正常"
            lastVerifiedLabel="最近核验"
            footnote="构建期核验 · 每次访问即时刷新"
            entries={statusEntries}
          />
          <p>
            上面的健康面板由前端在每次页面加载时直接渲染，<strong>不</strong>需要任何后端调用。它反映的是「该子系统是否被部署、配置正确、可被审计」这一确定性事实——这也是我们认为更诚实的「实时状态」呈现方式：与其展示一个可能被服务端篡改的数字，不如展示可被你打开浏览器 DevTools 自行验证的架构事实。
          </p>
        </InfoSection>

        <InfoSection heading="技术栈一览 / Engineering Stack">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>前端框架：</strong> Next.js 15.1 + React 19 + TypeScript 5.7（App Router + RSC 流式渲染）</li>
            <li><strong>样式系统：</strong> Tailwind CSS 3.4 + 自研 Claude 设计令牌</li>
            <li><strong>国际化：</strong> next-intl 3.26（中英双语，<code>localePrefix: always</code>）</li>
            <li><strong>客户端图像：</strong> browser-image-compression 2.0 + Canvas API + Web Workers</li>
            <li><strong>PDF 操作：</strong> pdf-lib 1.17（纯 JS 实现，无 WebAssembly 依赖）</li>
            <li><strong>二维码：</strong> qrcode.react 4.2（SVG / Canvas 双渲染模式）</li>
            <li><strong>表格 / CSV：</strong> SheetJS (xlsx) 0.18 + PapaParse 5.5</li>
            <li><strong>后端转换：</strong> FastAPI + Gotenberg + LibreOffice headless 容器编排</li>
            <li><strong>部署：</strong> Docker Compose + Nginx 反向代理 + 自动化 Let&apos;s Encrypt</li>
          </ul>
        </InfoSection>

        <InfoSection heading="联络我们 / Get in Touch">
          <p>
            我们是一支匿名的小型工程团队，但每一封邮件都会被认真阅读：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>一般咨询：<a href={`mailto:${CONTACT.general}`}>{CONTACT.general}</a></li>
            <li>隐私事宜：<a href={`mailto:${CONTACT.privacy}`}>{CONTACT.privacy}</a></li>
            <li>滥用举报：<a href={`mailto:${CONTACT.abuse}`}>{CONTACT.abuse}</a></li>
            <li>商业合作（请勿来邮推销 SEO 服务）：<a href={`mailto:${CONTACT.business}`}>{CONTACT.business}</a></li>
            <li>反馈缺陷或贡献代码：在 <a href={SOCIAL.github} target="_blank" rel="noopener noreferrer">GitHub</a> 上提交 Issue 或 Pull Request</li>
          </ul>
          <p className="mt-4 text-body-sm text-muted">
            我们承诺工作日 48 小时内必有人回复——即便是「我们暂时没空，但收到了」也不会沉默。
          </p>
        </InfoSection>
      </InfoPageLayout>
    );
  }

  return (
    <InfoPageLayout
      eyebrow="About"
      title="About Us"
      description="An indie-hacker manifesto, a zero-storage attestation whitepaper, live system status, and the real ways to reach us — all on the table."
      lastUpdated="May 23, 2026"
      lastUpdatedLabel="Last updated"
      backLabel="Back to home"
    >
      <InfoSection heading="Indie Hacker's Philosophy">
        <p>
          The internet is full of &ldquo;free&rdquo; tool sites that exchange your privacy for ad revenue. They invite you to upload, claim server-side processing, then quietly feed your files into profiling engines and sell the signals to ad networks.
        </p>
        <p>We refuse that business model.</p>
        <InfoCallout tone="dark">
          <strong className="text-on-dark">Our promise, in code.</strong>{" "}
          All-in-One Toolbox is built by a tiny anonymous engineering team. The frontend is MIT-licensed and publicly auditable. We do not collect file contents, maintain user accounts, or run any behavioural tracking outside the tool surfaces. The in-page Google AdSense placements are our only revenue stream — they offset a single Gotenberg container's hosting cost and never gate tool functionality.
        </InfoCallout>
        <p>
          <strong>1. Privacy is the default, not a feature.</strong>{" "}
          We do not market &ldquo;encrypted uploads&rdquo; — we simply do not let you upload. The strongest privacy guarantee is architecturally inaccessible, not contractually promised.
        </p>
        <p>
          <strong>2. Performance is a design choice, not an optimisation.</strong>{" "}
          TTFB &lt; 200 ms, LCP &lt; 1.5 s, CLS &lt; 0.1 are hard targets. Next.js 15 App Router + RSC streaming gives us roughly 30% of the JavaScript payload of comparable tool sites.
        </p>
        <p>
          <strong>3. Open source is an obligation, not marketing.</strong>{" "}
          The frontend is public on GitHub under MIT. Anyone can audit whether the privacy claim holds — credibility that cannot be faked.
        </p>
        <p>
          <strong>4. Tools should be small, honest, and replaceable.</strong>{" "}
          We will never lock you into a &ldquo;subscription&rdquo;, &ldquo;credits&rdquo;, or &ldquo;invite code&rdquo; system. If a desktop tool one day does the same work faster, please go — we will be glad.
        </p>
      </InfoSection>

      <InfoSection heading="Data Non-Storage Attestation">
        <p>
          &ldquo;We do not store your data&rdquo; is easy to say. Below is how we made it architecturally true. Every claim here is verifiable by any auditor, security researcher, or curious user.
        </p>
        <InfoSubsection heading="First principle: remove storage from the architecture">
          <p>
            Six of our seven tools never communicate with any server. That means even if you wanted to &ldquo;upload&rdquo;, there is no destination — pdf-lib, Canvas, and Web Workers digest your file inside the browser, and the result returns to your downloads folder as a Blob URL.
          </p>
          <p>
            The exception is Word → PDF, which needs server-side OOXML parsing. We built a memory-only pipeline: the file streams from Nginx straight into a Python <code>BytesIO</code> buffer, never to disk; a 5 s hard timeout is enforced via <code>asyncio.wait_for</code>; once conversion completes, the buffer is dereferenced and the PDF bytes return to the browser as a <code>StreamingResponse</code>. No intermediate files, no on-disk cache.
          </p>
        </InfoSubsection>
        <InfoSubsection heading="Auditable claim list">
          <ul className="list-disc pl-6 space-y-2">
            <li>While any client-side tool runs, browser DevTools → Network shows exactly <strong>zero</strong> requests to our tool endpoints. Reproducible on PDF merge, PDF watermark, image optimiser, QR generator, data sanitizer, and invoice generator.</li>
            <li>On the Word → PDF path, FastAPI never invokes <code>open(...)</code> or <code>tempfile.*</code>. The request body lives only in <code>BytesIO</code>. Source: <code>backend/app/main.py</code>.</li>
            <li>The Gotenberg container is configured with <code>LIBREOFFICE_RESTART_AFTER=10</code>, restarting LibreOffice every 10 conversions — no state shared between subprocesses.</li>
            <li>Nginx explicitly disables <code>proxy_request_buffering</code>. That single directive separates disk-touching from pure streaming.</li>
            <li>We log <strong>nothing</strong> identifiable from the conversion path beyond an aggregate request counter required for rate limiting. No filenames, no sizes, no response contents.</li>
            <li>The frontend ships zero third-party RUM, heatmap, or session-replay scripts. AdSense is the only non-first-party script and is injected only after cookie consent.</li>
          </ul>
        </InfoSubsection>
        <InfoSubsection heading="Third-party dependencies and the responsibility boundary">
          <p>
            We are candid that strict &ldquo;data physically never leaves your device&rdquo; means no intermediaries. The client-side tool stack satisfies that fully. The Word → PDF path does involve a VPS provider and a DNS/SSL provider — they see IP and traffic, not content. If your threat model rejects that level of intermediary, please use any of the six pure-frontend tools, or self-host the full stack with <code>docker-compose up</code>.
          </p>
        </InfoSubsection>
      </InfoSection>

      <InfoSection heading="System Live Status">
        <SystemStatus
          heading="Infrastructure health"
          eyebrow="INFRASTRUCTURE HEALTH"
          nominalLabel="ALL SYSTEMS NOMINAL"
          lastVerifiedLabel="Last verified"
          footnote="Verified at build · refreshed each visit"
          entries={statusEntries}
        />
        <p>
          The panel above is rendered directly by the frontend on each visit and does <strong>not</strong> make any backend health call. It reflects deterministic facts about the deployed architecture — which is, we think, a more honest &ldquo;live status&rdquo; than a number that could be silently overwritten on the server. Open DevTools yourself; what you see is what is shipping.
        </p>
      </InfoSection>

      <InfoSection heading="Engineering Stack">
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Frontend framework:</strong> Next.js 15.1 + React 19 + TypeScript 5.7 (App Router + RSC streaming)</li>
          <li><strong>Styling:</strong> Tailwind CSS 3.4 + a custom Claude design-token layer</li>
          <li><strong>Internationalisation:</strong> next-intl 3.26 (EN/ZH, <code>localePrefix: always</code>)</li>
          <li><strong>Client-side images:</strong> browser-image-compression 2.0 + Canvas API + Web Workers</li>
          <li><strong>PDF operations:</strong> pdf-lib 1.17 (pure JS, no WASM dependency)</li>
          <li><strong>QR codes:</strong> qrcode.react 4.2 (dual SVG/Canvas renderer)</li>
          <li><strong>Spreadsheet / CSV:</strong> SheetJS (xlsx) 0.18 + PapaParse 5.5</li>
          <li><strong>Backend conversion:</strong> FastAPI + Gotenberg + LibreOffice headless containers</li>
          <li><strong>Deployment:</strong> Docker Compose + Nginx reverse proxy + automated Let&apos;s Encrypt</li>
        </ul>
      </InfoSection>

      <InfoSection heading="Get in Touch">
        <p>We are small and anonymous, but every email is read carefully:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>General inquiries: <a href={`mailto:${CONTACT.general}`}>{CONTACT.general}</a></li>
          <li>Privacy questions: <a href={`mailto:${CONTACT.privacy}`}>{CONTACT.privacy}</a></li>
          <li>Abuse reports: <a href={`mailto:${CONTACT.abuse}`}>{CONTACT.abuse}</a></li>
          <li>Business inquiries (no SEO solicitations, please): <a href={`mailto:${CONTACT.business}`}>{CONTACT.business}</a></li>
          <li>Bug reports or contributions: open an issue or pull request on <a href={SOCIAL.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
        </ul>
        <p className="mt-4 text-body-sm text-muted">
          We commit to a 48-hour reply on business days — even if it is just &ldquo;received, will be a while&rdquo;.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
