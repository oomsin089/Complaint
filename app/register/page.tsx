"use client";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useAuth } from '../../utils/auth';
import { useState } from 'react';
import AlertBox from '../../components/modal/Alert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Swal from "sweetalert2";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [gender, setGender] = useState("");
  const [typePersonal, setTypePersonal] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rank, setRank] = useState("");
  //Modal Alert
  const [openAlert, setOpenAlert] = useState(false);
  const [typeAlert, setTypeAlert] = useState("");
  const [textAlert, setTextAlert] = useState("");

  const handleAlert = (type: ("success" | "error" | "warning" | "info"), text: string) => {
    setOpenAlert(true);
    setTypeAlert(type);
    setTextAlert(text);
  }
  const formatName = (value: string) => {
    // ตรวจสอบว่าขึ้นต้นด้วยตัวพิมพ์ใหญ่ และตัวที่เหลือเป็นพิมพ์เล็ก
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // เพิ่มบรรทัดนี้เพื่อป้องกันการ refresh หน้า

    if (isSubmitting) return;

    const errors: string[] = [];
    if (!firstName) errors.push("ชื่อ");
    if (!lastName) errors.push("นามสกุล");
    if (!email.trim()) errors.push("อีเมล");
    if (!password.trim()) errors.push("รหัสผ่าน");
    if (!gender.trim()) errors.push("เพศ")
    if (!typePersonal.trim()) errors.push("ประเภทผู้ใช้")

    if (errors.length > 0) {
      Swal.fire({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน!",
        text: `กรุณาระบุ: ${errors.join(", ")}`,
        icon: "warning",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password, firstName, lastName, gender, typePersonal, rank);
      handleAlert("success", "Register Success");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      handleAlert("warning", "Register Already");
      setTimeout(() => {
        window.location.reload(); // รีเฟรชหน้าเมื่อเกิด error
      }, 1500);
    } finally {
      setIsSubmitting(false);
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
        <div className="flex justify-center rounded-lg items-center bg-gray-100">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Register</h2>
            <p className="font-semibold text-center text-gray-700 mb-6">กรุณากรอกข้อมูลตามความเป็นจริง</p>

            <form onSubmit={handleRegister}>
              {/* Responsive grid layout - 1 column on mobile, 2 columns on medium screens and up */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left column */}
                <div>
                  <div className='mb-4'>
                    <label htmlFor="typePersonal" className="block text-gray-700">
                      ประเภทผู้ใช้<span className="text-red-500">*</span>
                    </label>
                    <select
                      id='typePersonal'
                      className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      value={typePersonal}
                      onChange={(e) => setTypePersonal(e.target.value)}
                    >
                      <option value="" disabled>ประเภทผู้ใช้</option>
                      <option value="อาจารย์">อาจารย์</option>
                      <option value="เจ้าหน้าที่">เจ้าหน้าที่</option>
                      <option value="นักศึกษา">นักศึกษา</option>
                      <option value="บุคคลภายนอก">บุคคลภายนอก</option>
                    </select>

                  </div>

                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700">
                      ชื่อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ชื่อ"
                      required
                      value={firstName}
                      onChange={(e) => {
                        const value = formatName(e.target.value);
                        setFirstName(value);
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700">อีเมล
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="อีเมล"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Right column */}
                <div>
                  <div className={`grid grid-cols-1 ${typePersonal === "อาจารย์" ? "md:grid-cols-2" : "md:grid-cols-1"} gap-4 mb-4`}>
                    <div>
                      <label htmlFor="gender" className="block text-gray-700">
                        เพศ<span className="text-red-500">*</span>
                      </label>
                      <select
                        id='gender'
                        className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="" disabled>เลือกเพศ</option>
                        <option value="ชาย">ชาย</option>
                        <option value="หญิง">หญิง</option>
                        <option value="LGBTQ+">LGBTQ+</option>
                      </select>
                    </div>

                    {typePersonal === "อาจารย์" && (
                      <div>
                        <label htmlFor="position" className="block text-gray-700">
                          ตำแหน่ง<span className="text-red-500">*</span>
                        </label>
                        <select
                          id="position"
                          className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={rank}
                          onChange={(e) => setRank(e.target.value)}
                          required
                        >
                          <option value="" disabled>เลือกตำแหน่ง</option>
                          <option value="ศ.ดร">ศ.ดร</option>
                          <option value="ผศ.ดร">ผศ.ดร</option>
                          <option value="รศ.ดร">รศ.ดร</option>
                          <option value="ดร.">ดร.</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* นามสกุล */}
                  <div className="mb-4">
                    <label htmlFor="surname" className="block text-gray-700">
                      นามสกุล<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="surname"
                      className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="นามสกุล"
                      required
                      value={lastName}
                      onChange={(e) => {
                        const value = formatName(e.target.value);
                        setLastName(value);
                      }}
                    />
                  </div>

                  {/* รหัสผ่าน */}
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700">รหัสผ่าน
                      <span className="text-red-500"> *</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="รหัสผ่าน"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        required
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
                </div>
              </div>

              {/* Buttons - full width on all screen sizes */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
                </button>
              </div>
            </form>

            <div className="text-center">
              <Link href="/login">
                <p className="text-gray-600 mb-4">มีบัญชีอยู่แล้ว?</p>
                <button
                  className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  เข้าสู่ระบบ
                </button>
              </Link>
              <footer className="text-center py-4 text-sm text-gray-600 mt-4">
                Copyright © 2025 ระบบรับเรื่องร้องเรียนร้องทุกข์  Developed by Nattanun & Rittinun
              </footer>
            </div>
          </div>
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