import Apis from "routes/apis";

export const uploadFile = async (file, type) => {
    const data = new FormData();
    data.append("file", file);
    let url = '';
    if (type === 'image') {
        data.append("upload_preset", 'Image_Preset');
        url = Apis.upload.image;
    } else if (type === 'video') {
        data.append("upload_preset", 'Video_Preset');
        url = Apis.upload.video;
    } else if (type === 'audio') {
        data.append("upload_preset", 'Audio_Preset');
        url = Apis.upload.audio;
    } else {
        data.append("upload_preset", 'Docs_Preset');
        url = Apis.upload.document;
    }
    try {
        const response = await fetch(url, {
            method: "POST",
            body: data,
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
    }
}