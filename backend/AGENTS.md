# Backend (FastAPI)

## 项目结构

- `app/main.py` - FastAPI 应用入口
- `app/config.py` - 配置管理
- `tests/` - pytest 测试用例

## 开发命令

```bash
# 安装依赖
pip install -r requirements.txt

# 运行开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 运行测试
pytest

# 带覆盖率测试
pytest --cov=app --cov-report=html
```

## API 端点

- `POST /api/convert/word` - Word 转 PDF
- `POST /api/convert/excel` - Excel 转 PDF
- `POST /api/convert/powerpoint` - PowerPoint 转 PDF
- `GET /api/health` - 健康检查

## 技术栈

- FastAPI + Python 3.11+
- Gotenberg (PDF 转换服务，端口 7000)
- 滑动窗口限流: 5 请求/分钟/IP

## 注意事项

- 后端端口: 8000
- Gotenberg 端口: 7000
- 文件操作在内存中进行，不写入磁盘
- 转换超时: 5 秒
