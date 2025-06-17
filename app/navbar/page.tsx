"use client";

import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="flex justify-between rounded-lg items-center bg-white text-black px-6 py-4 shadow-md">
      <div className="text-lg font-semibold">
        ระบบรับเรื่องร้องเรียน/ร้องทุกข์คณะบริหารธุรกิจ
      </div>

      <ul className="flex gap-6">
        <li>
          <Link href="/main" className="hover:underline">
            หน้าหลัก
          </Link>
        </li>
        <li>
          <Link href="/complaint" className="hover:underline">
            เขียนคำร้องเรียน/ร้องทุกข์
          </Link>
        </li>
        <li>
          <Link href="/followreport" className="hover:underline">
            ติดตามสถานะการร้องเรียน/ร้องทุกข์
          </Link>
        </li>
        <li>
          <Link href="/reportproblem" className="hover:underline">
          {/* <Link href="/NotAvailable" className="hover:underline"> */}
            แจ้งปัญหาการใช้งาน
          </Link>
        </li>
      </ul>
    </nav>
    
  );
};

export default Navbar;