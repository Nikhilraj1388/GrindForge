export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type HealthStatus = {
  status: "ok" | "error";
  database: "connected" | "disconnected";
  timestamp: string;
};
