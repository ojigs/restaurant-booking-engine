export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: number;
    details: ApiErrorDetail[];
    stack?: string;
  };
}
