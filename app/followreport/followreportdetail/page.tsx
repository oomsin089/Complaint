"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PersonIcon from '@mui/icons-material/Person';
import { useSession } from "../../../utils/useSession";
import { useAuth } from "../../../utils/auth";
import Navbar from "../../navbar/page";
import ApplicantTracking from "../../../navbar/Breadcrump";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import Link from "next/link";
import { useGetComplaintById } from "../../../hooks/useGetComplaintById";
import useDecryptData from "../../../hooks/Encryption/Decryption";
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import DescriptionIcon from '@mui/icons-material/Description';
import TimelineIcon from '@mui/icons-material/Timeline';
import CustomTabPanel, { a11yProps } from "../../../components/tabs";
import Card from "@mui/material/Card";
import { HourglassEmpty, Autorenew, Visibility, Check } from "@mui/icons-material";
import LogoutIcon from '@mui/icons-material/Logout';

const MainPage: React.FC = () => {
  const { session, loading } = useSession();
  const { logout } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [decryptedId, setDecryptedId] = useState<string | null>(null);
  const [urlId, setUrlId] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const { data: dataById } = useGetComplaintById(decryptedId?.toString());
  const { mutate: decrypt } = useDecryptData();
  const [rank, setRank] = useState<string>("");

  const [showSignout, setShowSignout] = useState(false);

  const handleButtonClick = () => {
    setShowSignout(!showSignout);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setUrlId(id);
  }, []);

  const stages = dataById?.data?.stageStatus ?? [];


  const sortedStages = stages.sort((a: any, b: any) => {
    // ถ้าเป็นสถานะ 'OPEN' ให้จัดอันดับให้ไปที่จุดเริ่มต้น
    if (a.activity === 'รอดำเนินการ' && b.activity !== 'รอดำเนินการ') return -1;
    if (a.activity !== 'รอดำเนินการ' && b.activity === 'รอดำเนินการ') return 1;

    // สำหรับสถานะที่ไม่ใช่ 'OPEN' ให้จัดเรียงตามลำดับที่ปรากฏ
    return 0;
  });

  const groupedStages = sortedStages.reduce((acc: any, stage: any) => {
    if (!acc[stage.activity]) {
      acc[stage.activity] = [];
    }
    acc[stage.activity].push(stage);
    return acc;
  }, {});

  const formatThaiDateTime = (dateString: any) => {
    const date = new Date(dateString);

    const day = date.getDate();
    const thaiYear = date.getFullYear() + 543; // แปลงเป็นพุทธศักราช (พ.ศ.)
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0'); // เติม 0 ถ้าหลักเดียว

    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const month = thaiMonths[date.getMonth()];

    return `วันที่ ${day} เดือน ${month} พ.ศ. ${thaiYear} เวลา ${hours}:${minutes} น.`;
};

  const reorganizeStages = (groupedStages: { [x: string]: any[]; }) => {
    const allActivities = Object.keys(groupedStages);
    const reorganizedStages = [];
    let latestActivity: null = null;
    let latestStages: any[] = [];

    // เรียงลำดับทุก stage ตาม createDate จากเก่าสุดไปใหม่สุด
    const allStagesSorted = allActivities.flatMap(activity =>
      groupedStages[activity].map(stage => ({ ...stage, activity }))
    ).sort((a, b) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime());

    allStagesSorted.forEach((stage) => {
      if (latestActivity !== stage.activity) {
        if (latestActivity) {
          reorganizedStages.push({
            activity: latestActivity,
            stages: latestStages // ไม่ต้อง reverse เพราะตอนนี้เรียงจากเก่าสุดอยู่บนแล้ว
          });
        }
        latestActivity = stage.activity;
        latestStages = [stage];
      } else {
        latestStages.push(stage);
      }
    });

    // เพิ่ม activity สุดท้าย
    if (latestActivity) {
      reorganizedStages.push({
        activity: latestActivity,
        stages: latestStages // ไม่ต้อง reverse
      });
    }

    return reorganizedStages;
  };

  const reorganizedStages = reorganizeStages(groupedStages);
  useEffect(() => {
      if (session?.rank) {
        setRank(session.rank);
      }
    }, [session]);

  useEffect(() => {
    console.log("dataById:", dataById);
    console.log("stageStatus:", dataById?.data?.stageStatus);
  }, [dataById]);

  useEffect(() => {
    if (session?.fullName) {
      setUserName(session.fullName);
    }
  }, [session]);

  useEffect(() => {
    if (urlId) {
      decrypt(urlId, {
        onSuccess: (decryptedId) => {
          window.history.replaceState({}, '', `/followreport/followreportdetail?id=${urlId}`);
          setDecryptedId(decryptedId);
        },
        onError: (err) => {
          console.error('Decryption failed:', err);
        }
      });
    }
  }, [urlId, decrypt]);

  const handleLogout = async () => {
    try {
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("รหัสผ่านหรืออีเมลไม่ถูกต้อง");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "รอดำเนินการ":
        return <HourglassEmpty fontSize="large" style={{ color: "white" }} />;
      case "กำลังดำเนินการ":
        return <Autorenew fontSize="large" style={{ color: "white" }} />;
      case "รอตรวจสอบ":
        return <Visibility fontSize="large" style={{ color: "white" }} />;
      case "เสร็จสิ้น":
        return <Check fontSize="large" style={{ color: "white" }} />;
      default:
        return null;
    }
  };
  const getStatusColor = (state: string) => {
    // ตรวจสอบว่ามี stageStatus หรือไม่
    const currentState = dataById?.data.stageStatus.some((status: { state: string; }) => status.state === state);

    if (currentState) {
      // กำหนดสีตามสถานะ
      switch (state) {
        case 'รอดำเนินการ':
          return '#FFA500';  // สีส้ม
        case 'กำลังดำเนินการ':
          return '#3190FF';  // สีส้ม
        case 'รอตรวจสอบ':
          return '#4B5563';  // สีส้ม
        case 'เสร็จสิ้น':
          return '#008000';  // สีเขียว
        default:
          return '#CCCCCC';  // สีเทา
      }
    }

    // ถ้าไม่มีสถานะที่ตรงกัน ให้ใช้สีเทา
    return '#CCCCCC';
  };

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
      <div className="bg-white shadow-lg rounded-lg p-6 mt-2 max-w-[90%] w-full flex-grow mb-12">
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="complaint details tabs"
              variant="fullWidth"
            >
              <Tab
                icon={<DescriptionIcon />}
                iconPosition="start"
                label="รายละเอียดการร้องเรียน"
                {...a11yProps(0)}
              />
              <Tab
                icon={<TimelineIcon />}
                iconPosition="start"
                label="Timeline"
                {...a11yProps(1)}
              />
            </Tabs>
          </Box>

          <CustomTabPanel value={tabValue} index={0}>
            <div className="grid grid-cols-2 gap-6">
              {/* ฝั่งซ้าย - ข้อมูลผู้ร้องเรียน */}
              <Card className="p-6 h-full">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-[#3190FF] pb-2 border-b pointer-events-none select-none">
                    ข้อมูลผู้ร้องเรียน
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-[120px,1fr] gap-2 items-baseline">
                      <span className="pointer-events-none select-none">ชื่อ-นามสกุล:</span>
                      <span
                        className="font-medium text-gray-600 pointer-events-none select-none"
                      >
                        {dataById?.data?.fullName}
                      </span>
                    </div>

                    <div className="grid grid-cols-[120px,1fr] gap-2 items-baseline">
                      <span className="pointer-events-none select-none">อีเมล:</span>
                      <span className="text-gray-600 pointer-events-none select-none">{dataById?.data?.emailAddress}</span>
                    </div>

                    <div className="grid grid-cols-[120px,1fr] gap-2 items-baseline">
                      <span className="pointer-events-none select-none">เบอร์โทร:</span>
                      <span className="font-medium text-gray-600 pointer-events-none select-none">{dataById?.data?.telephone}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* ฝั่งขวา - รายละเอียดการร้องเรียน */}
              <Card className="p-6 h-full">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-[#3190FF] pb-2 border-b pointer-events-none select-none">
                    รายละเอียดการร้องเรียน
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 pointer-events-none select-none">ประเด็นที่ร้องเรียน/ร้องทุกข์</h4>
                      <div className="pointer-events-none select-none p-3 bg-gray-50 rounded-lg font-medium text-gray-600">
                        {dataById?.data?.topicOfComplaint}
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 pointer-events-none select-none">เรื่องร้องเรียน/ร้องทุกข์</h4>
                      <div className="pointer-events-none select-none p-3 bg-gray-50 rounded-lg font-medium text-gray-600">
                        {dataById?.data?.detailsOfTheTopic}
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 pointer-events-none select-none">รายละเอียดการร้องเรียน/ร้องทุกข์		</h4>
                      <div className="pointer-events-none select-none p-3 bg-gray-50 rounded-lg font-medium text-gray-600 min-h-[200px] whitespace-pre-wrap">
                        {dataById?.data?.problemDetail}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={tabValue} index={1}>
            <h2 className="text-2xl font-bold mb-4 text-[#3190FF]">STATE</h2>
            <Timeline
              sx={{
                '& .MuiTimelineItem-root': {
                  minHeight: '120px',
                },
                '& .MuiTimelineContent-root': {
                  flex: 1,
                },
              }}
            >
              {reorganizedStages.map((stageGroup, index) => {
                return stageGroup.stages.map((stage, stageIndex) => {
                  const isCurrentState = dataById?.data.stageStatus.some(
                    (status: { state: any }) => status.state === stage.state
                  );

                  return (
                    <TimelineItem
                      key={`${stageGroup.activity}-${index}-${stageIndex}`}
                      sx={{
                        '&::before': {
                          flex: 1,
                          padding: 0,
                        },
                      }}
                    >
                      {/* Left side comment container - improved styling */}
                      <div style={{
                        width: '320px',
                        paddingRight: '20px',
                        position: 'absolute',
                        right: '50%',
                        marginRight: '70px',
                        textAlign: 'left',
                      }}>
                        <div
                          style={{
                            width: '100%',
                            padding: '16px 20px',
                            position: 'absolute',
                            textAlign: 'left',
                            right: '0',
                            backgroundColor: '#ffffff',
                            border: stage.state !== 'รอดำเนินการ' ? `2px solid ${getStatusColor(stage.state)}` : 'none',
                            borderRadius: '12px',
                            boxShadow: stage.state !== 'รอดำเนินการ' ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            overflowWrap: 'break-word',
                            visibility: stage.state === 'รอดำเนินการ' ? 'hidden' : 'visible',
                          }}
                        >
                          {stage.state !== 'รอดำเนินการ' && stage.state !== 'รอตรวจสอบ' && (
                            <p
                              style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: isCurrentState ? '#333' : '#888',
                                lineHeight: '1.5',
                                marginBottom: '4px',
                              }}
                            >
                              {stage.comment}
                            </p>
                          )}
                          {stage.state !== 'รอดำเนินการ' && stage.state !== 'กำลังดำเนินการ' && stage.state !== 'เสร็จสิ้น' && (
                            <p
                              style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: isCurrentState ? '#333' : '#888',
                                lineHeight: '1.5',
                                marginBottom: '4px',
                              }}
                            >
                              {stage.comment}: {formatThaiDateTime(stage.dueDate)}
                            </p>
                          )}
                          
                        </div>
                      </div>
                      {/* Middle timeline element - kept exactly the same */}
                      <TimelineSeparator>
                        <TimelineDot
                          sx={{
                            backgroundColor: getStatusColor(stage.state),
                            width: "48px",
                            height: "48px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {getStatusIcon(stage.state)}
                        </TimelineDot>
                        {(index === reorganizedStages.length - 1 ||
                          stageIndex < stageGroup.stages.length - 1) &&
                          stage.state !== "เสร็จสิ้น" && (
                            <TimelineConnector
                              sx={{
                                backgroundColor: getStatusColor(stage.state),
                                width: "2px",
                                height: "60px",
                              }}
                            />
                          )}
                        {(index === reorganizedStages.length - 1 &&
                          stageIndex === stageGroup.stages.length - 1) &&
                          stage.state !== "เสร็จสิ้น" && (
                            <TimelineDot
                              sx={{
                                backgroundColor: "#CCCCCC",
                                width: "24px",
                                height: "24px",
                                marginLeft: "auto",
                                marginRight: "auto",
                              }}
                            />
                          )}
                      </TimelineSeparator>

                      {/* Right side content - kept exactly the same as your original */}
                      <TimelineContent>
                        <div className="ml-4">
                          <h3
                            className={`font-semibold text-lg ${isCurrentState ? "text-black" : "text-black"
                              }`}
                          >
                            {stage.state}
                          </h3>
                          {isCurrentState && (
                            <div className="mt-2">
                              <p className="text-black">
                                {new Date(stage.createDate).toLocaleString("th-TH", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              {stage.detailsOfTheTopic && (
                                <p className="mt-1 text-gray-700">{stage.detailsOfTheTopic}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </TimelineContent>
                    </TimelineItem>
                  );
                });
              })}
            </Timeline>
          </CustomTabPanel>
        </Box>
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

}


export default MainPage;