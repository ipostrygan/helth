"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteMedicalExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/medical-expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete expense");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-expenses"] });
    },
  });
};
