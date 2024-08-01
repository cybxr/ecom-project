import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api/",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
        accept: "application/json",
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
