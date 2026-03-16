"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExpense } from "@/app/actions/medical-expenses";

export const useEditMedicalExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-expenses"] });
    },
  });
};
