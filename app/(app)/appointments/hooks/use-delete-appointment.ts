"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAppointment } from "@/lib/api/appointments";
import { toast } from "sonner";

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment was successfully deleted");
    },
    onError: () => {
      toast.error("Failed to delete appointment");
    },
  });
};
