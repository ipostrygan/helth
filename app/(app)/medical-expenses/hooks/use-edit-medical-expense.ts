"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExpense } from "@/app/actions/medical-expenses";
import { toast } from "sonner";

export const useEditMedicalExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-expenses"] });
      toast.success("Medical expense was successfully updated");
    },
    onError: () => {
      toast.error("Failed to update medical expense");
    },
  });
};
