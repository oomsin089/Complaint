import { useQuery } from "@tanstack/react-query"
import { IResponse } from "../other/IResponse";
import { getComplaintById } from "./queries/QueriesKey";
import { getComplaintByIdApi } from "../app/api/complaint";

export const useGetComplaintById = (id: string | undefined) => {
  return useQuery<IResponse, { message: string }>({
        queryKey: [getComplaintById, id], // ✅ ควรใช้ string เป็น queryKey
        queryFn: async () => {
            if (!id) {
                throw new Error('Invalid id');
            }
            return await getComplaintByIdApi(id);
        },
        enabled: !!id, // ✅ ป้องกันการเรียก API ถ้าไม่มี emailAddress
    });
};

