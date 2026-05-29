# Frontend (Next.js 15)

## 项目结构

- `src/app/` - Next.js App Router 页面
- `src/components/` - React 组件
- `src/hooks/` - 自定义 React Hooks
- `src/lib/` - 工具函数库
- `src/i18n/` - 国际化配置 (next-intl)
- `public/` - 静态资源

## 开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 类型检查
npx tsc --noEmit

# ESLint 检查
npm run lint

# 运行测试 (Vitest)
npm run test

# E2E 测试 (Playwright)
npx playwright test
```

## 技术栈

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS
- next-intl (国际化)
- Vitest (单元测试)
- Playwright (E2E 测试)

## 注意事项

- 前端使用 `http://localhost:3000`，后端 API 在 `http://localhost:8000`
- 组件路径别名: `@/` 指向 `src/`
