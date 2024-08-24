import axios from "axios";

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

        // Only attempt to refresh the token if it's not a login request
        if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== "login/") {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refresh_token");

            if (refreshToken) {
                try {
                    const response = await axiosInstance.post("token/refresh/", { refresh: refreshToken });
                    localStorage.setItem("access_token", response.data.access);
                    localStorage.setItem("refresh_token", response.data.refresh);

                    originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`;
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    console.error("Error refreshing token:", refreshError);
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    return Promise.reject(refreshError);
                }
            } else {
                console.error("No refresh token available");
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;