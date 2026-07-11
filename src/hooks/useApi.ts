import { useState } from "react";

/**
 * Hook para ejecutar peticiones HTTP y manejar estado de carga y errores.
 *
 * @returns Un objeto con estado de carga, error y método request.
 */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function request<T = any>(input: RequestInfo, init?: RequestInit) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(input, init);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Request failed");
      }

      return result as T;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    request,
  };
}
