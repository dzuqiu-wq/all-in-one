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
    ? "服务条款 | All-in-One Toolbox"
    : "Terms of Service | All-in-One Toolbox";
  const description = isZh
    ? "All-in-One Toolbox 的服务条款。免费使用、按现状提供、不对处理结果做商业担保。详尽规定可接受使用方式、知识产权与免责声明。"
    : "Terms of Service for All-in-One Toolbox. Free to use, provided 'as is', with no commercial warranty for output accuracy. Detailed acceptable use, IP, and liability provisions.";

  return {
    title,
    description,
    keywords: isZh
      ? ["服务条款", "使用协议", "免责声明", "知识产权", "All-in-One Toolbox"]
      : ["terms of service", "terms of use", "disclaimer", "intellectual property", "All-in-One Toolbox"],
    alternates: {
      canonical: `${BASE_URL}/${locale}/terms`,
      languages: {
        "en-US": `${BASE_URL}/en/terms`,
        "zh-CN": `${BASE_URL}/zh/terms`,
      },
    },
    openGraph: {
      type: "article",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${BASE_URL}/${locale}/terms`,
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

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";

  if (isZh) {
    return (
      <InfoPageLayout
        eyebrow="法律与合规"
        title="服务条款"
        description="本条款约定了您与 All-in-One Toolbox 之间关于使用本站工具的权利、义务与责任划分。请在使用前仔细阅读。"
        lastUpdated="2026 年 5 月 22 日"
        lastUpdatedLabel="最近更新"
        backLabel="返回主页"
      >
        <InfoSection heading="1. 条款接受">
          <p>
            访问或使用 All-in-One Toolbox（域名 <code>333654.xyz</code>，以下简称"本站"或"我们"）即表示您（"用户"或"您"）已阅读、理解并同意受本服务条款（"本条款"）以及{" "}
            <a href="privacy">隐私政策</a>、<a href="cookie">Cookie 政策</a>{" "}
            的约束。如您不同意，请立即停止访问并关闭本站。
          </p>
          <p>
            如您代表企业、组织或其他法律实体使用本站，则您声明并保证自己拥有以该实体名义接受本条款的合法授权。
          </p>
        </InfoSection>

        <InfoSection heading="2. 服务描述">
          <p>
            本站为您免费提供以下基于浏览器的效率工具（合称"服务"）：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Word ↔ PDF 转换</strong>：基于服务器端 LibreOffice/Gotenberg 内存隔离管道；</li>
            <li><strong>PDF 合并与拆分</strong>：基于 <code>pdf-lib</code> 的纯浏览器端处理；</li>
            <li><strong>图片无损压缩与 WebP 转换</strong>：基于 Canvas API + Web Worker；</li>
            <li><strong>二维码生成</strong>：基于 <code>qrcode.react</code> 客户端渲染。</li>
          </ul>
          <p>
            服务的具体功能、参数限制及实现细节，请参阅各工具页面与 <a href="docs">开发文档</a>。
          </p>
        </InfoSection>

        <InfoSection heading="3. 免费使用">
          <p>
            本站对个人与商业用户均完全免费开放，<strong>无需注册账户</strong>。我们通过页面内的非侵入式 Google AdSense 广告维持基础设施运营成本，您并未为此付费。
          </p>
          <p>
            我们保留在未来调整广告位、新增高级功能或对滥用流量进行限速的权利，但承诺四款核心工具的基础能力将始终保持免费。
          </p>
        </InfoSection>

        <InfoSection heading="4. 可接受使用规范">
          <p>使用本站服务时，您同意<strong>不</strong>从事以下行为：</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>处理任何含有非法内容（包括但不限于儿童性剥削材料、暴力恐怖主义内容、未经授权的版权作品）的文件；</li>
            <li>使用本站工具生成欺诈性二维码、钓鱼链接或恶意软件分发载荷；</li>
            <li>对 Word 转 PDF 接口发起超过限速规则的批量请求，或绕过频率限制；</li>
            <li>通过自动化脚本、爬虫、无头浏览器对本站进行大规模、非交互式访问；</li>
            <li>对本站源代码、API 或基础设施进行未经授权的逆向工程、渗透测试或拒绝服务攻击；</li>
            <li>移除、篡改或遮蔽 AdSense 广告位（违反 Google AdSense 政策）；</li>
            <li>以本站名义实施任何虚假陈述、商标侵权或不正当竞争行为。</li>
          </ul>
          <p>
            如发现以上违规行为，我们保留即时中断服务、永久封禁来源 IP 段并向有关执法机关报告的权利。
          </p>
        </InfoSection>

        <InfoSection heading="5. 重要免责声明：按现状提供，无商业担保">
          <InfoCallout tone="warning">
            <strong>请认真阅读本条款。</strong>
            本站服务以"按现状" (AS IS) 与"按可用性" (AS AVAILABLE) 形式提供。
            我们不对处理结果的<strong>绝对准确性、完整性、连续可用性</strong>做任何形式的明示或默示商业担保，
            包括但不限于适销性、特定用途适用性与非侵权性的默示担保。
          </InfoCallout>
          <p>
            具体而言，您理解并接受以下事实：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Word 转 PDF</strong> 的渲染结果可能受 LibreOffice 字体回退、宏剥离、复杂版式重排等因素影响，与原始 Word 文档可能存在视觉差异；
            </li>
            <li>
              <strong>图片压缩</strong> 是有损过程（除非选择 PNG 无损），不同质量参数下文件可能出现可感知的视觉伪影；
            </li>
            <li>
              <strong>PDF 合并与拆分</strong> 对 PDF 1.7 之后版本中包含的高级特性（如 XFA 表单、动态签名）支持有限；
            </li>
            <li>
              <strong>二维码</strong> 扫描兼容性取决于扫描设备型号、纠错级别选择与色彩对比度，部分组合可能影响识别成功率。
            </li>
          </ul>
          <p>
            如您将本站输出用于法律、医疗、金融、出版等高准确性要求场景，<strong>必须自行进行二次校对</strong>。本站不为因依赖输出结果而产生的任何后果负责。
          </p>
        </InfoSection>

        <InfoSection heading="6. 责任限制">
          <p>
            在适用法律允许的最大范围内，本站及其运营者、贡献者、关联方在任何情况下均不对因使用或无法使用服务而产生的任何间接、附带、特殊、惩罚性或后果性损害（包括但不限于利润损失、数据丢失、业务中断、商誉损失）承担责任，即使我们已被告知此类损害的可能性。
          </p>
          <p>
            在适用法律允许的最大范围内，我们对您因任何原因主张的全部累计赔偿责任不超过 100 美元或您过去 12 个月内向本站实际支付的金额（孰高者，且对免费用户为前者）。
          </p>
        </InfoSection>

        <InfoSection heading="7. 知识产权">
          <p>
            本站前端代码与文档以 <strong>MIT 协议</strong>开源（请参阅页脚 GitHub 链接）。您可在遵守 MIT 协议条件下自由复制、修改、分发本站源代码。
          </p>
          <p>
            "All-in-One Toolbox" 名称、Logo（Anthropic 风格 Spike Mark 衍生设计）及网站整体视觉系统受版权与商标法保护，未经书面许可不得用于商业用途。
          </p>
          <p>
            您通过本站处理的任何文件（图片、PDF、Word 文档）的所有权与知识产权完全归属于您。我们对您的文件不主张任何权利，也不保留任何副本。
          </p>
        </InfoSection>

        <InfoSection heading="8. 第三方服务">
          <p>
            本站集成了 Google AdSense 广告服务，您与广告服务方之间的关系受 Google 自身条款约束。我们对广告内容、链接目标网站或您与广告主之间的任何交易概不负责。
          </p>
        </InfoSection>

        <InfoSection heading="9. 服务变更与终止">
          <p>
            我们保留随时修改、暂停或终止部分或全部服务的权利，恕不另行通知。我们将尽力通过更新日志、页脚公告等渠道同步重大变更，但不保证所有变更均会预先告知。
          </p>
          <p>
            违反本条款者将立即丧失使用本站服务的资格，且无需另行通知。
          </p>
        </InfoSection>

        <InfoSection heading="10. 适用法律与争议解决">
          <p>
            本条款的解释、效力与争议解决适用<strong>中华人民共和国大陆地区</strong>法律（不含冲突法规则）。
            因本条款引起或与之相关的任何争议，应首先通过友好协商解决；
            协商不成的，提交本站运营者所在地有管辖权的人民法院诉讼解决。
          </p>
          <p>
            如您所在司法管辖区的强制性消费者保护法另有规定（如欧盟消费者保护指令），将不影响您据此享有的强制性权利。
          </p>
        </InfoSection>

        <InfoSection heading="11. 其他">
          <p>
            如本条款任一条款被认定为无效或不可执行，其余条款仍保持完全效力。本条款构成您与本站之间就本站服务的完整协议，取代之前的任何口头或书面协议。
          </p>
        </InfoSection>
      </InfoPageLayout>
    );
  }

  return (
    <InfoPageLayout
      eyebrow="Legal & Compliance"
      title="Terms of Service"
      description="These Terms govern the relationship between you and All-in-One Toolbox concerning your use of the Site's tools. Please read carefully before using the service."
      lastUpdated="May 22, 2026"
      lastUpdatedLabel="Last updated"
      backLabel="Back to home"
    >
      <InfoSection heading="1. Acceptance of Terms">
        <p>
          By accessing or using All-in-One Toolbox (the "Site", reachable at{" "}
          <code>333654.xyz</code>), you ("User" or "you") acknowledge that you have read, understood, and agreed to be bound by these Terms of Service (the "Terms"), the{" "}
          <a href="privacy">Privacy Policy</a>, and the <a href="cookie">Cookie Policy</a>. If you do not agree, you must immediately stop accessing and close the Site.
        </p>
        <p>
          If you use the Site on behalf of a company, organization, or other legal entity, you represent and warrant that you are authorized to accept these Terms on its behalf.
        </p>
      </InfoSection>

      <InfoSection heading="2. Description of Service">
        <p>
          The Site provides the following browser-based productivity tools at no charge (collectively, the "Service"):
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Word ↔ PDF conversion</strong> — backed by a server-side LibreOffice/Gotenberg memory-isolation pipeline;</li>
          <li><strong>PDF merge &amp; split</strong> — performed entirely in the browser via <code>pdf-lib</code>;</li>
          <li><strong>Image compression and WebP conversion</strong> — using the Canvas API and Web Workers;</li>
          <li><strong>QR code generation</strong> — rendered client-side with <code>qrcode.react</code>.</li>
        </ul>
        <p>
          Detailed parameters, limits, and implementation notes are described on each tool page and in our{" "}
          <a href="docs">Developer Documentation</a>.
        </p>
      </InfoSection>

      <InfoSection heading="3. Free Use">
        <p>
          The Service is offered free of charge to both personal and commercial users. <strong>No account or sign-up is required.</strong> We sustain hosting costs through non-intrusive Google AdSense placements; you pay nothing.
        </p>
        <p>
          We reserve the right to adjust ad slots, introduce optional advanced features, or rate-limit abusive traffic. However, we commit to keeping the four core tools' baseline capabilities free forever.
        </p>
      </InfoSection>

      <InfoSection heading="4. Acceptable Use">
        <p>While using the Service, you agree <strong>not</strong> to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Process any file containing illegal content (including, but not limited to, child sexual exploitation material, terrorist content, or unauthorized copyrighted works);</li>
          <li>Generate fraudulent QR codes, phishing links, or malware-distribution payloads;</li>
          <li>Issue Word-to-PDF requests beyond the published rate-limits, or attempt to evade rate limits;</li>
          <li>Access the Site via automated scripts, scrapers, or headless browsers at non-interactive scale;</li>
          <li>Reverse engineer, penetration-test, or launch denial-of-service attacks against the Site or its infrastructure without prior written authorization;</li>
          <li>Remove, alter, or obscure AdSense placements (a violation of Google AdSense policy);</li>
          <li>Engage in misrepresentation, trademark infringement, or unfair competition using the Site's identity.</li>
        </ul>
        <p>
          We reserve the right to immediately terminate access, permanently block originating IP ranges, and report violations to competent authorities.
        </p>
      </InfoSection>

      <InfoSection heading="5. Important Disclaimer: As-Is, No Commercial Warranty">
        <InfoCallout tone="warning">
          <strong>Please read carefully.</strong> The Service is provided strictly on an "AS IS" and "AS AVAILABLE" basis. We make no express or implied commercial warranty regarding the <strong>absolute accuracy, completeness, or continuous availability</strong> of any output, including (without limitation) the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
        </InfoCallout>
        <p>Specifically, you acknowledge and accept that:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Word-to-PDF</strong> rendering may diverge from the source document due to LibreOffice font fallback, macro stripping, or complex layout reflow;
          </li>
          <li>
            <strong>Image compression</strong> is lossy by default (PNG offers lossless); aggressive quality settings may introduce perceptible artifacts;
          </li>
          <li>
            <strong>PDF merge &amp; split</strong> support for post-PDF 1.7 advanced features (XFA forms, dynamic signatures) is intentionally limited;
          </li>
          <li>
            <strong>QR code</strong> scannability depends on the scanner device, chosen error-correction level, and color contrast — some combinations may reduce recognition rate.
          </li>
        </ul>
        <p>
          If you intend to use any output in legal, medical, financial, or publishing contexts where accuracy is critical, <strong>you must independently verify the result</strong>. The Site assumes no responsibility for consequences resulting from reliance on its output.
        </p>
      </InfoSection>

      <InfoSection heading="6. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, in no event shall the Site, its operators, contributors, or affiliates be liable for any indirect, incidental, special, punitive, or consequential damages (including lost profits, data loss, business interruption, or goodwill damage) arising from or related to your use of, or inability to use, the Service — even if advised of the possibility of such damages.
        </p>
        <p>
          To the maximum extent permitted by applicable law, our aggregate liability for any claim, regardless of cause, shall not exceed the greater of USD 100 or the amount you have actually paid us in the preceding 12 months (which, for free users, is the former).
        </p>
      </InfoSection>

      <InfoSection heading="7. Intellectual Property">
        <p>
          The Site's frontend source code and documentation are released under the <strong>MIT License</strong> (see the GitHub link in the footer). You may freely copy, modify, and redistribute the source code under the MIT terms.
        </p>
        <p>
          The name "All-in-One Toolbox", the logo (a derivative spike-mark visual inspired by Anthropic's brand), and the overall site visual system remain protected by copyright and trademark law and may not be used commercially without prior written permission.
        </p>
        <p>
          You retain full ownership and intellectual property rights over any file (image, PDF, Word document) you process via the Site. We claim no rights to your files and keep no copies.
        </p>
      </InfoSection>

      <InfoSection heading="8. Third-Party Services">
        <p>
          The Site integrates Google AdSense. Your relationship with that advertising provider is governed by Google's own terms. We are not responsible for ad creatives, landing pages, or any transaction you may enter into with an advertiser.
        </p>
      </InfoSection>

      <InfoSection heading="9. Changes and Termination">
        <p>
          We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice. We will make reasonable effort to communicate material changes via the changelog page and in-page notices, but cannot guarantee advance notification for all changes.
        </p>
        <p>
          Violators of these Terms forfeit access immediately and without further notice.
        </p>
      </InfoSection>

      <InfoSection heading="10. Governing Law and Dispute Resolution">
        <p>
          These Terms are governed by and construed under the laws of <strong>the People's Republic of China (mainland)</strong>, excluding conflict-of-law rules. Any dispute arising out of or relating to these Terms shall first be resolved through good-faith negotiation; failing that, the dispute shall be submitted to the courts having jurisdiction at the operator's place of business.
        </p>
        <p>
          If your jurisdiction provides mandatory consumer-protection rights (such as those in the EU Consumer Rights Directive), those mandatory rights remain unaffected by this clause.
        </p>
      </InfoSection>

      <InfoSection heading="11. Miscellaneous">
        <p>
          If any provision of these Terms is held invalid or unenforceable, the remaining provisions remain in full force and effect. These Terms constitute the entire agreement between you and the Site regarding the Service and supersede all prior oral or written agreements.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
