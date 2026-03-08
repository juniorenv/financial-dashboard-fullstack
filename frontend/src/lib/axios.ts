import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.length > 0
    ? import.meta.env.VITE_API_URL
    : "/api";

export const api = axios.create({
  baseURL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Reempacota erros da API no formato padrão do backend
    if (error.response) {
      const { status, data } = error.response;
      return Promise.reject(
        new Error(
          data?.message ??
            `Erro na requisição (${status}). Tente novamente mais tarde.`,
        ),
      );
    }

    return Promise.reject(
      new Error("Erro de rede. Verifique sua conexão com a internet."),
    );
  },
);

