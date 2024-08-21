import axios from "axios";
import { useNavigate } from "react-router-dom";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api/",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
        accept: "application/json",
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && originalRequest.url !== "token/refresh/") {
            const refreshToken = localStorage.getItem("refresh_token");

            if (refreshToken) {
                try {
                    const response = await axiosInstance.post("token/refresh/", { refresh: refreshToken });
                    localStorage.setItem("access_token", response.data.access);
                    localStorage.setItem("refresh_token", response.data.refresh);

                    originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`;
                    return axiosInstance(originalRequest);
                } catch (err) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");

                    const navigate = useNavigate();
                    navigate("/login");
                }
            } else {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");

                const navigate = useNavigate();
                navigate("/");
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
