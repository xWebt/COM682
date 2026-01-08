# CI/CD 配置指南（Logic Apps 版本）

本指南将帮助您为使用 **Logic Apps** 的项目配置 CI/CD。

## 概述

本项目使用以下架构：
- **前端**: Azure Static Web App（HTML/CSS/JavaScript）
- **后端API**: Azure Logic Apps（4个 Logic Apps 实现 CRUD 操作）
- **数据存储**: Azure Table Storage
- **文件存储**: Azure Blob Storage

**重要说明：**
- ✅ **Static Web App** 需要 CI/CD 自动部署
- ❌ **Logic Apps** 不需要 CI/CD（在 Azure Portal 中配置）

## GitHub Actions 工作流

本项目只有一个 GitHub Actions 工作流：

### Azure Static Web App CI/CD

- **文件**: `.github/workflows/azure-static-web-apps.yml`
- **功能**: 自动部署前端代码到 Azure Static Web App
- **触发条件**: 推送到 `main` 分支或创建/更新 Pull Request

## 快速配置（3 分钟）

### 步骤 1: 获取部署 Token

**方法 A: 通过 Azure CLI**
```bash
# 替换 <资源组名> 为您的实际资源组名称
RESOURCE_GROUP="<你的资源组名>"
SWA_NAME=$(az staticwebapp list --resource-group $RESOURCE_GROUP --query "[0].name" -o tsv)
az staticwebapp secrets list --name $SWA_NAME --resource-group $RESOURCE_GROUP --query properties.apiKey -o tsv
```

**方法 B: 通过 Azure Portal（推荐）**
1. 登录 [Azure Portal](https://portal.azure.com)
2. 找到您的 Static Web App 资源
3. 点击左侧菜单的 **"管理部署令牌"** (Manage deployment token)
4. 复制显示的 token

### 步骤 2: 配置 GitHub Secret

1. 在 GitHub 仓库中，点击 **Settings**（设置）
2. 在左侧菜单中，点击 **Secrets and variables** → **Actions**
3. 点击 **New repository secret**（新建仓库密钥）
4. 添加 Secret：
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value**: 步骤1中获取的 token
5. 点击 **Add secret**

### 步骤 3: 推送代码

```bash
git add .
git commit -m "feat: 配置 CI/CD"
git push origin main
```

### 步骤 4: 验证部署

1. 在 GitHub 仓库中，点击 **Actions** 标签
2. 查看 "Azure Static Web Apps CI/CD" 工作流运行状态
3. 等待部署完成（通常 1-3 分钟）
4. 访问您的 Static Web App URL 验证网站是否正常

## 工作流详解

### Static Web App 工作流

工作流文件：`.github/workflows/azure-static-web-apps.yml`

**触发条件：**
- 推送到 `main` 分支
- 创建或更新 Pull Request 到 `main` 分支

**工作流程：**
1. Checkout 代码
2. 构建和部署到 Azure Static Web App
3. 如果是 Pull Request，创建预览环境
4. 如果 Pull Request 关闭，清理预览环境

## Logic Apps 说明

**Logic Apps 不需要 CI/CD 配置**，因为：
- Logic Apps 在 Azure Portal 中通过可视化界面配置
- Logic Apps 的工作流定义保存在 Azure 中，不在代码仓库中
- 如果需要更新 Logic Apps，直接在 Azure Portal 中编辑即可

**您的项目中有 4 个 Logic Apps：**
- Create（创建）
- Get（读取）
- Update（更新）
- Delete（删除）

这些 Logic Apps 的 URL 已经在 `index.html` 中配置好了。

## 测试 CI/CD

### 测试前端部署

1. **修改前端代码**:
   ```bash
   # 编辑 index.html 或 css/styles.css，做一个小改动
   # 例如：修改标题文字
   ```

2. **提交并推送**:
   ```bash
   git add .
   git commit -m "test: CI/CD deployment"
   git push origin main
   ```

3. **检查 GitHub Actions**:
   - 在 GitHub 仓库中，点击 **Actions** 标签
   - 查看 "Azure Static Web Apps CI/CD" 工作流运行状态
   - 等待部署完成

4. **验证部署**:
   - 访问 Static Web App URL
   - 确认更改已生效

## 故障排除

### 工作流没有触发

**问题**: 推送代码后，GitHub Actions 工作流没有运行

**解决方案**:
- 确保代码推送到 `main` 分支
- 检查 `.github/workflows/azure-static-web-apps.yml` 文件是否存在
- 检查工作流文件的 YAML 语法是否正确
- 在 GitHub 仓库的 Actions 页面查看是否有错误提示

### 部署失败：Token 无效

**问题**: 工作流失败，显示 token 无效

**解决方案**:
- 检查 `AZURE_STATIC_WEB_APPS_API_TOKEN` Secret 是否正确配置
- 在 Azure Portal 中重新生成 token 并更新 Secret
- 确保 token 没有多余的空格或换行符

### 部署成功但网站无法访问

**问题**: GitHub Actions 显示部署成功，但网站无法访问

**解决方案**:
- 在 Azure Portal 中检查 Static Web App 的状态
- 查看 Static Web App 的日志
- 确认 `index.html` 在项目根目录
- 检查 `staticwebapp.config.json` 配置是否正确

### Logic Apps 相关

**问题**: Logic Apps 的 URL 在哪里？

**答案**: Logic Apps 的 URL 在 `index.html` 文件中配置（大约在第182-189行）

**问题**: 如何更新 Logic Apps 的 URL？

**答案**: 
1. 在 Azure Portal 中打开对应的 Logic App
2. 点击 **概览** → 复制 **HTTP POST URL**
3. 在 `index.html` 中更新对应的 URL 常量
4. 提交并推送到 GitHub，CI/CD 会自动部署

## 检查清单

在提交作业前，请确保：

- [ ] Static Web App 已创建
- [ ] GitHub Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` 已配置
- [ ] `.github/workflows/azure-static-web-apps.yml` 文件存在
- [ ] 代码已推送到 GitHub
- [ ] GitHub Actions 工作流至少成功运行过一次
- [ ] Static Web App 可以正常访问
- [ ] `index.html` 中的 Logic App URL 是正确的
- [ ] 4 个 Logic Apps（Create, Get, Update, Delete）都能正常工作
- [ ] 所有 CRUD 操作都能正常执行

## 最佳实践

1. **分支保护**: 在 GitHub 中设置分支保护规则（可选）
2. **测试**: 在部署到生产环境之前，先在本地测试
3. **监控**: 在 Azure Portal 中监控 Static Web App 的使用情况
4. **备份**: 定期备份您的代码和 Logic Apps 配置

## 下一步

- ✅ CI/CD 配置完成
- 🔄 测试所有 CRUD 操作
- 🔄 验证数据是否正确存储到 Table Storage
- 🔄 准备演示和文档

## 参考资源

- [Azure Static Web Apps GitHub Actions](https://github.com/Azure/static-web-apps-deploy)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Azure Static Web Apps 文档](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure Logic Apps 文档](https://docs.microsoft.com/azure/logic-apps/)
