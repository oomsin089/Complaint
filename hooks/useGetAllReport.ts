import { useQuery } from "@tanstack/react-query";
import { getAllReportApi } from "../app/api/complaint";
import { ReportProblem } from "../types/complaintCreate";
import { getAllReport } from "./queries/QueriesKey";


export const useGetAllReport = () => {
  return useQuery<ReportProblem[], { message: string }>({
    queryKey: [getAllReport],
    queryFn: async () => await getAllReportApi()
  });
};