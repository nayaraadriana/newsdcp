"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/infrastructure/auth/better-auth.client";

interface LinkField {
  id: string;
  label: string;
  url: string;
}

interface TrackedLink {
  label: string;
  originalUrl: string;
  trackedUrl: string;
}

function createLinkField(): LinkField {
  return { id: crypto.randomUUID(), label: "", url: "" };
}

export default function LinksPage() {
  const router = useRouter();

  const [campaignName, setCampaignName] = useState("");
  const [linkFields, setLinkFields] = useState<LinkField[]>([createLinkField()]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ campaignId: string; trackedLinks: TrackedLink[] } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  function addLinkField() {
    setLinkFields((prev) => [...prev, createLinkField()]);
  }

  function removeLinkField(id: string) {
    setLinkFields((prev) => prev.filter((f) => f.id !== id));
  }

  function updateLinkField(id: string, field: "label" | "url", value: string) {
    setLinkFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  }

  async function handleGenerate() {
    setError("");
    setResult(null);

    if (!campaignName.trim()) {
      setError("Informe o nome da campanha.");
      return;
    }

    const filledLinks = linkFields.filter((f) => f.label.trim() || f.url.trim());
    if (filledLinks.length === 0) {
      setError("Adicione ao menos um link com nome e URL.");
      return;
    }

    const incomplete = filledLinks.some((f) => !f.label.trim() || !f.url.trim());
    if (incomplete) {
      setError("Todos os links precisam ter nome e URL preenchidos.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/links/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: campaignName.trim(),
          links: filledLinks.map(({ label, url }) => ({ label, url })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao gerar links.");
        return;
      }

      setResult(data);
    } catch {
      setError("Falha na conexão. Verifique se o servidor está rodando.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyTrackedUrl(url: string, index: number) {
    await navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  async function copyAllLinks() {
    if (!result) return;
    const text = result.trackedLinks
      .map((l) => `${l.label}\t${l.trackedUrl}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  function handleReset() {
    setResult(null);
    setCampaignName("");
    setLinkFields([createLinkField()]);
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef] flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0d0d0d]">Gerador de Links Rastreáveis</h1>
          <p className="text-sm text-[#7a7773]">DCP — Hotmart</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-[#ff4000] hover:underline font-medium">
            Newsletter
          </Link>
          <Link href="/stats" className="text-sm text-[#ff4000] hover:underline font-medium">
            Monitoramento
          </Link>
          <button
            onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}
            className="text-sm text-[#7a7773] hover:text-[#0d0d0d] transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-[640px] flex flex-col gap-6">

          {!result ? (
            <>
              {/* Campaign name */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-[#0d0d0d]">Campanha</h2>
                  <p className="text-xs text-[#7a7773] mt-1">
                    Os links serão agrupados nesta campanha e aparecerão no Monitoramento.
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#0d0d0d]">
                    Nome da campanha *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4000] focus:border-transparent"
                    placeholder="Ex: Newsletter Julho 2026"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
              </div>

              {/* Link fields */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-[#0d0d0d]">Links</h2>
                  <p className="text-xs text-[#7a7773] mt-1">
                    Adicione quantos links quiser. Cada um recebe um nome para identificação nos relatórios.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {linkFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col gap-2 border border-gray-100 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#7a7773]">
                          Link {index + 1}
                        </span>
                        {linkFields.length > 1 && (
                          <button
                            onClick={() => removeLinkField(field.id)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                            title="Remover link"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#0d0d0d] font-medium">Nome do link *</label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4000] focus:border-transparent"
                          placeholder="Ex: Botão CTA principal"
                          value={field.label}
                          onChange={(e) => updateLinkField(field.id, "label", e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#0d0d0d] font-medium">URL de destino *</label>
                        <input
                          type="url"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4000] focus:border-transparent"
                          placeholder="https://hotmart.com/..."
                          value={field.url}
                          onChange={(e) => updateLinkField(field.id, "url", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addLinkField}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-[#ff4000] hover:text-[#ff4000] text-gray-400 rounded-xl py-3 text-sm font-medium transition-colors"
                >
                  + Adicionar link
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-[#ff4000] hover:bg-[#e63900] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                {isLoading ? "Gerando links..." : "Gerar links rastreáveis"}
              </button>
            </>
          ) : (
            <>
              {/* Result */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-[#0d0d0d]">Links gerados</h2>
                    <p className="text-xs text-[#7a7773] mt-1">
                      Campanha <span className="font-mono text-[#0d0d0d]">{campaignName}</span> criada com sucesso.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={copyAllLinks}
                      className="text-xs border border-gray-300 hover:border-[#ff4000] hover:text-[#ff4000] text-[#0d0d0d] px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      {copiedAll ? "Copiado!" : "Copiar todos"}
                    </button>
                    <Link
                      href="/stats"
                      className="text-xs text-[#ff4000] hover:underline font-medium"
                    >
                      Ver no monitoramento →
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {result.trackedLinks.map((link, i) => (
                    <div
                      key={i}
                      className="border border-gray-100 rounded-lg p-3 flex flex-col gap-1.5 bg-gray-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#0d0d0d] truncate">
                          {link.label}
                        </span>
                        <button
                          onClick={() => copyTrackedUrl(link.trackedUrl, i)}
                          className="shrink-0 text-xs text-[#7a7773] border border-gray-300 hover:border-[#ff4000] hover:text-[#ff4000] px-2 py-1 rounded transition-colors"
                        >
                          {copiedIndex === i ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                      <p className="text-xs text-[#7a7773] truncate" title={link.originalUrl}>
                        Destino: {link.originalUrl}
                      </p>
                      <p
                        className="text-xs font-mono text-[#ff4000] break-all cursor-pointer hover:underline"
                        onClick={() => copyTrackedUrl(link.trackedUrl, i)}
                        title="Clique para copiar"
                      >
                        {link.trackedUrl}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-green-800">ID da campanha</p>
                <p className="text-xs text-green-700 font-mono mt-0.5 break-all">
                  {result.campaignId}
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-white border border-gray-300 hover:border-[#ff4000] hover:text-[#ff4000] text-[#0d0d0d] font-medium py-3 rounded-lg transition-colors text-sm"
              >
                Gerar novos links
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
