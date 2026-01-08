#!/bin/bash

# Azure资源部署脚本（用于Azure Cloud Shell）
# 使用方法: ./deploy-azure.sh

set -e

# 配置变量 - 请根据实际情况修改
RESOURCE_GROUP="travel-journal-rg"
LOCATION="indonesiacentral"  # 主要区域（用于存储账户、Application Insights等）
FUNCTION_LOCATION="southeastasia"  # Function App区域（indonesiacentral不支持Function App，必须使用southeastasia）
SWA_LOCATION="eastasia"  # Static Web App区域（indonesiacentral不支持Static Web App，使用eastasia）
STORAGE_ACCOUNT="traveljournal$(openssl rand -hex 4)"
FUNCTION_APP="travel-journal-func-$(openssl rand -hex 4)"
STATIC_WEB_APP="travel-journal-swa-$(openssl rand -hex 4)"
APP_INSIGHTS="travel-journal-insights-$(openssl rand -hex 4)"
TABLE_NAME="journals"
CONTAINER_NAME="journal-images"

echo "开始部署Azure资源..."

# 1. 创建资源组
echo "创建资源组: $RESOURCE_GROUP"
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. 创建存储账户
echo "创建存储账户: $STORAGE_ACCOUNT"
az storage account create \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS \
    --kind StorageV2

# 3. 启用Table Storage和Blob Storage
echo "启用Table和Blob服务..."
az storage account blob-service-properties update \
    --account-name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --enable-versioning false \
    --enable-change-feed false

# 4. 创建表
echo "创建表: $TABLE_NAME"
STORAGE_KEY=$(az storage account keys list --account-name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query "[0].value" -o tsv)
az storage table create --name $TABLE_NAME --account-name $STORAGE_ACCOUNT --account-key $STORAGE_KEY

# 5. 创建Blob容器
echo "创建Blob容器: $CONTAINER_NAME"
az storage container create --name $CONTAINER_NAME --account-name $STORAGE_ACCOUNT --account-key $STORAGE_KEY --public-access blob

# 6. 创建Application Insights
echo "创建Application Insights: $APP_INSIGHTS"
az monitor app-insights component create \
    --app $APP_INSIGHTS \
    --location $LOCATION \
    --resource-group $RESOURCE_GROUP

APP_INSIGHTS_KEY=$(az monitor app-insights component show --app $APP_INSIGHTS --resource-group $RESOURCE_GROUP --query instrumentationKey -o tsv)

# 7. 创建Function App
echo "创建Function App: $FUNCTION_APP (区域: $FUNCTION_LOCATION)"
echo "注意: indonesiacentral区域不支持Function App，使用 $FUNCTION_LOCATION 区域"
az functionapp create \
    --resource-group $RESOURCE_GROUP \
    --consumption-plan-location $FUNCTION_LOCATION \
    --runtime node \
    --runtime-version 24 \
    --functions-version 4 \
    --name $FUNCTION_APP \
    --storage-account $STORAGE_ACCOUNT \
    --app-insights $APP_INSIGHTS \
    --os-type Linux

# 8. 配置Function App环境变量
echo "配置Function App环境变量..."
CONNECTION_STRING=$(az storage account show-connection-string --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query connectionString -o tsv)

az functionapp config appsettings set \
    --name $FUNCTION_APP \
    --resource-group $RESOURCE_GROUP \
    --settings \
    "STORAGE_CONNECTION_STRING=$CONNECTION_STRING" \
    "TABLE_NAME=$TABLE_NAME" \
    "CONTAINER_NAME=$CONTAINER_NAME" \
    "APPINSIGHTS_INSTRUMENTATIONKEY=$APP_INSIGHTS_KEY"

# 9. 创建Static Web App
echo "创建Static Web App: $STATIC_WEB_APP (区域: $SWA_LOCATION)"
echo "注意: indonesiacentral区域不支持Static Web App，使用 $SWA_LOCATION 区域"
az staticwebapp create \
    --name $STATIC_WEB_APP \
    --resource-group $RESOURCE_GROUP \
    --location $SWA_LOCATION \
    --sku Free

echo ""
echo "=========================================="
echo "Azure资源创建完成！"
echo "=========================================="
echo "资源组: $RESOURCE_GROUP"
echo "存储账户: $STORAGE_ACCOUNT (区域: $LOCATION)"
echo "Function App: $FUNCTION_APP (区域: $FUNCTION_LOCATION)"
echo "Function App URL: https://$FUNCTION_APP.azurewebsites.net"
echo "Static Web App: $STATIC_WEB_APP (区域: $SWA_LOCATION)"
echo "Application Insights: $APP_INSIGHTS (区域: $LOCATION)"
echo ""
echo "区域说明:"
echo "  - 存储账户和Application Insights使用 $LOCATION 区域"
echo "  - Function App使用 $FUNCTION_LOCATION 区域（indonesiacentral不支持）"
echo "  - Static Web App使用 $SWA_LOCATION 区域（indonesiacentral不支持）"
echo "  所有服务可以跨区域协作，不影响功能"
echo ""
echo "下一步："
echo "1. 在本地运行 deploy-functions.sh $FUNCTION_APP 部署Functions代码"
echo "2. 在 index.html 和 js/app.js 中更新 API_BASE_URL 为: https://$FUNCTION_APP.azurewebsites.net/api"
echo "3. 在Azure Portal中配置Static Web App的GitHub部署"
echo ""
echo "获取Static Web App部署token:"
echo "az staticwebapp secrets list --name $STATIC_WEB_APP --resource-group $RESOURCE_GROUP --query properties.apiKey -o tsv"

