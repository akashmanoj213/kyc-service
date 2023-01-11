const { postFile } = require('./axiosClient');

const uploadFile = async (fileBuffer, fileName, customerId) => {
    const params = {
        customerId
    }
    return await postFile('https://sahi-document-service-dnhiaxv6nq-el.a.run.app/external/document/upload', fileBuffer, fileName, {params}, true);
}

module.exports = {
    uploadFile
}