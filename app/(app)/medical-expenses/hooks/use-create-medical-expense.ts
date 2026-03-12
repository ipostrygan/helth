"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense } from "@/app/actions/medical-expenses";

export const useCreateMedicalExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-expenses"] });
    },
  });
};
