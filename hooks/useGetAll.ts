import { useQuery } from "@tanstack/react-query";
import { getAllApi } from "../app/api/complaint";
import { GetComplaint } from "../types/complaintCreate";
import { getAll } from "./queries/QueriesKey";


export const useGetAll = () => {
  return useQuery<GetComplaint[], { message: string }>({
    queryKey: [getAll],
    queryFn: async () => await getAllApi()
  });
};