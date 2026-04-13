import axios from "axios";
import { BASE_URL } from "../constant";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;