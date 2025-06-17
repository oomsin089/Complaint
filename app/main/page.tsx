"use client";
import React, { useEffect, useRef, useState } from "react";
import Navbar from "../navbar/page";
import { useSession } from '../../utils/useSession';
import { useAuth } from "../../utils/auth";
import { useRouter } from "next/navigation";
import ApplicantTracking from "../../navbar/Breadcrump";
import PersonIcon from '@mui/icons-material/Person';
import Link from "next/link";
import { useGetAll } from "../../hooks/useGetAll";
import { Complaint } from "../../types/complaintCreate";
import { useGetComplaintByEmailAddress } from "../../hooks/useGetComplaintByEmailAddress";
import LogoutIcon from '@mui/icons-material/Logout';
const MainPage = () => {
  const { session, loading } = useSession();
  const { logout } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [rank, setRank] = useState<string>("");
  const { data: getAll } = useGetAll();
  const { data: responseData } = useGetComplaintByEmailAddress(session?.emailAddress) as { data?: Complaint[] };
  const userComplaintsCount = responseData?.length || 0; // นับจำนวนคำร้องทั้งหมดของ user ปัจจุบัน
  // Inside your component:
  const [showSignout, setShowSignout] = useState(false);

  const handleButtonClick = () => {
    setShowSignout(!showSignout);
  };
  useEffect(() => {
    console.log(session); // ดูค่า session ที่ได้มา
    if (!loading && session === null) {
      router.push('/login');
    }
  }, [session, loading]);

  useEffect(() => {
    if (session?.fullName) {
      setUserName(session.fullName);
    }
  }, [session]);
  
  useEffect(() => {
    if (session?.rank) {
      setRank(session.rank);
    }
  }, [session]);
  const handleLogout = async () => {
    try {
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("รหัสผ่านหรืออีเมลไม่ถูกต้อง");
    }
  };




  return (
    <div className="min-h-screen bg-[#e8edff] flex flex-col items-center">
      {/* Gradient Header */}
      <div className="w-full bg-gradient-to-b from-green-200 to-blue-200 h-32 rounded-b-lg shadow-md">
        <Link href="/main" className="hover:underline">
          <img
            src="/images/logo.png"
            width={150}
            className="absolute top-2 left-2 z-20"
            alt="Logo"
          />
        </Link>
        <div style={{ position: 'relative' }}>
          <div className="text-right" style={{ marginRight: '60px', marginTop: '40px', width: '95%' }}>
            <div className="flex flex-col items-end">
              <button
                onClick={handleButtonClick}
                className="inline-flex items-center"
              >
                <span className="text-gray-800 font-medium">
                  {rank} {userName}
                  <PersonIcon style={{ marginLeft: "5px" }} />
                </span>
              </button>

              {showSignout && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '10px',
                  zIndex: 50,
                  marginTop: '5px'
                }}>
                  <button
                    onClick={handleLogout}
                    className="bg-white text-black text-sm flex items-center px-4 py-1 rounded-full shadow-md hover:bg-gray-200 hover:shadow-lg"
                  >
                    <span>Logout</span>
                    <LogoutIcon style={{ marginLeft: "8px", color: 'red' }} />
                  </button>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Navbar */}
      <div className="w-full max-w-[90%] -mt-10 z-10">
        <div className="bg-white shadow-lg rounded-xl">
          <Navbar />
        </div>
      </div>
      <div className="rounded-lg mt-6 ml-8 w-[90%]">
        <ApplicantTracking />
      </div>
      {/* Main Content */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-2 max-w-[90%] w-full flex-grow mb-12">
        <h1 className="text-2xl font-bold text-center text-blue-600">ระบบจัดการการร้องเรียน/ร้องทุกข์</h1>
        <p className="mt-4 text-center text-gray-600">
          ยินดีต้อนรับเข้าสู่ระบบรับเรื่องร้องเรียน/ร้องทุกข์คณะบริหารธุรกิจ
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Card: All Reports */}
          <div className="bg-blue-100 rounded-lg p-6 shadow-md text-center transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold text-blue-800">การรายงานทั้งหมด</h2>
            <p className="mt-4 text-3xl font-bold text-blue-800">{getAll?.length}</p>
          </div>

          {/* Card: Pending Reports */}
          <div className="bg-orange-100 rounded-lg p-6 shadow-md text-center transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold text-orange-800">รอดำเนินการ</h2>
            <p className="mt-4 text-3xl font-bold text-orange-800">
              {getAll?.filter(item => item.status === 'รอดำเนินการ').length}
            </p>
          </div>

          {/* Card: In Progress */}
          <div className="bg-yellow-100 rounded-lg p-6 shadow-md text-center transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold text-yellow-800">กำลังดำเนินการ</h2>
            <p className="mt-4 text-3xl font-bold text-yellow-800">
              {getAll?.filter(item => item.status === 'กำลังดำเนินการ').length}
            </p>
          </div>

          {/* Card: Resolved Reports */}
          <div className="bg-teal-100 rounded-lg p-6 shadow-md text-center transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold text-teal-800">คำร้องที่รอตรวจสอบ</h2>
            <p className="mt-4 text-3xl font-bold text-teal-800">
              {getAll?.filter(item => item.status === 'รอตรวจสอบ').length}
            </p>
          </div>

          {/* Card: Resolved Reports */}
          <div className="bg-green-100 rounded-lg p-6 shadow-md text-center transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold text-green-800">เสร็จสิ้น</h2>
            <p className="mt-4 text-3xl font-bold text-green-800">
              {getAll?.filter(item => item.status === 'เสร็จสิ้น').length}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Your Reports */}
          <div className="bg-purple-100 rounded-lg p-6 shadow-md text-center transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold text-purple-800">คำร้องของคุณ</h2>
            <p className="mt-4 text-3xl font-bold text-purple-800">
              {userComplaintsCount}
            </p>
            <button
              onClick={() => (router.push('/followreport'))}
              className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              ดูรายละเอียด
            </button>
          </div>

          {/* Card: Resolved Reports */}
          <div className="bg-teal-100 rounded-lg p-6 shadow-md text-center transform transition-transform hover:scale-105">
            <h2 className="text-xl font-semibold text-teal-800">คำร้องที่รอตรวจสอบของคุณ</h2>
            <p className="mt-4 text-3xl font-bold text-teal-800">
              {responseData?.filter(item => item.status === 'รอตรวจสอบ').length || 0}
            </p>
            <button
              onClick={() => (router.push('/followreport'))}
              className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              ดูรายละเอียด
            </button>
          </div>
        </div>
      </div>
      <footer className="text-center py-4 text-sm text-gray-600">
        Copyright © 2025 ระบบรับเรื่องร้องเรียนร้องทุกข์ | Developed by Nattanun Naknaree & Rittinun Disaraphong | Version (1.0)
      </footer>
    </div>
    
  );
};

export default MainPage;
