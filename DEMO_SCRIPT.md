# 演示脚本 (5分钟演示)

## 准备
- 确保所有Azure资源已部署
- 打开浏览器访问Static Web App URL
- 打开Azure Portal

---

## 第一部分：展示Azure资源架构 (1分钟)

### 1.1 资源组概览 (30秒)
- 打开Azure Portal
- 导航到资源组 `travel-journal-rg`
- 展示所有资源：
  - ✅ Static Web App (前端)
  - ✅ Function App (后端API)
  - ✅ Storage Account (存储)
  - ✅ Application Insights (监控)
  - ✅ Logic App (可选，如果部署)

**话术**: "这是我们的云原生旅行日记平台。使用Azure Static Web App承载前端，Azure Functions提供REST API，Table Storage存储日记数据，Blob Storage存储图片，Application Insights提供监控。"

### 1.2 Application Insights监控面板 (30秒)
- 打开Application Insights资源
- 展示"概述"页面，显示：
  - 请求数量
  - 响应时间
  - 失败率
- 点击"实时指标"展示实时请求

**话术**: "Application Insights正在监控我们的API调用，可以看到实时的请求数量和性能指标。"

---

## 第二部分：演示核心功能 - CRUD操作 (3分钟)

### 2.1 创建新日记 (1分钟)
- 在浏览器中打开应用
- 填写表单：
  - 标题: "东京之旅"
  - 内容: "第一次访问日本，参观了浅草寺和东京塔..."
  - 上传一张图片
- 点击"创建日记"
- 等待成功提示

**话术**: "现在我来创建一个新的旅行日记。输入标题、描述和上传图片，点击创建。系统会将数据存储到Azure Table Storage，图片存储到Blob Storage。"

### 2.2 查看日记列表 (30秒)
- 页面自动刷新，显示新创建的日记
- 展示日记卡片（标题、预览图片、部分文本）
- 说明响应式布局

**话术**: "创建成功后，日记列表自动更新。每个日记卡片显示标题、图片预览和部分内容。界面采用响应式设计，适配各种设备。"

### 2.3 查看单个日记详情 (30秒)
- 点击日记卡片的"查看"按钮
- 模态框显示完整内容：
  - 大图
  - 完整文本
  - 创建时间

**话术**: "点击查看按钮，可以看到日记的完整内容，包括高清图片和全文。这是一个模态框设计，提供良好的用户体验。"

### 2.4 删除日记 (30秒)
- 关闭模态框
- 点击某个日记卡片的"删除"按钮
- 确认删除
- 验证日记从列表中消失

**话术**: "删除功能会同时删除Table Storage中的元数据和Blob Storage中的图片，确保数据一致性。"

### 2.5 创建更多日记 (30秒)
- 快速创建2-3个额外的日记
- 展示列表更新

**话术**: "我可以创建多个日记，系统会按时间倒序排列，最新的显示在最前面。"

---

## 第三部分：验证数据存储和集成 (1分钟)

### 3.1 验证Table Storage (30秒)
- 打开Azure Portal
- 导航到Storage Account > Table service > journals表
- 展示表中的实体（PartitionKey, RowKey, Title, Text, ImageUrl等字段）
- 说明数据模型

**话术**: "在Table Storage中，我们可以看到所有日记的元数据。使用PartitionKey存储用户ID，RowKey存储日记ID，还包含标题、文本、图片URL和时间戳等字段。"

### 3.2 验证Blob Storage (20秒)
- 在Storage Account中打开Container: `journal-images`
- 展示上传的图片文件
- 点击一个文件，展示属性（大小、URL等）

**话术**: "Blob Storage中存储了所有上传的图片。每个图片都有唯一的URL，可以公开访问，用于前端显示。"

### 3.3 验证API调用日志 (10秒)
- 返回Application Insights
- 点击"日志" > 运行查询查看最近的函数调用
- 展示API调用记录

**话术**: "Application Insights记录了所有API调用。我们可以看到每个函数的执行时间、状态码和详细信息，这对监控和调试非常有用。"

---

## 结尾总结 (30秒)

**话术**: "总结一下，我们成功构建了一个完整的云原生旅行日记平台：
- 使用Azure Static Web App提供快速、可扩展的前端
- Azure Functions提供无服务器后端API
- Table Storage和Blob Storage分别存储结构化和非结构化数据
- Application Insights提供全面的监控
- 整个系统可以自动扩展，按使用量付费，非常适合云原生架构。
这个平台展示了Azure核心服务的集成使用，体现了现代云应用的最佳实践。"

---

## 备选演示点（如果时间允许）

- **Logic App集成**: 展示当日记创建时触发的工作流
- **错误处理**: 演示网络错误时的用户体验
- **性能**: 展示Application Insights中的响应时间分析
- **扩展性**: 说明系统如何自动扩展处理高负载

---

## 提示

- 提前准备好测试图片
- 确保所有服务正常运行
- 如果某个服务响应慢，准备简短解释（如"这是冷启动"）
- 保持演示流畅，重点突出核心功能

