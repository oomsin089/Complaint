"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../navbar/page";
import { useSession } from "../../utils/useSession";
import { useAuth } from "../../utils/auth";
import { useRouter } from "next/navigation";
import ApplicantTracking from "../../navbar/Breadcrump";
import PersonIcon from '@mui/icons-material/Person';
import { useGetComplaintByEmailAddress } from "../../hooks/useGetComplaintByEmailAddress";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Complaint } from "../../types/complaintCreate";
import Link from "next/link";
import useEncryptData from "../../hooks/Encryption/Encryption";
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';

const MainPage: React.FC = () => {
  const { session, loading } = useSession();
  const { logout } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const { data: responseData } = useGetComplaintByEmailAddress(session?.emailAddress) as { data?: Complaint[] };
  const { mutate: encrypting } = useEncryptData();
  const [rank, setRank] = useState<string>("");
  const [showSignout, setShowSignout] = useState(false);

  

  const handleButtonClick = () => {
    setShowSignout(!showSignout);
  };
  const formatSearchDate = (dateString: string): string => {
    if (!dateString) return '';
    const d = new Date(dateString);
    // แปลงเป็น yyyy-mm-dd สำหรับการเปรียบเทียบ
    return d.toISOString().split('T')[0];
  };
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('th-TH');
  };
  const handleViewComplaint = (params: any) => {
    encrypting(params.id, {
      onSuccess: (encryptedId: any) => {
        router.push(`/followreport/followreportdetail?id=${encryptedId}`);
      },
      onError: (error: any) => {
        console.error("Error encrypting ID:", error);
      }
    });
  };
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    topicOfComplaint: "",
    detailsOfTheTopic: "",
    problemDetail: "",
    status: "",
  });
  // ฟังก์ชั่นสำหรับ handle การเลือกหัวข้อ
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      topicOfComplaint: e.target.value,
      detailsOfTheTopic: "",  // รีเซ็ตค่ารายละเอียดเมื่อลองเลือกหัวข้อใหม่
    });
  };

  // ฟังก์ชั่นสำหรับ handle การเลือกรายละเอียดของหัวข้อ
  const handleDetailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      detailsOfTheTopic: e.target.value,
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories: Record<string, string[]> = {
    "": [],
    "บุคลากร": [
      "พฤติกรรมการให้บริการ",
      "การขาดงาน/มาสาย",
      "ความไม่เป็นกลางในการปฏิบัติงาน",
      "การใช้วาจาไม่สุภาพ",
      "ความล่าช้าในการให้บริการ",
      "อื่นๆ เกี่ยวกับบุคลากร"
    ],
    "การเรียนการสอน": [
      "เกณฑ์การให้เกรด",
      "เนื้อหาไม่ตรงกับคำอธิบายรายวิชา",
      "อาจารย์ขาดสอน/มาสอนสาย",
      "การประเมินผลไม่เป็นธรรม",
      "สื่อการสอนไม่ทันสมัย",
      "เอกสารประกอบการสอนไม่เพียงพอ",
      "อื่นๆ เกี่ยวกับการเรียนการสอน"
    ],
    "บริการนักศึกษา": [
      "ปัญหาด้านทุนการศึกษา",
      "การให้คำปรึกษา",
      "การให้บริการห้องสมุด",
      "ช่องทางการติดต่อ",
      "ระบบลงทะเบียน",
      "อื่นๆ เกี่ยวกับบริการนักศึกษา"
    ],
    "สิ่งอำนวยความสะดวก": [
      "สภาพห้องเรียน/ห้องปฏิบัติการ",
      "อุปกรณ์โสตทัศนูปกรณ์",
      "สัญญาณอินเทอร์เน็ต",
      "สภาพแวดล้อมในมหาวิทยาลัย",
      "ที่จอดรถ",
      "ห้องน้ำ",
      "อื่นๆ เกี่ยวกับสิ่งอำนวยความสะดวก"
    ],
    "ค่าธรรมเนียมและการเงิน": [
      "การชำระเงินออนไลน์",
      "การคืนเงินค่าธรรมเนียม",
      "การออกใบเสร็จ",
      "ค่าปรับล่าช้า",
      "อื่นๆ เกี่ยวกับค่าธรรมเนียมและการเงิน"
    ],
    "ความปลอดภัย": [
      "อุบัติเหตุในมหาวิทยาลัย",
      "ทรัพย์สินสูญหาย",
      "ระบบกล้องวงจรปิด",
      "แสงสว่างในเวลากลางคืน",
      "อื่นๆ เกี่ยวกับความปลอดภัย"
    ],
    "หอพัก/ที่พักอาศัย": [
      "สภาพห้องพัก",
      "สาธารณูปโภคในหอพัก",
      "กฎระเบียบหอพัก",
      "พฤติกรรมผู้พักอาศัยร่วม",
      "การให้บริการของเจ้าหน้าที่หอพัก",
      "อื่นๆ เกี่ยวกับหอพัก/ที่พักอาศัย"
    ],
    "IT/ระบบสารสนเทศ": [
      "ระบบลงทะเบียน",
      "ระบบอีเมล",
      "เว็บไซต์มหาวิทยาลัย",
      "แอปพลิเคชันมือถือ",
      "ระบบสารสนเทศนักศึกษา",
      "อื่นๆ เกี่ยวกับ IT/ระบบสารสนเทศ"
    ],
    "อาหารและโภชนาการ": [
      "คุณภาพอาหาร",
      "ราคาอาหาร",
      "สุขอนามัยของร้านอาหาร",
      "ความหลากหลายของร้านอาหาร",
      "อื่นๆ เกี่ยวกับอาหารและโภชนาการ"
    ],
    "การขนส่ง/การเดินทาง": [
      "รถรับส่งภายในมหาวิทยาลัย",
      "จุดจอดรถ/ที่จอดรถ",
      "ความปลอดภัยในการเดินทาง",
      "ตารางเวลารถรับส่ง",
      "อื่นๆ เกี่ยวกับการขนส่ง/การเดินทาง"
    ],
    "เรื่องอื่นๆ": [
      "ข้อเสนอแนะทั่วไป",
      "ร้องเรียนอื่นๆ ที่ไม่มีในหมวดหมู่"
    ]
  };

  const filteredComplaints = responseData?.filter((complaint) => {
    // แปลงวันที่ให้อยู่ในรูปแบบเดียวกันก่อนเปรียบเทียบ
    const complaintDate = complaint.createDate ? formatSearchDate(complaint.createDate.toString()) : '';
    const searchStartDate = filters.startDate ? formatSearchDate(filters.startDate) : '';
    const searchEndDate = filters.endDate ? formatSearchDate(filters.endDate) : '';

    // Check if date is within range (or if no range is specified)
    const dateMatch = (!searchStartDate && !searchEndDate) ||
      (searchStartDate && !searchEndDate && complaintDate >= searchStartDate) ||
      (!searchStartDate && searchEndDate && complaintDate <= searchEndDate) ||
      (searchStartDate && searchEndDate && complaintDate >= searchStartDate && complaintDate <= searchEndDate);

    // Other filters remain the same
    const topicMatch = !filters.topicOfComplaint || complaint.topicOfComplaint === filters.topicOfComplaint;
    const detailsMatch = filters.detailsOfTheTopic === "" || complaint.detailsOfTheTopic === filters.detailsOfTheTopic;
    const statusMatch = filters.status === "" || complaint.status === filters.status;
    const problemDetailMatch = !filters.problemDetail || complaint.problemDetail?.toLowerCase().includes(filters.problemDetail.toLowerCase());

    return dateMatch && topicMatch && detailsMatch && statusMatch && problemDetailMatch;
  }) || [];

  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  useEffect(() => {
    console.log(session); // ดูค่า session ที่ได้มา
    if (!loading && session === null) {
      router.push('/login');
    }
  }, [session, loading]);

  return (
    <div className="min-h-screen bg-[#e8edff] flex flex-col items-center">
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

      <div className="w-full max-w-[90%] -mt-10 z-10">
        <div className="bg-white shadow-lg rounded-xl">
          <Navbar />
        </div>
      </div>

      <div className="rounded-lg mt-6 ml-8 w-[90%]">
        <ApplicantTracking />
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
                value={filters.topicOfComplaint}
                onChange={handleCategoryChange}
                className="border rounded p-2 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">ประเด็นที่ร้องเรียน/ร้องทุกข์ทั้งหมด</option>
                {Object.keys(categories).filter(cat => cat !== "").map((category, idx) => (
                  <option key={idx} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={filters.detailsOfTheTopic}
                onChange={handleDetailChange}
                className="border rounded p-2 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                disabled={!filters.topicOfComplaint}
              >
                <option value="">เรื่องร้องเรียน/ร้องทุกข์ทั้งหมด</option>
                {categories[filters.topicOfComplaint]?.map((detail, index) => (
                  <option key={index} value={detail}>{detail}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Search */}
          <div className="space-y-2">
            <div>
              <label className="block text-gray-700 mb-1">สถานะ</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="border rounded p-2 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">สถานะทั้งหมด</option>
                <option value="รอดำเนินการ">รอดำเนินการ</option>
                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                <option value="รอตรวจสอบ">รอตรวจสอบ</option>
                <option value="เสร็จสิ้น">เสร็จสิ้น</option>
              </select>
            </div>
            <div className="relative">
              <input
                type="text"
                value={filters.problemDetail}
                onChange={(e) => setFilters({ ...filters, problemDetail: e.target.value })}
                className="border rounded p-1.5 pl-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                placeholder="ค้นหาคำร้องเรียน/ร้องทุกข์..."
                />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 mt-2 max-w-[90%] w-full flex-grow mb-12">
        <table className="min-w-full table-auto ">
          <thead>
            <tr className=" text-[#042278]">
              <th className="px-4 py-2 border text-center">ลำดับ</th>
              <th className="px-4 py-2 border text-center">วันที่</th>
              <th className="px-4 py-2 border">ประเด็นที่ร้องเรียน/ร้องทุกข์</th>
              <th className="px-4 py-2 border">เรื่องร้องเรียน/ร้องทุกข์</th>
              <th className="px-4 py-2 border">รายละเอียดการร้องเรียน/ร้องทุกข์</th>
              {/* <th className="px-4 py-2 border text-center">ระยะเวลาการรับข้อร้องเรียน (1 วัน)</th>
              <th className="px-4 py-2 border text-center">ระยะเวลาในการพิจารณาข้อร้องเรียน (15 วัน)</th> */}
              <th className="px-4 py-2 border w-40">สถานะ</th>
              <th className="px-4 py-2 border text-center">ดูรายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {paginatedComplaints && paginatedComplaints.length > 0 ? (
              paginatedComplaints.map((complaint, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-4 py-2 border text-center">
                    {formatDate(complaint.createDate?.toString())}
                  </td>
                  <td className="px-4 py-2 border">{complaint.topicOfComplaint || '-'}</td>
                  <td className="px-4 py-2 border">{complaint.detailsOfTheTopic || '-'}</td>
                  <td className="px-4 py-2 border" style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "200px" // ปรับตามความเหมาะสม
                  }}>
                    {complaint.problemDetail || '-'}
                  </td>
                  {/* <td className="border text-center">
                    test
                    </td>
                    <td className="border text-center">
                    test2
                    </td> */}
                  <td className="border text-center">
                    <span
                      style={{
                        backgroundColor:
                          complaint.status === 'รอดำเนินการ' ? '#FFA500' :
                            complaint.status === 'กำลังดำเนินการ' ? '#3190FF' :
                              complaint.status === 'รอตรวจสอบ' ? '#4B5563' :
                                complaint.status === 'เสร็จสิ้น' ? 'green' :
                                  '',
                        fontWeight: 'bold',
                        padding: '2px 12px',
                        display: 'inline-block',
                        borderRadius: '9999px',
                      }}
                      className="text-white ">
                      {complaint.status || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 border text-center ">
                    <button className="text-blue-500 hover:text-blue-700" onClick={() => handleViewComplaint({ id: complaint.id })}>
                      <RemoveRedEyeIcon />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-2 border text-center">
                  ไม่พบข้อมูลการร้องเรียน
                </td>
              </tr>
            )}
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

      <style jsx global>{`
        .swal2-popup {
          width: 700px !important;
        }
      `}</style>
      <footer className="text-center py-4 text-sm text-gray-600">
        Copyright © 2025 ระบบรับเรื่องร้องเรียนร้องทุกข์ | Developed by Nattanun Naknaree & Rittinun Disaraphong | Version (1.0)
      </footer>
    </div>
  );
};

export default MainPage;