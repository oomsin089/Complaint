'use client';
import { Box } from '@mui/material';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from "next/link";

export interface TracksType {
  level: number;
  name: string;
  linkTo: string;
}

export default function ApplicantTracking() {
  const pathname = usePathname();

  const getPaths = () => {
    const paths: TracksType[] = [
      { level: 1, name: "Dashboard", linkTo: "/main" },
    ];

    const pathMapping: { [key: string]: string } = {
      'complaint': 'Complaint',
      'followreport': 'FollowReport',
      'reportproblem': 'ReportProblem',
      'followreportdetail': 'FollowReportDetail',
      // เพิ่ม mapping อื่นๆ ตามต้องการ
    };

    const segments = pathname.split('/').filter(segment => segment && segment !== 'main');
    let currentPath = '';
    
    segments.forEach((segment) => {
      if (pathMapping[segment]) {
        currentPath += `/${segment}`;
        paths.push({
          level: paths.length + 1,
          name: pathMapping[segment],
          linkTo: currentPath
        });
      }
    });

    return paths;
  };

  const pathTracks = getPaths();

  // สไตล์สำหรับลิงก์ก่อนหน้า (สีฟ้า)
  const previousLinkStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#3190FF",
    textDecoration: "none"
  };

  // สไตล์สำหรับลิงก์ปัจจุบัน (สีดำ)
  const currentLinkStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#000000",
    textDecoration: "none"
  };

  return (
    <Box className="w-auto flex mx-auto max-w-screen-2xl px-8 mb-4">
      <Box className="px-3.5 lg:px-6 text-l">
        {pathTracks.map((track, index) => {
          const isLast = index === pathTracks.length - 1;
          
          return (
            <span key={track.name + index}>
              {index > 0 && <span style={{ fontSize: "20px", fontWeight: "bold" }}> {">"} </span>}
              {isLast ? (
                <span style={currentLinkStyle}>{track.name}</span>
              ) : (
                <Link href={track.linkTo} style={previousLinkStyle}>
                  {track.name}
                </Link>
              )}
            </span>
          );
        })}
      </Box>
    </Box>
  );
}