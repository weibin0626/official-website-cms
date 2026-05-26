export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

export interface PaginatedData<T = unknown> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    roles: string[];
  };
}
