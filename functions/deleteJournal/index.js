const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");
const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
    context.log('DeleteJournal function processed a request.');

    try {
        const journalId = req.query.journalId;

        if (!journalId) {
            context.res = {
                status: 400,
                body: { error: "缺少journalId参数" }
            };
            return;
        }

        const connectionString = process.env.STORAGE_CONNECTION_STRING;
        const tableName = process.env.TABLE_NAME || "journals";
        const containerName = process.env.CONTAINER_NAME || "journal-images";
        
        const credential = new AzureNamedKeyCredential(
            getAccountName(connectionString),
            getAccountKey(connectionString)
        );
        
        const tableClient = new TableClient(
            getTableEndpoint(connectionString),
            tableName,
            credential
        );

        // 先获取实体以获取图片URL
        const userId = "default-user";
        let imageUrl = null;
        try {
            const entity = await tableClient.getEntity(userId, journalId);
            imageUrl = entity.ImageUrl;
        } catch (error) {
            // 实体不存在，继续删除操作（幂等性）
        }

        // 删除表实体
        await tableClient.deleteEntity(userId, journalId);

        // 删除Blob中的图片
        if (imageUrl) {
            try {
                const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
                const containerClient = blobServiceClient.getContainerClient(containerName);
                const blobName = imageUrl.split('/').pop().split('?')[0]; // 提取blob名称
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                await blockBlobClient.delete();
            } catch (error) {
                context.log.warn('Error deleting blob:', error);
                // 继续执行，不因删除blob失败而失败
            }
        }

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: { message: "日记删除成功" }
        };
    } catch (error) {
        context.log.error('Error deleting journal:', error);
        context.res = {
            status: error.statusCode === 404 ? 404 : 500,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: { error: error.message }
        };
    }
};

function getAccountName(connectionString) {
    const match = connectionString.match(/AccountName=([^;]+)/);
    return match ? match[1] : '';
}

function getAccountKey(connectionString) {
    const match = connectionString.match(/AccountKey=([^;]+)/);
    return match ? match[1] : '';
}

function getTableEndpoint(connectionString) {
    const accountName = getAccountName(connectionString);
    return `https://${accountName}.table.core.windows.net`;
}

