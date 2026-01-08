#!/bin/bash

# Functions代码部署脚本（用于本地环境）
# 使用方法: ./deploy-functions.sh <Function_App_Name>
# 示例: ./deploy-functions.sh travel-journal-func-ecce29fb

set -e

# 检查参数
if [ -z "$1" ]; then
    echo "错误: 请提供Function App名称"
    echo "使用方法: ./deploy-functions.sh <Function_App_Name>"
    echo "示例: ./deploy-functions.sh travel-journal-func-ecce29fb"
    exit 1
fi

FUNCTION_APP=$1

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 检查functions目录是否存在
if [ ! -d "functions" ]; then
    echo "错误: 找不到functions目录"
    echo "请确保在项目根目录运行此脚本"
    exit 1
fi

echo "开始部署Functions代码到: $FUNCTION_APP"
echo ""

# 进入functions目录
cd functions

# 安装依赖
echo "安装依赖..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "node_modules已存在，跳过安装（如需重新安装，请删除node_modules目录）"
fi

# 部署Functions
echo ""
echo "部署Functions代码..."
func azure functionapp publish $FUNCTION_APP

echo ""
echo "=========================================="
echo "Functions代码部署完成！"
echo "=========================================="
echo "Function App URL: https://$FUNCTION_APP.azurewebsites.net"
echo "API端点: https://$FUNCTION_APP.azurewebsites.net/api"
echo ""
echo "下一步："
echo "1. 在 js/app.js 中更新 API_BASE_URL 为: https://$FUNCTION_APP.azurewebsites.net/api"
echo "2. 测试API端点是否正常工作"

