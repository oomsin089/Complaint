import { useQuery } from "@tanstack/react-query";
import { getAllUserApi } from "../app/api/complaint";
import { AdmUser } from "../types/complaintCreate";
import { getAllUser } from "./queries/QueriesKey";



export const useGetAllUser = () => {
  return useQuery<AdmUser[], { message: string }>({
    queryKey: [getAllUser],
    queryFn: async () => await getAllUserApi()
  });
};