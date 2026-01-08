# Azure区域代码参考

Azure CLI需要使用区域代码（location code），而不是完整的区域名称。

## 常用区域代码

### 亚太地区
- `southeastasia` - 东南亚（新加坡，适合印尼等国家）
- `eastasia` - 东亚（香港）
- `japaneast` - 日本东部（东京）
- `japanwest` - 日本西部（大阪）
- `australiaeast` - 澳大利亚东部（新南威尔士）
- `australiasoutheast` - 澳大利亚东南部（维多利亚）
- `koreacentral` - 韩国中部（首尔）
- `koreasouth` - 韩国南部（釜山）
- `centralindia` - 印度中部
- `southindia` - 印度南部
- `westindia` - 印度西部

### 欧洲
- `westeurope` - 西欧（荷兰）
- `northeurope` - 北欧（爱尔兰）
- `francecentral` - 法国中部（巴黎）
- `francesouth` - 法国南部（马赛）
- `germanywestcentral` - 德国中西部（法兰克福）
- `uksouth` - 英国南部（伦敦）
- `ukwest` - 英国西部（卡迪夫）

### 美洲
- `eastus` - 美国东部（弗吉尼亚）
- `eastus2` - 美国东部2（弗吉尼亚）
- `westus` - 美国西部（加利福尼亚）
- `westus2` - 美国西部2（华盛顿）
- `centralus` - 美国中部
- `southcentralus` - 美国中南部（德克萨斯）
- `brazilsouth` - 巴西南部（圣保罗）
- `canadacentral` - 加拿大中部（多伦多）
- `canadaeast` - 加拿大东部（魁北克）

### 其他
- `southafricanorth` - 南非北部（约翰内斯堡）
- `uaenorth` - 阿联酋北部（迪拜）

## 查找可用的区域

在Azure CLI中运行以下命令查看所有可用区域：

```bash
# 列出所有区域
az account list-locations -o table

# 按显示名称搜索（例如搜索包含"Asia"的区域）
az account list-locations --query "[?contains(displayName, 'Asia')].{Name:name, DisplayName:displayName}" -o table

# 查看订阅支持的区域
az account list-locations --query "[].{Name:name, DisplayName:displayName}" -o table
```

## 推荐选择

对于印尼用户，推荐使用：
- **southeastasia**（东南亚，新加坡）- 延迟低，适合大多数用例
- **eastasia**（东亚，香港）- 备选方案

这两个区域都提供良好的性能，且包含在Azure免费层中。

