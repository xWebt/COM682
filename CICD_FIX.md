# CI/CD 部署失败修复指南

## 问题

部署失败，错误信息：
```
npm error 404 Not Found - GET https://registry.npmjs.org/@azure%2fapplicationinsights
```

## 原因

Static Web App 自动检测到了 `functions/` 目录并尝试构建它，但您使用的是 Logic Apps，不需要 Functions。

## 解决方案

我已经更新了 GitHub Actions 工作流，在构建前会自动移除 `functions/` 目录。

### 方法 1: 使用更新后的工作流（已修复）

工作流已经更新，会自动排除 functions 目录。只需：

```bash
git add .github/workflows/azure-static-web-apps.yml
git commit -m "fix: 排除 functions 目录从构建"
git push origin main
```

### 方法 2: 在 Azure Portal 中配置（推荐，永久解决）

1. 登录 [Azure Portal](https://portal.azure.com)
2. 找到您的 Static Web App 资源
3. 点击左侧菜单的 **"配置"** (Configuration)
4. 点击 **"构建设置"** (Build configuration) 标签
5. 找到 **"API location"** (API 位置) 字段
6. **将其设置为空**（删除任何值）
7. 点击 **"保存"** (Save)

这样 Static Web App 就不会尝试构建 functions 目录了。

### 方法 3: 临时重命名 functions 目录（如果上述方法都不行）

如果需要在 Git 中保留 functions 目录但不想被构建：

```bash
# 重命名目录（不会被 Git 跟踪）
mv functions functions.backup
git add .
git commit -m "fix: 临时重命名 functions 目录"
git push origin main
```

## 验证

部署成功后，在 GitHub Actions 页面应该看到：
- ✅ 工作流运行成功
- ✅ 没有 npm 错误
- ✅ 网站可以正常访问

## 注意事项

- `functions/` 目录仍然在您的代码仓库中，只是不会被构建
- 如果您以后需要使用 Functions，可以恢复目录并配置 API location
- Logic Apps 的配置不受影响，因为它们是在 Azure Portal 中管理的

