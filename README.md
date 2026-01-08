# 旅行日记平台 (Travel Journal Platform)

一个基于Azure的云原生旅行日记平台，支持创建、查看、删除旅行日记，并上传图片。

## 架构概览

- **前端**: Azure Static Web App (HTML/CSS/JavaScript)
- **后端API**: Azure Functions (Node.js)
- **数据存储**: Azure Table Storage (日记元数据)
- **文件存储**: Azure Blob Storage (图片文件)
- **监控**: Application Insights
- **工作流**: Azure Logic Apps (可选)

## 功能特性

- ✅ 创建旅行日记（标题、文本、图片）
- ✅ 查看所有日记列表
- ✅ 查看单个日记详情
- ✅ 删除日记
- ✅ 图片上传和预览
- ✅ 响应式设计

## 快速开始

### 前置要求

- Azure订阅
- Azure CLI (`az`)
- Node.js 18+ 和 npm
- Azure Functions Core Tools (`func`)

### 方式一：使用部署脚本（推荐）

1. 克隆或下载此项目

2. 安装Azure Functions Core Tools:
```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

3. 登录Azure:
```bash
az login
```

4. 运行部署脚本:
```bash
chmod +x deploy-azure.sh
./deploy-azure.sh
```

5. 脚本会自动创建所有Azure资源并部署Functions代码

6. 更新前端API URL:
   - 编辑 `js/app.js`
   - 将 `API_BASE_URL` 替换为脚本输出的Function App URL

7. 部署前端到Static Web App:
   - 通过Azure Portal配置GitHub Actions自动部署
   - 或使用Azure CLI手动部署

### 方式二：手动部署

#### 1. 创建Azure资源

使用Azure Portal或Azure CLI创建以下资源：

**资源组**
```bash
az group create --name travel-journal-rg --location eastasia
```

**存储账户**
```bash
az storage account create \
    --name traveljournal<随机字符串> \
    --resource-group travel-journal-rg \
    --location eastasia \
    --sku Standard_LRS \
    --kind StorageV2
```

**创建表**
```bash
STORAGE_KEY=$(az storage account keys list --account-name <存储账户名> --resource-group travel-journal-rg --query "[0].value" -o tsv)
az storage table create --name journals --account-name <存储账户名> --account-key $STORAGE_KEY
```

**创建Blob容器**
```bash
az storage container create --name journal-images --account-name <存储账户名> --account-key $STORAGE_KEY --public-access blob
```

**Application Insights**
```bash
az monitor app-insights component create \
    --app travel-journal-insights \
    --location eastasia \
    --resource-group travel-journal-rg
```

**Function App**
```bash
az functionapp create \
    --resource-group travel-journal-rg \
    --consumption-plan-location eastasia \
    --runtime node \
    --runtime-version 18 \
    --functions-version 4 \
    --name travel-journal-func-<随机字符串> \
    --storage-account <存储账户名> \
    --app-insights travel-journal-insights \
    --os-type Linux
```

**配置Function App环境变量**
```bash
CONNECTION_STRING=$(az storage account show-connection-string --name <存储账户名> --resource-group travel-journal-rg --query connectionString -o tsv)
APP_INSIGHTS_KEY=$(az monitor app-insights component show --app travel-journal-insights --resource-group travel-journal-rg --query instrumentationKey -o tsv)

az functionapp config appsettings set \
    --name <Function App名> \
    --resource-group travel-journal-rg \
    --settings \
    "STORAGE_CONNECTION_STRING=$CONNECTION_STRING" \
    "TABLE_NAME=journals" \
    "CONTAINER_NAME=journal-images" \
    "APPINSIGHTS_INSTRUMENTATIONKEY=$APP_INSIGHTS_KEY"
```

**Static Web App**
```bash
az staticwebapp create \
    --name travel-journal-swa \
    --resource-group travel-journal-rg \
    --location eastasia \
    --sku Free
```

#### 2. 部署Functions

```bash
cd functions
npm install
func azure functionapp publish <Function App名>
cd ..
```

#### 3. 配置前端

编辑 `js/app.js`，更新 `API_BASE_URL`:
```javascript
const API_BASE_URL = 'https://<你的Function App名>.azurewebsites.net/api';
```

#### 4. 部署前端

**通过GitHub Actions（推荐）:**

1. 将代码推送到GitHub仓库
2. 在Azure Portal中配置Static Web App的GitHub连接
3. 获取部署token并添加到GitHub Secrets: `AZURE_STATIC_WEB_APPS_API_TOKEN`

**手动部署:**

```bash
# 安装SWA CLI
npm install -g @azure/static-web-apps-cli

# 构建和部署
swa deploy ./ --deployment-token <部署token>
```

## 项目结构

```
.
├── index.html              # 前端主页
├── css/
│   └── styles.css         # 样式文件
├── js/
│   └── app.js             # 前端逻辑
├── functions/             # Azure Functions代码
│   ├── host.json
│   ├── package.json
│   ├── createJournal/     # 创建日记API
│   ├── getJournals/       # 获取日记列表API
│   ├── getJournal/        # 获取单个日记API
│   ├── deleteJournal/     # 删除日记API
│   └── uploadImage/       # 上传图片API
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  # CI/CD工作流
├── deploy-azure.sh        # 自动部署脚本
└── README.md              # 本文档
```

## API端点

所有API端点位于: `https://<Function App名>.azurewebsites.net/api`

- `POST /api/createJournal` - 创建日记
  - Body: `{ title: string, text: string, imageUrl: string }`

- `GET /api/getJournals` - 获取所有日记列表

- `GET /api/getJournal?journalId=<id>` - 获取单个日记

- `DELETE /api/deleteJournal?journalId=<id>` - 删除日记

- `POST /api/uploadImage` - 上传图片
  - Body: `{ image: string }` (base64编码的图片)

## 本地测试

### 测试Functions

1. 复制 `functions/local.settings.json.example` 为 `functions/local.settings.json`
2. 填入实际的连接字符串和配置
3. 运行:
```bash
cd functions
npm install
func start
```

### 测试前端

使用本地服务器（如Python）:
```bash
python3 -m http.server 8000
```

然后在浏览器访问 `http://localhost:8000`

**注意**: 本地测试需要更新 `js/app.js` 中的 `API_BASE_URL` 为本地Functions地址（如 `http://localhost:7071/api`）

## Logic App集成（可选）

可以创建一个Logic App，在日记创建时触发工作流（如发送邮件、记录日志等）。

## Application Insights监控

Application Insights已集成到Function App中，可以在Azure Portal中查看：
- 函数调用次数
- 响应时间
- 错误和异常
- 依赖关系

## 成本估算

使用免费/基本层：
- Static Web App: Free层（每月100GB带宽）
- Function App: Consumption计划（每月前100万次调用免费）
- Storage Account: 前5GB存储和操作免费
- Application Insights: 每月前5GB数据免费

## 故障排除

### CORS错误
确保Function App的CORS设置允许前端域名，或在代码中已设置 `Access-Control-Allow-Origin: *`

### 图片上传失败
检查：
- Blob容器是否存在且为公开访问
- 存储账户连接字符串是否正确
- 文件大小是否在限制内（默认128MB）

### Functions部署失败
检查：
- Node.js版本是否为18
- 所有依赖是否已安装
- Azure CLI是否已登录

## 演示脚本（5分钟）

1. **展示Azure资源** (1分钟)
   - 打开Azure Portal
   - 展示资源组中的所有资源
   - 展示Application Insights监控面板

2. **演示CRUD操作** (3分钟)
   - 创建新日记（标题、文本、图片）
   - 查看日记列表
   - 点击查看单个日记详情
   - 删除一篇日记

3. **验证数据存储** (1分钟)
   - 在Azure Portal中查看Table Storage中的实体
   - 在Storage Explorer中查看Blob容器中的图片
   - 展示Application Insights中的API调用记录

## 许可证

本项目仅用于教育目的。

## 联系方式

如有问题，请联系项目维护者。

