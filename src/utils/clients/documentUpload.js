const { postFile } = require('./axiosClient');

const uploadFile = async (fileBuffer, fileName) => {
    return await postFile('https://sahi-document-service-dnhiaxv6nq-el.a.run.app/external/document/upload', fileBuffer, fileName, {}, true);
}

module.exports = {
    uploadFile
}