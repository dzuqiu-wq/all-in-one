import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · sRGB COLOR MATH",
  title:
    "HEX, RGB, HSL in 2026: three views of the same sRGB point, why designers prefer HSL, and what the next decade of OKLCH will change",
  lead:
    "Every color you see on a screen is a single point in a three-dimensional space. HEX, RGB, and HSL are three coordinate systems on top of the same space — the sRGB color cube. Picking between them is not a question of which one is right; it is a question of which one matches the task. HEX is the wire format. RGB is the math. HSL is the human-facing handle. This page is the contract behind our converter: which transforms we run, where the rounding lives, why we deliberately do not ship OKLCH yet, and how to think about color when you are tweaking a brand palette at 11pm.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "Color on the web has two layers: the sRGB color space itself (defined by IEC 61966-2-1 in 1996 and still the default for nearly every consumer screen), and the coordinate systems we use to talk about points inside that space. HEX, RGB, and HSL are three of those coordinate systems. Their relationship to one another — and to the next-generation spaces like Display P3 and OKLCH — is what determines which one belongs in your CSS file.",
      subsections: [
        {
          heading: "sRGB is the substrate; HEX/RGB/HSL are three coordinate systems on it",
          paragraphs: [
            "The sRGB cube has three axes — red, green, and blue intensities — each running from 0 to 1 (or 0 to 255 in 8-bit form). Every point inside that cube is a color the substrate can display. HEX, RGB, and HSL do not change which colors are addressable; they only change how you name a given point.",
            "HEX is a positional notation: six hexadecimal digits, two per channel, packed into a single string. `#ff0000` is `(255, 0, 0)` in RGB. The format originated in 1990s HTML when CSS did not yet exist and authors needed to fit a color into an `<font color=>` attribute. It survived because it is short, unambiguous, and trivially parseable. Today it is the wire format for color in HTML, CSS, and SVG.",
            "RGB is the math. The same color expressed as `rgb(255, 0, 0)` exposes each channel as an integer, which is what every blend, shader, and image-processing kernel actually operates on. When the GPU composites your page, it works in RGB (in fact, in linear-light RGB, with the sRGB gamma curve applied per-pixel at the very end). RGB is the right surface when you need to do math: average two colors, mix toward white, adjust a single channel.",
            "HSL — hue, saturation, lightness — is a polar reparameterization of the same cube. Hue is an angle (0–360°) around the central axis; saturation is the distance from that axis (0–100%); lightness is the position along the axis (0–100%, with 0% black and 100% white). HSL was popularized by Tom Cox's 1978 paper and codified in CSS by Tab Atkins in 2010. It exists because it matches how humans talk about color: \"a slightly less saturated red, a bit darker.\"",
          ],
        },
        {
          heading: "When each space is the right choice",
          paragraphs: [
            "HEX belongs in the code you ship. CSS variables, design-token JSON, brand-style documents — all should store color as HEX. It is the most compact representation, it is unambiguous (one HEX string maps to exactly one color), and every tool in the pipeline parses it identically. The one exception is colors with transparency: HEX has an 8-digit variant (`#RRGGBBAA`) but not every CSS parser supports it; for alpha, `rgba()` is more portable.",
            "RGB belongs in the math. When you are computing a hover state by darkening a base color, you average channels. When you are generating a heat-map gradient, you interpolate channels. When you are building a tint-and-shade ramp, you blend toward white and black in channel space. HSL interpolation in those cases is wrong: HSL hue wraps modulo 360, so interpolating from 350° to 10° passes through red (correct) by default but may pass through the long way (cyan) if your library is naive.",
            "HSL belongs in the design surface. When a designer says \"make it a touch warmer,\" they mean \"shift the hue toward red\" — directly editable in HSL by changing one number. When they say \"desaturate it,\" they mean \"decrease saturation\" — again, one number. RGB cannot expose either of those moves cleanly; you have to pull on three channels in coordinated proportions to achieve what HSL gives you for free.",
          ],
        },
        {
          heading: "The gamut question: sRGB, Display P3, Rec.2020",
          paragraphs: [
            "All three of HEX, RGB, and HSL on this page are sRGB. The sRGB gamut covers roughly 35% of the colors a human eye can perceive — a deliberately conservative slice that every consumer display can reproduce. Modern Apple displays, recent Android phones, and high-end monitors can display a larger gamut: Display P3 (about 45% of the visible spectrum) is now standard on Mac and iOS hardware released since 2016.",
            "CSS Color Module Level 4 introduced syntax for colors outside the sRGB gamut: `color(display-p3 1 0 0)` is a saturated red brighter than `#ff0000`. If you convert that P3 red to sRGB and store it as HEX, you lose the saturation; the result is just `#ff0000`. The conversion clamps to the cube. For most use cases this does not matter — your users' screens cannot display the brighter red anyway — but for HDR content, photo-realistic rendering, and high-end print pipelines it does.",
            "Our converter operates entirely inside the sRGB cube. We do not attempt to detect whether the user's input was meant as P3 or Rec.2020; the input is interpreted as sRGB and round-tripped within sRGB. If your work requires wide-gamut, use the CSS Color 4 functions directly and let the browser handle conversion at render time.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "Our converter is 40 lines of pure TypeScript. The interesting parts are not the formulas — those are textbook — but the rounding boundaries, the input parsing, and the deliberate omission of OKLCH.",
      subsections: [
        {
          heading: "Step 1 — HEX parsing accepts shorthand and case-insensitive input",
          paragraphs: [
            "The CSS HEX color syntax has three valid forms: `#RGB` (3 digits), `#RRGGBB` (6 digits), and `#RRGGBBAA` (8 digits, alpha). Our converter handles the first two. The 3-digit shorthand is expanded by duplication: `#f0a` becomes `#ff00aa`. This is not arbitrary — it is what the CSS spec mandates.",
            "We strip a leading `#` if present, lowercase the input, and validate against `/^[0-9a-fA-F]{6}$/`. Invalid input throws an `Error`; the UI catches the throw and displays the localized `errorInvalid` message. We deliberately do not coerce partial input (`#ff` does not become `#ff0000`) because that masks user mistakes — better to show an error than silently produce wrong output.",
            "What we do not parse: named colors (`red`, `dodgerblue`), `rgb()` function syntax, `hsl()` function syntax, or any CSS Color 4 function. Those belong in the browser's parser, not ours. Our converter takes raw color values; if you have CSS strings, parse them first.",
          ],
        },
        {
          heading: "Step 2 — RGB ↔ HSL uses the standard hexcone formula",
          paragraphs: [
            "The RGB-to-HSL conversion divides the input channels by 255 to bring them into [0, 1], finds the max and min, and then derives hue, saturation, and lightness from those extremes. Lightness is the midpoint: `(max + min) / 2`. Saturation depends on lightness — for the upper half of the cube (light side) it is `(max - min) / (2 - max - min)`, for the lower half it is `(max - min) / (max + min)`. Hue is a piecewise function that picks one of three formulas depending on which channel is the max, then multiplies by 60° to convert sextant indices into degrees.",
            "Going the other way — HSL to RGB — is more verbose because the hue angle has to be decomposed into a chroma (`c = (1 - |2l - 1|) * s`), an intermediate value (`x = c * (1 - |((h/60) mod 2) - 1|)`), and a baseline (`m = l - c/2`). The output channels are assembled from c, x, 0, and m depending on which 60° sextant the hue falls into. The formula is in every graphics textbook; we implement it directly with no shortcuts.",
            "The rounding boundary lives at the output of each conversion. RGB channels are rounded to integers in 0–255 with `Math.round`. HSL components are rounded to integers (hue in 0–360, saturation and lightness in 0–100). Round-tripping pure red — `(255,0,0) → (0°, 100%, 50%) → (255,0,0)` — is exact. Round-tripping arbitrary colors loses up to 1 unit per channel due to the integer rounding; that is the documented drift in our `faq3A`.",
          ],
        },
        {
          heading: "Step 3 — Bidirectional bindings are state-canonical, view-derived",
          paragraphs: [
            "The UI maintains a single canonical state: RGB. The HEX string and the HSL triplet are recomputed from RGB on every render using `useMemo`. When the user edits any input — HEX, R/G/B, or H/S/L — we convert the edit into RGB and call `setRgb`. React re-renders, the memos recompute, and all three views update.",
            "This pattern avoids a common bug: if all three views held independent state and synchronized via effects, you would get update loops (changing HEX triggers an effect that updates RGB which triggers an effect that updates HSL which triggers an effect that updates HEX, etc.). A single canonical state with derived views eliminates the loop entirely.",
            "The one piece of state that does not derive from RGB is `hexInput`. The user may type an invalid HEX string (`#ff` — incomplete) and we want to show what they typed, with an error message, without snapping the input back to a valid value. So `hexInput` is independent state synchronized on every valid parse and on every RGB/HSL edit.",
          ],
        },
        {
          heading: "Step 4 — Nothing leaves the browser tab",
          paragraphs: [
            "Color conversion is pure arithmetic. There is no API call, no service-worker cache, no analytics event, no localStorage write. The input you type goes into component state; component state is garbage-collected when you navigate away or close the tab. If you screenshot the preview block, that screenshot is yours; we never see it.",
            "This is the right model for a color tool. Designers paste brand colors into tools constantly; those colors are sometimes confidential before launch. A converter that round-trips through a server is a converter the server can log. Our infrastructure has no endpoint that could receive a color value and no logging surface that could record one.",
          ],
        },
        {
          heading: "Step 5 — Why no OKLCH yet",
          paragraphs: [
            "OKLCH is a perceptually uniform color space published by Björn Ottosson in 2020 and added to CSS Color Module Level 4. Its appeal is that equal numeric distances in OKLCH correspond to roughly equal perceived differences — unlike HSL, where moving from green (120°) to red (0°) by hue produces a smaller perceived change than moving the same number of degrees through yellow. For palette generation, accessible contrast tuning, and color interpolation, OKLCH is straightforwardly better than HSL.",
            "We do not ship it on this page for two reasons. First, the conversion math involves the OKLab intermediate (matrix multiply + nonlinear transfer function + polar conversion); browsers have implemented this, but each browser's rounding behavior at the gamut boundary still differs subtly. Second, our UI design — three integer-channel inputs per space — does not translate cleanly to OKLCH's mixed-unit format (L in 0–1, C in 0–0.4, H in 0–360). We are waiting until CSS Color 4 is fully stable across all browsers and we can find a UI that feels natural for non-experts.",
            "If you need OKLCH today, use the CSS `oklch()` function directly. The browser will handle conversion when rendering; you do not need a separate tool for it unless you want to interpolate manually.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Most color-conversion problems are not converter bugs — they are gamut clamps, rounding drift, or confusion about which space the source material actually was. The fixes are short.",
      subsections: [
        {
          heading: "\"I converted #ff0000 to HSL and back and got #fe0000 — bug?\"",
          paragraphs: [
            "Not a bug. The HSL representation of `#ff0000` is `(0°, 100%, 50%)` exactly, and converting back yields `#ff0000` exactly. But if you converted through a different intermediate (RGB float → HSL float → rounded HSL → RGB), the rounded HSL would re-derive to `(255, 0, 0)` minus the rounding noise — sometimes producing `#fe0000`.",
            "Our converter keeps RGB as integers throughout, so pure primaries round-trip exactly. Arbitrary colors may drift by ±1 unit per channel on round-trips, which is the documented and unavoidable cost of integer storage. If your workflow needs exact float-precision color, edit in the original space and convert only at output time.",
          ],
        },
        {
          heading: "\"My designer gave me a Pantone code — how do I convert it?\"",
          paragraphs: [
            "Pantone codes are not points in sRGB; they are spot colors with their own dye specifications. Pantone publishes sRGB approximations for each code, but those are guidance, not equivalence. The right move is to ask your designer for the sRGB HEX value alongside the Pantone code; if they only have the Pantone, look it up in the Pantone Color Bridge (the official conversion table), then enter that HEX.",
            "If you have a CMYK value instead, the conversion to RGB is similarly approximate — CMYK output depends on the specific press and paper. ICC profiles exist to do the math correctly, but they are outside the scope of a browser tool. For digital-only work where your source is CMYK, treat the converter's output as a starting point and proof against your designer's intent.",
          ],
        },
        {
          heading: "\"I want a color slightly brighter — should I edit R/G/B or H/S/L?\"",
          paragraphs: [
            "HSL, by changing L. Moving lightness up moves the color toward white along the perceptually intuitive axis. Editing each RGB channel by the same absolute amount works but produces a slightly different result because RGB is not perceptually uniform — equal channel increments produce larger perceived changes in the green channel than in red or blue.",
            "If you need true perceptual uniformity — for example, building a 10-step lightness ramp where each step looks like the same gap — neither HSL nor RGB is ideal. HSL approximates it; OKLCH does it correctly. For most brand-palette work, HSL is good enough.",
          ],
        },
        {
          heading: "\"My HSL preview looks washed out compared to a competitor tool\"",
          paragraphs: [
            "Three causes account for almost every washed-out preview. First, your monitor: a non-color-managed display in a bright room shows lower-saturation rendition of the same HEX value than a calibrated monitor in a dim room. Move the preview to a calibrated display and a controlled environment before judging.",
            "Second, the tool you are comparing against may be using a wider gamut. Figma renders in P3 on capable Apple devices; our preview is sRGB-only and will look slightly less saturated for fully-saturated primaries on the same screen. This is not a bug in either tool; it is two different gamuts displaying their respective in-gamut maxima.",
            "Third, the gamma curve. sRGB uses a nonlinear gamma curve (approximately gamma-2.2) for storage. Some tools apply the curve correctly; others composite in linear-light and apply the curve only at output. Our converter does not composite anything — it is pure space-to-space arithmetic — so this should not affect us, but it can affect the screenshots you compare against.",
          ],
        },
        {
          heading: "\"Can I trust this converter for accessibility contrast checks?\"",
          paragraphs: [
            "For the conversion itself, yes. WCAG 2.1 contrast formulas operate on sRGB-linear luminance, not on HEX, RGB, or HSL directly; converting from HEX to RGB is a necessary first step, and our converter does that correctly. After getting RGB, run each channel through the sRGB gamma inverse (`(c/255)^2.4` approximation), compute relative luminance, then divide the two luminances + 0.05 fudge factor.",
            "We do not currently ship a contrast checker on this page. If you need one, the WebAIM Contrast Checker is the industry reference; copy the HEX from our preview block into it and verify against the AA (4.5:1 for body text) or AAA (7:1) thresholds.",
          ],
        },
        {
          heading: "Best-practice checklist before shipping a color decision",
          paragraphs: [
            "Five habits that prevent the most common color regressions in shipped code.",
          ],
        },
      ],
      bullets: [
        "Store color as HEX in your design tokens. It is the most compact unambiguous wire format and every downstream tool parses it identically.",
        "Edit color in HSL when the change is human-described (\"warmer\", \"more saturated\", \"a touch darker\") — one channel, one move.",
        "Do math in RGB. Averaging, blending, gradient interpolation — RGB is the right surface; HSL hue wraparound will burn you.",
        "Pick all your interactive states (hover, active, focus) from the same hue. Vary saturation and lightness, hold hue constant — the palette stays coherent across the entire UI.",
        "Verify contrast on real screens, not just in the design tool. A 4.5:1 ratio in your editor may render at 3.9:1 on an LCD in sunlight.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · sRGB 颜色数学",
  title:
    "HEX、RGB、HSL 在 2026 年：同一个 sRGB 点的三种坐标视角、设计师为什么偏爱 HSL、以及未来十年 OKLCH 会改变什么",
  lead:
    "你在屏幕上看到的每一种颜色，都是某个三维空间中的一个点。HEX、RGB 和 HSL 是同一个空间（sRGB 颜色立方体）上的三套坐标系。在它们之间选择不是「哪个对」的问题，而是「哪个匹配当前任务」的问题。HEX 是线格式。RGB 是数学。HSL 是面向人的把手。本页就是这款转换器背后的契约：我们跑哪些变换、舍入边界在哪里、为什么我们刻意还不上 OKLCH，以及当你在晚上 11 点调品牌色板时该用什么思路。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "Web 上的颜色有两层：sRGB 色彩空间本身（由 1996 年的 IEC 61966-2-1 定义，至今仍是几乎每一块消费屏幕的默认色域），以及我们用来谈论该空间内某个点的坐标系。HEX、RGB、HSL 是其中三种。它们彼此之间的关系——以及它们与下一代空间（Display P3、OKLCH）的关系——决定了哪一个应该写进你的 CSS 文件。",
      subsections: [
        {
          heading: "sRGB 是底物；HEX/RGB/HSL 是它之上的三套坐标系",
          paragraphs: [
            "sRGB 立方体有三个轴——红、绿、蓝的强度——每个轴从 0 到 1（或 8 位下的 0 到 255）。立方体内的每一个点都是底物能显示的一种颜色。HEX、RGB、HSL 都不改变「哪些颜色可寻址」；它们只改变「你怎么给某个点起名」。",
            "HEX 是一种位置记号：六位十六进制数字，每通道两位，打包成一个字符串。`#ff0000` 在 RGB 中就是 `(255, 0, 0)`。这种格式起源于 1990 年代 HTML 还没有 CSS 时——作者需要把颜色塞进 `<font color=>` 属性。它流传下来是因为短、无歧义、解析平凡。今天它是 HTML、CSS、SVG 中颜色的线格式。",
            "RGB 是数学。同一份颜色写作 `rgb(255, 0, 0)` 时，每个通道作为整数暴露出来，这正是任何混合、shader、图像处理 kernel 实际操作的对象。当 GPU 合成你的页面时，它在 RGB 里工作（事实上是在线性光 RGB 里，sRGB gamma 曲线在最后逐像素施加）。当你要做数学时——平均两种颜色、向白色混合、调一个通道——RGB 是正确的界面。",
            "HSL——色相、饱和度、明度——是同一立方体的极坐标重参数化。色相是绕中心轴的角度（0–360°）；饱和度是离开该轴的距离（0–100%）；明度是沿轴的位置（0–100%，0% 黑、100% 白）。HSL 由 Tom Cox 在 1978 年的论文推广开来，2010 年由 Tab Atkins 编入 CSS。它存在是因为它匹配人类讨论颜色的方式：「一份略微不那么饱和的红，稍微暗一点」。",
          ],
        },
        {
          heading: "什么时候该用哪个空间",
          paragraphs: [
            "HEX 应该出现在你交付的代码里。CSS 变量、design-token JSON、品牌规范文档——颜色都应该存为 HEX。它是最紧凑的表示、它是无歧义的（一个 HEX 字符串恰好映射到一种颜色）、管道上的每个工具都用同一种方式解析它。唯一例外是带透明度的颜色：HEX 有 8 位变体（`#RRGGBBAA`），但并非每个 CSS 解析器都支持；对 alpha 来说 `rgba()` 更可移植。",
            "RGB 应该出现在数学里。当你通过把基色调暗来计算一份 hover 状态时，你在平均通道。当你生成热力图渐变时，你在插值通道。当你构造「色阶（tint 和 shade）」时，你在通道空间向白和黑混合。在这些场景下用 HSL 插值是错的：HSL 色相按 360 取模，从 350° 插到 10° 默认会穿过红色（正确），但天真的库可能让你绕远路穿过青色（错）。",
            "HSL 应该出现在设计界面里。当设计师说「调暖一点」时，他们的意思是「色相往红方向移」——HSL 里改一个数字就行。当他们说「降饱和一点」时，意思是「减少饱和度」——还是一个数字。RGB 没法干净地暴露这两种动作；你得按协调比例同时拉动三个通道，才能得到 HSL 一行就给你的东西。",
          ],
        },
        {
          heading: "色域问题：sRGB、Display P3、Rec.2020",
          paragraphs: [
            "本页的 HEX、RGB、HSL 全部都是 sRGB。sRGB 色域覆盖人眼可感知颜色的大约 35%——一份刻意保守的切片，每一块消费显示器都能复现。现代苹果屏幕、近年的安卓手机、高端显示器能展示更大色域：Display P3（约 45% 可见光谱）从 2016 年起就是 Mac 和 iOS 硬件的标配。",
            "CSS Color Module Level 4 引入了 sRGB 色域以外颜色的语法：`color(display-p3 1 0 0)` 是一份比 `#ff0000` 更鲜艳的红。如果你把那份 P3 红转成 sRGB 并存为 HEX，你就丢了那份饱和度；结果只是 `#ff0000`。转换会夹紧到立方体内。对多数用法来说这不重要——你的用户屏幕本来就显示不出更鲜艳的红——但对 HDR 内容、写实渲染、高端印刷管道来说就重要了。",
            "我们的转换器完全在 sRGB 立方体内运作。我们不试图侦测用户输入「是不是 P3 或 Rec.2020 的意思」；输入按 sRGB 解释，并在 sRGB 内往返。如果你的工作需要广色域，直接用 CSS Color 4 的函数，让浏览器在渲染时处理转换。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "我们的转换器是 40 行纯 TypeScript。有意思的部分不是公式——那些都是教科书里的——而是舍入边界、输入解析、以及刻意省略的 OKLCH。",
      subsections: [
        {
          heading: "决策 1 · HEX 解析接受缩写形式与大小写无关输入",
          paragraphs: [
            "CSS HEX 颜色语法有三种合法形式：`#RGB`（3 位）、`#RRGGBB`（6 位）、`#RRGGBBAA`（8 位，带 alpha）。我们的转换器处理前两种。3 位缩写按重复展开：`#f0a` 变成 `#ff00aa`。这不是任意决定——这是 CSS 规范的要求。",
            "我们去掉可选的 `#` 前缀，把输入转小写，并对 `/^[0-9a-fA-F]{6}$/` 做校验。非法输入抛 `Error`；UI 捕获 throw 并显示本地化的 `errorInvalid` 信息。我们刻意不对残缺输入做强制补全（`#ff` 不会被补成 `#ff0000`），因为那会掩盖用户错误——明确报错比静默产出错的颜色更好。",
            "我们不解析的东西：命名色（`red`、`dodgerblue`）、`rgb()` 函数语法、`hsl()` 函数语法、任何 CSS Color 4 函数。那些属于浏览器的解析器，不是我们的。我们的转换器接受原始颜色值；如果你拿到的是 CSS 字符串，先解析它。",
          ],
        },
        {
          heading: "决策 2 · RGB ↔ HSL 用标准「hexcone」公式",
          paragraphs: [
            "RGB 到 HSL 的转换把输入通道除以 255 落到 [0, 1]、求 max 和 min、然后从两端导出色相、饱和度和明度。明度是中点：`(max + min) / 2`。饱和度依赖明度——立方体上半部分（亮侧）是 `(max - min) / (2 - max - min)`，下半部分是 `(max - min) / (max + min)`。色相是一个分段函数，按哪个通道是 max 在三个公式中挑一个，再乘 60° 把 sextant 索引转成度数。",
            "反过来——HSL 到 RGB——更冗长，因为要把色相角度分解成 chroma（`c = (1 - |2l - 1|) * s`）、中间值（`x = c * (1 - |((h/60) mod 2) - 1|)`）、和 baseline（`m = l - c/2`）。输出通道按色相落入哪一个 60° sextant，从 c、x、0、m 中组装。这个公式在每一本图形学教科书里都有；我们直接实现，没有捷径。",
            "舍入边界活在每次转换的输出处。RGB 通道用 `Math.round` 舍入到 0–255 的整数。HSL 分量舍入到整数（色相 0–360，饱和度和明度 0–100）。纯红的往返——`(255,0,0) → (0°, 100%, 50%) → (255,0,0)`——是精确的。任意颜色的往返每通道可能漂移最多 1 单位，这就是 `faq3A` 里写的那份「rounding drift」。",
          ],
        },
        {
          heading: "决策 3 · 双向绑定是「单一规范态、视图派生」",
          paragraphs: [
            "UI 维护一份单一规范状态：RGB。HEX 字符串和 HSL 三元组在每次渲染时用 `useMemo` 从 RGB 重新计算。当用户编辑任何一个输入（HEX、R/G/B、或 H/S/L）时，我们把那次编辑转成 RGB 并调 `setRgb`。React 重渲，memo 重算，三个视图同步更新。",
            "这个模式回避了一个常见 bug：如果三个视图都各持有独立状态、靠 effect 互相同步，你会拿到更新循环（改 HEX 触发 effect 更新 RGB，触发 effect 更新 HSL，触发 effect 更新 HEX，依此类推）。「单一规范态、视图派生」彻底消除循环。",
            "唯一不从 RGB 派生的状态是 `hexInput`。用户可能输入一份非法 HEX（`#ff`——残缺），我们希望显示他们输入的内容、附上错误提示，而不是把输入框 snap 回到合法值。所以 `hexInput` 是独立状态，在每次合法解析时、以及每次 RGB/HSL 编辑时同步。",
          ],
        },
        {
          heading: "决策 4 · 任何东西都不离开浏览器标签页",
          paragraphs: [
            "颜色转换是纯算术。没有 API 调用、没有 service-worker 缓存、没有埋点事件、没有 localStorage 写入。你输入的颜色进了组件状态；组件状态会在你导航走或关闭标签页时被 GC。如果你截屏预览块，那张截图归你；我们看不到。",
            "对一款颜色工具来说这是正确的模型。设计师经常把品牌色粘进各种工具；那些颜色在发布前有时是机密。一款会绕回服务器的转换器就是一款服务器可以记录颜色值的转换器。我们的基础设施没有可以接收颜色值的端点，也没有可以记录它的日志面。",
          ],
        },
        {
          heading: "决策 5 · 为什么还不上 OKLCH",
          paragraphs: [
            "OKLCH 是 Björn Ottosson 在 2020 年发布的「感知均匀」色彩空间，已加入 CSS Color Module Level 4。它的吸引力在于：OKLCH 中相等的数值距离大致对应相等的感知差异——不像 HSL，色相从绿（120°）走到红（0°）的感知变化小于同样度数穿过黄色的感知变化。对调色板生成、可访问性对比度调优、颜色插值，OKLCH 直接比 HSL 更好。",
            "我们本页不上它，原因有两条。第一，转换数学涉及 OKLab 中间步（矩阵乘 + 非线性传递函数 + 极坐标转换）；浏览器都实现了，但每个浏览器在色域边界的舍入行为还存在微妙差异。第二，我们的 UI 设计——每个空间三个整数通道输入——并不能干净地映射到 OKLCH 的混合单位格式（L 在 0–1，C 在 0–0.4，H 在 0–360）。我们在等 CSS Color 4 在所有浏览器里完全稳定，并且找到一种对非专家也自然的 UI。",
            "如果你今天就需要 OKLCH，直接用 CSS 的 `oklch()` 函数。浏览器会在渲染时处理转换；你不需要单独一个工具，除非你想手动插值。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "多数颜色转换问题不是转换器的 bug——而是色域夹紧、舍入漂移、或者对「源材料原本在哪个空间」的混淆。修复都很短。",
      subsections: [
        {
          heading: "「我把 #ff0000 转 HSL 再转回来，得到了 #fe0000——bug 吗？」",
          paragraphs: [
            "不是 bug。`#ff0000` 的 HSL 表示恰好是 `(0°, 100%, 50%)`，转回去也恰好是 `#ff0000`。但如果你经过另一种中间形式（RGB 浮点 → HSL 浮点 → 舍入 HSL → RGB），舍入过的 HSL 反推回 `(255, 0, 0)` 减去舍入噪声——有时就会出 `#fe0000`。",
            "我们的转换器全程保持 RGB 为整数，所以纯三原色往返是精确的。任意颜色的往返每通道可能漂移 ±1 单位，这是已经写在文档里、且整数存储不可避免的代价。如果你的流程需要浮点精度颜色，请在原空间里编辑，仅在输出时再转换。",
          ],
        },
        {
          heading: "「设计师给了我一个 Pantone 编号——怎么转？」",
          paragraphs: [
            "Pantone 编号不是 sRGB 空间里的点；它们是有自己染料规格的「专色」。Pantone 为每个编号公布过 sRGB 近似值，但那些是参考，不是等价。正确的做法是请设计师把 Pantone 编号对应的 sRGB HEX 一起给你；如果他们手里只有 Pantone，到 Pantone Color Bridge（官方换算表）查表，然后输入那份 HEX。",
            "如果你拿到的是 CMYK 值，转 RGB 同样是近似的——CMYK 的输出依赖具体的印刷机和纸张。ICC 配置文件可以正确地做这件事，但已经超出浏览器工具的范围。对于源是 CMYK 的纯数字工作，把转换器输出当作起点，再用「设计师本来的意图」做最终校样。",
          ],
        },
        {
          heading: "「我想要一份稍微亮一点的颜色——应该改 R/G/B 还是 H/S/L？」",
          paragraphs: [
            "HSL，改 L。把明度向上推就是沿着「感知直觉的轴」往白色方向移动颜色。把每个 RGB 通道按相同绝对量增加也行，但结果会略有不同，因为 RGB 不是感知均匀的——相等的通道增量在绿通道上产生的感知变化大于红和蓝。",
            "如果你需要真正的感知均匀——比如做一份「每一级感觉间隔一致」的 10 级亮度阶梯——HSL 和 RGB 都不理想。HSL 是近似的；OKLCH 才是正确的。多数品牌色板的工作里，HSL 已经够用了。",
          ],
        },
        {
          heading: "「我的 HSL 预览看起来比对手工具更灰」",
          paragraphs: [
            "三个原因占了几乎所有「显得灰」的情况。第一，你的显示器：在明亮房间里使用未做色彩管理的显示器，比起在暗房里使用校准过的显示器，看同一份 HEX 时饱和度更低。先把预览搬到校准过的显示器和受控环境里再评判。",
            "第二，你对比的那个工具可能用了更广的色域。Figma 在支持的苹果设备上以 P3 渲染；我们的预览只有 sRGB，对于完全饱和的三原色，在同一块屏幕上会显得略不那么饱和。这不是任一边的 bug；这是两个不同色域各自显示其「域内最大值」的结果。",
            "第三，gamma 曲线。sRGB 在存储上用一条非线性 gamma 曲线（大约 gamma 2.2）。某些工具正确地施加曲线；另一些在线性光里合成、仅在输出时才施加曲线。我们的转换器不合成任何东西——它就是纯空间到空间的算术——所以这一点应该影响不到我们，但它会影响你拿来对比的那张截图。",
          ],
        },
        {
          heading: "「我能用这个转换器跑可访问性对比度检查吗？」",
          paragraphs: [
            "就转换本身而言，可以。WCAG 2.1 的对比度公式作用在 sRGB 线性亮度之上，不是直接作用在 HEX、RGB、HSL 上；从 HEX 转到 RGB 是必要的第一步，我们的转换器正确地完成了这一步。拿到 RGB 后，把每个通道按 sRGB gamma 反函数（`(c/255)^2.4` 近似）做一遍、算相对亮度、再用「两份亮度 + 0.05 修正」相除。",
            "本页目前不直接提供对比度检查器。如果你需要，WebAIM Contrast Checker 是行业参考；把我们预览块里的 HEX 复制过去，对照 AA（正文 4.5:1）或 AAA（7:1）阈值验证就行。",
          ],
        },
        {
          heading: "在落地颜色决策之前的最佳实践清单",
          paragraphs: [
            "下面这五条习惯能消灭已交付代码里最常见的颜色回归。",
          ],
        },
      ],
      bullets: [
        "在 design token 里把颜色存成 HEX。这是最紧凑的无歧义线格式，下游每一个工具都按同样方式解析。",
        "当变化是「人类话语」时（更暖、更饱和、稍微深一点），在 HSL 里编辑——一个通道、一次动作。",
        "在 RGB 里做数学。平均、混合、渐变插值——RGB 才是正确的界面；HSL 色相绕一圈会把你坑了。",
        "互动状态（hover、active、focus）从同一个色相挑。改饱和度和明度，保持色相不变——整套 UI 的色板就会保持连贯。",
        "在真实屏幕上验证对比度，不要只在设计工具里验。设计稿里 4.5:1 的比，到太阳光下的 LCD 上可能就成了 3.9:1。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
