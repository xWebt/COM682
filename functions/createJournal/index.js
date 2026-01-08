const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

module.exports = async function (context, req) {
    context.log('CreateJournal function processed a request.');

    try {
        const { title, text, imageUrl } = req.body;

        if (!title || !text || !imageUrl) {
            context.res = {
                status: 400,
                body: { error: "缺少必需字段: title, text, imageUrl" }
            };
            return;
        }

        const connectionString = process.env.STORAGE_CONNECTION_STRING;
        const tableName = process.env.TABLE_NAME || "journals";
        
        const credential = new AzureNamedKeyCredential(
            getAccountName(connectionString),
            getAccountKey(connectionString)
        );
        
        const tableClient = new TableClient(
            getTableEndpoint(connectionString),
            tableName,
            credential
        );

        // 确保表存在（如果不存在则创建，忽略已存在的错误）
        try {
            await tableClient.createTable();
        } catch (error) {
            // 表已存在，忽略错误
            if (error.statusCode !== 409) {
                throw error;
            }
        }

        // 生成唯一ID
        const journalId = generateId();
        const userId = "default-user"; // 简化：使用默认用户
        
        const timestamp = new Date().toISOString();
        
        const entity = {
            partitionKey: userId,
            rowKey: journalId,
            Title: title,
            Text: text,
            ImageUrl: imageUrl,
            Timestamp: timestamp
        };

        await tableClient.createEntity(entity);

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: { 
                message: "日记创建成功",
                journalId: journalId 
            }
        };
    } catch (error) {
        context.log.error('Error creating journal:', error);
        context.res = {
            status: 500,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: { error: error.message }
        };
    }
};

function generateId() {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
}

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

