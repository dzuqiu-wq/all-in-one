import { Metadata } from "next";
import InfoPageLayout, {
  InfoSection,
  InfoSubsection,
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
    ? "隐私政策 | All-in-One Toolbox"
    : "Privacy Policy | All-in-One Toolbox";
  const description = isZh
    ? "All-in-One Toolbox 的 GDPR 合规隐私政策。我们所有客户端工具均在浏览器内存中处理数据，绝不上传、绝不收集您的文件。"
    : "GDPR-compliant privacy policy for All-in-One Toolbox. Our client-side tools process data exclusively in browser memory — your files are never uploaded or collected.";

  return {
    title,
    description,
    keywords: isZh
      ? ["隐私政策", "GDPR", "数据保护", "客户端处理", "无上传", "All-in-One Toolbox"]
      : ["privacy policy", "gdpr", "data protection", "client-side", "no upload", "All-in-One Toolbox"],
    alternates: {
      canonical: `${BASE_URL}/${locale}/privacy`,
      languages: {
        "en-US": `${BASE_URL}/en/privacy`,
        "zh-CN": `${BASE_URL}/zh/privacy`,
      },
    },
    openGraph: {
      type: "article",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${BASE_URL}/${locale}/privacy`,
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

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";

  if (isZh) {
    return (
      <InfoPageLayout
        eyebrow="法律与合规"
        title="隐私政策"
        description="您的数据归您所有，且仅留在您的设备中。本政策详细说明 All-in-One Toolbox 如何在架构层面保障您的隐私安全，并符合欧盟 GDPR 及相关数据保护法规。"
        lastUpdated="2026 年 5 月 22 日"
        lastUpdatedLabel="最近更新"
        backLabel="返回主页"
      >
        <InfoSection heading="1. 导言">
          <p>
            All-in-One Toolbox（以下简称"本站"、"我们"，访问域名{" "}
            <code>333654.xyz</code>）是一套面向全球用户开放的免费在线效率工具集合，涵盖 Word 转 PDF、PDF 合并与拆分、图片压缩与 WebP 转换、二维码生成四大核心能力。
          </p>
          <p>
            我们深知隐私的不可让渡性。本政策并非营销话术，而是对您数据生命周期的工程级承诺——从您打开浏览器的那一刻，到您关闭标签页的瞬间，我们以"零采集、零留存、零追踪"为最高优先级。
          </p>
        </InfoSection>

        <InfoSection heading="2. 数据控制者">
          <p>
            根据《欧盟通用数据保护条例》(GDPR) 第 4(7) 条的定义，本站为本政策所述任何最小化数据处理活动的"数据控制者"。如您希望行使任何数据主体权利，可通过{" "}
            <a href="mailto:privacy@333654.xyz">privacy@333654.xyz</a> 与我们联系。
          </p>
        </InfoSection>

        <InfoSection heading="3. 我们收集了什么？（剧透：几乎为零）">
          <p>
            在最严格的"数据最小化原则"指导下，本站<strong>不收集</strong>下列任何信息：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>用户姓名、邮箱、电话或其他任何账户身份信息（本站无注册系统）；</li>
            <li>您上传或拖入的图片、PDF、Word 文档原始文件；</li>
            <li>您输入到二维码生成器中的任何字符串（URL、文本、Wi-Fi 配置等）；</li>
            <li>您的浏览历史、跨站点行为或长期画像数据；</li>
            <li>设备指纹、Canvas 指纹、WebGL 指纹等任何追踪标识。</li>
          </ul>
          <p className="mt-4">
            我们的服务器在常规请求中仅记录用于运维必要的最小日志（请求方法、状态码、IP 段哈希、UTC 时间戳），保留期不超过 30 天，仅用于反滥用与故障排查，绝不用于用户画像。
          </p>
        </InfoSection>

        <InfoSection heading="4. 纯前端处理（Client-Side Pure）的工程承诺">
          <p>
            本站四款工具中有三款（图片压缩、PDF 合并与拆分、二维码生成）<strong>完全运行于您的浏览器内存中</strong>。文件不会经过我们的任何服务器，亦不会触达任何第三方对象存储或 CDN 缓存。
          </p>
          <InfoCallout tone="dark">
            <strong className="text-on-dark">技术原理：</strong>{" "}
            浏览器原生提供的 <code>File API</code>、<code>Blob</code>、<code>Canvas API</code> 与 <code>WebAssembly</code> 沙箱使我们得以在客户端完成 100% 的密集计算。当您拖入文件，它会被读入 JavaScript 堆内存，经处理后通过 <code>URL.createObjectURL</code> 生成可下载的本地 Blob——整个生命周期与"网络"二字毫无关联。您甚至可以在断开网络后继续使用这些工具。
          </InfoCallout>
          <p>
            您可以打开浏览器的开发者工具，切换到"网络" (Network) 面板，亲自验证：除首次加载页面外，使用客户端工具时不会发起任何文件上传请求。代码开源、行为可审计。
          </p>
        </InfoSection>

        <InfoSection heading="5. Word 转 PDF：后端隔离区的安全直转">
          <p>
            出于浏览器对 <code>.docx</code> / <code>.doc</code> 格式解析能力的客观限制，Word 转 PDF 这一项工具需要后端 LibreOffice 引擎介入。我们为这一受限场景设计了"<strong>内存直转隔离区</strong>"管道：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              文件以 HTTPS 流的形式上传至 Gotenberg 渲染服务，全程在容器内存中以二进制流形式传递；
            </li>
            <li>
              服务器从不将原始 Word 或转换后 PDF 写入磁盘——使用 Python <code>BytesIO</code> + <code>tempfile.SpooledTemporaryFile</code> 组合，物理介质上不留下任何痕迹；
            </li>
            <li>
              单次转换强制 5 秒超时与 5 MB 体积上限，转换完成后内存缓冲立即释放、容器在每次任务后回收；
            </li>
            <li>每个 IP 每分钟限速 5 次，使用滑动窗口算法防止资源滥用；</li>
            <li>整条隔离区不写入访问日志中的文件名或文件内容字段。</li>
          </ul>
          <p>
            换言之，即便我们的运维团队希望窥探您的文档，技术上也已被设计为"不可见"。这是"特权不可获取" (Privilege-Inaccessible) 的架构哲学。
          </p>
        </InfoSection>

        <InfoSection heading="6. Cookie 与第三方服务">
          <p>
            我们自身不投放任何用于追踪的 Cookie。但本站为维持零服务器成本的免费运营，在页面中嵌入了 <strong>Google AdSense</strong> 广告组件，AdSense 会向您的浏览器写入第三方 Cookie，用于：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>展示与您兴趣相关的广告（个性化广告）；</li>
            <li>衡量广告投放效果与防止重复展示；</li>
            <li>遵守 IAB Transparency &amp; Consent Framework (TCF v2.2) 进行用户同意管理。</li>
          </ul>
          <p>
            如您身处欧洲经济区 (EEA)、英国或瑞士，首次访问时将弹出 Google 联合发布商管理的同意横幅，您可选择"全部接受"、"全部拒绝"或细粒度自定义。详细的 Cookie 类目说明请参阅我们的{" "}
            <a href="cookie">Cookie 政策</a>。
          </p>
          <p>
            您也可前往{" "}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
              Google 广告设置
            </a>
            {" "}全局关闭个性化广告。
          </p>
        </InfoSection>

        <InfoSection heading="7. 数据保留">
          <p>
            服务器侧最小化运维日志保留 30 天后自动滚动删除。客户端工具产生的所有数据均为浏览器进程内的瞬时对象，关闭标签页即被 JavaScript 垃圾回收器回收。我们不存在任何可用于"用户档案"的持久化数据集。
          </p>
        </InfoSection>

        <InfoSection heading="8. 您的 GDPR 权利">
          <p>
            尽管我们处理的个人数据极少，我们仍郑重声明并尊重以下 GDPR 第 12–22 条赋予您的权利：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>访问权</strong>：要求确认我们是否处理了与您相关的个人数据；</li>
            <li><strong>更正权</strong>：要求更正不准确的数据；</li>
            <li><strong>删除权</strong>（被遗忘权）：要求删除您的数据；</li>
            <li><strong>限制处理权</strong>：要求暂停某项处理活动；</li>
            <li><strong>数据可携权</strong>：以结构化、机器可读格式获取您的数据；</li>
            <li><strong>反对权</strong>：反对基于合法利益的处理；</li>
            <li><strong>撤回同意权</strong>：随时撤回此前授予的 Cookie 同意；</li>
            <li><strong>申诉权</strong>：向您所在国的数据保护监管机构提出申诉。</li>
          </ul>
          <p>
            如希望行使任何权利，请发送邮件至{" "}
            <a href="mailto:privacy@333654.xyz">privacy@333654.xyz</a>，我们将在 30 个日历日内回复。
          </p>
        </InfoSection>

        <InfoSection heading="9. 国际数据传输">
          <p>
            本站基础设施部署于符合 GDPR 第 45 条充分性认定地区或具备 SCC（标准合同条款）保护的云服务商节点。Google AdSense 由 Google LLC（位于美国）运营，受 EU-U.S. Data Privacy Framework 约束。
          </p>
        </InfoSection>

        <InfoSection heading="10. 儿童隐私">
          <p>
            本站并非面向 13 岁（或您所在司法管辖区适用的最低年龄）以下儿童设计。我们不会有意识地收集儿童的任何个人数据。如您是监护人，且发现儿童在未经您同意的情况下提供了任何信息，请联系我们立即删除。
          </p>
        </InfoSection>

        <InfoSection heading="11. 政策变更">
          <p>
            隐私政策的任何重大修订将通过页眉横幅及更新日志页面同步告知。本页顶部始终展示最新生效日期。继续使用本站即视为接受最新政策。
          </p>
        </InfoSection>

        <InfoSection heading="12. 联系我们">
          <p>
            隐私事宜邮箱：<a href="mailto:privacy@333654.xyz">privacy@333654.xyz</a>
            <br />
            一般咨询邮箱：<a href="mailto:hello@333654.xyz">hello@333654.xyz</a>
            <br />
            技术与开源协作：通过页脚 GitHub 链接提交 Issue
          </p>
        </InfoSection>
      </InfoPageLayout>
    );
  }

  return (
    <InfoPageLayout
      eyebrow="Legal & Compliance"
      title="Privacy Policy"
      description="Your data stays on your device. This policy explains, at an engineering level, how All-in-One Toolbox protects your privacy by design and complies with the EU GDPR and related data protection regulations."
      lastUpdated="May 22, 2026"
      lastUpdatedLabel="Last updated"
      backLabel="Back to home"
    >
      <InfoSection heading="1. Introduction">
        <p>
          All-in-One Toolbox (the "Site", "we", "us", reachable at{" "}
          <code>333654.xyz</code>) is a free suite of online productivity tools for a global audience, covering Word-to-PDF conversion, PDF merge &amp; split, image compression &amp; WebP conversion, and QR code generation.
        </p>
        <p>
          Privacy is non-negotiable. This document is not a marketing statement — it is an engineering-grade commitment to the lifecycle of your data, from the moment you open your browser tab to the instant you close it. We treat zero collection, zero retention, and zero tracking as architectural defaults rather than optional features.
        </p>
      </InfoSection>

      <InfoSection heading="2. Data Controller">
        <p>
          Pursuant to Article 4(7) of the EU General Data Protection Regulation (GDPR), the operator of this Site acts as the "data controller" for any minimal processing activity described herein. To exercise any data subject right, contact us at{" "}
          <a href="mailto:privacy@333654.xyz">privacy@333654.xyz</a>.
        </p>
      </InfoSection>

      <InfoSection heading="3. What We Collect (Spoiler: Almost Nothing)">
        <p>
          Guided by the strictest reading of the data minimization principle, we do <strong>not</strong> collect any of the following:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Names, emails, phone numbers, or any account-style identifiers (there is no sign-up system);</li>
          <li>The raw image, PDF, or Word document files you drop into our tools;</li>
          <li>Any string you type into the QR generator (URLs, text, Wi-Fi credentials, vCards);</li>
          <li>Cross-site browsing history or long-term behavioral profiles;</li>
          <li>Device fingerprints, Canvas fingerprints, WebGL fingerprints, or any tracking identifier.</li>
        </ul>
        <p className="mt-4">
          Our server keeps minimal operational logs (HTTP method, status code, hashed IP prefix, UTC timestamp) for at most 30 days, used exclusively for abuse mitigation and incident response. They are never joined with user profiles.
        </p>
      </InfoSection>

      <InfoSection heading="4. Client-Side Pure: Our Engineering Promise">
        <p>
          Three of our four tools (image compression, PDF merge &amp; split, QR generation) execute <strong>entirely inside your browser's memory</strong>. Your files never traverse our servers, nor any third-party object storage or CDN cache.
        </p>
        <InfoCallout tone="dark">
          <strong className="text-on-dark">How it works:</strong> Native browser primitives — <code>File API</code>, <code>Blob</code>, <code>Canvas API</code>, and the <code>WebAssembly</code> sandbox — let us perform 100% of the compute on the client. When you drop a file, it is read into the JavaScript heap, processed, and surfaced back via <code>URL.createObjectURL</code> as a local Blob for download. The entire lifecycle never touches the network. You can disconnect Wi-Fi and the tools still work.
        </InfoCallout>
        <p>
          Open your browser's DevTools Network panel and verify it yourself: after the initial page load, no upload request is ever issued. The behavior is auditable; the source is open.
        </p>
      </InfoSection>

      <InfoSection heading="5. Word to PDF: An Isolated, Memory-Only Backend Pipeline">
        <p>
          Browser-native parsing of <code>.docx</code> / <code>.doc</code> remains technically constrained. For this single tool we engineered a strict "<strong>memory-only isolation pipeline</strong>":
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>The file is streamed over HTTPS to a containerized Gotenberg rendering service as an in-memory binary stream;</li>
          <li>The server never writes the original Word file or the resulting PDF to disk — Python's <code>BytesIO</code> + <code>tempfile.SpooledTemporaryFile</code> ensure zero physical footprint;</li>
          <li>Each conversion is bounded by a 5-second hard timeout and a 5 MB file size cap, after which memory buffers are immediately released and the container is recycled;</li>
          <li>Sliding-window rate limiting allows at most 5 conversions per IP per minute;</li>
          <li>Filenames and file contents are not written to access logs — by design.</li>
        </ul>
        <p>
          In other words, even our own operators are architecturally prevented from peeking at your document. This is the "privilege-inaccessible" design philosophy.
        </p>
      </InfoSection>

      <InfoSection heading="6. Cookies &amp; Third-Party Services">
        <p>
          We do not set any first-party tracking cookies. To sustain the zero-cost free hosting model, the Site embeds <strong>Google AdSense</strong>, which writes third-party cookies to your browser to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Serve interest-based (personalized) advertising;</li>
          <li>Measure ad performance and frequency-cap impressions;</li>
          <li>Honor user consent under the IAB Transparency &amp; Consent Framework (TCF v2.2).</li>
        </ul>
        <p>
          If you are in the European Economic Area, the United Kingdom, or Switzerland, a Google-managed consent banner appears on your first visit, allowing you to accept all, reject all, or granularly customize. For the full taxonomy, see our{" "}
          <a href="cookie">Cookie Policy</a>.
        </p>
        <p>
          You can also visit{" "}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            Google Ad Settings
          </a>
          {" "}to globally opt out of personalized ads.
        </p>
      </InfoSection>

      <InfoSection heading="7. Data Retention">
        <p>
          Minimal server-side operational logs are auto-rotated after 30 days. All data produced by client-side tools is ephemeral, living only inside the browser's JavaScript heap, and is garbage-collected when you close the tab. There is no persistent dataset that could be turned into a "user profile".
        </p>
      </InfoSection>

      <InfoSection heading="8. Your GDPR Rights">
        <p>
          Even though we process minimal personal data, we explicitly recognize and uphold the following rights granted under GDPR Articles 12–22:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Right of access</strong> — to confirm whether we process personal data concerning you;</li>
          <li><strong>Right to rectification</strong> — to correct inaccurate data;</li>
          <li><strong>Right to erasure</strong> ("right to be forgotten");</li>
          <li><strong>Right to restriction of processing</strong>;</li>
          <li><strong>Right to data portability</strong> — to receive your data in a structured, machine-readable format;</li>
          <li><strong>Right to object</strong> — to object to processing based on legitimate interest;</li>
          <li><strong>Right to withdraw consent</strong> — for any cookie consent previously granted;</li>
          <li><strong>Right to lodge a complaint</strong> with your national data protection authority.</li>
        </ul>
        <p>
          To exercise any right, email{" "}
          <a href="mailto:privacy@333654.xyz">privacy@333654.xyz</a>. We respond within 30 calendar days.
        </p>
      </InfoSection>

      <InfoSection heading="9. International Data Transfers">
        <p>
          Site infrastructure is provisioned on cloud nodes located either in regions covered by an Article 45 GDPR adequacy decision or under signed Standard Contractual Clauses (SCCs). Google AdSense is operated by Google LLC (United States) under the EU-U.S. Data Privacy Framework.
        </p>
      </InfoSection>

      <InfoSection heading="10. Children's Privacy">
        <p>
          The Site is not directed to children under 13 (or the equivalent minimum age in your jurisdiction). We do not knowingly collect any personal data from children. Guardians who believe a child has shared information without their consent should contact us for immediate erasure.
        </p>
      </InfoSection>

      <InfoSection heading="11. Changes to This Policy">
        <p>
          Material revisions will be announced via an in-page banner and on the changelog page. The effective date at the top of this page always reflects the latest version. Continued use of the Site after such notification constitutes acceptance.
        </p>
      </InfoSection>

      <InfoSection heading="12. Contact">
        <p>
          Privacy inquiries: <a href="mailto:privacy@333654.xyz">privacy@333654.xyz</a>
          <br />
          General questions: <a href="mailto:hello@333654.xyz">hello@333654.xyz</a>
          <br />
          Technical &amp; open-source collaboration: open an issue via the GitHub link in the footer.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
