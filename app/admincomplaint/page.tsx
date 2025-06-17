"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Navbar from "../adminnavbar/page";
import EditIcon from "@mui/icons-material/Edit";
import Link from "next/link";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useSession } from "../../utils/useSession";
import { useAuth } from "../../utils/auth";
import { useRouter } from "next/navigation";
import ApplicantTrackingAdmin from "../../navbar/BreadcrumpAdmin";
import { useGetAll } from "../../hooks/useGetAll";
import { useUpdateComplaint } from "../../hooks/useUpdateComplaint";
import SearchIcon from "@mui/icons-material/Search";
import ExPdfBtn from "../../components/button/ExPdfBtn";
import AlertBox from "../../components/modal/Alert";
import LogoutIcon from "@mui/icons-material/Logout";
interface Complaint {
  id: number;
  createDate: string;
  topicOfComplaint: string;
  detailsOfTheTopic: string;
  problemDetail: string;
  status: string;
}

const ComplaintTable: React.FC = () => {
  const { session, loading } = useSession();
  const { logout } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const { data: getAll } = useGetAll();
  const { mutateAsync: mutateAsyncUpdate } = useUpdateComplaint();
  const sortedData = getAll?.sort((a, b) => a.id - b.id);
  //Modal Alert
  const [openAlert, setOpenAlert] = useState(false);
  const [typeAlert, setTypeAlert] = useState("");
  const [textAlert, setTextAlert] = useState("");

  const [showSignout, setShowSignout] = useState(false);

  const handleButtonClick = () => {
    setShowSignout(!showSignout);
  };

  const handleAlert = (
    type: "success" | "error" | "warning" | "info",
    text: string
  ) => {
    setOpenAlert(true);
    setTypeAlert(type);
    setTextAlert(text);
  };

  const formatDates = (dateString: string | undefined) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString("th-TH");
  };
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  // ฟังก์ชันแปลงวันที่สำหรับการค้นหา
  const formatSearchDate = (dateString: string): string => {
    if (!dateString) return "";
    const d = new Date(dateString);
    // แปลงเป็น yyyy-mm-dd สำหรับการเปรียบเทียบ
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (session?.fullName) {
      setUserName(session.fullName);
    }
  }, [session]);

  const handleLogout = async () => {
    try {
      logout();
      router.push("/adminlogin");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("รหัสผ่านหรืออีเมลไม่ถูกต้อง");
    }
  };
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    topicOfComplaint: "",
    detailsOfTheTopic: "",
    problemDetail: "",
    status: "",
  });
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      topicOfComplaint: e.target.value,
      detailsOfTheTopic: "", // รีเซ็ตค่ารายละเอียดเมื่อลองเลือกหัวข้อใหม่
    });
  };

  // ฟังก์ชั่นสำหรับ handle การเลือกรายละเอียดของหัวข้อ
  const handleDetailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      detailsOfTheTopic: e.target.value,
    });
  };
  const categories: Record<string, string[]> = {
    "": [],
    บุคลากร: [
      "พฤติกรรมการให้บริการ",
      "การขาดงาน/มาสาย",
      "ความไม่เป็นกลางในการปฏิบัติงาน",
      "การใช้วาจาไม่สุภาพ",
      "ความล่าช้าในการให้บริการ",
      "อื่นๆ เกี่ยวกับบุคลากร",
    ],
    การเรียนการสอน: [
      "เกณฑ์การให้เกรด",
      "เนื้อหาไม่ตรงกับคำอธิบายรายวิชา",
      "อาจารย์ขาดสอน/มาสอนสาย",
      "การประเมินผลไม่เป็นธรรม",
      "สื่อการสอนไม่ทันสมัย",
      "เอกสารประกอบการสอนไม่เพียงพอ",
      "อื่นๆ เกี่ยวกับการเรียนการสอน",
    ],
    บริการนักศึกษา: [
      "ปัญหาด้านทุนการศึกษา",
      "การให้คำปรึกษา",
      "การให้บริการห้องสมุด",
      "ช่องทางการติดต่อ",
      "ระบบลงทะเบียน",
      "อื่นๆ เกี่ยวกับบริการนักศึกษา",
    ],
    สิ่งอำนวยความสะดวก: [
      "สภาพห้องเรียน/ห้องปฏิบัติการ",
      "อุปกรณ์โสตทัศนูปกรณ์",
      "สัญญาณอินเทอร์เน็ต",
      "สภาพแวดล้อมในมหาวิทยาลัย",
      "ที่จอดรถ",
      "ห้องน้ำ",
      "อื่นๆ เกี่ยวกับสิ่งอำนวยความสะดวก",
    ],
    ค่าธรรมเนียมและการเงิน: [
      "การชำระเงินออนไลน์",
      "การคืนเงินค่าธรรมเนียม",
      "การออกใบเสร็จ",
      "ค่าปรับล่าช้า",
      "อื่นๆ เกี่ยวกับค่าธรรมเนียมและการเงิน",
    ],
    ความปลอดภัย: [
      "อุบัติเหตุในมหาวิทยาลัย",
      "ทรัพย์สินสูญหาย",
      "ระบบกล้องวงจรปิด",
      "แสงสว่างในเวลากลางคืน",
      "อื่นๆ เกี่ยวกับความปลอดภัย",
    ],
    "หอพัก/ที่พักอาศัย": [
      "สภาพห้องพัก",
      "สาธารณูปโภคในหอพัก",
      "กฎระเบียบหอพัก",
      "พฤติกรรมผู้พักอาศัยร่วม",
      "การให้บริการของเจ้าหน้าที่หอพัก",
      "อื่นๆ เกี่ยวกับหอพัก/ที่พักอาศัย",
    ],
    "IT/ระบบสารสนเทศ": [
      "ระบบลงทะเบียน",
      "ระบบอีเมล",
      "เว็บไซต์มหาวิทยาลัย",
      "แอปพลิเคชันมือถือ",
      "ระบบสารสนเทศนักศึกษา",
      "อื่นๆ เกี่ยวกับ IT/ระบบสารสนเทศ",
    ],
    อาหารและโภชนาการ: [
      "คุณภาพอาหาร",
      "ราคาอาหาร",
      "สุขอนามัยของร้านอาหาร",
      "ความหลากหลายของร้านอาหาร",
      "อื่นๆ เกี่ยวกับอาหารและโภชนาการ",
    ],
    "การขนส่ง/การเดินทาง": [
      "รถรับส่งภายในมหาวิทยาลัย",
      "จุดจอดรถ/ที่จอดรถ",
      "ความปลอดภัยในการเดินทาง",
      "ตารางเวลารถรับส่ง",
      "อื่นๆ เกี่ยวกับการขนส่ง/การเดินทาง",
    ],
    เรื่องอื่นๆ: ["ข้อเสนอแนะทั่วไป", "ร้องเรียนอื่นๆ ที่ไม่มีในหมวดหมู่"],
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // กำหนดตัวเลือกสำหรับ filter
  // const subCategoryOptions = {
  //   "นักศึกษา": ["การเรียนการสอน", "สิ่งอำนวยความสะดวก", "อาคารสถานที่", "อื่นๆ"],
  //   "อาจารย์": ["การเรียนการสอน", "สิ่งอำนวยความสะดวก", "อาคารสถานที่", "อื่นๆ"],
  //   "บุคคลภายนอก": ["การเรียนการสอน", "สิ่งอำนวยความสะดวก", "อาคารสถานที่", "อื่นๆ"]
  // };

  const filteredComplaints =
    getAll?.filter((complaint) => {
      // แปลงวันที่ทั้งสองให้อยู่ในรูปแบบเดียวกันก่อนเปรียบเทียบ
      const complaintDate = complaint.createDate
        ? formatSearchDate(complaint.createDate.toString())
        : "";
      const searchStartDate = filters.startDate
        ? formatSearchDate(filters.startDate)
        : "";
      const searchEndDate = filters.endDate
        ? formatSearchDate(filters.endDate)
        : "";

      // Check if date is within range (or if no range is specified)
      const dateMatch =
        (!searchStartDate && !searchEndDate) ||
        (searchStartDate &&
          !searchEndDate &&
          complaintDate >= searchStartDate) ||
        (!searchStartDate && searchEndDate && complaintDate <= searchEndDate) ||
        (searchStartDate &&
          searchEndDate &&
          complaintDate >= searchStartDate &&
          complaintDate <= searchEndDate);
      const topicMatch =
        !filters.topicOfComplaint ||
        complaint.topicOfComplaint === filters.topicOfComplaint;
      const detailsMatch =
        filters.detailsOfTheTopic === "" ||
        complaint.detailsOfTheTopic === filters.detailsOfTheTopic;
      const statusMatch =
        filters.status === "" || complaint.status === filters.status;

      return dateMatch && topicMatch && detailsMatch && statusMatch;
    }) || [];

  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  useEffect(() => {
    console.log(session); // ดูค่า session ที่ได้มา
    if (!loading && session === null) {
      router.push("/adminlogin");
    }
  }, [session, loading]);

  const handleEdit = async (complaint: Complaint) => {
    // Define the order of states
    const statusOrder = [
      "รอดำเนินการ",
      "กำลังดำเนินการ",
      "รอตรวจสอบ",
      "เสร็จสิ้น",
    ];
    const currentStatusIndex = statusOrder.indexOf(complaint.status);

    // Function to get status color
    const getStatusColor = (status: string) => {
      switch (status) {
        case "รอดำเนินการ":
          return "#FFA500"; // orange
        case "กำลังดำเนินการ":
          return "#3190FF"; // blue
        case "รอตรวจสอบ":
          return "#4B5563"; // gray
        case "เสร็จสิ้น":
          return "green";
        default:
          return "#CCCCCC"; // light gray
      }
    };

    // Helper function to render the timeline HTML
    const renderTimelineHTML = (
      currentStatus: string,
      selectedStatus: string
    ) => {
      const currentIndex = statusOrder.indexOf(currentStatus);
      const selectedIndex = statusOrder.indexOf(selectedStatus);

      return statusOrder
        .map((status, index) => {
          // Status is completed if it's before or equal to current status
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isSelected = index === selectedIndex;
          const isAnimated = isSelected && index !== currentIndex;
          const isLast = index === statusOrder.length - 1;
          // Check if the status is being selected and is a future status (not completed yet)
          const isFutureSelected = isSelected && index > currentIndex;

          const statusColor = getStatusColor(status);

          return `
          <div style="display: flex; align-items: center; margin-bottom: ${
            isLast ? "0" : "30px"
          }; position: relative; width: 100%;">
            <div style="
              width: 40px; 
              height: 40px; 
              border-radius: 50%; 
              background-color: ${
                isCompleted || isFutureSelected ? statusColor : "#CCCCCC"
              };
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              ${isAnimated ? "animation: blink 1s infinite alternate;" : ""}
              z-index: 2;
            ">
              ${index + 1}
            </div>
            <div style="
              margin-left: 15px;
              font-weight: ${
                isCompleted || isFutureSelected ? "bold" : "normal"
              };
              color: ${
                isCompleted
                  ? statusColor
                  : isFutureSelected
                  ? statusColor
                  : "#777"
              };
              ${isAnimated ? "animation: textBlink 1s infinite alternate;" : ""}
            ">
              ${status}
              ${
                isCompleted && !isFutureSelected
                  ? `<span style="margin-left: 10px; font-size: 0.8rem; color: #666;">✓</span>`
                  : ""
              }
            </div>
            ${
              !isLast
                ? `
              <div style="
                position: absolute;
                top: 40px;
                left: 20px;
                width: 2px;
                height: 30px;
                background-color: ${
                  isCompleted || isFutureSelected ? statusColor : "#CCCCCC"
                };
                z-index: 1;
              "></div>
            `
                : ""
            }
          </div>
        `;
        })
        .join("");
    };

    // Generate options for the status dropdown based on current status
    const generateStatusOptions = () => {
      // If status is "รอดำเนินการ", only allow selection of "กำลังดำเนินการ"
      if (complaint.status === "รอดำเนินการ") {
        return `
          <option value="รอดำเนินการ" selected>รอดำเนินการ</option>
          <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
        `;
      } else if (complaint.status === "กำลังดำเนินการ") {
        return `
        <option value="กำลังดำเนินการ" selected>กำลังดำเนินการ</option>
        <option value="รอตรวจสอบ">รอตรวจสอบ</option>
      `;
      } else if (complaint.status === "รอตรวจสอบ") {
        return `
         <option value="รอตรวจสอบ" selected>รอตรวจสอบ</option>
        <option value="เสร็จสิ้น">เสร็จสิ้น</option>
      `;
      } else {
        // For other statuses, show all options but disable inappropriate ones
        return statusOrder
          .map((status) => {
            const currentIndex = statusOrder.indexOf(complaint.status);
            const statusIndex = statusOrder.indexOf(status);
            // Allow selection of current status or next status only
            const isSelectable = statusIndex <= currentIndex + 1;

            return `
            <option value="${status}" 
              ${status === complaint.status ? "selected" : ""} 
              ${!isSelectable ? "disabled" : ""}
            >
              ${status}
            </option>
          `;
          })
          .join("");
      }
    };

    const result = await Swal.fire({
      title:
        '<h2 style="font-size: 1.5rem; font-weight: bold; color: black;">อัพเดทสถานะ</h2>',
      html: `
  <div style="margin-bottom: 20px;">
    <div style="text-align: left; font-size: 1rem; margin: 10px 20px; color: black;">
      <p style="margin-bottom: 10px;"><strong>ประเด็นที่ร้องเรียน/ร้องทุกข์:</strong>  ${
        complaint?.topicOfComplaint || "-"
      }</p>
      <p><strong>เรื่องร้องเรียน/ร้องทุกข์:</strong>  ${
        complaint?.detailsOfTheTopic || "-"
      }</p>
    </div>
    <div style="text-align: left; font-size: 1rem; margin: 10px 20px; color: black;">
      <label for="swal-status" style="font-weight: bold;">เลือกสถานะ:</label>
      <select id="swal-status" class="swal2-input" style="width: 90%; margin-top: 5px;">
        ${generateStatusOptions()}
      </select>
    </div>
  </div>
  <div id="swal-comment-box" style="display: none; text-align: left; font-size: 1rem; margin: 10px 20px; color: black;">
    <label for="swal-comment" style="font-weight: bold;">รายละเอียดจากผู้ดูแลระบบ: <span style="color: red;">*</span></label>
    <input id="swal-comment" class="swal2-input" type="text" style="width: 90%; margin-top: 5px;" />
    <div id="comment-error" style="color: red; font-size: 0.8rem; display: none;">กรุณากรอกรายละเอียด</div>
  </div>
  <div id="swal-date-picker" style="display: none; text-align: left; font-size: 1rem; margin: 10px 20px; color: black;">
  <label for="swal-date" style="font-weight: bold;">เลือกวันที่และเวลา:</label><span style="color: red;">*</span>
  <input id="swal-date" class="swal2-input" type="datetime-local" style="width: 90%; margin-top: 5px;" />
</div>


  <div style="margin-top: 20px; position: relative;">
    <h3 style="text-align: center; font-weight: bold; margin-bottom: 15px; color: black;">Timeline</h3>
    
    <div style="width: 90%; margin: 0 auto; padding-left: 30%; display: flex; flex-direction: column; align-items: flex-start; color: black;" id="timeline-content">           
      ${renderTimelineHTML(complaint.status, complaint.status)}
    </div>
  </div>

  <style>
  .swal2-confirm,
  .swal2-cancel {
    background-color: #3085d6 !important; /* สีฟ้า SweetAlert ปกติ */
    color: white !important;
    border: none !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .swal2-cancel {
    background-color: #aaa !important; /* ปรับให้ต่างจาก confirm */
  }

  .swal2-confirm:hover,
  .swal2-cancel:hover {
    filter: brightness(1.1);
  }
    @keyframes blink {
      0% { opacity: 0.5; transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1.05); }
    }
    @keyframes textBlink {
      0% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  </style>
    `,
      didOpen: () => {
        const statusSelect = document.getElementById(
          "swal-status"
        ) as HTMLSelectElement;
        const commentBox = document.getElementById(
          "swal-comment-box"
        ) as HTMLDivElement;
        const timelineContent = document.getElementById("timeline-content");
        const datePicker = document.getElementById(
          "swal-date-picker"
        ) as HTMLDivElement;
        const dateInput = document.getElementById(
          "swal-date"
        ) as HTMLInputElement;

        if (statusSelect && commentBox && timelineContent && datePicker) {
          const currentDate = new Date();
          currentDate.setMinutes(
            currentDate.getMinutes() - currentDate.getTimezoneOffset()
          );
          const currentDateTime = currentDate.toISOString().slice(0, 16);
          dateInput.min = currentDateTime;
          dateInput.addEventListener("input", function () {
            if (dateInput.value < dateInput.min) {
              dateInput.value = dateInput.min; // รีเซ็ตค่าให้เป็นเวลาปัจจุบัน
            }
          });

          // ตรวจสอบค่าเริ่มต้นและแสดงกล่องข้อความถ้าจำเป็น
          if (statusSelect.value === "กำลังดำเนินการ") {
            commentBox.style.display = "block";
            datePicker.style.display = "none"; // ซ่อน date picker สำหรับสถานะนี้
          } else if (statusSelect.value === "รอตรวจสอบ") {
            commentBox.style.display = "block";
            datePicker.style.display = "block"; // แสดง date picker สำหรับสถานะนี้
          } else if (statusSelect.value === "เสร็จสิ้น") {
            commentBox.style.display = "block";
            datePicker.style.display = "none"; // ซ่อน date picker สำหรับสถานะนี้
          }

          statusSelect.addEventListener("change", function () {
            // แสดงกล่องใส่หมายเหตุเมื่อเลือก 'กำลังดำเนินการ'
            if (this.value === "กำลังดำเนินการ") {
              commentBox.style.display = "block";
              datePicker.style.display = "none"; // ซ่อน date picker
            } else if (this.value === "รอตรวจสอบ") {
              commentBox.style.display = "block";
              datePicker.style.display = "block"; // แสดง date picker
            } else if (this.value === "เสร็จสิ้น") {
              commentBox.style.display = "block";
              datePicker.style.display = "none"; // ซ่อน date picker
            } else {
              commentBox.style.display = "none";
              document.getElementById("comment-error")!.style.display = "none";
              datePicker.style.display = "none"; // ซ่อน date picker ถ้าเลือกสถานะอื่น
            }

            // อัปเดต Timeline
            timelineContent.innerHTML = renderTimelineHTML(
              complaint.status,
              this.value
            );
          });
        }
      },
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      width: 600,
      preConfirm: () => {
        const status = (
          document.getElementById("swal-status") as HTMLSelectElement
        ).value;
        const commentInput = document.getElementById(
          "swal-comment"
        ) as HTMLInputElement;
        const comment = commentInput?.value || "";
        const date =
          (document.getElementById("swal-date") as HTMLInputElement)?.value ||
          "";
        const commentError = document.getElementById("comment-error");

        if (!status) {
          Swal.showValidationMessage("กรุณาเลือกสถานะ");
          return false;
        }

        // ตรวจสอบว่าถ้าสถานะเป็น "กำลังดำเนินการ" จะต้องกรอกรายละเอียด
        if (status === "กำลังดำเนินการ" && !comment.trim()) {
          if (commentError) commentError.style.display = "block";
          commentInput.style.borderColor = "red";
          Swal.showValidationMessage("กรุณากรอกรายละเอียดจากผู้ดูแลระบบ");
          return false;
        }
        if (status === "รอตรวจสอบ" && !comment.trim()) {
          commentInput.style.borderColor = "red";
          Swal.showValidationMessage("กรุณากรอกรายละเอียดจากผู้ดูแลระบบ");
          return false;
        }
        if (status === "รอตรวจสอบ" && !date) {
          commentInput.style.borderColor = "red";
          Swal.showValidationMessage("กรุณาเลือกวันที่");
          return false;
        }
        if (status === "เสร็จสิ้น" && !comment.trim()) {
          commentInput.style.borderColor = "red";
          Swal.showValidationMessage("กรุณากรอกรายละเอียดจากผู้ดูแลระบบ");
          return false;
        }
        return { status, comment, date };
      },
    });

    if (result.isConfirmed) {
      try {
        await mutateAsyncUpdate({
          id: complaint.id,
          payload: {
            status: result.value.status,
            state: result.value.status,
            comment: result.value.comment, // เพิ่มหมายเหตุที่ผู้ใช้ใส่
            dueDate: result.value.date, // ส่งวันที่
            firstName: session?.firstName || "",
            lastName: session?.lastName || "",
            fullName: session?.fullName || "",
            emailAddress: session?.emailAddress || "",
          },
        });

        handleAlert("success", "Update Success");
        setTimeout(() => {
          router.push("/adminmain");
        }, 1500);
      } catch (error) {
        console.error("Error updating complaint:", error);
        handleAlert("error", "อัพเดทสถานะไม่สําเร็จ");
        setTimeout(() => {}, 1500);
      }
    }
  };

  return (
    <>
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
          <div style={{ position: "relative" }}>
            <div
              className="text-right"
              style={{ marginRight: "60px", marginTop: "40px", width: "95%" }}
            >
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
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: "10px",
                      zIndex: 50,
                      marginTop: "5px",
                    }}
                  >
                    <button
                      onClick={handleLogout}
                      className="bg-white text-black text-sm flex items-center px-4 py-1 rounded-full shadow-md hover:bg-gray-200 hover:shadow-lg"
                    >
                      <span>Logout</span>
                      <LogoutIcon style={{ marginLeft: "8px", color: "red" }} />
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

        <div className="w-full px-8 mt-6">
          <div className="flex flex-row justify-between items-center ">
            <div className="text-left ml-16">
              <ApplicantTrackingAdmin />
            </div>
            <div className="mb-6 mr-12">
              <ExPdfBtn filteredData={filteredComplaints} />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-4 max-w-[90%] w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative w-full">
              <div className="flex w-full">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-1">
                    วันที่เริ่มต้น
                  </label>
                </div>
                <div className="w-8"></div>
                <div className="flex-1">
                  <label className="block text-gray-700 mb-1">
                    วันที่สิ้นสุด
                  </label>
                </div>
              </div>
              <div className="flex items-center w-full">
                <div className="flex-1">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
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
                  {Object.keys(categories)
                    .filter((cat) => cat !== "")
                    .map((category, idx) => (
                      <option key={idx} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
                <select
                  value={filters.detailsOfTheTopic}
                  onChange={handleDetailChange}
                  className="border rounded p-2 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  disabled={!filters.topicOfComplaint}
                >
                  <option value="">เรื่องร้องเรียน/ร้องทุกข์ทั้งหมด</option>
                  {categories[filters.topicOfComplaint]?.map(
                    (detail, index) => (
                      <option key={index} value={detail}>
                        {detail}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* Status & Search */}
            <div className="space-y-2">
              <div>
                <label className="block text-gray-700 mb-1">สถานะ</label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFilters({ ...filters, problemDetail: e.target.value })
                  }
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
                <th className="px-2 py-2 border">ลำดับ</th>
                <th className="px-2 py-2 border">วันที่</th>
                <th className="px-2 py-2 border">
                  ชื่อ - นามสกุล ผู้ร้องเรียน/ร้องทุกข์
                </th>
                <th className="px-2 py-2 border">
                  ประเด็นที่ร้องเรียน/ร้องทุกข์{" "}
                </th>
                <th className="px-2 py-2 border">เรื่องร้องเรียน/ร้องทุกข์</th>
                <th className="px-2 py-2 border">
                  รายละเอียดการร้องเรียน/ร้องทุกข์
                </th>
                <th className="px-12 py-2 border">สถานะ</th>
                <th className="px-2 py-2 border">แก้ไข</th>
              </tr>
            </thead>
            <tbody>
              {paginatedComplaints.map((complaint: any) => (
                <tr key={complaint.id} className="hover:bg-gray-100">
                  <td className="px-2 py-2 border text-center">
                    {sortedData?.find((item) => item.id === complaint.id)?.id}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {formatDates(
                      getAll
                        ?.filter((item) => item.id === complaint.id)[0]
                        ?.createDate?.toString()
                    )}
                  </td>
                  <td className="px-2 py-2 border">
                    {
                      getAll?.filter((item) => item.id === complaint.id)[0]
                        ?.fullName
                    }
                  </td>
                  <td className="px-2 py-2 border">
                    {
                      getAll?.filter((item) => item.id === complaint.id)[0]
                        ?.topicOfComplaint
                    }
                  </td>
                  <td className="px-2 py-2 border">
                    {
                      getAll?.filter((item) => item.id === complaint.id)[0]
                        ?.detailsOfTheTopic
                    }
                  </td>
                  <td
                    className="px-2 py-2 border"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "200px", // ปรับตามความเหมาะสม
                    }}
                  >
                    {
                      getAll?.filter((item) => item.id === complaint.id)[0]
                        ?.problemDetail
                    }
                  </td>
                  <td className="border text-center">
                    <span
                      style={{
                        backgroundColor:
                          getAll?.filter((item) => item.id === complaint.id)[0]
                            ?.status === "รอดำเนินการ"
                            ? "#FFA500"
                            : getAll?.filter(
                                (item) => item.id === complaint.id
                              )[0]?.status === "กำลังดำเนินการ"
                            ? "#3190FF"
                            : getAll?.filter(
                                (item) => item.id === complaint.id
                              )[0]?.status === "รอตรวจสอบ"
                            ? "#4B5563"
                            : getAll?.filter(
                                (item) => item.id === complaint.id
                              )[0]?.status === "เสร็จสิ้น"
                            ? "green"
                            : "",
                        fontWeight: "bold",
                        padding: "2px 12px",
                        display: "inline-block",
                        borderRadius: "9999px",
                      }}
                      className="text-white "
                    >
                      {
                        getAll?.filter((item) => item.id === complaint.id)[0]
                          ?.status
                      }
                    </span>
                  </td>
                  <td className="px-2 py-2 border text-center">
                    {getAll?.filter((item) => item.id === complaint.id)[0]
                      ?.status !== "เสร็จสิ้น" && (
                      <button
                        onClick={() => handleEdit(complaint)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <EditIcon />
                      </button>
                    )}
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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
          Copyright © 2025 ระบบรับเรื่องร้องเรียนร้องทุกข์ | Developed by
          Nattanun Naknaree & Rittinun Disaraphong | Version (1.0)
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

export default ComplaintTable;
