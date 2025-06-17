"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "../../utils/useSession";
import { useAuth } from "../../utils/auth";
import { useGetComplaintByEmailAddress } from "../../hooks/useGetComplaintByEmailAddress";
import { Complaint } from "../../types/complaintCreate";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Navbar from "../adminnavbar/page";
import ApplicantTracking from "../../navbar/Breadcrump";
import SearchIcon from '@mui/icons-material/Search';
import ApplicantTrackingAdmin from "../../navbar/BreadcrumpAdmin";
import { useGetAllReport } from "../../hooks/useGetAllReport";
import LogoutIcon from '@mui/icons-material/Logout';

const MainPage = () => {
  const { session, loading } = useSession();
  const { logout } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const { data: getAll } = useGetAllReport();
  const sortedData = getAll?.sort((a, b) => a.id - b.id);


 const [showSignout, setShowSignout] = useState(false);

  const handleButtonClick = () => {
    setShowSignout(!showSignout);
  };


  const formatDates = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('th-TH');
  };
  useEffect(() => {
    if (session?.fullName) {
      setUserName(session.fullName);
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
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    topic: "",
    problem: "",
    problemDetail: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const formatSearchDate = (dateString: string): string => {
    if (!dateString) return '';
    const d = new Date(dateString);
    // แปลงเป็น yyyy-mm-dd สำหรับการเปรียบเทียบ
    return d.toISOString().split('T')[0];
  };


  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      topic: e.target.value,
      problem: "",  // รีเซ็ตค่ารายละเอียดเมื่อลองเลือกหัวข้อใหม่
    });
  };

  // ฟังก์ชั่นสำหรับ handle การเลือกรายละเอียดของหัวข้อ
  const handleDetailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      problem: e.target.value,
    });
  };

  const filteredComplaints = getAll?.filter((report) => {
    // แปลงวันที่ทั้งสองให้อยู่ในรูปแบบเดียวกันก่อนเปรียบเทียบ
    const complaintDate = report.createDate ? formatSearchDate(report.createDate.toString()) : '';
    const searchStartDate = filters.startDate ? formatSearchDate(filters.startDate) : '';
    const searchEndDate = filters.endDate ? formatSearchDate(filters.endDate) : '';

    // Check if date is within range (or if no range is specified)
    const dateMatch = (!searchStartDate && !searchEndDate) ||
      (searchStartDate && !searchEndDate && complaintDate >= searchStartDate) ||
      (!searchStartDate && searchEndDate && complaintDate <= searchEndDate) ||
      (searchStartDate && searchEndDate && complaintDate >= searchStartDate && complaintDate <= searchEndDate);
    const topicMatch = !filters.topic || report.topic === filters.topic;
    const detailsMatch = filters.problem === "" || report.problem === filters.problem;
    const problemDetailMatch = filters.problemDetail === "" ||
      report.problemDetail.toLowerCase().includes(filters.problemDetail.toLowerCase());
    return dateMatch && topicMatch && detailsMatch && problemDetailMatch;
  }) || [];

  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  useEffect(() => {
    console.log(session); // ดูค่า session ที่ได้มา
    if (!loading && session === null) {
      router.push('/adminlogin');
    }
  }, [session, loading]);
  const systemIssuesCategories: Record<string, string[]> = {
    "": [],
    "การเข้าสู่ระบบ": [
      "ไม่สามารถเข้าสู่ระบบได้",
      "ลืมรหัสผ่าน",
      "บัญชีถูกล็อก",
      "การยืนยันตัวตนมีปัญหา",
      "อื่นๆ เกี่ยวกับการเข้าสู่ระบบ"
    ],
    "การทำงานของระบบ": [
      "ระบบล่มหรือโหลดช้า",
      "ข้อมูลแสดงผลไม่ถูกต้อง",
      "ไม่สามารถบันทึกข้อมูลได้",
      "การประมวลผลผิดพลาด",
      "อื่นๆ เกี่ยวกับการทำงานของระบบ"
    ],
    "UI/UX และการใช้งาน": [
      "อินเทอร์เฟซไม่เป็นมิตรกับผู้ใช้",
      "ปุ่มหรือฟังก์ชันใช้งานไม่ได้",
      "สีหรือฟอนต์อ่านยาก",
      "หน้าเว็บหรือแอปแสดงผลผิดพลาด",
      "อื่นๆ เกี่ยวกับ UI/UX"
    ],
    "ระบบแจ้งเตือน": [
      "ไม่ได้รับอีเมลแจ้งเตือน",
      "การแจ้งเตือนผิดพลาด",
      "ระบบแจ้งเตือนไม่ทำงาน",
      "อื่นๆ เกี่ยวกับระบบแจ้งเตือน"
    ],
    "ฐานข้อมูลและข้อมูล": [
      "ข้อมูลสูญหาย",
      "ข้อมูลซ้ำซ้อน",
      "ไม่สามารถเรียกดูข้อมูลได้",
      "อื่นๆ เกี่ยวกับฐานข้อมูลและข้อมูล"
    ],
    "ความปลอดภัยของระบบ": [
      "พบช่องโหว่ความปลอดภัย",
      "บัญชีถูกเข้าถึงโดยไม่ได้รับอนุญาต",
      "ข้อมูลรั่วไหล",
      "อื่นๆ เกี่ยวกับความปลอดภัยของระบบ"
    ],
    "API และการเชื่อมต่อ": [
      "API ตอบสนองช้า",
      "API ส่งค่าผิดพลาด",
      "ไม่สามารถเชื่อมต่อกับ API ได้",
      "อื่นๆ เกี่ยวกับ API และการเชื่อมต่อ"
    ],
    "การชำระเงินและธุรกรรม": [
      "การชำระเงินไม่สำเร็จ",
      "ยอดเงินไม่ตรง",
      "การคืนเงินล่าช้า",
      "อื่นๆ เกี่ยวกับการชำระเงิน"
    ],
    "การรองรับอุปกรณ์": [
      "ระบบไม่รองรับอุปกรณ์มือถือ",
      "เว็บไซต์ไม่แสดงผลบนบางเบราว์เซอร์",
      "ปัญหาการใช้งานบนแท็บเล็ต",
      "อื่นๆ เกี่ยวกับการรองรับอุปกรณ์"
    ],
    "อื่นๆ": [
      "ข้อเสนอแนะ",
      "ปัญหาอื่นๆ ที่ไม่มีในหมวดหมู่"
    ]
  };

  return (
    <div className="min-h-screen bg-[#e8edff] flex flex-col items-center">
      <div className="w-full bg-gradient-to-b from-green-200 to-blue-200 h-32 rounded-b-lg shadow-md">
        <Link href="/adminmain" className="hover:underline">
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
                  {userName}
                  <AdminPanelSettingsIcon style={{ marginLeft: "5px" }} />
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

      <div className="w-full max-w-[90%] -mt-10 z-10">
        <div className="bg-white shadow-lg rounded-xl">
          <Navbar />
        </div>
      </div>

      <div className="rounded-lg mt-6 ml-8 w-[90%]">
        <ApplicantTrackingAdmin />
      </div>
      <div className="bg-white shadow-lg rounded-lg p-4 max-w-[90%] w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative w-full">
            <div className="flex w-full">
              <div className="flex-1">
                <label className="block text-gray-700 mb-1">วันที่เริ่มต้น</label>
              </div>
              <div className="w-8"></div>
              <div className="flex-1">
                <label className="block text-gray-700 mb-1">วันที่สิ้นสุด</label>
              </div>
            </div>
            <div className="flex items-center w-full">
              <div className="flex-1">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="border rounded p-1.5 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  placeholder="วันที่เริ่มต้น"
                />
              </div>
              <div className="flex justify-center items-center w-8">
                <span>ถึง</span>
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="border rounded p-1.5 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  placeholder="วันที่สิ้นสุด"
                />
              </div>
            </div>
          </div>

          {/* Category & Subcategory Filters */}
          <div>
            <label className="block text-gray-700 mb-1">หมวดหมู่</label>
            <div className="flex flex-col gap-2">
              <select
                value={filters.topic}
                onChange={handleCategoryChange}
                className="border rounded p-2 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">หัวข้อปัญหาที่พบ</option>
                {Object.keys(systemIssuesCategories).filter(cat => cat !== "").map((category, idx) => (
                  <option key={idx} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={filters.problem}
                onChange={handleDetailChange}
                className="border rounded p-2 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                disabled={!filters.topic}
              >
                <option value="">ปัญหาที่พบ</option>
                {systemIssuesCategories[filters.topic]?.map((detail, index) => (
                  <option key={index} value={detail}>{detail}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-gray-700 mb-1">ค้นหา</label>
            <div className="relative">
              <input
                type="text"
                value={filters.problemDetail}
                onChange={(e) => setFilters({ ...filters, problemDetail: e.target.value })}
                className="border rounded p-1.5 pl-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                placeholder="ค้นหารายละเอียดการแจ้งปัญหา..."
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <SearchIcon />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mt-2 max-w-[90%] w-full flex-grow mb-12">
        <table className="min-w-full table-auto ">
          <thead>
            <tr className=" text-[#042278]">
              <th className="px-2 py-2 border">ลำดับ</th>
              <th className="px-2 py-2 border">วันที่</th>
              <th className="px-2 py-2 border">หัวข้อปัญหาที่พบ</th>
              <th className="px-2 py-2 border">ปัญหาที่พบ</th>
              <th className="px-2 py-2 border">รายละเอียดปัญหา</th>
            </tr>
          </thead>
          <tbody>
            {paginatedComplaints.map((report: any) => (
              <tr key={report.id} className="hover:bg-gray-100">
                <td className="px-2 py-2 border text-center">
                  {sortedData?.find((item) => item.id === report.id)?.id}
                </td>
                <td className="px-2 py-2 border text-center">{formatDates(getAll?.filter((item) => item.id === report.id)[0]?.createDate?.toString())}</td>
                <td className="px-2 py-2 border">{getAll?.filter((item) => item.id === report.id)[0]?.topic}</td>
                <td className="px-2 py-2 border">{getAll?.filter((item) => item.id === report.id)[0]?.problem}</td>
                <td className="px-2 py-2 border" style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "200px" // ปรับตามความเหมาะสม
                }}>
                  {getAll?.filter((item) => item.id === report.id)[0]?.problemDetail}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            ก่อนหน้า
          </button>
          <span>
            หน้า {currentPage} จาก {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
      </div>
      <footer className="text-center py-4 text-sm text-gray-600">
        Copyright © 2025 ระบบรับเรื่องร้องเรียนร้องทุกข์ | Developed by Nattanun Naknaree & Rittinun Disaraphong | Version (1.0)
      </footer>

      <style jsx global>{`
      .swal2-popup {
        width: 700px !important;
      }
    `}</style>
    </div>
  );
};

export default MainPage;
