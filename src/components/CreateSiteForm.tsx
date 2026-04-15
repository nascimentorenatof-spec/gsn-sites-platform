"use client";

import { useState } from "react";
import { palettes, segments, visualStyles } from "@/lib/catalog";

export function CreateSiteForm() {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Montando um preview vendavel com IA...");

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/generate-site", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { ok: boolean; error?: string; previewUrl?: string; errors?: Record<string, string> };

      if (!response.ok || !payload.ok) {
        const message = payload.errors ? Object.values(payload.errors).join(" ") : payload.error || "Nao foi possivel gerar o site.";
        throw new Error(message);
      }

      window.location.href = payload.previewUrl || "/";
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="site-form" onSubmit={submit}>
      <label>
      Nome do negocio ou site
        <input name="businessName" maxLength={90} required placeholder="Ex: Studio Luna" />
      </label>
      <label>
        Segmento
        <select name="segment" required defaultValue="">
          <option value="" disabled>
            Selecione
          </option>
          {segments.map((segment) => (
            <option key={segment} value={segment}>
              {segment}
            </option>
          ))}
        </select>
      </label>
      <label>
        Paleta de cores
        <select name="palette" required defaultValue="">
          <option value="" disabled>
            Selecione
          </option>
          {Object.entries(palettes).map(([value, palette]) => (
            <option key={value} value={value}>
              {palette.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Estilo visual
        <select name="visualStyle" required defaultValue="">
          <option value="" disabled>
            Selecione
          </option>
          {visualStyles.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </label>
      <label>
        Cidade/regiao
        <input name="region" maxLength={120} required placeholder="Ex: Sao Paulo e regiao" />
      </label>
      <label>
        Contato
        <input name="contact" maxLength={120} required placeholder="email, telefone ou WhatsApp" />
      </label>
      <label className="wide">
        Descricao do negocio
        <textarea name="description" minLength={30} maxLength={900} required placeholder="Conte o que voce vende, para quem e qual diferencial precisa aparecer." />
      </label>
      <label className="wide">
        Servicos
        <textarea name="services" minLength={5} maxLength={700} required placeholder="Liste os principais servicos, separados por virgula ou linha." />
      </label>
      <label>
        Dominio desejado
        <input name="desiredDomain" maxLength={120} placeholder="exemplo.com.br" />
      </label>
      <label>
        Imagens
        <input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple />
      </label>
      <label className="check wide">
        <input name="generateAiTexts" type="checkbox" defaultChecked />
        Gerar textos automaticamente com IA
      </label>
      <div className="actions wide">
        <button className="button primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Gerando preview..." : "Gerar preview para comprar"}
        </button>
        <p className="status-text" role="status">
          {status}
        </p>
      </div>
    </form>
  );
}
