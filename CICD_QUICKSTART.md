# CI/CD 快速配置指南（Logic Apps 版本）

## 🚀 3 分钟快速设置

您只需要配置 **Static Web App** 的自动部署，Logic Apps 已经在 Azure Portal 中配置好了。

### 步骤 1: 获取 Static Web App 部署 Token

```bash
# 获取 Static Web App 名称
SWA_NAME=$(az staticwebapp list --resource-group <你的资源组名> --query "[0].name" -o tsv)

# 获取部署 token
az staticwebapp secrets list --name $SWA_NAME --resource-group <你的资源组名> --query properties.apiKey -o tsv
```

**或者通过 Azure Portal：**
1. 打开 Azure Portal
2. 找到您的 Static Web App 资源
3. 点击左侧菜单的 **"管理部署令牌"** (Manage deployment token)
4. 复制显示的 token

### 步骤 2: 在 GitHub 中添加 Secret

1. 在 GitHub 仓库中，点击 **Settings**（设置）
2. 点击左侧菜单 **Secrets and variables** → **Actions**
3. 点击 **New repository secret**（新建仓库密钥）
4. 添加以下 Secret：
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value**: 步骤1中获取的 token
5. 点击 **Add secret**

### 步骤 3: 推送代码到 GitHub

```bash
git add .
git commit -m "feat: 添加 CI/CD 配置"
git push origin main
```

### 步骤 4: 验证部署

1. 在 GitHub 仓库点击 **Actions** 标签
2. 查看 "Azure Static Web Apps CI/CD" 工作流运行状态
3. 等待部署完成（通常 1-3 分钟）
4. 访问您的 Static Web App URL（在 Azure Portal 中查看）

## ✅ 完成！

现在，每次推送代码到 `main` 分支时，前端会自动部署到 Azure Static Web App。

**注意：** Logic Apps 不需要 CI/CD，它们已经在 Azure Portal 中配置好了。您只需要确保 `index.html` 中的 Logic App URL 是正确的。

## 🔍 检查清单

- [ ] Static Web App 已创建
- [ ] GitHub Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` 已配置
- [ ] 代码已推送到 GitHub
- [ ] GitHub Actions 工作流运行成功
- [ ] Static Web App 可以访问
- [ ] `index.html` 中的 Logic App URL 是正确的

## ❓ 常见问题

**Q: 工作流没有触发？**
A: 确保代码推送到 `main` 分支，并且 `.github/workflows/azure-static-web-apps.yml` 文件存在。

**Q: 部署失败？**
A: 检查 GitHub Secret 是否正确配置，token 是否有效。

**Q: Logic Apps 需要配置 CI/CD 吗？**
A: 不需要。Logic Apps 在 Azure Portal 中配置，不需要代码部署。
