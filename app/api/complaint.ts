import { ComplaintCreate, GetComplaint, ReportProblemCreate,ReportProblem, AdmUser } from '../../types/complaintCreate';
import { IResponse } from '../../other/IResponse';
import { axiosApi } from '../../utils/axios';
import axios, { isAxiosError } from 'axios';


export const complaintCreateApi = async (payload:ComplaintCreate) => {
    try {
      const response = await axiosApi<IResponse>('post', `/auth/add`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
       );
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.message);
        console.error("Axios error details:", error.response?.data);
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }
  }

 export const getComplaintByEmailAddressApi = async (emailAddress: string) => {
  try {
    const response = await axiosApi<IResponse[]>('get',`/auth/email?emailAddress=${emailAddress}`);    
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const getComplaintByIdApi = async (id: string) => {
  try {
    const response = await axiosApi<IResponse>(`get`,`/auth/getById?id=${id}`);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
};

export const getAllApi = async (): Promise<GetComplaint[]> => {
  try {
    const response = await axiosApi<GetComplaint[]>(`get`,`/auth/getAll`);
    if (!response || !Array.isArray(response)) {
      throw new Error("Response data is not an array or is undefined");
    }
    return response;
  } catch (err) {
    if (isAxiosError(err)) {
      console.error(err);
      throw err;
    } else {
      console.error(err);
      throw err;
    }
  }
};

export const reportProblemCreateApi = async (payload:ReportProblemCreate) => {
  try {
    const response = await axiosApi<IResponse>('post', `/auth/addreport`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
     );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      console.error("Axios error details:", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

export const updateComplaintApi = async (id: number, payload: {
  status:string
  state: string;
  firstName: string;
  lastName: string;
  fullName: string;
  emailAddress: string;
  dueDate: Date;
}) => {
  try {
    const response = await axiosApi('put', `/auth/update/${id}`, payload);
    return response;
  } catch (err) {
    if (isAxiosError(err)) {
      console.error(err);
      throw Promise.reject(err);
    } else {
      console.error(err);
      throw Promise.reject(err);
    }
  }
}

export const getAllReportApi = async (): Promise<ReportProblem[]> => {
  try {
    const response = await axiosApi<ReportProblem[]>(`get`,`/auth/getAllReport`);
    if (!response || !Array.isArray(response)) {
      throw new Error("Response data is not an array or is undefined");
    }
    return response;
  } catch (err) {
    if (isAxiosError(err)) {
      console.error(err);
      throw err;
    } else {
      console.error(err);
      throw err;
    }
  }
};

export const getAllUserApi = async (): Promise<AdmUser[]> => {
  try {
    const response = await axiosApi<AdmUser[]>(`get`,`/auth/getAllUser`);
    if (!response || !Array.isArray(response)) {
      throw new Error("Response data is not an array or is undefined");
    }
    return response;
  } catch (err) {
    if (isAxiosError(err)) {
      console.error(err);
      throw err;
    } else {
      console.error(err);
      throw err;
    }
  }
};