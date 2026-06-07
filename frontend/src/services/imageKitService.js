// frontend/src/services/imageKitService.js
import api from './api';

const IMAGEKIT_URL = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/r9naagwrj';
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '';

export const getImageKitAuth = async () => {
    const response = await api.get('/imagekit/auth');
    return response.data;
};

export const getImageUrl = (path) => {
    return `${IMAGEKIT_URL}/${path}`;
};

export const uploadImage = async (file, folder = '') => {
    try {
        const auth = await getImageKitAuth();
        const formData = new FormData();
        
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('folder', `Car-Driver/${folder}`);
        
        const response = await fetch(`${IMAGEKIT_URL}/api/v1/files/upload`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${btoa(auth.token + ":")}`,
            },
            body: formData
        });
        
        return await response.json();
    } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
    }
};