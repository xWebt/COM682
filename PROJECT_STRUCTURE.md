# 项目结构说明

```
COM682-cw2/
│
├── index.html                          # 前端主页面
├── staticwebapp.config.json            # Static Web App配置文件
│
├── css/
│   └── styles.css                      # 样式文件（响应式设计）
│
├── js/
│   └── app.js                          # 前端JavaScript逻辑（API调用、UI交互）
│
├── functions/                          # Azure Functions后端
│   ├── host.json                       # Functions运行时配置
│   ├── package.json                    # Node.js依赖
│   ├── local.settings.json.example     # 本地开发配置模板
│   │
│   ├── createJournal/                  # 创建日记API
│   │   ├── function.json
│   │   └── index.js
│   │
│   ├── getJournals/                    # 获取日记列表API
│   │   ├── function.json
│   │   └── index.js
│   │
│   ├── getJournal/                     # 获取单个日记API
│   │   ├── function.json
│   │   └── index.js
│   │
│   ├── deleteJournal/                  # 删除日记API
│   │   ├── function.json
│   │   └── index.js
│   │
│   └── uploadImage/                    # 上传图片API
│       ├── function.json
│       └── index.js
│
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml   # GitHub Actions CI/CD工作流
│
├── deploy-azure.sh                     # Azure资源自动部署脚本
├── logic-app.json                      # Logic App工作流定义（可选）
│
├── README.md                           # 完整项目文档
├── QUICKSTART.md                       # 快速开始指南
├── DEMO_SCRIPT.md                      # 演示脚本
├── PROJECT_STRUCTURE.md                # 本文件
└── .gitignore                          # Git忽略文件
```

## 核心文件说明

### 前端文件
- **index.html**: 单页面应用，包含创建表单和日记列表
- **css/styles.css**: 现代化响应式样式，使用渐变背景和卡片布局
- **js/app.js**: 前端逻辑，处理API调用、表单提交、图片预览等

### 后端Functions
每个Function包含：
- **function.json**: HTTP触发器配置
- **index.js**: 函数逻辑代码

**API端点**:
- `POST /api/createJournal` - 创建日记
- `GET /api/getJournals` - 获取所有日记
- `GET /api/getJournal` - 获取单个日记
- `DELETE /api/deleteJournal` - 删除日记
- `POST /api/uploadImage` - 上传图片（base64）

### 配置和部署
- **deploy-azure.sh**: 一键创建所有Azure资源
- **.github/workflows/azure-static-web-apps.yml**: GitHub Actions自动部署
- **staticwebapp.config.json**: Static Web App路由和导航配置

### 文档
- **README.md**: 完整文档，包括架构、部署、API说明
- **QUICKSTART.md**: 5分钟快速开始指南
- **DEMO_SCRIPT.md**: 演示脚本和时间安排

## 数据模型

### Table Storage (journals表)
- **PartitionKey**: 用户ID（当前使用"default-user"）
- **RowKey**: 日记ID（时间戳+随机字符串）
- **Title**: 日记标题（字符串）
- **Text**: 日记内容（字符串）
- **ImageUrl**: 图片URL（字符串）
- **Timestamp**: 创建时间（ISO字符串）

### Blob Storage (journal-images容器)
- 存储上传的图片文件
- 文件名格式: `{uuid}-{timestamp}.{extension}`
- 公开访问（blob级别）

## 技术栈

- **前端**: HTML5, CSS3, Vanilla JavaScript
- **后端**: Node.js 18, Azure Functions v4
- **存储**: Azure Table Storage, Azure Blob Storage
- **部署**: Azure Static Web App, GitHub Actions
- **监控**: Application Insights
- **工作流**: Azure Logic Apps（可选）

## 部署流程

1. **Azure资源部署**: 运行 `deploy-azure.sh`
2. **Functions部署**: 脚本自动部署，或手动运行 `func azure functionapp publish <name>`
3. **前端部署**: 
   - 通过GitHub Actions（自动）
   - 或使用SWA CLI手动部署
4. **配置更新**: 更新 `js/app.js` 中的 `API_BASE_URL`

## 开发环境设置

```bash
# 1. 安装依赖
cd functions
npm install

# 2. 配置本地设置
cp local.settings.json.example local.settings.json
# 编辑 local.settings.json，填入实际连接字符串

# 3. 运行Functions本地
func start

# 4. 运行前端（使用简单HTTP服务器）
python3 -m http.server 8000
# 或
npx serve .
```

## 注意事项

- 所有Functions使用匿名认证（authLevel: "anonymous"）
- CORS已在代码中设置（Access-Control-Allow-Origin: *）
- 使用免费/基础层服务以降低成本
- 图片使用base64编码传输（简化实现）
- 使用默认用户分区（"default-user"），未实现多用户

## 扩展建议

- 添加用户认证（Azure AD B2C）
- 实现多用户支持（真正的PartitionKey）
- 添加图片压缩和缩略图
- 集成Computer Vision API进行图片分析
- 添加搜索和筛选功能
- 实现日记编辑功能
- 添加评论和点赞功能

