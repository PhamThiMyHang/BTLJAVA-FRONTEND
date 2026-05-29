import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Địa chỉ Backend của Hang
    withCredentials: true, // Phải có cái này vì Backend đã để allowCredentials(true)
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;