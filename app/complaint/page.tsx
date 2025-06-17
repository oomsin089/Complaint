'use client'
import React, { useEffect, useState } from "react";
import Navbar from "../navbar/page";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import useComplaintCreate from "../../hooks/useComplaintCreate";
import { ComplaintCreate } from "../../types/complaintCreate";
import AlertBox from "../../components/modal/Alert";
import { useSession } from "../../utils/useSession";
import { useAuth } from "../../utils/auth";
import ApplicantTracking from "../../navbar/Breadcrump";
import PersonIcon from '@mui/icons-material/Person';
import Link from "next/link";
import LogoutIcon from '@mui/icons-material/Logout';
const MainPage: React.FC = () => {
  const { mutateAsync: mutateAsyncCreate } = useComplaintCreate();
  const { session, loading } = useSession();
  const { logout } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [topicOfComplaint, setTopicOfComplaint] = useState<string>("");
  const [detailsOfTheTopic, setDetailsOfTheTopic] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [problemDetails, setProblemDetails] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rank, setRank] = useState<string>("");


  const [showSignout, setShowSignout] = useState(false);

  const handleButtonClick = () => {
    setShowSignout(!showSignout);
  };

  //Modal Alert
  const [openAlert, setOpenAlert] = useState(false);
  const [typeAlert, setTypeAlert] = useState("");
  const [textAlert, setTextAlert] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const handleAlert = (type: ("success" | "error" | "warning" | "info"), text: string) => {
    setOpenAlert(true);
    setTypeAlert(type);
    setTextAlert(text);
  }
 useEffect(() => {
    if (session?.rank) {
      setRank(session.rank);
    }
  }, [session]);
  useEffect(() => {
    if (session?.fullName) {
      setUserName(session.fullName);
    }
  }, [session]);
  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout;

    if (shouldRedirect) {
      redirectTimeout = setTimeout(() => {
        router.push("/followreport");
        setShouldRedirect(false); // Reset the redirect state
      }, 1500);
    }

    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [shouldRedirect, router]);


  const handleLogout = async () => {
    try {
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("รหัสผ่านหรืออีเมลไม่ถูกต้อง");
    }
  };


  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [isAuthenticated, router]);

  // if (!user) {
  //   return null;
  // }  

  const handleAddComplaint = async () => {
    if (isSubmitting) return;

    const errors: string[] = [];
    if (!selectedCategory) errors.push("ประเด็นที่ต้องการร้องเรียน/ร้องทุกข์");
    if (!selectedSubCategory) errors.push("มีเรื่องร้องเรียน/ร้องทุกข์");
    if (!problemDetails.trim()) errors.push("รายละเอียดที่ต้องการร้องเรียน/ร้องทุกข์ ");
    if (!phoneNumber.trim()) errors.push("เบอร์โทร");

    if (errors.length > 0) {
      handleAlert("warning", `กรุณาระบุ: ${errors.join(", ")}`);
      return;
    }


    setIsSubmitting(true);

    const payload: ComplaintCreate = {
      firstName: session?.firstName || "",
      lastName: session?.lastName || "",
      emailAddress: session?.emailAddress || "",
      topicOfComplaint: topicOfComplaint,
      detailsOfTheTopic: detailsOfTheTopic,
      problemDetail: problemDetails,
      telephone: phoneNumber,
      status: "รอดำเนินการ",
      createDate: new Date(),
      fullName: session?.fullName || "",
    };

    try {
      const res = await mutateAsyncCreate(payload);
      if (res) {
        handleAlert("success", "Create Success");
        setShouldRedirect(true); // Set redirect flag after successful creation
      } else {
        handleAlert("error", "Failed to create problem.");
      }
    } catch (error) {
      console.error('Error:', error);
      handleAlert("error", "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };


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

  const resetForm = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setProblemDetails("");
    setPhoneNumber("");
    setTopicOfComplaint("");
    setDetailsOfTheTopic("");
  };

  useEffect(() => {
    console.log(session); // ดูค่า session ที่ได้มา
    if (!loading && session === null) {
      router.push('/login');
    }
  }, [session, loading]);

  return (
    <>
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
          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              className="text-3xl font-extrabold text-center mt-8 text-[#3190FF]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              เขียนคำร้องเรียน/ร้องทุกข์
            </motion.h1>

            {/* Form Layout */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Left Column */}
              <div className="col-span-1 space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="block text-xl font-medium text-gray-700">
                      ชื่อ
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="text"
                      className="mt-2 p-3 w-full border rounded-lg text-gray-500 bg-gray-100 cursor-not-allowed focus:outline-none"
                      value={session?.firstName}
                      readOnly
                      style={{ pointerEvents: 'none' }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xl font-medium text-gray-700">
                      นามสกุล
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="text"
                      className="mt-2 p-3 w-full border rounded-lg text-gray-500 bg-gray-100 cursor-not-allowed focus:outline-none"
                      value={session?.lastName}
                      readOnly
                      style={{ pointerEvents: 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xl font-medium text-gray-700">
                    ประเด็นที่ต้องการร้องเรียน/ร้องทุกข์
                    <span className="text-red-500"> *</span>
                  </label>
                  <select
                    className="mt-2 p-3 border rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={selectedCategory}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      setSelectedCategory(selectedValue);
                      setTopicOfComplaint(selectedValue);  // Update topicOfComplaint here
                      setSelectedSubCategory("");  // Reset subcategory
                    }}
                    required
                  >
                    <option value="">เลือกหัวข้อ</option>
                    {Object.keys(categories)
                      .filter((key) => key !== "")
                      .map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                  </select>
                </div>


                {selectedCategory && categories[selectedCategory].length > 0 && (
                  <div>
                    <label className="block text-xl font-medium text-gray-700">
                      รายละเอียดของประเด็น
                      <span className="text-red-500"> *</span>
                    </label>
                    <select
                      className="mt-2 p-3 border rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={selectedSubCategory}
                      onChange={(e) => {
                        const selectedSub = e.target.value;
                        setSelectedSubCategory(selectedSub);
                        setDetailsOfTheTopic(selectedSub);  // Update detailsOfTheTopic here
                      }}
                      required
                    >
                      <option value="">เลือกหัวข้อย่อย</option>
                      {categories[selectedCategory].map((subCategory, index) => (
                        <option key={index} value={subCategory}>
                          {subCategory}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xl font-medium text-gray-700">
                      เบอร์โทร
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="text"
                      className="mt-2 p-3 border rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="กรุณากรอกเบอร์โทร"
                      value={phoneNumber}
                      onChange={(e) => {
                        // ดักพิมพ์เฉพาะตัวเลข 10 ตัว
                        const value = e.target.value.replace(/\D/g, ''); // ลบอักขระที่ไม่ใช่ตัวเลข
                        if (value.length <= 10) {
                          setPhoneNumber(value);
                        }
                      }}
                      required
                      maxLength={10} // กำหนดความยาวไม่เกิน 10 ตัว
                    />
                  </div>
                  <div>
                    <label className="block text-xl font-medium text-gray-700">
                      อีเมล
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      type="email"
                      className="mt-2 p-3 border rounded-lg w-full text-gray-500 bg-gray-100 cursor-not-allowed focus:outline-none"
                      placeholder="กรุณากรอกอีเมล"
                      value={session?.emailAddress}
                      readOnly
                      style={{ pointerEvents: 'none' }} // ป้องกันการคลิกหรือโฟกัส
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-span-1 flex flex-col justify-between">
                <label className="block text-xl font-medium text-gray-700">
                  รายละเอียดเพิ่มเติมของประเด็น
                  <span className="text-red-500"> *</span>
                </label>
                <textarea
                  className="mt-2 p-3 border rounded-lg w-full h-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={10}
                  placeholder="กรุณากรอกรายละเอียดปัญหาที่พบ"
                  value={problemDetails}
                  onChange={(e) => setProblemDetails(e.target.value)}
                  maxLength={1000}
                  required
                ></textarea>
                <p className="text-right text-gray-500 text-sm mt-1">
                  {problemDetails.length}/1000 ตัวอักษร
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 text-center">
              <button
                onClick={handleAddComplaint}
                className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                ส่งข้อมูล
              </button>
              <button
                onClick={resetForm}
                className="ml-4 px-6 py-3 bg-gray-300 text-gray-700 text-lg font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                ล้างข้อมูล
              </button>
            </div>
          </motion.div>
        </div>
        <footer className="text-center py-4 text-sm text-gray-600">
          Copyright © 2025 ระบบรับเรื่องร้องเรียนร้องทุกข์ | Developed by Nattanun Naknaree & Rittinun Disaraphong | Version (1.0)
        </footer>
      </div>
      <AlertBox
        type={typeAlert}
        text={textAlert}
        isOpen={openAlert}
        setIsOpen={setOpenAlert}
      />
      
    </>
  );
};

export default MainPage;
