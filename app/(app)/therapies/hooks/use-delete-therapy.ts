"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTherapy } from "@/lib/api/therapies";
import { toast } from "sonner";

export const useDeleteTherapy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTherapy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapies"] });
      toast.success("Therapy was successfully deleted");
    },
    onError: () => {
      toast.error("Failed to delete therapy");
    },
  });
};
