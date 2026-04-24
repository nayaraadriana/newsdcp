"use client";

import { useState } from "react";
import Link from "next/link";

const SECTION_TYPES = [
  {
    value: "intro",
    label: "Introdução",
    description: "Texto de abertura da newsletter",
    hasImage: false,
    placeholderTitle: "Ex: Edição #12 — O que aconteceu no último mês",
    placeholderText: "Ex: Reunimos os principais destaques das últimas semanas...",
  },
  {
    value: "hero",
    label: "Hero",
    description: "Destaque principal com imagem grande",
    hasImage: true,
    placeholderTitle: "Ex: O crescimento do commerce no Brasil",
    placeholderText: "Ex: Os números do último trimestre mostram uma aceleração...",
  },
  {
    value: "highlight",
    label: "Highlight",
    description: "Item de destaque da seção de novidades",
    hasImage: false,
    placeholderTitle: "Ex: Novo painel de relatórios",
    placeholderText: "Ex: A área de Analytics ganhou um novo painel consolidado...",
  },
  {
    value: "fique_de_olho",
    label: "Fique de Olho",
    description: "Aviso ou novidade que merece atenção especial",
    hasImage: false,
    placeholderTitle: "Ex: Evento importante chegando",
    placeholderText: "Ex: Na próxima semana teremos um webinar exclusivo...",
  },
];

function createBlock(type = "intro") {
  return {
    id: crypto.randomUUID(),
    type,
    title: "",
    text: "",
    imageUrl: "",
  };
}

export default function Home() {
  const [blocks, setBlocks] = useState([createBlock("intro")]);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [tracking, setTracking] = useState({
    campaignName: "",
    subject: "",
    recipientEmail: "",
    recipientName: "",
  });
  const [campaignId, setCampaignId] = useState("");

  function addBlock() {
    setBlocks((prev) => [...prev, createBlock("highlight")]);
  }

  function removeBlock(id) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function updateBlock(id, field, value) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  }

  function moveBlock(index, direction) {
    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];
    setBlocks(newBlocks);
  }

  function updateTracking(field, value) {
    setTracking((prev) => ({ ...prev, [field]: value }));
  }

  function getSectionMeta(typeValue) {
    return SECTION_TYPES.find((t) => t.value === typeValue);
  }

  async function handleGenerate() {
    const hasContent = blocks.some(
      (b) => b.title.trim() !== "" || b.text.trim() !== ""
    );
    if (!hasContent) {
      setError("Preencha pelo menos uma seção antes de gerar.");
      return;
    }

    setIsLoading(true);
    setError("");
    setPreviewHtml("");
    setCampaignId("");

    try {
      const body = { blocks };
      if (trackingEnabled) body.tracking = tracking;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao gerar o e-mail.");
        return;
      }

      setPreviewHtml(data.html);
      if (data.campaignId) setCampaignId(data.campaignId);
    } catch (err) {
      setError("Falha na conexão. Verifique se o servidor está rodando.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopyHtml() {
    if (!previewHtml) return;
    await navigator.clipboard.writeText(previewHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopyCampaignId() {
    await navigator.clipboard.writeText(campaignId);
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef] flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0d0d0d]">Gerador de Newsletter</h1>
          <p className="text-sm text-[#7a7773]">DCP — Hotmart</p>
        </div>
        <Link href="/stats" className="text-sm text-[#ff4000] hover:underline font-medium">
          Monitoramento →
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Painel esquerdo — Formulário */}
        <aside className="w-[420px] min-w-[420px] bg-white border-r border-gray-200 flex flex-col overflow-hidden">

          {/* Lista de blocos scrollável */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">

            {/* Seção de rastreamento */}
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setTrackingEnabled((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#0d0d0d] hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${trackingEnabled ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  Rastreamento
                </span>
                <span className="text-gray-400 text-xs">
                  {trackingEnabled ? "ativado ▲" : "desativado ▼"}
                </span>
              </button>

              {trackingEnabled && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-100 pt-3">
                  <p className="text-xs text-[#7a7773]">
                    Preencha para registrar aberturas e cliques desta campanha.
                  </p>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#0d0d0d]">
                      Nome da campanha *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4000] focus:border-transparent"
                      placeholder="Ex: Newsletter Abril 2026"
                      value={tracking.campaignName}
                      onChange={(e) => updateTracking("campaignName", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#0d0d0d]">
                      Assunto do e-mail *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4000] focus:border-transparent"
                      placeholder="Ex: Novidades da semana"
                      value={tracking.subject}
                      onChange={(e) => updateTracking("subject", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#0d0d0d]">
                      E-mail do destinatário *
                    </label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4000] focus:border-transparent"
                      placeholder="Ex: pessoa@hotmart.com"
                      value={tracking.recipientEmail}
                      onChange={(e) => updateTracking("recipientEmail", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#0d0d0d]">
                      Nome do destinatário
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4000] focus:border-transparent"
                      placeholder="Ex: João Silva"
                      value={tracking.recipientName}
                      onChange={(e) => updateTracking("recipientName", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Blocos de conteúdo */}
            {blocks.map((block, index) => {
              const meta = getSectionMeta(block.type);
              return (
                <div
                  key={block.id}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-white shadow-sm"
                >
                  {/* Cabeçalho do bloco */}
                  <div className="flex items-center justify-between gap-2">
                    <select
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-[#0d0d0d] focus:outline-none focus:ring-2 focus:ring-[#ff4000] bg-white"
                      value={block.type}
                      onChange={(e) =>
                        updateBlock(block.id, "type", e.target.value)
                      }
                    >
                      {SECTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveBlock(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#0d0d0d] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Mover para cima"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveBlock(index, "down")}
                        disabled={index === blocks.length - 1}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#0d0d0d] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Mover para baixo"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeBlock(block.id)}
                        disabled={blocks.length === 1}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Remover seção"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Descrição */}
                  <p className="text-xs text-[#7a7773]">{meta.description}</p>

                  {/* Campo título */}
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#0d0d0d] focus:outline-none focus:ring-2 focus:ring-[#ff4000] focus:border-transparent"
                    placeholder={meta.placeholderTitle}
                    value={block.title}
                    onChange={(e) =>
                      updateBlock(block.id, "title", e.target.value)
                    }
                  />

                  {/* Campo texto */}
                  <textarea
                    className="w-full h-24 border border-gray-300 rounded-lg p-3 text-sm text-[#0d0d0d] resize-none focus:outline-none focus:ring-2 focus:ring-[#ff4000] focus:border-transparent"
                    placeholder={meta.placeholderText}
                    value={block.text}
                    onChange={(e) =>
                      updateBlock(block.id, "text", e.target.value)
                    }
                  />

                  {/* Campo imagem — só aparece no Hero */}
                  {meta.hasImage && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-[#0d0d0d]">
                        URL da imagem (S3)
                      </label>
                      <input
                        type="url"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#0d0d0d] focus:outline-none focus:ring-2 focus:ring-[#ff4000] focus:border-transparent"
                        placeholder="https://seu-bucket.s3.amazonaws.com/imagem.jpg"
                        value={block.imageUrl}
                        onChange={(e) =>
                          updateBlock(block.id, "imageUrl", e.target.value)
                        }
                      />
                      {block.imageUrl && (
                        <img
                          src={block.imageUrl}
                          alt="Preview"
                          className="w-full rounded-lg border border-gray-200 object-cover"
                          style={{ maxHeight: "100px" }}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Botão adicionar bloco */}
            <button
              onClick={addBlock}
              className="w-full border-2 border-dashed border-gray-300 hover:border-[#ff4000] hover:text-[#ff4000] text-gray-400 rounded-xl py-3 text-sm font-medium transition-colors"
            >
              + Adicionar seção
            </button>
          </div>

          {/* Rodapé fixo */}
          <div className="border-t border-gray-200 p-4 flex flex-col gap-2 bg-white">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-[#ff4000] hover:bg-[#e63900] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm"
            >
              {isLoading ? "Gerando..." : "Gerar E-mail"}
            </button>

            {previewHtml && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopyHtml}
                  className="flex-1 bg-white border border-gray-300 hover:border-[#ff4000] hover:text-[#ff4000] text-[#0d0d0d] font-medium py-2 rounded-lg transition-colors text-sm"
                >
                  {copied ? "Copiado!" : "Copiar HTML"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-white border border-gray-300 hover:border-[#ff4000] hover:text-[#ff4000] text-[#0d0d0d] font-medium py-2 rounded-lg transition-colors text-sm"
                >
                  Baixar .html
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Painel direito — Preview */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          {!previewHtml && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-[#7a7773]">
              <span className="text-5xl">✉️</span>
              <p className="text-base font-medium">
                O preview do e-mail aparece aqui
              </p>
              <p className="text-sm">
                Monte as seções ao lado e clique em{" "}
                <strong>Gerar E-mail</strong>
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#7a7773]">
              <div className="w-8 h-8 border-4 border-[#ff4000] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Gerando seu e-mail...</p>
            </div>
          )}

          {previewHtml && !isLoading && (
            <div className="w-full max-w-[640px] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#7a7773]">
                  Preview gerado com sucesso
                </p>
                <p className="text-xs text-[#7a7773]">Largura máxima: 600px</p>
              </div>

              {campaignId && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-green-800">
                      Rastreamento ativado
                    </p>
                    <p className="text-xs text-green-700 font-mono mt-0.5 break-all">
                      {campaignId}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCampaignId}
                    className="shrink-0 text-xs text-green-700 border border-green-300 hover:bg-green-100 px-2 py-1 rounded transition-colors"
                  >
                    Copiar ID
                  </button>
                </div>
              )}

              <iframe
                srcDoc={previewHtml}
                title="Preview do E-mail"
                className="w-full rounded-xl border border-gray-200 shadow-sm bg-white"
                style={{ height: "80vh", minHeight: "600px" }}
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
