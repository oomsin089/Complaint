"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from "next/navigation";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../utils/auth';
import { useSession } from '../../utils/useSession';
import AlertBox from '../../components/modal/Alert';
export default function Login() {
  const router = useRouter();
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { refreshSession2 } = useSession(); // ดึง refreshSession มาจาก useSession
  //Modal Alert
  const [openAlert, setOpenAlert] = useState(false);
  const [typeAlert, setTypeAlert] = useState("");
  const [textAlert, setTextAlert] = useState("");

  const handleAlert = (type: ("success" | "error" | "warning" | "info"), text: string) => {
    setOpenAlert(true);
    setTypeAlert(type);
    setTextAlert(text);
  }


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // setIsLoading(true);
    setError('');

    try {
      await loginAdmin(email, password);
      await refreshSession2(); // รีเฟรช session
      handleAlert("success", "Login Success");
      setTimeout(() => {
        router.push("/adminmain");
      }, 1500);
    } catch (error) {
      console.error("Logout failed:", error);
      handleAlert("warning", "Incorrect email or password");
    }
  };


  return (
    <>
      <div
        className="flex justify-center items-center min-h-screen bg-gray-100 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/BackgroundLogin.jpg)',
        }}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg w-96 opacity-100">
          <h2 className="text-2xl font-semibold text-center text-black mb-6">เข้าสู่ระบบ (ผู้ดูแลระบบ)</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-black">อีเมล</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="กรอกอีเมล"
                required
              // disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-black mb-2">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกรหัสผ่าน"
                  required
                // disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              เข้าสู่ระบบ
            </button>
          </form>
          <Link href="/login">
            <button
              className="w-full p-3 bg-white text-gray-600 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 mt-4"
            >
              สำหรับผู้ใช้งานทั่วไป
            </button>
          </Link>
          <footer className="text-center py-4 text-sm text-gray-600 mt-4">
            Copyright © 2025 ระบบรับเรื่องร้องเรียนร้องทุกข์  Developed by Nattanun & Rittinun
          </footer>
        </div>
      </div>
      <AlertBox
        type={typeAlert}
        text={textAlert}
        isOpen={openAlert}
        setIsOpen={setOpenAlert}
      />
    </>
  );
}
