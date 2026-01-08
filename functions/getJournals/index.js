const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

module.exports = async function (context, req) {
    context.log('GetJournals function processed a request.');

    try {
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

        // 查询所有日记（简化：使用默认用户分区）
        const userId = "default-user";
        const entities = tableClient.listEntities({
            queryOptions: { filter: `PartitionKey eq '${userId}'` }
        });

        const journals = [];
        for await (const entity of entities) {
            journals.push(entity);
        }

        // 按时间倒序排序
        journals.sort((a, b) => {
            const timeA = new Date(a.Timestamp || a.rowKey);
            const timeB = new Date(b.Timestamp || b.rowKey);
            return timeB - timeA;
        });

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: journals
        };
    } catch (error) {
        context.log.error('Error getting journals:', error);
        context.res = {
            status: 500,
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

