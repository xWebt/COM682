const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

module.exports = async function (context, req) {
    context.log('GetJournal function processed a request.');

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
        
        const credential = new AzureNamedKeyCredential(
            getAccountName(connectionString),
            getAccountKey(connectionString)
        );
        
        const tableClient = new TableClient(
            getTableEndpoint(connectionString),
            tableName,
            credential
        );

        const userId = "default-user";
        const entity = await tableClient.getEntity(userId, journalId);

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: entity
        };
    } catch (error) {
        context.log.error('Error getting journal:', error);
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

