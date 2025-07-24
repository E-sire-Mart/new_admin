// src/utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: "https://api.e-SireMart.in"
});
console.log(axiosInstance);

export default axiosInstance;
