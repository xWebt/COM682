const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");

module.exports = async function (context, req) {
    context.log('UploadImage function processed a request.');

    // 处理CORS预检请求
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
        return;
    }

    try {
        if (!req.body || !req.body.image) {
            context.res = {
                status: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*"
                },
                body: { error: "缺少图片文件" }
            };
            return;
        }

        const connectionString = process.env.STORAGE_CONNECTION_STRING;
        const containerName = process.env.CONTAINER_NAME || "journal-images";

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // 确保容器存在
        await containerClient.createIfNotExists({
            access: 'blob'
        });

        // 处理base64图片
        const imageData = req.body.image;
        let imageBuffer;
        let contentType = 'image/jpeg';

        if (typeof imageData === 'string') {
            // Base64格式
            const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
            imageBuffer = Buffer.from(base64Data, 'base64');
            const match = imageData.match(/^data:image\/(\w+);base64,/);
            if (match) {
                contentType = `image/${match[1]}`;
            }
        } else {
            imageBuffer = Buffer.from(imageData);
        }

        // 生成唯一文件名
        const blobName = `${uuidv4()}-${Date.now()}.${getExtensionFromContentType(contentType)}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // 上传图片
        await blockBlobClient.upload(imageBuffer, imageBuffer.length, {
            blobHTTPHeaders: { blobContentType: contentType }
        });

        // 获取URL
        const imageUrl = blockBlobClient.url;

        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: { imageUrl: imageUrl }
        };
    } catch (error) {
        context.log.error('Error uploading image:', error);
        context.res = {
            status: 500,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: { error: error.message }
        };
    }
};

function getExtensionFromContentType(contentType) {
    const map = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp'
    };
    return map[contentType] || 'jpg';
}

