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
    ? "Cookie 政策 | All-in-One Toolbox"
    : "Cookie Policy | All-in-One Toolbox";
  const description = isZh
    ? "All-in-One Toolbox 的 Cookie 政策。我们自身不投放追踪 Cookie；本站仅使用 Google AdSense 第三方 Cookie 投放广告，符合 GDPR 与 IAB TCF v2.2。"
    : "Cookie Policy for All-in-One Toolbox. We set no first-party tracking cookies; only Google AdSense third-party cookies are used for advertising, in compliance with GDPR and IAB TCF v2.2.";

  return {
    title,
    description,
    keywords: isZh
      ? ["Cookie 政策", "GDPR", "AdSense", "第三方 Cookie", "用户同意", "All-in-One Toolbox"]
      : ["cookie policy", "gdpr", "adsense", "third-party cookies", "consent", "All-in-One Toolbox"],
    alternates: {
      canonical: `${BASE_URL}/${locale}/cookie`,
      languages: {
        "en-US": `${BASE_URL}/en/cookie`,
        "zh-CN": `${BASE_URL}/zh/cookie`,
      },
    },
    openGraph: {
      type: "article",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${BASE_URL}/${locale}/cookie`,
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

export default async function CookiePage({ params }: Props) {
  const { locale } = await params;
  const isZh = locale === "zh";

  if (isZh) {
    return (
      <InfoPageLayout
        eyebrow="法律与合规"
        title="Cookie 政策"
        description="本政策对本站使用 Cookie 及类似追踪技术的范围、目的与管理方式进行透明披露，符合欧盟 GDPR、ePrivacy 指令与 IAB Transparency & Consent Framework (TCF v2.2) 要求。"
        lastUpdated="2026 年 5 月 22 日"
        lastUpdatedLabel="最近更新"
        backLabel="返回主页"
      >
        <InfoSection heading="1. 什么是 Cookie？">
          <p>
            Cookie 是网站在您的浏览器中存储的一小段文本数据。它使站点能够"记住"您在多次访问之间的偏好、登录状态或浏览路径。除 Cookie 之外，<code>localStorage</code>、<code>sessionStorage</code>、<code>IndexedDB</code>、像素追踪与浏览器指纹也都属于本政策所覆盖的"类似技术"。
          </p>
        </InfoSection>

        <InfoSection heading="2. 我们自身不投放追踪 Cookie">
          <InfoCallout tone="dark">
            <strong className="text-on-dark">透明披露：</strong>{" "}
            All-in-One Toolbox 自身不在您的浏览器中写入任何第一方追踪 Cookie。
            您在使用本站工具时，所有数据均保留在浏览器本地——不存在跨页面行为记录、不存在转化追踪、不存在 A/B 实验分桶 Cookie。
          </InfoCallout>
        </InfoSection>

        <InfoSection heading="3. 我们使用的 Cookie 类别">
          <p>
            根据 ePrivacy 指令的分类法，本站涉及的 Cookie 仅落入下列两类：
          </p>

          <div className="mt-6 space-y-6">
            <div className="surface-card hairline rounded-lg p-6">
              <div className="caption-upper text-muted mb-2">类别 A · 严格必要</div>
              <h3 className="text-title-lg font-sans font-medium text-ink mb-3">站点功能性 Cookie</h3>
              <p className="text-body-md text-body leading-relaxed">
                即您此刻读取的页面所必需的、用于维持基础导航与安全性的会话级标识。
                例如：CSRF Token、负载均衡器粘性会话、Next.js 路由 RSC Payload 缓存。
                它们均为会话级，关闭浏览器后自动清除，且根据 GDPR 第 6(1)(f) 条无需获得明示同意。
              </p>
            </div>

            <div className="surface-card hairline rounded-lg p-6">
              <div className="caption-upper text-muted mb-2">类别 B · 广告投放</div>
              <h3 className="text-title-lg font-sans font-medium text-ink mb-3">Google AdSense 第三方 Cookie</h3>
              <p className="text-body-md text-body leading-relaxed mb-3">
                本站为维持零服务器成本的免费运营，嵌入了 Google AdSense 广告组件。AdSense 会在您的浏览器中写入下列第三方 Cookie：
              </p>
              <ul className="list-disc pl-6 space-y-1 text-body-sm text-body">
                <li><code>__gads</code> / <code>__gpi</code>——广告频次控制与对话归因；</li>
                <li><code>IDE</code>（doubleclick.net）——衡量广告效果、防止重复展示；</li>
                <li><code>NID</code>（google.com）——存储用户广告偏好；</li>
                <li><code>FPGCLDC</code>——首方域聚合广告归因。</li>
              </ul>
              <p className="text-body-md text-body leading-relaxed mt-3">
                此类 Cookie 仅在您通过同意横幅明示授权后才会写入。如您在欧洲经济区、英国或瑞士首次访问本站，将首先看到 Google Funding Choices 同意管理平台 (CMP) 提供的横幅，可选择"全部接受"、"全部拒绝"或细粒度控制。
              </p>
            </div>
          </div>
        </InfoSection>

        <InfoSection heading="4. 法律依据">
          <p>
            根据 GDPR 第 6 条与 ePrivacy 指令第 5(3) 条：
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>类别 A 的功能性 Cookie 依据"合法利益" (Art. 6(1)(f)) 与"履行合同必要" (Art. 6(1)(b))；</li>
            <li>类别 B 的广告 Cookie 严格依据"用户明示同意" (Art. 6(1)(a) + Art. 7)；</li>
            <li>同意通过 IAB Transparency &amp; Consent Framework (TCF v2.2) 协议传递给广告生态系统；</li>
            <li>您可随时撤回同意，撤回不影响撤回前基于该同意所做处理的合法性。</li>
          </ul>
        </InfoSection>

        <InfoSection heading="5. 如何管理或撤回同意">
          <p>有多种方式可以让您随时收回对广告 Cookie 的同意：</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>本站内：</strong> 点击页脚的"Cookie 偏好"链接（如所在地区适用），将重新调起 Google Funding Choices 同意管理面板；
            </li>
            <li>
              <strong>Google 账户层级：</strong> 前往{" "}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
                Google 广告设置
              </a>
              {" "}全局关闭个性化广告（即便不在本站操作亦生效）；
            </li>
            <li>
              <strong>浏览器层级：</strong> 大多数主流浏览器允许您在设置中清除或屏蔽 Cookie。
              参考：
              <ul className="list-disc pl-6 mt-2 space-y-1 text-body-sm">
                <li>Chrome: 设置 → 隐私和安全 → Cookie 和其他网站数据；</li>
                <li>Safari: 偏好设置 → 隐私 → 管理网站数据；</li>
                <li>Firefox: 设置 → 隐私与安全 → Cookie 和站点数据；</li>
                <li>Edge: 设置 → Cookie 和站点权限。</li>
              </ul>
            </li>
            <li>
              <strong>行业级 opt-out：</strong> 通过{" "}
              <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer">
                Your Online Choices
              </a>
              （欧洲）或{" "}
              <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer">
                Digital Advertising Alliance
              </a>
              （美国）一键退出多个广告网络。
            </li>
          </ul>
          <p>
            如您完全屏蔽 AdSense Cookie，本站仍可正常使用全部四款工具——这不会影响您的功能体验，仅会让您看到非个性化广告。
          </p>
        </InfoSection>

        <InfoSection heading="6. Do Not Track（请勿追踪）">
          <p>
            部分浏览器支持 Do Not Track (DNT) HTTP 头。由于行业尚未就 DNT 形成统一执行标准，本站不依赖 DNT 头作为同意撤回的唯一依据，但我们承诺通过 TCF 协议透明地遵循您在同意面板中的选择，效果等同于 DNT。
          </p>
        </InfoSection>

        <InfoSection heading="7. 政策变更">
          <p>
            如未来本站使用的 Cookie 类别发生变化，我们将更新本页面并通过同意横幅重新请求您的授权。本页面顶部始终展示最新生效日期。
          </p>
        </InfoSection>

        <InfoSection heading="8. 联系我们">
          <p>
            如对本 Cookie 政策有任何疑问，可发送邮件至{" "}
            <a href="mailto:privacy@333654.xyz">privacy@333654.xyz</a>。
          </p>
        </InfoSection>
      </InfoPageLayout>
    );
  }

  return (
    <InfoPageLayout
      eyebrow="Legal & Compliance"
      title="Cookie Policy"
      description="This policy transparently discloses the scope, purpose, and management of cookies and similar tracking technologies used on this Site, in compliance with the EU GDPR, the ePrivacy Directive, and IAB Transparency & Consent Framework (TCF v2.2)."
      lastUpdated="May 22, 2026"
      lastUpdatedLabel="Last updated"
      backLabel="Back to home"
    >
      <InfoSection heading="1. What Is a Cookie?">
        <p>
          A cookie is a small piece of text stored by a website in your browser. It lets the site "remember" your preferences, login state, or navigation path across visits. Beyond classic cookies, <code>localStorage</code>, <code>sessionStorage</code>, <code>IndexedDB</code>, tracking pixels, and browser fingerprints are all "similar technologies" covered by this policy.
        </p>
      </InfoSection>

      <InfoSection heading="2. We Set No First-Party Tracking Cookies">
        <InfoCallout tone="dark">
          <strong className="text-on-dark">Transparent disclosure:</strong>{" "}
          All-in-One Toolbox itself writes no first-party tracking cookies into your browser. When you use our tools, all data stays local — there are no cross-page behavioral records, no conversion tracking, no A/B test bucketing cookies.
        </InfoCallout>
      </InfoSection>

      <InfoSection heading="3. Cookie Categories on This Site">
        <p>Under the ePrivacy Directive taxonomy, this Site involves only the following two categories:</p>

        <div className="mt-6 space-y-6">
          <div className="surface-card hairline rounded-lg p-6">
            <div className="caption-upper text-muted mb-2">Category A · Strictly Necessary</div>
            <h3 className="text-title-lg font-sans font-medium text-ink mb-3">Functional Cookies</h3>
            <p className="text-body-md text-body leading-relaxed">
              Session-level identifiers required to load the page you are reading right now and to keep navigation safe. Examples: CSRF tokens, load-balancer sticky-session IDs, and the Next.js RSC payload cache. They are session-scoped, expire when you close the browser, and do not require explicit consent under GDPR Art. 6(1)(f).
            </p>
          </div>

          <div className="surface-card hairline rounded-lg p-6">
            <div className="caption-upper text-muted mb-2">Category B · Advertising</div>
            <h3 className="text-title-lg font-sans font-medium text-ink mb-3">Google AdSense Third-Party Cookies</h3>
            <p className="text-body-md text-body leading-relaxed mb-3">
              To sustain the zero-cost free hosting model, the Site embeds Google AdSense. AdSense may write the following third-party cookies into your browser:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-body-sm text-body">
              <li><code>__gads</code> / <code>__gpi</code> — frequency capping and conversion attribution;</li>
              <li><code>IDE</code> (doubleclick.net) — measuring ad performance and preventing duplicate displays;</li>
              <li><code>NID</code> (google.com) — stores user ad preferences;</li>
              <li><code>FPGCLDC</code> — first-party domain aggregated ad attribution.</li>
            </ul>
            <p className="text-body-md text-body leading-relaxed mt-3">
              These cookies are written <strong>only after you have granted explicit consent</strong> through the banner. If you visit from the EEA, UK, or Switzerland, you will first see the Google Funding Choices Consent Management Platform (CMP) banner, where you can accept all, reject all, or fine-tune your choices.
            </p>
          </div>
        </div>
      </InfoSection>

      <InfoSection heading="4. Legal Basis">
        <p>Pursuant to GDPR Art. 6 and ePrivacy Directive Art. 5(3):</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Category A functional cookies rely on "legitimate interest" (Art. 6(1)(f)) and "performance of a contract" (Art. 6(1)(b));</li>
          <li>Category B advertising cookies strictly rely on "explicit consent" (Art. 6(1)(a) + Art. 7);</li>
          <li>Consent is propagated to the advertising ecosystem via the IAB TCF v2.2 protocol;</li>
          <li>You may withdraw consent at any time; withdrawal does not affect the lawfulness of processing performed before withdrawal.</li>
        </ul>
      </InfoSection>

      <InfoSection heading="5. Managing or Withdrawing Consent">
        <p>Multiple paths let you take back consent at any time:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>On this Site:</strong> click the "Cookie preferences" link in the footer (where applicable in your region) to re-open the Google Funding Choices consent panel;
          </li>
          <li>
            <strong>At the Google account level:</strong> visit{" "}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
              Google Ad Settings
            </a>
            {" "}to globally disable personalized advertising;
          </li>
          <li>
            <strong>At the browser level:</strong> most major browsers let you clear or block cookies in settings:
            <ul className="list-disc pl-6 mt-2 space-y-1 text-body-sm">
              <li>Chrome: Settings → Privacy and security → Cookies and other site data;</li>
              <li>Safari: Preferences → Privacy → Manage Website Data;</li>
              <li>Firefox: Settings → Privacy &amp; Security → Cookies and Site Data;</li>
              <li>Edge: Settings → Cookies and site permissions.</li>
            </ul>
          </li>
          <li>
            <strong>Industry-level opt-out:</strong> via{" "}
            <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer">
              Your Online Choices
            </a>
            {" "}(Europe) or{" "}
            <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer">
              Digital Advertising Alliance
            </a>
            {" "}(United States), one click opts out of multiple ad networks.
          </li>
        </ul>
        <p>
          If you fully block AdSense cookies, all four tools continue to work — you simply see non-personalized ads.
        </p>
      </InfoSection>

      <InfoSection heading="6. Do Not Track">
        <p>
          Some browsers support a Do Not Track (DNT) HTTP header. Because the industry has not adopted a uniform DNT enforcement standard, we do not rely on DNT as the sole signal of consent withdrawal. We do, however, transparently honor your choices made through the TCF consent panel, which achieves the same effect as DNT.
        </p>
      </InfoSection>

      <InfoSection heading="7. Updates to This Policy">
        <p>
          If the cookie categories used on this Site change, we will update this page and re-request your authorization via the consent banner. The effective date at the top of this page reflects the latest revision.
        </p>
      </InfoSection>

      <InfoSection heading="8. Contact">
        <p>
          For any question regarding this Cookie Policy, email{" "}
          <a href="mailto:privacy@333654.xyz">privacy@333654.xyz</a>.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
