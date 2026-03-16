"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMedicalExpense } from "@/lib/api/medical-expenses";

export const useDeleteMedicalExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMedicalExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-expenses"] });
    },
  });
};
