"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMedicalExpense } from "@/lib/api/medical-expenses";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export const useDeleteMedicalExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMedicalExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalExpenses.all });
      toast.success("Medical expense was successfully deleted");
    },
    onError: () => {
      toast.error("Failed to delete medical expense");
    },
  });
};
