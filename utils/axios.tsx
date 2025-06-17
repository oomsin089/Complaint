import axios from 'axios';

// สร้าง axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // ใช้ environment variable
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true  // สำคัญ! เพื่อให้ส่ง cookies ไปด้วย
});

// ฟังก์ชันกลางสำหรับเรียก API
export async function axiosApi<T>(method: 'get' | 'post' | 'put' | 'delete', url: string, data?: any, options?: any) {
    try {
    const response = await api({
      method,
      url,
      data,
    });
    return response.data as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      console.error("Axios error details:", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

export default api;
