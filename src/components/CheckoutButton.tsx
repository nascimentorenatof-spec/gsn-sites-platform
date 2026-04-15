"use client";

import { useState } from "react";

export function CheckoutButton({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function startCheckout() {
    setIsLoading(true);
    setStatus("Preparando compra...");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const payload = (await response.json()) as { ok: boolean; checkoutUrl?: string; error?: string };
      if (!response.ok || !payload.ok || !payload.checkoutUrl) throw new Error(payload.error || "Checkout indisponivel.");
      window.location.href = payload.checkoutUrl;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro ao iniciar checkout.");
      setIsLoading(false);
    }
  }

  return (
    <div className="preview-actions">
      <button className="button primary" type="button" onClick={startCheckout} disabled={isLoading}>
        {isLoading ? "Abrindo checkout..." : "Comprar este site agora"}
      </button>
      <span className="status-text">{status}</span>
    </div>
  );
}
