"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent } from "react";
import { uploadProfileImage } from "@/lib/api/users";

export function useUploadFile(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]

      if (!file) throw new Error("No file provided");

      return uploadProfileImage(id, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (err) => {
      if (err) throw new Error("Failed to upload file to S3");
    }
  })
}
