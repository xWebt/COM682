# 快速开始指南

这是5分钟快速部署指南，帮助您快速运行旅行日记平台。

## 前置条件检查

```bash
# 检查Azure CLI
az --version

# 检查Node.js
node --version  # 需要 v18+

# 检查npm
npm --version

# 检查Azure Functions Core Tools
func --version  # 如果没有，安装: npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

## 一键部署（5步）

### 步骤1: 登录Azure
```bash
az login
```

### 步骤2: 运行部署脚本
```bash
chmod +x deploy-azure.sh
./deploy-azure.sh
```

脚本会自动：
- 创建资源组
- 创建存储账户
- 创建表和Blob容器
- 创建Application Insights
- 创建Function App
- 部署Functions代码

### 步骤3: 记录输出的URL
脚本完成后会输出Function App URL，类似：
```
Function App URL: https://travel-journal-func-xxxxx.azurewebsites.net
```

### 步骤4: 更新前端API地址
编辑 `js/app.js`，将第一行改为：
```javascript
const API_BASE_URL = 'https://travel-journal-func-xxxxx.azurewebsites.net/api';
```
（替换为步骤3中获取的实际URL）

### 步骤5: 部署前端到Static Web App

**选项A: 使用GitHub Actions（推荐）**
1. 将代码推送到GitHub
2. 在Azure Portal中找到Static Web App资源
3. 点击"管理部署token"，复制token
4. 在GitHub仓库中添加Secret: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. GitHub Actions会自动部署

**选项B: 使用Azure CLI手动部署**
```bash
# 安装SWA CLI
npm install -g @azure/static-web-apps-cli

# 获取部署token（在Azure Portal的Static Web App资源中）
# 然后部署
swa deploy ./ --deployment-token <你的token>
```

## 测试

1. 访问Static Web App URL（在Azure Portal中查看）
2. 创建一个日记：填写标题、内容，上传图片
3. 查看日记列表
4. 点击查看单个日记
5. 删除一个日记

## 验证存储

在Azure Portal中：
1. 打开存储账户
2. 查看"表服务" > "journals"表，应该能看到创建的日记
3. 查看"容器" > "journal-images"，应该能看到上传的图片

## 常见问题

**Q: 脚本报错"资源已存在"**
A: 修改脚本中的资源名称，添加随机后缀

**Q: Functions部署失败**
A: 确保Node.js版本是18，运行 `cd functions && npm install` 后再部署

**Q: 前端无法连接到API**
A: 检查 `js/app.js` 中的 `API_BASE_URL` 是否正确，检查Function App是否运行正常

**Q: CORS错误**
A: 代码中已设置CORS，如果还有问题，检查Function App的CORS设置

## 下一步

- 查看 `README.md` 了解更多详细信息
- 查看 `DEMO_SCRIPT.md` 了解演示脚本
- 查看Application Insights监控数据
- 自定义样式和功能

祝使用愉快！🎉

