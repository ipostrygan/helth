"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAppointment } from "@/lib/api/appointments";

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
