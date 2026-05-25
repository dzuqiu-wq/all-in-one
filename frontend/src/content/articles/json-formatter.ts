import type { ToolArticleContent } from "@/components/ToolArticle";

const en: ToolArticleContent = {
  eyebrow: "WHITEPAPER · CLIENT-SIDE JSON.PARSE PIPELINE",
  title:
    "Why a JSON formatter belongs in the browser: ECMA-404, parser internals, and the long tail of malformed payloads",
  lead:
    "Pretty-printing JSON is the rare developer chore where the right answer is also the boring one — call the platform's native JSON.parse, hand the result back to JSON.stringify, and ship nothing over the network. Everything interesting lives in the edges: which characters belong to the grammar, how parsers report errors, and what the long tail of broken inputs actually looks like in the wild.",
  sections: [
    {
      id: "industry",
      heading: "Industry Standard & Context",
      lead:
        "JSON is a wire format, not a programming-language literal. The grammar is small enough to fit on one page, but the disconnect between that grammar and the JavaScript object literals developers reach for in their heads is the source of nearly every error this tool will surface.",
      subsections: [
        {
          heading: "ECMA-404 / RFC 8259 — the grammar this tool enforces",
          paragraphs: [
            "JSON was originally specified by Douglas Crockford in RFC 4627, then re-published as the more authoritative ECMA-404 in 2013 and IETF RFC 8259 in 2017. The two documents agree on the same lexical grammar, with RFC 8259 layering on a few interoperability recommendations — notably that the top-level value can be any JSON value (not just an object or array) and that text MUST be encoded in UTF-8.",
            "The grammar is small. A JSON document is a single value. A value is one of: an object (`{}`), an array (`[]`), a string (always double-quoted), a number, the literal `true`, the literal `false`, or the literal `null`. Whitespace is allowed between tokens but never inside them. Comments do not exist in the grammar — neither `//` nor `/* */`. Trailing commas do not exist either: `[1,2,3,]` is invalid even though every modern programming language tolerates it in source code.",
            "This formatter accepts whatever your tab's `JSON.parse` accepts. That is intentional. Browser implementations are tested against the same ECMA-404 / RFC 8259 conformance suites; if a payload survives `JSON.parse`, every downstream JSON consumer in the world will accept it too.",
          ],
        },
        {
          heading: "Why JSON beat XML for API payloads",
          paragraphs: [
            "When AJAX took off in 2005, XML was the default wire format for `XMLHttpRequest`. It lost market share to JSON for three structural reasons. First, the grammar is roughly an order of magnitude smaller: no namespaces, no entities, no DTD, no schema language baked into the document. Second, the parsing API in the browser is two characters — `JSON.parse` — versus dozens for DOM traversal. Third, JavaScript object literals look almost identical to JSON, which makes the cognitive cost of hand-authoring a payload close to zero.",
            "By 2015 the major REST APIs (GitHub, Stripe, Twilio, Slack) had standardised on JSON for both request and response bodies. By 2020 even traditionally XML-heavy industries — banking integrations, healthcare HL7 messaging — were publishing JSON-native APIs alongside their legacy SOAP endpoints. JSON's dominance is so complete that newer formats like CBOR and MessagePack market themselves explicitly as `binary JSON` rather than as standalone schemes.",
          ],
        },
        {
          heading: "Where developers reach for a formatter every day",
          paragraphs: [
            "Three workflows dominate the use-cases we see in production telemetry. They are all pure-developer scenarios — this is not a tool the marketing team needs.",
            "First, eyeballing API responses. A `curl https://api.example.com/v2/users | jq .` works on the command line, but plenty of developers ship-and-iterate inside the browser. Pasting a minified API response into a tab and getting back a properly indented tree is faster than installing `jq` on a fresh laptop.",
            "Second, debugging logs. Modern logging stacks emit one JSON object per line (newline-delimited JSON, NDJSON) for stream-friendly aggregation. A single line plucked from a Kibana view or a CloudWatch log is invariably minified; pretty-printing it locally is the fastest way to spot the field whose value is wrong.",
            "Third, hand-authoring config. Many infrastructure tools — Terraform JSON variants, AWS IAM policies, GitHub Actions matrix configurations — still accept JSON as a config format. The grammar's strictness becomes a footgun the moment you forget a comma or close-brace; a formatter that surfaces the exact character offset of the failure beats the toolchain's own error message in nine cases out of ten.",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "Under the Hood · Deep Dive",
      lead:
        "The implementation is intentionally small — three exported functions over `JSON.parse` and `JSON.stringify`. The interesting engineering is in what we deliberately do NOT do: no custom tokenizer, no string concatenation, no streaming parser, no JSON5 fallback. The platform parser is already industrial-grade, and re-implementing it would only add bugs.",
      subsections: [
        {
          heading: "Step 1 — Why we don't ship a custom tokenizer",
          paragraphs: [
            "Every browser engine in the last decade ships a SIMD-accelerated JSON parser. V8's parser (used by Chrome, Edge, Node) processes well-formed inputs at multiple gigabytes per second on a modern x86 core. Safari's JSC parser and Firefox's SpiderMonkey parser are within the same order of magnitude.",
            "Re-implementing JSON parsing in user-space JavaScript would be a strict regression: slower by a factor of 10-100x, with a smaller test corpus, and at risk of subtle conformance drift from the spec. The same reasoning applies in reverse: anything `JSON.parse` accepts is what the rest of the ecosystem accepts. Compatibility is not a feature we have to maintain — it is inherited from the platform.",
          ],
        },
        {
          heading: "Step 2 — JSON.stringify and the indent argument",
          paragraphs: [
            "`JSON.stringify(value, replacer, space)` accepts a third argument that controls indentation. When `space` is a positive integer, the engine inserts that many spaces between structural tokens. When it is a string, that string is used as the indent literal. When it is omitted or `0`, the output has no whitespace at all — that is the minify path.",
            "Our `formatJson(input, indent)` is exactly `JSON.stringify(JSON.parse(input), null, indent)`. The parse-and-restringify pattern has a useful side effect: it canonicalises the output. Duplicate keys (which the JSON grammar permits but RFC 8259 strongly discourages) are collapsed to the last value seen; key insertion order is preserved within each object; and any non-significant whitespace inside the original input is stripped before being re-emitted with the chosen indent.",
          ],
        },
        {
          heading: "Step 3 — Surface-level error reporting",
          paragraphs: [
            "When `JSON.parse` rejects an input, modern engines throw a `SyntaxError` whose `message` property describes the failure with a position offset. V8 emits messages like `Unexpected token 'a' at position 4 in JSON`; SpiderMonkey produces `JSON.parse: expected property name or '}' at line 1 column 2 of the JSON data`. Both messages are precise enough to be actionable.",
            "Our `validateJson` wraps the parse in a `try`/`catch`, narrows the caught value to `Error`, and surfaces `error.message` directly to the UI. We do not attempt to re-format the message or translate it; the engine's wording is more accurate than any heuristic rewriter we could ship, and surfacing it verbatim makes the failure searchable on Stack Overflow.",
          ],
        },
        {
          heading: "Step 4 — Why this entire file is 35 lines",
          paragraphs: [
            "The `jsonFormatter.ts` module is 35 lines of TypeScript including comments. Every line traces directly to either ECMA-404 grammar or the platform `JSON` API. There is no abstraction layer, no parser combinator, no `JsonNode` class hierarchy.",
            "That is the design. The cost of adding a layer — say, a custom AST walker — is paid every time someone reads the code, every time a bug needs fixing, and every time a new edge case (BigInt, NaN, Infinity) needs handling. The native `JSON.parse` already handles every edge case the spec defines; layering on top of it would only add surface area without expanding capability.",
          ],
        },
        {
          heading: "Step 5 — The browser tab as the entire sandbox",
          paragraphs: [
            "Everything in this tool runs inside the V8 / JSC / SpiderMonkey instance that loaded the page. There is no Service Worker, no Web Worker, no `fetch` to a backend, no `localStorage` write. The textarea content lives in component state and is dereferenced when the tab is closed.",
            "That property has a security-relevant consequence: a JSON payload pasted here is invisible to our infrastructure. We do not have an endpoint that could log it; we do not even have a request handler that could intercept it. The blast radius of an information disclosure is exactly the radius of your own browser tab.",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "Troubleshooting & Guide",
      lead:
        "Three classes of errors account for the overwhelming majority of `JSON.parse` failures: characters that look like JSON but aren't (unquoted keys, single quotes, trailing commas), encoding issues (BOM, non-UTF-8 input), and grammar surprises (JavaScript constants used as JSON values). Each is fixable in seconds once recognised.",
      subsections: [
        {
          heading: "`Unexpected token a in JSON at position N` — unquoted keys",
          paragraphs: [
            "JSON keys MUST be double-quoted strings. JavaScript object literal syntax allows bare identifiers — `{ a: 1 }` is a valid JS literal — but the JSON grammar requires `{ \"a\": 1 }`. This is the single most common authoring mistake and it manifests as an `Unexpected token` error pointing at the first character of the bare identifier.",
            "The fix is mechanical: wrap every key in double quotes. If your input came from a JavaScript source file rather than a wire payload, you may need to convert single-quoted strings to double-quoted strings as well. The two transformations are usually done together with a regex substitution in your editor.",
          ],
        },
        {
          heading: "`Unexpected token ' in JSON` — single-quoted strings",
          paragraphs: [
            "JSON strings MUST use double quotes. Python's `repr()` of a dictionary, JavaScript's `console.log()` output for some embedded structures, and many ad-hoc templating tools emit single-quoted strings — none of which are JSON.",
            "Replace all `'` characters with `\"` inside string values. Be careful with apostrophes inside English text: `\"it's\"` is correct JSON, `'it\\'s'` is not. A safer transformation is to round-trip the payload through `JSON.stringify` in your source language before saving it, which guarantees correctly-quoted output.",
          ],
        },
        {
          heading: "`Unexpected token ] in JSON` — trailing commas",
          paragraphs: [
            "JavaScript, Python, Go, and Rust all tolerate trailing commas inside arrays and objects in source code — `[1, 2, 3,]` is fine in every one of those languages. JSON does not allow them. The parser sees the comma, expects another value, sees the closing bracket, and throws.",
            "Strip the trailing comma. If you are generating JSON programmatically and find yourself fighting trailing commas, switch to `JSON.stringify` (in JavaScript) or `json.dumps` (in Python) instead of string-concatenating the payload by hand.",
          ],
        },
        {
          heading: "`Unexpected non-whitespace character after JSON at position N`",
          paragraphs: [
            "This usually means you have two JSON documents concatenated together — for example, an NDJSON line broken across two log entries that got pasted into one buffer. The parser successfully reads the first complete value, then encounters the start of the next one and complains.",
            "Split the input into one document per parse. If your data is genuinely NDJSON, format each line separately. If it is a streaming-JSON variant (JSON Lines, JSON-seq), use the appropriate per-record parser rather than treating the whole stream as one value.",
          ],
        },
        {
          heading: "Numbers that lose precision after a round-trip",
          paragraphs: [
            "JSON has a single `number` type. JavaScript represents all numbers as 64-bit IEEE 754 floats. Integer values larger than 2^53 (approximately 9.007 × 10^15) lose precision when parsed: `9007199254740993` round-trips as `9007199254740992`.",
            "If your payload carries integer IDs larger than `Number.MAX_SAFE_INTEGER`, the only safe representation in JSON is a string. Many APIs that emit user IDs from Snowflake or 64-bit auto-increment generators have already adopted this convention — Twitter's API famously switched its tweet IDs to strings for exactly this reason.",
          ],
        },
        {
          heading: "Best-practice checklist before pasting a payload",
          paragraphs: [
            "These five habits eliminate most authoring-time errors and they are essentially free once memorised.",
          ],
        },
      ],
      bullets: [
        "Double-quote every key. JSON keys are strings, never bare identifiers.",
        "Double-quote every string. Single quotes are a JavaScript thing, not a JSON thing.",
        "Strip trailing commas — JSON does not tolerate them anywhere.",
        "Replace `undefined`, `NaN`, and `Infinity` with `null` or a string. None of them are valid JSON values.",
        "If integer IDs exceed 2^53, serialise them as strings to preserve precision across language boundaries.",
      ],
    },
  ],
};

const zh: ToolArticleContent = {
  eyebrow: "技术白皮书 · 浏览器端 JSON.PARSE 流水线",
  title:
    "为什么 JSON 格式化器属于浏览器：ECMA-404、解析器内幕，以及那条长长的坏数据尾巴",
  lead:
    "美化 JSON 是程序员日常里少见的「答案既正确又乏味」的活——调用一次平台原生 JSON.parse，再把结果交给 JSON.stringify，全程不走任何网络。所有有趣的细节都藏在边角：语法到底允许什么字符、解析器报错的方式有多精准，以及野外那些花式破损的 payload 究竟长什么样。",
  sections: [
    {
      id: "industry",
      heading: "行业标准与合规背景",
      lead:
        "JSON 是一种传输格式，不是某门语言的对象字面量语法。它的语法小到可以印在一张 A4 纸上，但「这条语法」和「程序员脑子里所谓的对象字面量」之间的鸿沟，几乎是这款工具会暴露出来的全部错误的来源。",
      subsections: [
        {
          heading: "ECMA-404 / RFC 8259 —— 本工具实际执行的语法",
          paragraphs: [
            "JSON 最早由 Douglas Crockford 在 RFC 4627 中定义，2013 年升级为更权威的 ECMA-404，2017 年由 IETF 再发布为 RFC 8259。两份文档使用完全相同的词法语法，RFC 8259 又叠加了若干互操作建议——例如顶层值可以是任意 JSON 值（不强制是对象或数组），以及 JSON 文本必须以 UTF-8 编码。",
            "语法本身很短。一个 JSON 文档就是一个值。一个值只能是以下七种之一：对象（`{}`）、数组（`[]`）、字符串（必须用双引号）、数字、字面量 `true`、字面量 `false`、字面量 `null`。token 之间允许出现空白，但 token 内部不允许。注释不在语法里——既不允许 `//` 也不允许 `/* */`。结尾逗号也不在语法里：`[1,2,3,]` 不合法，即使几乎所有现代编程语言在源代码里都容忍它。",
            "本工具完全遵循你这个标签页里 `JSON.parse` 的行为。这是刻意的：浏览器实现都跑了同一套 ECMA-404 / RFC 8259 一致性测试集，能被 `JSON.parse` 接受的 payload，全世界任何一个下游 JSON 消费者都会接受。",
          ],
        },
        {
          heading: "JSON 为什么打赢了 XML",
          paragraphs: [
            "2005 年 AJAX 兴起时，`XMLHttpRequest` 默认的传输格式是 XML。JSON 之所以蚕食 XML 的市场份额，结构性原因有三条。第一，语法体积大约小一个数量级：没有命名空间、没有实体、没有 DTD，也没有内嵌的 schema 子语言。第二，浏览器里的解析 API 就是两个字符——`JSON.parse`，而 DOM 遍历得用几十个 API。第三，JavaScript 的对象字面量长得几乎和 JSON 一样，手写 payload 的认知成本几乎为零。",
            "到 2015 年，主流 REST API（GitHub、Stripe、Twilio、Slack）已经在请求与响应体上统一用了 JSON。到 2020 年，连传统上重度依赖 XML 的行业——银行系统集成、医疗行业的 HL7 消息——也都在传统 SOAP 端点之外发布了 JSON 原生接口。JSON 的统治力已经完成到连 CBOR、MessagePack 这类后辈格式都直接拿「二进制 JSON」做营销定位，而不是把自己定位成全新方案。",
          ],
        },
        {
          heading: "开发者每天会用到格式化器的场景",
          paragraphs: [
            "我们看到生产遥测里出现频率最高的三类工作流，全部是纯开发者场景——市场或运营团队基本不需要这款工具。",
            "第一，肉眼看 API 响应。命令行上当然可以 `curl https://api.example.com/v2/users | jq .`，但仍有相当多开发者习惯在浏览器里来回迭代。把一份压缩后的 API 响应粘进一个标签页，立刻拿到缩进良好的树形结构——比给临时机器装一份 `jq` 快得多。",
            "第二，调试日志。现代日志栈往往一行一个 JSON 对象（NDJSON，Newline-Delimited JSON）来便于流式聚合。从 Kibana 视图或者 CloudWatch 日志里挑出一行时，它必然是压缩的；把它本地美化一下，是定位「哪个字段值不对」最快的办法。",
            "第三，手写配置。许多基础设施工具——Terraform 的 JSON 变体、AWS IAM 策略、GitHub Actions 的 matrix 配置——至今仍接受 JSON 作为配置格式。JSON 语法的严格性会立刻变成绊脚石：少一个逗号、少一个右花括号，整份配置就废。一款能直接指向失败字符偏移量的格式化器，在九成情况下都比工具链自己的错误信息更有用。",
          ],
        },
      ],
    },
    {
      id: "underTheHood",
      heading: "极客视角 · 底层硬核拆解",
      lead:
        "实现刻意做得极小——三个导出函数加在一起就是对 `JSON.parse` 和 `JSON.stringify` 的轻量包装。真正有意思的工程在于我们「没做什么」：不写自定义词法分析、不做字符串拼接、不写流式解析器、不退化到 JSON5。平台解析器已经是工业级的，自己再写一遍只会引入更多 bug。",
      subsections: [
        {
          heading: "决策 1 · 为什么不写自己的词法分析器",
          paragraphs: [
            "过去十年间发布的浏览器引擎都内置了 SIMD 加速的 JSON 解析器。Chrome / Edge / Node 用的 V8 解析器在一颗现代 x86 核心上，对良构输入的吞吐量是 GB/s 级别。Safari 的 JSC 解析器和 Firefox 的 SpiderMonkey 解析器与之处于同一量级。",
            "用 JavaScript 用户态再实现一次 JSON 解析，会是严格的退步：性能慢 10-100 倍、测试用例覆盖更小、还要面对相对规范的小幅一致性偏差。反过来也是一样：能被 `JSON.parse` 接受的，就是整个生态都会接受的。兼容性不是我们要维护的特性——它是从平台继承下来的。",
          ],
        },
        {
          heading: "决策 2 · JSON.stringify 与 indent 参数",
          paragraphs: [
            "`JSON.stringify(value, replacer, space)` 的第三个参数控制缩进。当 `space` 是正整数时，引擎在结构 token 之间插入对应数量的空格；当它是字符串时，那个字符串就被当作缩进字面量；当它被省略或为 `0` 时，输出完全无空白——这就是 minify 路径。",
            "我们的 `formatJson(input, indent)` 本质就是 `JSON.stringify(JSON.parse(input), null, indent)`。这种「先解再写」模式有个有用的副作用：输出会被规范化。重复 key（语法允许但 RFC 8259 强烈不推荐）会被合并成最后一次出现的值；同一对象内的 key 插入顺序会被保留；原始输入里所有非结构性空白会先被剥光，再以选定的缩进重新喷出。",
          ],
        },
        {
          heading: "决策 3 · 表层错误上报",
          paragraphs: [
            "当 `JSON.parse` 拒绝输入时，现代引擎会抛出 `SyntaxError`，其 `message` 中带有失败字符的偏移量。V8 给出的形如 `Unexpected token 'a' at position 4 in JSON`；SpiderMonkey 形如 `JSON.parse: expected property name or '}' at line 1 column 2 of the JSON data`。两者的措辞都精确到可以直接复制去 Stack Overflow 搜索。",
            "我们的 `validateJson` 用 `try`/`catch` 把解析包起来，把捕获值收窄到 `Error`，然后把 `error.message` 原文呈现在界面上。我们刻意不重写、不翻译这条信息——引擎自己的描述比任何启发式改写都更准确，原文呈现也让用户更容易在搜索引擎里找到对应的解决方案。",
          ],
        },
        {
          heading: "决策 4 · 为什么整个 module 只有 35 行",
          paragraphs: [
            "`jsonFormatter.ts` 加上注释一共 35 行 TypeScript，每一行都能直接追溯到 ECMA-404 语法或者平台的 `JSON` API。没有抽象层、没有 parser combinator、没有 `JsonNode` 类层级。",
            "这就是设计。每加一层抽象——比如自定义 AST 遍历器——的代价会在三个地方反复支付：别人读代码的时候、修 bug 的时候、以及处理新边界情况（BigInt、NaN、Infinity）的时候。原生 `JSON.parse` 已经覆盖了规范里定义的全部边界；在它之上再叠加只会增加表面积而不扩展能力。",
          ],
        },
        {
          heading: "决策 5 · 浏览器标签页就是整个沙箱",
          paragraphs: [
            "整个工具的所有逻辑都在加载这个页面的 V8 / JSC / SpiderMonkey 实例里运行。没有 Service Worker、没有 Web Worker、没有 `fetch` 去后端、没有 `localStorage` 写入。textarea 的内容生活在组件状态里，标签页关闭即被释放。",
            "这条性质带来一个安全相关的副产品：在这里粘贴的任意 JSON 对我们的基础设施完全不可见。我们没有可以记录它的端点，甚至没有可以拦截它的请求处理函数。一次信息泄漏的爆炸半径，正好等于你自己浏览器标签页的半径。",
          ],
        },
      ],
    },
    {
      id: "troubleshooting",
      heading: "排错指南 · 长尾问答",
      lead:
        "压倒性比例的 `JSON.parse` 失败，都落在三类错误里：「看起来像 JSON 但不是」（不带引号的 key、单引号、结尾逗号）、编码问题（BOM、非 UTF-8 输入）、以及把 JavaScript 常量当 JSON 用造成的语法错误。每一类都能在认出来之后几秒钟内修好。",
      subsections: [
        {
          heading: "`Unexpected token a in JSON at position N` —— key 没加引号",
          paragraphs: [
            "JSON 的 key 必须是双引号字符串。JavaScript 对象字面量允许写 `{ a: 1 }`，JSON 必须写 `{ \"a\": 1 }`。这是手写阶段最常见的错误，表现为「Unexpected token」错误指向那个裸标识符的第一个字符。",
            "修复方式机械化：把每一个 key 都用双引号包起来。如果输入来自 JavaScript 源文件而不是真实 wire payload，多半还得把所有单引号字符串一并换成双引号——这两个变换通常在编辑器里用一次正则替换就能做完。",
          ],
        },
        {
          heading: "`Unexpected token ' in JSON` —— 单引号字符串",
          paragraphs: [
            "JSON 字符串必须用双引号。Python 的 `repr()`、JavaScript 某些嵌入结构的 `console.log()` 输出、以及不少临时模板工具都会吐出单引号字符串——它们都不是 JSON。",
            "把字符串值里所有的 `'` 换成 `\"`。注意英文文本中的撇号：`\"it's\"` 是合法 JSON，`'it\\'s'` 不是。更安全的做法是在源语言里先用 `JSON.stringify`（JavaScript）或 `json.dumps`（Python）做一次正经的序列化，再保存到文件。",
          ],
        },
        {
          heading: "`Unexpected token ] in JSON` —— 结尾逗号",
          paragraphs: [
            "JavaScript、Python、Go、Rust 在源代码里都容忍数组和对象的结尾逗号——`[1, 2, 3,]` 在它们里都没问题。JSON 不允许。解析器看到逗号会期望下一个值，结果遇到了结束括号，于是抛错。",
            "删掉那个结尾逗号。如果你在程序化生成 JSON 时反复和结尾逗号搏斗，最好的办法是直接用 `JSON.stringify`（JavaScript）或 `json.dumps`（Python），不要手工字符串拼接 payload。",
          ],
        },
        {
          heading: "`Unexpected non-whitespace character after JSON at position N`",
          paragraphs: [
            "这通常意味着你把两份 JSON 文档拼到了一起——例如本来是 NDJSON 的两行日志被一起粘贴到一个缓冲区里。解析器成功读完了第一个完整值，接着遇到了下一个值的起始字符，于是报错。",
            "请把输入拆成「一份 JSON 解析一次」。如果你的数据本来就是 NDJSON，就逐行格式化。如果是 JSON Lines、JSON-seq 这类流式变体，请使用对应的逐条解析器，而不是把整段流当成一个值喂进来。",
          ],
        },
        {
          heading: "数字往返之后丢精度",
          paragraphs: [
            "JSON 只有一种 `number` 类型。JavaScript 内部把所有数字都表示为 64 位 IEEE 754 浮点。大于 2^53（约 9.007 × 10^15）的整数在解析时会丢精度：`9007199254740993` 往返之后会变成 `9007199254740992`。",
            "如果你的 payload 里有大于 `Number.MAX_SAFE_INTEGER` 的整数 ID，唯一安全的表示方式是把它当字符串。许多用 Snowflake 或 64 位自增主键生成用户 ID 的 API 早已采用这一约定——Twitter 当年就是因为这个原因把 tweet ID 在 API 里改成字符串的。",
          ],
        },
        {
          heading: "粘贴 payload 之前的最佳实践清单",
          paragraphs: [
            "下面五条习惯一旦养成基本是零成本的，但能消灭手写 JSON 阶段几乎所有错误。",
          ],
        },
      ],
      bullets: [
        "所有 key 都用双引号——JSON 的 key 是字符串，不是裸标识符。",
        "所有字符串都用双引号——单引号是 JavaScript 的事，不是 JSON 的事。",
        "去掉一切结尾逗号——JSON 在任何位置都不容忍它。",
        "把 `undefined`、`NaN`、`Infinity` 换成 `null` 或字符串——这三个都不是合法 JSON 值。",
        "整数 ID 超过 2^53 时，序列化成字符串，避免跨语言边界丢精度。",
      ],
    },
  ],
};

const article = { en, zh };
export default article;
