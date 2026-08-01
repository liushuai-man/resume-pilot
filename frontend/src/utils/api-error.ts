interface ApiErrorLike {
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string
): string {
  const apiError = error as ApiErrorLike;
  const serverMessage = apiError?.response?.data?.message;
  if (serverMessage) return serverMessage;

  if (apiError?.response?.status === 429) {
    return '操作过于频繁，请稍后再试';
  }

  return apiError?.message || fallback;
}
