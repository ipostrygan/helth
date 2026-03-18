"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense } from "@/app/actions/medical-expenses";
import { toast } from "sonner";

export const useCreateMedicalExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-expenses"] });
      toast.success("Medical expense was successfully created");
    },
    onError: () => {
      toast.error("Failed to create medical expense");
    },
  });
};
