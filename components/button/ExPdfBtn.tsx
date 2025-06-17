"use client";

import React from "react";
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { useGetAll } from "../../hooks/useGetAll";
import { FiDownload } from 'react-icons/fi';

type Props = {
  filteredData?: any[]; // รับข้อมูลที่กรองแล้วจาก parent component
};

export default function ExportPdfButton({ filteredData = [] }: Props) {
  const { data: allData = [] } = useGetAll();

  // ฟังก์ชันแปลงวันที่เป็นรูปแบบไทย
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    try {
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString || '-';
    }
  };

  // ฟังก์ชันแปลงสถานะเป็นภาษาไทยและกำหนดสี
  const getStatusStyle = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      'รอดำเนินการ': { text: 'รอดำเนินการ', color: '#FFA500' },
      'กำลังดำเนินการ': { text: 'กำลังดำเนินการ', color: '#3190FF' },
      'เสร็จสิ้น': { text: 'เสร็จสิ้น', color: 'green' },
      'รอตรวจสอบ': { text: 'รอตรวจสอบ', color: '#4B5563' }
    };

    return statusMap[status] || { text: status || '-', color: '#000000' };
  };

  const exportToPDF = async () => {
    const dataToExport = filteredData.length > 0 ? filteredData : allData;

    if (!dataToExport || dataToExport.length === 0) {
      alert("ไม่มีข้อมูลที่จะส่งออก กรุณาตรวจสอบข้อมูลอีกครั้ง");
      return;
    }

    try {
      // วันที่และเวลาปัจจุบัน
      const currentDate = new Date();
      const thaiDate = currentDate.toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      const currentTime = currentDate.toLocaleTimeString('th-TH');

      // สร้าง PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      const maxContentHeight = pageHeight - (margin * 2);

      // สร้างส่วนหัวและข้อมูลกลุ่มแรก
      let currentPage = 1;
      let currentY = margin;
      let dataIndex = 0;

      // สร้างและเพิ่มส่วนหัวลงในทุกหน้า
      const addHeader = () => {
        const headerHTML = `
          <div style="text-align: center; margin-bottom: 15px; display: flex; flex-direction: column; align-items: center;">
            <img src="/images/logo.png" style="height: 100px; margin-bottom: 10px;" />
            <h1 style="font-size: 18px; margin: 0; color: #3190FF; padding-bottom: 5px;">รายงานข้อมูลการร้องเรียน/ร้องทุกข์</h1>
            <p style="font-size: 14px; margin: 0;">ข้อมูล ณ วันที่: ${thaiDate} เวลา: ${currentTime} น.</p>
            <p style="font-size: 14px; margin: 5px 0 0 0;">จำนวนรายการทั้งหมด: ${dataToExport.length} รายการ</p>
          </div>
        `;

        const headerDiv = document.createElement('div');
        headerDiv.style.position = 'absolute';
        headerDiv.style.left = '-9999px';
        headerDiv.style.width = '210mm';
        headerDiv.style.fontFamily = 'Sarabun, Arial, sans-serif';
        headerDiv.innerHTML = headerHTML;

        document.body.appendChild(headerDiv);

        return html2canvas(headerDiv).then(canvas => {
          document.body.removeChild(headerDiv);

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);

          return imgHeight;
        });
      };

      // สร้างและเพิ่มส่วนท้ายลงในทุกหน้า
      const addFooter = (pageNum: any, totalPages: any) => {
        const footerHTML = `
          <div style="margin-bottom: 15px; font-size: 10px; display: flex; justify-content: space-between;">
            <p style="margin: 0;">ออกรายงานโดย: ระบบจัดการข้อร้องเรียน/ร้องทุกข์</p>
            <p style="margin: 0;">หน้า ${pageNum} จาก ${totalPages}</p>
          </div>
        `;

        const footerDiv = document.createElement('div');
        footerDiv.style.position = 'absolute';
        footerDiv.style.left = '-9999px';
        footerDiv.style.width = '210mm';
        footerDiv.style.fontFamily = 'Sarabun, Arial, sans-serif';
        footerDiv.innerHTML = footerHTML;

        document.body.appendChild(footerDiv);

        return html2canvas(footerDiv).then(canvas => {
          document.body.removeChild(footerDiv);

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // เพิ่มส่วนท้ายที่ด้านล่างของหน้า
          pdf.addImage(imgData, 'PNG', margin, pageHeight - margin - imgHeight, imgWidth, imgHeight);

          return imgHeight;
        });
      };

      // สร้างและเพิ่มส่วนหัวตารางลงในทุกหน้า
      const addTableHeader = () => {
        const tableHeaderHTML = `
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
            <thead>
              <tr style="background-color: #3190FF; color: white;">
                <th style="border: 1px solid #ddd; padding: 6px; text-align: center; width: 5%;">ลำดับ</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: center; width: 12%;">วันที่</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: center; width: 15%;">ชื่อ-นามสกุล</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: center; width: 15%;">ประเด็นการร้องเรียน/ร้องทุกข์</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: center; width: 15%;">เรื่องการร้องเรียน/ร้องทุกข์</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: center; width: 28%;">รายละเอียด</th>
                <th style="border: 1px solid #ddd; padding: 6px; text-align: center; width: 15%;">สถานะ</th>
              </tr>
            </thead>
          </table>
        `;

        const headerDiv = document.createElement('div');
        headerDiv.style.position = 'absolute';
        headerDiv.style.left = '-9999px';
        headerDiv.style.width = '210mm';
        headerDiv.style.fontFamily = 'Sarabun, Arial, sans-serif';
        headerDiv.innerHTML = tableHeaderHTML;

        document.body.appendChild(headerDiv);

        return html2canvas(headerDiv).then(canvas => {
          document.body.removeChild(headerDiv);

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);

          return imgHeight;
        });
      };

      // สร้างกลุ่มข้อมูลและเพิ่มลงใน PDF
      const addRows = async (startIdx: any, count: any) => {
        if (startIdx >= dataToExport.length) return 0;

        const endIdx = Math.min(startIdx + count, dataToExport.length);
        const rowsData = dataToExport.slice(startIdx, endIdx);

        const rowsHTML = `
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
            <tbody>
              ${rowsData.map((item, index) => {
          const statusStyle = getStatusStyle(item.status);
          return `
                  <tr style="${index % 2 === 0 ? 'background-color: #f9f9f9;' : ''}">
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center; width: 5%;">${item.id}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; width: 12%;">${formatDate(item.createDate?.toString())}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center; word-wrap: break-word; width: 15%;">${item.fullName || '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center; word-wrap: break-word; width: 15%;">${item.topicOfComplaint || '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center; word-wrap: break-word; width: 15%;">${item.detailsOfTheTopic || '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; word-wrap: break-word; width: 28%;">${item.problemDetail || '-'}</td>
                    <td style="border: 1px solid #ddd; padding: 6px; text-align: center; color: ${statusStyle.color}; font-weight: bold; width: 15%;">${statusStyle.text}</td>
                  </tr>
                `;
        }).join('')}
            </tbody>
          </table>
        `;

        const rowsDiv = document.createElement('div');
        rowsDiv.style.position = 'absolute';
        rowsDiv.style.left = '-9999px';
        rowsDiv.style.width = '210mm';
        rowsDiv.style.fontFamily = 'Sarabun, Arial, sans-serif';
        rowsDiv.innerHTML = rowsHTML;

        document.body.appendChild(rowsDiv);

        const canvas = await html2canvas(rowsDiv);
        document.body.removeChild(rowsDiv);

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        return {
          imgData,
          imgWidth,
          imgHeight,
          rowsProcessed: endIdx - startIdx
        };
      };

      // คำนวณจำนวนหน้าทั้งหมดโดยประมาณ (เพื่อแสดงในส่วนท้าย)
      const estimatedTotalPages = Math.ceil(dataToExport.length / 10); // ประมาณว่า 10 แถวต่อหน้า

      // เริ่มกระบวนการสร้าง PDF
      let pageCreationInProgress = true;

      while (pageCreationInProgress) {
        // เริ่มหน้าใหม่
        if (currentPage > 1) {
          pdf.addPage();
        }

        // เริ่มต้นที่ส่วนบนของหน้า
        currentY = margin;

        // เพิ่มส่วนหัว
        const headerHeight = await addHeader();
        currentY += headerHeight + 5; // เพิ่มระยะห่าง

        // เพิ่มส่วนหัวตาราง
        const tableHeaderHeight = await addTableHeader();
        currentY += tableHeaderHeight;

        // คำนวณพื้นที่ที่เหลือสำหรับข้อมูล (หักส่วนท้าย)
        const footerHeight = 10; // ประมาณความสูงส่วนท้าย
        const remainingHeight = pageHeight - currentY - margin - footerHeight;

        // ประมาณจำนวนแถวที่จะใส่ในหน้านี้
        let rowsAdded = 0;
        const rowsToAdd = [];
        let tempCurrentY = currentY;

        // เก็บข้อมูลแถวที่สามารถแสดงในหน้านี้ได้
        while (dataIndex < dataToExport.length) {
          // ทดลองเพิ่ม 1 แถว
          const result = await addRows(dataIndex, 1);

          if (typeof result === "object" && result !== null) {
            if (tempCurrentY + result.imgHeight <= pageHeight - margin - footerHeight) {
              // ยังมีพื้นที่พอ
              tempCurrentY += result.imgHeight;
              rowsToAdd.push({
                imgData: result.imgData,
                imgWidth: result.imgWidth,
                imgHeight: result.imgHeight
              });
              dataIndex += result.rowsProcessed;
              rowsAdded += result.rowsProcessed;
            } else {
              // พื้นที่ไม่พอ ต้องขึ้นหน้าใหม่
              break;
            }
          }
        }

        // เพิ่มแถวที่ได้รับการตรวจสอบแล้วว่าแสดงได้ในหน้านี้
        for (const row of rowsToAdd) {
          pdf.addImage(row.imgData, 'PNG', margin, currentY, row.imgWidth, row.imgHeight);
          currentY += row.imgHeight;
        }

        // เพิ่มส่วนท้าย
        await addFooter(currentPage, estimatedTotalPages);

        // ตรวจสอบว่าจบการทำงานหรือยัง
        if (dataIndex >= dataToExport.length) {
          pageCreationInProgress = false;
        }

        currentPage++;
      }

      // บันทึกไฟล์ PDF
      const filename = `รายงานข้อร้องเรียน_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="flex justify-center items-center bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
      <div className="cursor-pointer bg-[#C60000] border-l-2 border-y-2 border-[#C60000] rounded-l-lg w-10 h-10 flex justify-center items-center" onClick={exportToPDF}>
        <FiDownload className="text-white text-lg" />
      </div>
      <button
        className="w-24 h-10 hover:bg-[#C60000] hover:text-white font-medium duration-300 border-2 border-[#C60000] rounded-r-lg text-[#C60000] text-sm"
        onClick={exportToPDF}
      >
        Export PDF
      </button>
    </div>
  );
}