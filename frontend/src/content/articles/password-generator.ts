import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · CSPRNG-BACKED PASSWORDS",
  title:
    "Passwords in 2026: CSPRNG, not Math.random; length, not complexity; managers, not memory",
  lead:
    "A password is a single number sampled from a probability distribution. If the sampler is biased, the password is guessable. If the distribution is too small, the password is guessable. Everything else — character classes, the @-symbol mandate, the 90-day rotation policy your IT department still enforces — is decoration on top of those two facts. This page is the contract behind our generator: which RNG we call, how we count entropy, why length dominates complexity, and which folk-wisdom we deliberately ignore.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "Password guidance has churned through three eras: the 1980s NIST era of \"complexity rules\", the 2010s reaction (\"length over complexity, drop the rotation\"), and the current era (\"use a manager, generate per-site secrets, MFA the rest\"). The current era is codified in NIST SP 800-63B, OWASP ASVS v4.0, and FIDO's passkey roadmap. Our generator sits inside that consensus.",
      subsections: [
        {
          heading: "NIST SP 800-63B — what changed and why it matters",
          paragraphs: [
            "NIST Special Publication 800-63B (Digital Identity Guidelines, Authentication & Lifecycle Management) is the document that ended the 1980s era. It explicitly retired three rules that organisations spent decades enforcing. First, mandatory periodic rotation is gone: rotate only on evidence of compromise. Second, mandatory mixed character classes are gone: a 16-character all-lowercase phrase is acceptable. Third, password hints and knowledge-based recovery (\"mother's maiden name\") are gone: they are weaker than the password itself.",
            "What replaced them is a memorised-secret length floor (8 characters minimum, 64 maximum allowed), a screening requirement against known-breached corpora (have-i-been-pwned, the NCSC's top-100k list), and a CSPRNG requirement for system-generated secrets. Section 5.1.1.2 mandates that any password chosen by the verifier itself must be generated with \"an approved random bit generator\". In browser terms that means `crypto.getRandomValues`, not `Math.random`.",
            "OWASP ASVS v4.0 (Section 2 — Authentication) layers on top: minimum 12 characters for any new account, breached-password check on every set/reset, no composition rules, no truncation, MFA on every authoritative login. Both documents converge on the same operating model: humans should not be inventing passwords; software should be generating them.",
          ],
        },
        {
          heading: "Where generated passwords actually show up",
          paragraphs: [
            "Five workflows account for almost every legitimate use of a generator like this one.",
            "First, per-site account credentials stored in a password manager (1Password, Bitwarden, KeePassXC, the browser keychain). The manager fills the login field; the human never types or memorises the password. Length is whatever the site accepts up to its truncation limit — we recommend 20+ for ordinary accounts and 32+ for anything financial or administrative.",
            "Second, machine-to-machine credentials: API tokens, database passwords, service account secrets, deploy keys. These never face a human keyboard, so the only constraint is the consumer's parser. 32-character mixed alphabets are the working default; 64-character is fine when the consumer accepts it.",
            "Third, root recovery codes and break-glass credentials — the password to the password manager itself, the offline TOTP backup, the cold-storage seed phrase encryption. These are the irreplaceable secrets. Length should be 32+; they should be written down on paper and stored physically (a safe, a bank deposit box, split with Shamir's Secret Sharing across geographically separate locations).",
            "Fourth, one-shot tokens: a temporary share link, a single-use device-pairing code, an invite token. The length floor is dictated by how many tokens you generate per second multiplied by how long they remain valid. 16 characters at the full 88-symbol alphabet is roughly 103 bits of entropy — comfortably above the 128-bit equivalent floor once you account for the limited validity window.",
            "Fifth, generated salts and nonces for cryptographic protocols. Strictly speaking these are not passwords — they are public, but they have to be unique and unpredictable. The same CSPRNG that backs this tool is the right source. The output is then fed directly to the protocol; never base64-and-eyeball them as if they were credentials.",
          ],
        },
        {
          heading: "The case against composition rules",
          paragraphs: [
            "\"Must contain at least one uppercase, one digit, and one symbol\" is the rule most enterprises still enforce. NIST removed it deliberately. The reason is statistical: composition rules narrow the search space rather than widening it. An attacker running a guessing campaign skips passwords that violate the rules; once you mandate one symbol, the attacker stops trying purely alphabetic candidates, which were uniformly distributed and therefore plentiful.",
            "Worse, humans satisfy composition rules predictably. The mandatory uppercase goes at the start; the mandatory digit goes at the end; the mandatory symbol is `!`. `Password1!` and `Welcome2024!` are the canonical examples, and they are at the top of every cracking dictionary because the entire population of humans subject to the rule produces them.",
            "Our generator exposes character classes as toggles, not mandates. A 20-character all-lowercase password from our CSPRNG carries `20 * log2(26) ≈ 94 bits` of entropy, which is well above the 80-bit floor most threat models require. If your verifier insists on composition rules, enable all four classes and accept that you are paying a small entropy tax for compliance theatre.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "Our implementation is a 20-line TypeScript function on top of `crypto.getRandomValues`. The interesting engineering is in what could go wrong if you wrote it wrong — and how the platform protects you when you write it right.",
      subsections: [
        {
          heading: "Step 1 — `crypto.getRandomValues` is the only acceptable source",
          paragraphs: [
            "`crypto.getRandomValues(typedArray)` is the browser's CSPRNG (cryptographically-secure pseudo-random number generator). It is spec'd by W3C WebCryptoAPI, implemented by every major browser as a thin wrapper over the OS RNG (`getrandom(2)` on Linux, `BCryptGenRandom` on Windows, `SecRandomCopyBytes` on macOS/iOS), and seeded from kernel entropy that pools hardware events, interrupt timing, and (on modern CPUs) the `RDRAND`/`RDSEED` instructions.",
            "`Math.random` is the wrong primitive. Its specification only requires \"uniformly distributed numbers in [0, 1)\"; the algorithm is implementation-defined, historically Xorshift128+ in V8 and Mulberry32 in earlier engines, and explicitly not cryptographically secure. The internal state is recoverable from a handful of consecutive outputs. Using `Math.random` to generate passwords is a CVE-class mistake; in 2017 a popular npm library shipped this bug and produced reversible session tokens for two years before anyone noticed.",
            "Our generator allocates a `Uint32Array` of length N, calls `crypto.getRandomValues(arr)` to fill it with 32 bits of CSPRNG output per slot, then reduces each 32-bit word modulo the alphabet size to pick a character. The modulo introduces a microscopic bias (because 2^32 is not a multiple of, say, 88), but for password generation it is undetectable — the bias is below 2^-25, which means the most-favoured character is roughly 1.00000003x more likely than the least-favoured. Reject-sampling would eliminate even that, at the cost of more code; we judged it not worth it for this surface.",
          ],
        },
        {
          heading: "Step 2 — Shannon entropy is the only sensible strength metric",
          paragraphs: [
            "A password's strength against an offline guessing attack is its Shannon entropy: `H = length * log2(alphabet_size)`. A 20-character password drawn uniformly from a 72-symbol alphabet (lowercase + uppercase + digits + 10 symbols) carries `20 * log2(72) ≈ 123 bits`. A 12-character password from the same alphabet carries `74 bits`. The 74-bit password is breakable on a single GPU rig in under a year; the 123-bit password is unbreakable on any plausible adversary's budget until at least 2050.",
            "Our strength meter buckets entropy into three bands: under 40 bits is \"weak\" (breakable in seconds-to-hours on a botnet), 40 to 80 bits is \"medium\" (depends entirely on the attacker's hashing budget — fine if the verifier uses Argon2id, broken if the verifier uses raw SHA-256), and 80 bits and up is \"strong\". The 80-bit boundary is conservative; NIST treats 80 bits as the floor for memorised secrets in non-classified systems, and it is what every commodity password-cracking benchmark uses as \"computationally infeasible to brute-force\".",
            "We do not award entropy bonuses for \"contains a dictionary word\" or deductions for \"three vowels in a row\". Those heuristics make sense for *human-chosen* passwords (\"password123\" looks 11 characters long but carries about 13 bits, not 64) but make no sense for CSPRNG output, where every character is independent of every other and the entropy formula is exact.",
          ],
        },
        {
          heading: "Step 3 — Why length dominates complexity",
          paragraphs: [
            "The arithmetic is direct. Doubling the alphabet adds `log2(2) = 1 bit` per character to the entropy. Doubling the length doubles the entropy. So adding one character of length to a lowercase password (`+log2(26) = 4.7 bits`) is worth more than switching from lowercase-only to all-94-printable-ASCII (`+log2(94/26) = 1.85 bits per character`) only when the password is shorter than 2.5 characters — i.e. never.",
            "Spelled out: a 16-character lowercase password has `16 * log2(26) ≈ 75 bits`. An 8-character full-alphabet password has `8 * log2(94) ≈ 52 bits`. The 16-character all-lowercase is over 8 million times harder to brute-force than the 8-character mixed-case-with-symbols version that satisfies a composition rule.",
            "This is why our default length is 20 and our slider goes to 64. The cost of generating a 64-character password is the same as a 20-character one (microseconds either way). The cost of *typing* it is irrelevant when a password manager fills it. The only constraint is the verifier's maximum length; some legacy systems still cap at 16. When that happens, we are entropy-bound by the cap and have no choice but to use the full alphabet.",
          ],
        },
        {
          heading: "Step 4 — The symbol alphabet is a compromise",
          paragraphs: [
            "Our symbol set is `!@#$%^&*()-_=+[]{};:,.<>?/~` — 28 ASCII symbols, deliberately excluding `\\`, backtick, quotes, and whitespace. The exclusions are not aesthetic: `\\` is a path separator that some shell-script consumers misinterpret; backtick is a command-substitution character in shells; quotes have to be escaped when the password is pasted into SQL, JSON, or shell strings; whitespace is silently trimmed by some web forms.",
            "If you generate a password that will be typed into a system you do not control (a router admin panel, an embedded device, a legacy Java app), prefer the alphanumeric subset. Our toggle for symbols is independent of the other classes precisely so you can disable it without losing the rest.",
          ],
        },
        {
          heading: "Step 5 — Nothing leaves the browser tab",
          paragraphs: [
            "Generation happens inside the engine instance that loaded this page. The CSPRNG buffer is allocated in JS heap memory and discarded as soon as the function returns; the resulting string sits in component state and is garbage-collected when you navigate away or close the tab. There is no `fetch` call, no analytics event, no `localStorage` write, no Service Worker cache.",
            "This is structurally important: a password generator that round-trips through a server is a password generator the server can log. Our infrastructure has no endpoint that could receive a generated password, no request handler that could intercept one, and no logging surface that could record one. The trust boundary is the browser tab; everything inside it is yours.",
          ],
        },
        {
          heading: "Step 6 — What this tool deliberately does not do",
          paragraphs: [
            "We do not generate \"pronounceable\" or \"memorable\" passwords (Diceware-style word lists are a different surface; we may add one). We do not generate passphrases. We do not store passwords. We do not check against breached-password corpora (the integration is feasible — `k-anonymity` queries against `api.pwnedpasswords.com` only leak the first 5 hex digits of a SHA-1 — but it crosses the network and changes the trust model, so we did not ship it on this page).",
            "We also do not generate ECC keypairs, JWT secrets, or session tokens. Those need format-aware generators (PEM, base64url with specific length) that this tool intentionally omits. If you need a JWT signing secret, generate raw bytes with a separate tool and feed them through your library; do not paste a password into a `process.env.JWT_SECRET` slot.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Most password issues are not generator bugs — they are consumer constraints (length caps, banned characters, encoding quirks) or operational habits (\"I'll memorise this one\"). The fixes are short.",
      subsections: [
        {
          heading: "\"The site rejected my generated password\"",
          paragraphs: [
            "Three causes account for nearly all rejections. First, length cap: the site silently truncates input beyond, say, 16 characters, and your 20-character password gets cut to 16 before the hash is computed. If you ever see \"password too long\", you are on a legacy stack — generate at the cap and move on. Worse, if the truncation is silent (no error), your first login succeeds with the full 20 characters but your subsequent logins fail because the hash was computed on 16. Generate at the cap from the start.",
            "Second, banned characters: some forms reject `<`, `>`, `&`, or single quotes because the back-end never learned about prepared statements. Disable the symbols toggle and regenerate with alphanumeric-only.",
            "Third, copy-paste corruption: copying from a terminal can pick up a trailing space or newline; pasting into a password field that strips whitespace then fails on the round-trip. Use the Copy button in this tool — it sends the raw string to the clipboard with no trailing characters.",
          ],
        },
        {
          heading: "\"How long is long enough?\"",
          paragraphs: [
            "Threat-model the verifier. If the back-end uses Argon2id, bcrypt, or scrypt with appropriate cost parameters, the attacker's offline guess budget is roughly `10^8` guesses per second per GPU. A 64-bit-entropy password (`12 chars * log2(72)`) takes `2^64 / 10^8 ≈ 5,800 years` of single-GPU time — comfortably safe.",
            "If the back-end uses raw SHA-256 (which it should not, but legacy systems do), the budget jumps to `10^10` per second per GPU. The same password is now breakable in 58 years on one GPU, or 21 days on a 1000-GPU cluster. You need 80 bits of entropy minimum (`14 chars at 72-symbol alphabet`, or `17 chars lowercase`) to stay safe against that adversary.",
            "If the password protects an offline encrypted blob (a password manager vault, an LUKS volume, a PGP private key), the attacker has unlimited budget — bounded only by hardware. 128 bits is the floor; we recommend 192+ bits for anything irreplaceable. That is a 30-character password from the full 88-symbol alphabet, or a 6-word Diceware phrase from a 7776-word list.",
          ],
        },
        {
          heading: "\"I want to memorise it\"",
          paragraphs: [
            "Then this is the wrong tool. CSPRNG output is by construction unmemorable — the whole point of randomness is that the next character is uncorrelated with the previous one. If you have to memorise, use a Diceware-style passphrase: 4 to 6 words drawn from a standard word list (the EFF Long List is 7776 words = 12.9 bits per word). Six words is 77.4 bits of entropy, comparable to a 16-character lowercase password from this tool.",
            "The strategic answer is: memorise exactly one password — the master password to a password manager — and let the manager generate and remember every per-site secret. The master password should be 6+ Diceware words, never reused, and protected by an MFA second factor at the manager itself.",
          ],
        },
        {
          heading: "\"The same options give me a different password every time — is that wrong?\"",
          paragraphs: [
            "That is exactly correct, and it is the defining property of the tool. A deterministic password generator (where the same input always produces the same output) is a *key-derivation function*, not a password generator — and KDFs are the wrong primitive for credentials, because the same input must never be allowed to produce the same credential twice.",
            "If you generate two passwords with the same length and character classes and they were equal, the CSPRNG would be broken. The randomness budget per 20-character generation is roughly `20 * 5.5 ≈ 110 bits`; the chance of two collisions is `1 / 2^110` — astronomically lower than the chance of a hardware-level cosmic-ray bit flip.",
          ],
        },
        {
          heading: "\"Can I trust this on my employer's laptop?\"",
          paragraphs: [
            "Probably, with a caveat. The generator itself never leaves the page, so a passive network monitor cannot see the output. But your employer may run endpoint monitoring (DLP, EDR) that records clipboard content, screenshots periodically, or hooks the keyboard. Pasting a generated password into a form may be recorded by those agents.",
            "For high-value secrets — a recovery code, a personal master password — do not generate them on a managed device. Use a personal laptop or a public-but-trusted device (a library kiosk with a fresh Tor Browser session is, perversely, a strong choice). The CSPRNG itself is identical across devices; the trust boundary is the operating system underneath it.",
          ],
        },
        {
          heading: "Best-practice checklist before relying on a generated password",
          paragraphs: [
            "Five habits that prevent almost every password-related incident.",
          ],
        },
      ],
      bullets: [
        "Use a password manager — generate, store, autofill. Never memorise more than the one master password.",
        "Aim for 20 characters minimum on ordinary accounts; 32+ on financial or administrative accounts; 64 when the verifier accepts it.",
        "Turn on multi-factor authentication. A 12-bit TOTP code on top of a 80-bit password is stronger than a 128-bit password alone — second factors compose multiplicatively.",
        "Never reuse a password across sites. Reuse is the single largest cause of credential-stuffing breaches; per-site secrets contain the blast radius to one site.",
        "Rotate only on evidence of compromise. Scheduled rotation produces weaker passwords (humans pick patterns) and does not defeat a working adversary, who exfiltrates within hours.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · CSPRNG 驱动的密码",
  title:
    "2026 年的密码：用 CSPRNG，不要 Math.random；拼长度，不拼复杂度；用密码管理器，不靠脑子",
  lead:
    "一个密码就是从某个概率分布中采样出来的一个数字。如果采样器有偏，密码就可猜；如果分布太小，密码就可猜。其他一切 —— 字符类别要求、必须包含 @、IT 部门还在执行的 90 天轮换 —— 都是建立在这两条事实之上的装饰。本页就是这款生成器背后的契约：我们调用哪一个 RNG、我们怎么算熵、为什么长度压倒复杂度、以及我们刻意忽略哪些「江湖经验」。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "密码学指导经历了三个时代：1980 年代 NIST 的「复杂度规则」时代、2010 年代的反向修正（「长度优先、放弃轮换」）、以及当前的时代（「用密码管理器、为每个站点生成、其它一切走 MFA」）。当前时代被编入 NIST SP 800-63B、OWASP ASVS v4.0、以及 FIDO 的 passkey 路线图。我们这款生成器就坐落在那个共识里。",
      subsections: [
        {
          heading: "NIST SP 800-63B —— 改了什么、为什么重要",
          paragraphs: [
            "NIST 特别出版物 800-63B（Digital Identity Guidelines, Authentication & Lifecycle Management）就是终结 1980 年代那个时代的文件。它明确退役了三条机构执行了几十年的规则。第一，强制定期轮换被取消：仅在出现失陷证据时轮换。第二，强制混合字符类被取消：一段 16 字符纯小写也合规。第三，密码提示与基于知识的恢复（「母亲的娘家姓」）被取消：它们比密码本身更弱。",
            "取而代之的是一条「记忆型秘密」的长度底线（最少 8 字符、最多允许 64 字符）、一条「针对已泄露语料的筛查」要求（have-i-been-pwned、英国 NCSC 的 top-100k 名单），以及对「系统生成」秘密的 CSPRNG 要求。5.1.1.2 节规定，任何由验证方自己生成的密码都必须使用「approved random bit generator」生成。在浏览器语境里，那就是 `crypto.getRandomValues`，不是 `Math.random`。",
            "OWASP ASVS v4.0（第 2 节 —— Authentication）在它之上加了一层：任何新账号至少 12 字符、每次设置/重置都做一次「是否在泄露名单」的检查、不要组合规则、不要截断、所有授权登录都上 MFA。两份文档汇合到同一种运行模型：人类不应该再发明密码；软件应该来生成。",
          ],
        },
        {
          heading: "「软件生成的密码」实际出现在哪些位置",
          paragraphs: [
            "压倒性比例的合规用法落在五种工作流里。",
            "第一，存进密码管理器（1Password、Bitwarden、KeePassXC、浏览器内置钥匙串）里的每站点账号凭据。管理器自动填登录字段；人类从不输入也不记忆密码。长度只受站点的截断上限约束 —— 我们建议普通账户 20+，金融/管理类账户 32+。",
            "第二，机器到机器的凭据：API token、数据库密码、服务账号 secret、deploy key。它们永远不会面对人类键盘，唯一约束就是消费者的解析器。32 字符混合字母表是工作默认；只要消费者接受，64 字符也行。",
            "第三，根恢复码与「破玻璃」凭据 —— 密码管理器本身的密码、离线 TOTP 备份、冷存储助记词的加密密码。这些是不可替换的秘密。长度应该 32+；它们应该写在纸上并物理保存（保险柜、银行保管箱、用 Shamir 秘密分享分散到地理上分隔的多处）。",
            "第四，一次性 token：临时分享链接、单次设备配对码、邀请 token。长度底线由「你每秒发多少 token × token 有效期多长」决定。在完整 88 符号字母表上 16 字符约 103 比特熵 —— 在有限有效期之后，足以远超 128 比特等效门槛。",
            "第五，密码学协议里生成的 salt 与 nonce。严格说它们不是密码 —— 它们是公开的，但必须唯一且不可预测。背后驱动本工具的同一个 CSPRNG 就是正确的来源。这种输出直接喂给协议；千万不要 base64 一下再拿肉眼当凭据看。",
          ],
        },
        {
          heading: "为什么要反对组合规则",
          paragraphs: [
            "「必须包含至少一位大写、一位数字、一位符号」是大多数企业还在执行的那条规则。NIST 是刻意拿掉它的。原因是统计性的：组合规则是把搜索空间变窄，不是变宽。一个跑猜测攻击的攻击者会跳过违反规则的密码；一旦强制要求一个符号，攻击者就会停止尝试纯字母候选，而那些原本是均匀分布因此数量众多的。",
            "更糟的是人类满足组合规则的方式高度可预测。强制大写放在开头；强制数字放在末尾；强制符号是 `!`。`Password1!` 和 `Welcome2024!` 是教科书例子，它们在每一份破解词典的最顶部，因为受这条规则约束的全人类都在产出它们。",
            "本工具把字符类作为开关而不是强制。来自我们 CSPRNG 的 20 字符纯小写密码携带 `20 × log2(26) ≈ 94 比特`熵，远高于多数威胁模型要求的 80 比特地板。如果你的验证方坚持要组合规则，把四个类都打开，并且接受「你在为合规戏剧支付一点熵税」这件事。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "我们的实现是 20 行 TypeScript，跑在 `crypto.getRandomValues` 之上。真正有意思的工程在于「写错会出什么事」—— 以及当你写对时平台是怎么保护你的。",
      subsections: [
        {
          heading: "决策 1 · `crypto.getRandomValues` 是唯一可接受的来源",
          paragraphs: [
            "`crypto.getRandomValues(typedArray)` 是浏览器的 CSPRNG（密码学安全伪随机数生成器）。它由 W3C WebCryptoAPI 规范定义，每个主流浏览器都把它实现成「OS RNG 的薄包装」（Linux 上是 `getrandom(2)`、Windows 上是 `BCryptGenRandom`、macOS/iOS 上是 `SecRandomCopyBytes`），并由内核熵池播种，那个熵池池化了硬件事件、中断时序、以及（在现代 CPU 上）`RDRAND`/`RDSEED` 指令。",
            "`Math.random` 是错误的原语。它的规范只要求「[0, 1) 上的均匀分布数」；算法是实现自定义的，历史上 V8 用 Xorshift128+、更早的引擎用 Mulberry32，并明确*不是*密码学安全的。它的内部状态可以从少数几次连续输出中还原。用 `Math.random` 生成密码是 CVE 级别错误；2017 年某个流行的 npm 库就是这样翻车，产出了两年可逆的 session token 才被人发现。",
            "本工具分配一个长度 N 的 `Uint32Array`，调 `crypto.getRandomValues(arr)` 用每槽 32 比特 CSPRNG 输出填满，然后把每个 32 比特字对字母表大小取模来挑字符。取模会引入极其微小的偏置（因为 2^32 不是比如 88 的整数倍），但对密码生成来说是不可观测的 —— 偏置低于 2^-25，意味着「最受偏爱字符」比「最不受偏爱字符」大约多 1.00000003 倍出现概率。拒绝采样可以消掉这一点偏置，代价是多写一些代码；我们判断在这块界面上不值得。",
          ],
        },
        {
          heading: "决策 2 · Shannon 熵是唯一靠谱的强度指标",
          paragraphs: [
            "一个密码对抗离线猜测攻击的强度，就是它的 Shannon 熵：`H = 长度 × log2(字母表大小)`。一个从 72 符号字母表（小写 + 大写 + 数字 + 10 个符号）中均匀采样的 20 字符密码携带 `20 × log2(72) ≈ 123 比特`。从同一字母表采样的 12 字符密码携带 `74 比特`。74 比特密码在单 GPU 机上一年内可破；123 比特密码在 2050 年前任何合理预算的对手都破不开。",
            "我们的强度计把熵分成三档：低于 40 比特是「弱」（在僵尸网络上秒-小时级可破）；40 到 80 比特是「中」（完全取决于攻击者的哈希预算 —— 验证方用 Argon2id 就没事，用裸 SHA-256 就裸奔）；80 比特以上是「强」。80 比特这条边界是保守的；NIST 把 80 比特当作「非涉密系统中记忆型秘密」的地板，也是每一个商用密码破解 benchmark 用作「计算上不可行暴力破解」的取值。",
            "我们不会因为「包含字典词」给熵加分、也不会因为「三个连续元音」扣分。那些启发式对 *人类自选* 密码（「password123」看起来 11 字符，但只携带约 13 比特熵，不是 64 比特）有意义，但对 CSPRNG 输出毫无意义 —— 每个字符与其他每个字符独立，熵公式是精确的。",
          ],
        },
        {
          heading: "决策 3 · 为什么长度压倒复杂度",
          paragraphs: [
            "算术很直接。字母表翻倍只为每个字符加 `log2(2) = 1 比特`熵。长度翻倍把整个熵翻倍。所以「给一个小写密码再加一个字符长度」（`+log2(26) = 4.7 比特`）的收益，比「把字母表从纯小写换成全部 94 个可打印 ASCII」（`+log2(94/26) = 每个字符 1.85 比特`）更大，除非密码短于 2.5 字符 —— 那不可能。",
            "写明白：16 字符纯小写密码携带 `16 × log2(26) ≈ 75 比特`熵。8 字符全字母表密码携带 `8 × log2(94) ≈ 52 比特`熵。16 字符纯小写比「满足组合规则的 8 字符混合大小写带符号」难破解 800 万倍以上。",
            "这就是为什么我们的默认长度是 20、滑块上限是 64。生成 64 字符密码的成本跟生成 20 字符的一样（都在微秒级）。*输入*它的成本无关紧要，因为密码管理器自动填。唯一的约束是验证方的长度上限；某些遗留系统还是卡在 16。当那种情况出现时，我们就被「上限」绑住了熵，只能改用完整字母表。",
          ],
        },
        {
          heading: "决策 4 · 符号字母表是一种妥协",
          paragraphs: [
            "我们的符号集是 `!@#$%^&*()-_=+[]{};:,.<>?/~` —— 28 个 ASCII 符号，刻意排除 `\\`、反引号、引号、空白字符。这些排除不是审美考虑：`\\` 在一些 shell 脚本消费者里会被误读为路径分隔；反引号在 shell 里是命令替换字符；引号在密码被粘进 SQL、JSON、shell 字符串时必须转义；空白字符在某些 web 表单里会被默默 trim。",
            "如果你要生成一份「会被输入到你掌控不到的系统」（路由器管理面板、嵌入式设备、遗留 Java 应用）的密码，优先选纯字母数字。我们的「符号」开关跟其他三个类独立，正是为了让你能关掉它而保留其余的。",
          ],
        },
        {
          heading: "决策 5 · 任何东西都不离开浏览器标签页",
          paragraphs: [
            "生成发生在加载本页的引擎实例里。CSPRNG 缓冲区分配在 JS 堆内存里，函数返回即丢弃；产出的字符串住在组件状态里，你导航走或关闭标签页即被 GC。没有 `fetch` 调用、没有埋点、没有 `localStorage` 写入、没有 Service Worker 缓存。",
            "这条结构性事实很重要：一款会绕回服务器的密码生成器就是一款服务器可以记录密码的密码生成器。我们的基础设施没有可以接收一份生成密码的端点、没有可以拦截它的请求处理器、没有可以记录它的日志面。信任边界就是浏览器标签页；它里面的一切都是你自己的。",
          ],
        },
        {
          heading: "决策 6 · 本工具刻意不做的那些事",
          paragraphs: [
            "我们不生成「可发音」或「易记」密码（Diceware 风格词表是另一种界面；后面可能会做）。我们不生成短语密码。我们不存密码。我们不查泄露语料库（集成是可行的 —— 对 `api.pwnedpasswords.com` 做 `k-anonymity` 查询只会泄露 SHA-1 前 5 个十六进制位 —— 但这跨网络、且改变信任模型，所以本页没做）。",
            "我们也不生成 ECC 密钥对、JWT secret、session token。那些需要格式感知的生成器（PEM、定长 base64url），本工具刻意不做。如果你要 JWT 签名 secret，用另一个工具生成原始字节再喂给你的库；不要把一段密码粘进 `process.env.JWT_SECRET` 的位置。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "多数密码问题不是生成器 bug —— 而是消费者约束（长度上限、禁用字符、编码怪癖）或者运维习惯（「这个我要记住」）。修复都很短。",
      subsections: [
        {
          heading: "「站点拒绝了我生成的密码」",
          paragraphs: [
            "三类原因占了几乎所有拒绝。第一，长度上限：站点静默地把超过比如 16 字符的输入截断，你那 20 字符密码进哈希前被砍成 16。如果你看到「password too long」，你身处一份遗留栈 —— 按上限生成、继续。更糟的是如果截断是静默的（没有报错），你第一次登录是 20 字符成功的，但之后的登录失败，因为哈希算的是 16 字符。这种情况一开始就按上限生成。",
            "第二，禁用字符：某些表单拒收 `<`、`>`、`&`、单引号，因为后端从来没学过 prepared statement。关掉符号开关，按「仅字母数字」重新生成。",
            "第三，复制粘贴损坏：从终端复制可能带上末尾的空格或换行；把它粘进「去掉空白」的密码字段，再往回校验时就崩。请用本工具的 Copy 按钮 —— 它把原始字符串送进剪贴板，不带任何尾随字符。",
          ],
        },
        {
          heading: "「多长才够长？」",
          paragraphs: [
            "对验证方做威胁建模。如果后端用 Argon2id、bcrypt 或者参数得当的 scrypt，攻击者的离线猜测预算大约是每 GPU 每秒 `10^8` 次。一个 64 比特熵的密码（`12 字符 × log2(72)`）需要 `2^64 / 10^8 ≈ 5800 年`的单 GPU 时间 —— 安全得很。",
            "如果后端用裸 SHA-256（不该用，但遗留系统在用），预算跳到每 GPU 每秒 `10^10`。同一份密码现在单 GPU 58 年可破、1000 GPU 集群 21 天可破。你需要至少 80 比特熵（`72 符号字母表下 14 字符`，或者 `17 字符纯小写`）才能在这种对手面前稳住。",
            "如果密码保护的是离线加密 blob（密码管理器主库、LUKS 卷、PGP 私钥），攻击者预算无上限 —— 只受硬件约束。128 比特是地板；对任何不可替换的东西，我们建议 192 比特+。那就是「来自完整 88 符号字母表的 30 字符密码」，或者 6 词 Diceware 短语（来自 7776 词词表）。",
          ],
        },
        {
          heading: "「我想把它记住」",
          paragraphs: [
            "那本工具就不适合你。CSPRNG 输出从构造上就不可记忆 —— 随机性的核心就是「下一个字符跟上一个字符不相关」。如果你必须记忆，请用 Diceware 风格短语：从标准词表中抽 4 到 6 个词（EFF Long List 是 7776 词 = 每词 12.9 比特熵）。6 个词是 77.4 比特熵，跟本工具产出的 16 字符纯小写密码差不多。",
            "战略层面的答案是：只记一个密码 —— 密码管理器的主密码 —— 让管理器替你生成并记住每个站点的秘密。主密码至少 6 词 Diceware、永不复用，且在管理器侧本身上一层 MFA。",
          ],
        },
        {
          heading: "「同样的选项每次生成的密码都不同 —— 这不对吗？」",
          paragraphs: [
            "完全正确，这是本工具的定义属性。一个「同样的输入永远产出同样的输出」的密码生成器是一个*密钥派生函数（KDF）*，不是密码生成器 —— KDF 是凭据领域里错误的原语，因为「同一份输入」绝不被允许两次产出同一份凭据。",
            "如果你用同样的长度和字符类生成两个密码，它们碰巧相等，那就说明 CSPRNG 坏了。每生成一份 20 字符密码的随机性预算大约是 `20 × 5.5 ≈ 110 比特`；碰撞概率是 `1 / 2^110` —— 比硬件级宇宙射线翻位的概率还低得多得多。",
          ],
        },
        {
          heading: "「我能在公司笔记本上信任它吗？」",
          paragraphs: [
            "大概率可以，但带一条注意事项。生成器本身不离开页面，所以被动网络监控看不到输出。但你的雇主可能跑着 endpoint 监控（DLP、EDR），那些工具会记录剪贴板内容、定时截屏、挂键盘钩子。把生成的密码粘进表单，这些 agent 可能会记录下来。",
            "对高价值秘密 —— 一份恢复码、一份个人主密码 —— 不要在受管设备上生成。用一台私人笔记本，或者一台「公共但可信」的设备（一台跑刚开 Tor Browser 会话的图书馆机器，反直觉地，反而是个强选择）。CSPRNG 本身在各设备上完全等价；信任边界是它下面的操作系统。",
          ],
        },
        {
          heading: "依赖一份生成密码前的最佳实践清单",
          paragraphs: [
            "下面这五条习惯能消灭几乎所有密码相关的事故。",
          ],
        },
      ],
      bullets: [
        "用密码管理器 —— 生成、存储、自动填充。除了一份主密码，其他全部别记。",
        "普通账户至少 20 字符；金融/管理类账户 32 字符+；验证方接受时 64 字符。",
        "打开多因素认证。一份 12 比特熵 TOTP 码叠在 80 比特熵密码之上，比单独一份 128 比特密码更强 —— 第二因素是乘法叠加的。",
        "不要跨站点复用密码。复用是「撞库泄露」的头号原因；每站点独立秘密把爆炸半径收敛到单个站点。",
        "只在出现失陷证据时轮换。定期轮换会逼出更弱的密码（人类挑模式），而面对一个数小时内就把数据外传完的真实对手也根本拦不住。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
