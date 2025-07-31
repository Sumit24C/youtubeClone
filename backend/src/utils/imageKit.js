import ImageKit from 'imagekit'
import fs from 'fs'
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const uploadOnImageKit = async (localFilePath, localFileName) => {
    try {
        const response = await imagekit.upload({
            file: localFilePath,
            fileName: localFileName,
            folder: '/mytube',
        })
        console.log("imagekit:: res::", response)
        fs.unlinkSync(localFilePath);
        return response
    } catch (error) {
        console.log("imagekit :: error :: ",error);
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFromImageKit = async () => {

}
export { uploadOnImageKit }
