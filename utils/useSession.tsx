"use client";
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { axiosApi } from './axios';

type SessionData = {
  emailAddress: string;
  passWord: string;
  firstName: string;
  lastName: string;
  fullName: string;
  rank: string;
};

type SessionContextType = {
  session: SessionData | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  refreshSession2: () => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
  refreshSession: async () => {},
  refreshSession2: async () => {},
  logout: async () => {},
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimestamp, setSessionTimestamp] = useState<number | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const router = useRouter();

  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 นาที (900,000 มิลลิวินาที)

  // อ่านข้อมูล session จาก localStorage เมื่อเริ่มต้น component
  useEffect(() => {
    const loadSessionFromStorage = async () => {
      setLoading(true);
      try {
        const savedSession = localStorage.getItem('userSession');
        const savedTimestamp = localStorage.getItem('sessionTimestamp');
        
        if (savedSession && savedTimestamp) {
          const parsedSession = JSON.parse(savedSession);
          const timestamp = parseInt(savedTimestamp, 10);
          
          // ตรวจสอบว่า session หมดอายุหรือไม่
          if (Date.now() - timestamp < SESSION_TIMEOUT) {
            console.log('พบ session ใน localStorage', parsedSession);
            setSession(parsedSession);
            setSessionTimestamp(timestamp);
            setInitialCheckDone(true);
            setLoading(false);
            return true; // พบ session ที่ใช้งานได้
          } else {
            // ถ้า session หมดอายุ ให้ลบออกจาก localStorage
            console.log('session หมดอายุ');
            localStorage.removeItem('userSession');
            localStorage.removeItem('sessionTimestamp');
          }
        } else {
          console.log('ไม่พบ session ใน localStorage');
        }
        
        // ถ้าไม่มี session ใน localStorage หรือ session หมดอายุ ให้ดึงข้อมูลใหม่
        const fetchResult = await fetchSessionData();
        setInitialCheckDone(true);
        return fetchResult;
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอ่าน session:', error);
        setInitialCheckDone(true);
        setLoading(false);
        return false;
      }
    };

    loadSessionFromStorage();
  }, []);

  // ฟังก์ชันสำหรับดึงข้อมูล session จาก API
  const fetchSessionData = async () => {
    let success = false;
    try {
      console.log('กำลังดึงข้อมูล session จาก API...');
      // ลองดึงข้อมูลจาก profile ก่อน
      const response = await axiosApi<SessionData>('get', '/auth/profile');
      if (response) {
        setSession(response);
        const currentTime = Date.now();
        setSessionTimestamp(currentTime);
        localStorage.setItem('userSession', JSON.stringify(response));
        localStorage.setItem('sessionTimestamp', currentTime.toString());
        console.log('ดึงข้อมูล session จาก /auth/profile สำเร็จ', response);
        success = true;
      }
    } catch (profileError) {
      console.error('ดึงข้อมูล session จาก /auth/profile ไม่สำเร็จ:', profileError);
      
      // ถ้าดึงข้อมูลจาก profile ไม่สำเร็จ ให้ลองดึงจาก profileAdmin
      try {
        const adminResponse = await axiosApi<SessionData>('get', '/auth/profileAdmin');
        if (adminResponse) {
          setSession(adminResponse);
          const currentTime = Date.now();
          setSessionTimestamp(currentTime);
          localStorage.setItem('userSession', JSON.stringify(adminResponse));
          localStorage.setItem('sessionTimestamp', currentTime.toString());
          console.log('ดึงข้อมูล session จาก /auth/profileAdmin สำเร็จ', adminResponse);
          success = true;
        }
      } catch (adminError) {
        console.error('ดึงข้อมูล session จาก /auth/profileAdmin ไม่สำเร็จ:', adminError);
        setSession(null);
        localStorage.removeItem('userSession');
        localStorage.removeItem('sessionTimestamp');
      }
    } finally {
      setLoading(false);
    }
    return success;
  };

  const getSession = async () => {
    try {
      const response = await axiosApi<SessionData>('get', '/auth/profileAdmin');
      if (response) {
        setSession(response);
        const currentTime = Date.now();
        setSessionTimestamp(currentTime);
        localStorage.setItem('userSession', JSON.stringify(response));
        localStorage.setItem('sessionTimestamp', currentTime.toString());
        console.log('getSession สำเร็จ:', response);
        return true;
      }
    } catch (error) {
      console.error('ดึงข้อมูล session ไม่สำเร็จ (getSession):', error);
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  };

  const fetchSession = async () => {
    try {
      const response = await axiosApi<SessionData>('get', '/auth/profile');
      if (response) {
        setSession(response);
        const currentTime = Date.now();
        setSessionTimestamp(currentTime);
        localStorage.setItem('userSession', JSON.stringify(response));
        localStorage.setItem('sessionTimestamp', currentTime.toString());
        console.log('fetchSession สำเร็จ:', response);
        return true;
      }
    } catch (error) {
      console.error('ดึงข้อมูล session ไม่สำเร็จ (fetchSession):', error);
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  };

  const logout = async () => {
    // เก็บข้อมูลว่าเป็น admin หรือไม่ไว้ก่อน
    let isAdmin = false;
    try {
      const savedSession = localStorage.getItem('userSession');
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        isAdmin = parsedSession?.emailAddress?.includes('@mail.rmutt.ac.th');
      }
    } catch (e) {
      console.error('เกิดข้อผิดพลาดในการตรวจสอบ email:', e);
    }
    
    try {
      // เรียก API logout
      await axiosApi('post', '/auth/logout', {}, { withCredentials: true });
      console.log('Logout API successful');
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // เคลียร์ข้อมูล session ทั้งหมด
      setSession(null);
      setSessionTimestamp(null);
      localStorage.removeItem('userSession');
      localStorage.removeItem('sessionTimestamp');
      console.log('Session data cleared');
      
      // redirect โดยใช้ค่า isAdmin ที่เก็บไว้
      if (isAdmin) {
        router.push('/adminlogin');
      } else {
        router.push('/login');
      }
    }
  };

  const redirectToLogin = () => {
    console.log('กำลัง redirect ไปหน้า login...');
    // ดูข้อมูลจาก localStorage เพื่อตรวจสอบว่าเป็น admin หรือไม่
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        if (parsedSession?.emailAddress?.includes('@mail.rmutt.ac.th')) {
          router.push('/adminlogin');
          return;
        }
      } catch (e) {
        console.error('เกิดข้อผิดพลาดในการตรวจสอบ email:', e);
      }
    }
    
    // ถ้าไม่มีข้อมูลหรือไม่ใช่ admin ให้ไปที่ /login
    router.push('/login');
  };

  // ตรวจสอบ session หลังจากโหลดข้อมูลเสร็จแล้ว
  useEffect(() => {
    if (initialCheckDone && !loading && session === null) {
      console.log('initialCheckDone แล้ว, session เป็น null, เตรียม redirect');
      redirectToLogin();
    }
  }, [initialCheckDone, loading, session]);

  // ตั้งเวลาตรวจสอบหมดอายุ session
  useEffect(() => {
    if (!sessionTimestamp) return;
    
    const timeout = setTimeout(async () => {
      console.log('Session timeout!');
      
      // เรียก logout เมื่อหมดเวลา
      await logout();
    }, SESSION_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [sessionTimestamp]);

  // ตรวจสอบหมดอายุ session เป็นระยะ
  useEffect(() => {
    const interval = setInterval(async () => {
      const savedTimestamp = localStorage.getItem('sessionTimestamp');
      if (savedTimestamp) {
        const timestamp = parseInt(savedTimestamp, 10);
        if (Date.now() - timestamp >= SESSION_TIMEOUT) {
          console.log('Session expired during interval check!');
          
          // เรียก logout เมื่อ session หมดอายุ
          await logout();
        }
      }
    }, 60000); // ตรวจสอบทุก 1 นาที

    return () => clearInterval(interval);
  }, []);

  const refreshSession = async () => {
    setLoading(true);
    await fetchSession();
  };

  const refreshSession2 = async () => {
    setLoading(true);
    await getSession();
  };

  return (
    <SessionContext.Provider value={{ session, loading, refreshSession, refreshSession2, logout }}>
      {children}
    </SessionContext.Provider>
  );
};