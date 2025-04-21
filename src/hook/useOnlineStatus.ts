import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function useOnlineStatus() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.email) return;  // Verifica se o usuário está logado

    const userId = session.user.email;

    const setStatus = async (status: "online" | "offline") => {
      try {
        await fetch("/api/create/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dados: { userId, status } }),
        });
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setStatus("online");  // Marca como online se a página estiver visível
      } else {
        setStatus("offline"); // Marca como offline se a página não estiver visível
      }
    };

    const handleFocus = () => {
      setStatus("online");  // Marca como online se a aba ou janela do navegador ganhar foco
    };

    const handleBlur = () => {
      setStatus("offline"); // Marca como offline se a aba ou janela do navegador perder foco
    };

    const handleBeforeUnload = () => setStatus("offline"); // Marca como offline antes de sair ou recarregar

    // Inicializa o status como "online" quando a página está visível
    if (document.visibilityState === "visible") {
      setStatus("online");
    }

    // Adiciona os event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Limpeza dos event listeners
      setStatus("offline");
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session?.user?.email]);  // Executa quando a sessão do usuário mudar
}
