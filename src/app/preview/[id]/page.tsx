"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Project = {
  id: string;
  status: string;
  form_data: { businessName: string; segment: string; contact: string };
  preview_html: string;
  expires_at: string | null;
};

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0); // segundos
  const [notes, setNotes] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");

  // Carrega o projeto
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/project/${id}`);
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        if (data.project) {
          setProject(data.project);
          if (data.project.expires_at) {
            const diff = Math.floor((new Date(data.project.expires_at).getTime() - Date.now()) / 1000);
            setTimeLeft(Math.max(0, diff));
            if (diff <= 0) setExpired(true);
          }
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [id]);

  // Countdown
  useEffect(() => {
    if (!project?.expires_at || expired) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setExpired(true); clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [project, expired]);

  async function handleCheckout() {
    setCheckingOut(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id, customerNotes: notes }),
      });
      const data = await res.json();
      if (data.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || "Erro ao iniciar pagamento.");
        setCheckingOut(false);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setCheckingOut(false);
    }
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function urgencyColor() {
    if (timeLeft > 600) return "#16a34a"; // verde — > 10min
    if (timeLeft > 180) return "#f59e0b"; // laranja — > 3min
    return "#ef4444"; // vermelho — < 3min
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
        <p style={{ color: "#64748b", fontSize: 18 }}>Carregando preview...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "Inter, sans-serif", padding: 24 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Preview não encontrado</h1>
        <p style={{ color: "#64748b", textAlign: "center" }}>Este link não existe ou foi removido.</p>
      </div>
    );
  }

  if (expired && !["paid","in_progress","delivered"].includes(project.status)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fef2f2", fontFamily: "Inter, sans-serif", padding: 24 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⏰</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Este preview expirou</h1>
        <p style={{ color: "#64748b", textAlign: "center", maxWidth: 420, marginBottom: 24 }}>
          O rascunho do seu site ficou disponível por 1 hora. Para gerar um novo, basta preencher o formulário novamente.
        </p>
        <a href="/create-site" style={{ background: "#16a34a", color: "white", fontWeight: 700, padding: "14px 28px", borderRadius: 12, textDecoration: "none", fontSize: 16 }}>
          Criar novo site →
        </a>
      </div>
    );
  }

  const isPaid = ["paid","in_progress","delivered"].includes(project.status);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>

      {/* Barra superior */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "white", borderBottom: "1px solid #e2e8f0",
        padding: "12px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)"
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>
            Rascunho do site
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {project.form_data.businessName}
          </div>
        </div>

        {/* Timer */}
        {!isPaid && project.expires_at && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: timeLeft <= 180 ? "#fef2f2" : "#f8fafc",
            border: `2px solid ${urgencyColor()}`,
            borderRadius: 10, padding: "8px 14px"
          }}>
            <span style={{ fontSize: 18 }}>⏱️</span>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Link expira em</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: urgencyColor(), fontVariantNumeric: "tabular-nums" }}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        )}

        {isPaid && (
          <div style={{ background: "#f0fdf4", border: "2px solid #16a34a", borderRadius: 10, padding: "8px 16px", fontSize: 14, fontWeight: 700, color: "#16a34a" }}>
            ✅ Pagamento confirmado
          </div>
        )}
      </div>

      {/* Preview iframe */}
      <div style={{ position: "relative" }}>
        <iframe
          title={`Preview de ${project.form_data.businessName}`}
          srcDoc={project.preview_html}
          style={{ width: "100%", height: "70vh", border: "none", display: "block" }}
        />
        {/* Overlay para bloquear interação no iframe */}
        <div style={{ position: "absolute", inset: 0, cursor: "default" }} />
      </div>

      {/* Painel de checkout */}
      {!isPaid && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px 48px" }}>
          <div style={{ background: "white", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.09)", padding: 32, border: "1px solid #e2e8f0" }}>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
              Gostou do rascunho? 🚀
            </h2>
            <p style={{ color: "#64748b", fontSize: 15, marginBottom: 24 }}>
              Faça o checkout e um designer vai ajustar tudo que você pedir. Entrega em até 5 dias.
            </p>

            <label style={{ display: "block", fontWeight: 700, color: "#0f172a", marginBottom: 8, fontSize: 14 }}>
              O que você quer mudar ou melhorar? (opcional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Mudar a cor para azul, adicionar foto do espaço, colocar meu Instagram, alterar o texto da seção de serviços..."
              rows={5}
              style={{
                width: "100%", borderRadius: 12, border: "2px solid #e2e8f0",
                padding: "12px 16px", fontSize: 14, color: "#0f172a",
                fontFamily: "Inter, sans-serif", resize: "vertical",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 0.2s"
              }}
              onFocus={e => (e.target.style.borderColor = "#16a34a")}
              onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
            />

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 14, marginTop: 12 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              style={{
                marginTop: 20, width: "100%", background: checkingOut ? "#86efac" : "#16a34a",
                color: "white", fontWeight: 800, fontSize: 18,
                padding: "16px 24px", borderRadius: 12, border: "none",
                cursor: checkingOut ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(22,163,74,0.35)",
                transition: "all 0.2s"
              }}
            >
              {checkingOut ? "Aguarde..." : "✅ Aprovar e fazer pagamento"}
            </button>

            <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", marginTop: 12 }}>
              Pix aceito · Sem contrato · Revisões inclusas · Entrega em até 5 dias
            </p>
          </div>
        </div>
      )}

      {/* Pós-pagamento: coleta de domínio */}
      {isPaid && (
        <DomainCollector projectId={id} />
      )}
    </div>
  );
}

function DomainCollector({ projectId }: { projectId: string }) {
  const [domain, setDomain] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!domain.trim()) return;
    setSaving(true);
    await fetch("/api/project/domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, domain: domain.trim() }),
    });
    setSaved(true);
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px 48px" }}>
      <div style={{ background: "#f0fdf4", borderRadius: 20, border: "2px solid #bbf7d0", padding: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
          🎉 Pagamento confirmado!
        </h2>
        <p style={{ color: "#374151", fontSize: 15, marginBottom: 24 }}>
          Seu site está sendo finalizado. Enquanto isso, informe o domínio que deseja usar — pode ser um que você já tem ou comprar um conosco.
        </p>

        {!saved ? (
          <>
            <label style={{ display: "block", fontWeight: 700, color: "#0f172a", marginBottom: 8, fontSize: 14 }}>
              Qual domínio você quer usar?
            </label>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="meunegocio.com.br (ou deixe em branco para decidir depois)"
              style={{
                width: "100%", borderRadius: 10, border: "2px solid #86efac",
                padding: "12px 16px", fontSize: 14, color: "#0f172a",
                fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box"
              }}
            />
            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <button
                onClick={handleSave}
                disabled={saving || !domain.trim()}
                style={{ background: "#16a34a", color: "white", fontWeight: 700, fontSize: 15, padding: "12px 24px", borderRadius: 10, border: "none", cursor: "pointer" }}
              >
                {saving ? "Salvando..." : "Confirmar domínio"}
              </button>
              <button
                onClick={() => setSaved(true)}
                style={{ background: "white", color: "#64748b", fontWeight: 600, fontSize: 15, padding: "12px 24px", borderRadius: 10, border: "2px solid #e2e8f0", cursor: "pointer" }}
              >
                Decidir depois
              </button>
            </div>
          </>
        ) : (
          <div style={{ background: "white", borderRadius: 12, padding: "16px 20px", border: "1px solid #bbf7d0" }}>
            <p style={{ fontWeight: 700, color: "#16a34a", fontSize: 16, margin: 0 }}>
              ✅ {domain ? `Domínio "${domain}" registrado!` : "Você pode informar o domínio a qualquer momento."}
            </p>
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>
              Entraremos em contato assim que o site estiver pronto para publicação.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
