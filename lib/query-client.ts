import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 minute
      retry: (failureCount, error) => {
        // Don't retry on 401 (Unauthorized)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.warn("[React Query] Skipping retry for 401 Unauthorized");
          return false;
        }
        // Retry other errors once
        return failureCount < 1;
      },
    },
  },
});
