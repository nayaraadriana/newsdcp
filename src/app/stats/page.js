"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtShortDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR");
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-1">
      <span className="text-xs text-[#7a7773] font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-2xl font-bold text-[#0d0d0d]">{value}</span>
      {sub && <span className="text-xs text-[#7a7773]">{sub}</span>}
    </div>
  );
}

function copyAsExcel(headers, rows) {
  const tsv = [headers, ...rows].map((r) => r.join("\t")).join("\n");
  const html =
    `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>` +
    `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

  const item = new ClipboardItem({
    "text/plain": new Blob([tsv], { type: "text/plain" }),
    "text/html": new Blob([html], { type: "text/html" }),
  });
  return navigator.clipboard.write([item]);
}

export default function StatsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [copiedList, setCopiedList] = useState(false);
  const [copiedLinks, setCopiedLinks] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns ?? []))
      .catch(() => setError("Erro ao carregar campanhas."))
      .finally(() => setLoadingList(false));
  }, []);

  const loadStats = useCallback(async (campaignId) => {
    setSelectedId(campaignId);
    setStats(null);
    setLoadingStats(true);
    try {
      const r = await fetch(`/api/campaigns/${campaignId}/stats`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setStats(d);
    } catch {
      setError("Erro ao carregar estatísticas da campanha.");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  async function handleCopyCampaignList() {
    const headers = ["Campanha", "Assunto", "Data", "Enviados", "Aberturas únicas", "Cliques únicos"];
    const rows = campaigns.map((c) => [
      c.name,
      c.subject,
      fmtShortDate(c.created_at),
      c.total_sent ?? 0,
      c.unique_opens ?? 0,
      c.unique_clicks ?? 0,
    ]);
    await copyAsExcel(headers, rows);
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2000);
  }

  async function handleCopyLinks() {
    if (!stats?.topLinks?.length) return;
    const headers = ["Link", "Label", "Cliques"];
    const rows = stats.topLinks.map((l) => [l.original_url, l.link_label || "—", l.total_clicks]);
    await copyAsExcel(headers, rows);
    setCopiedLinks(true);
    setTimeout(() => setCopiedLinks(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef] flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0d0d0d]">Monitoramento de Campanhas</h1>
          <p className="text-sm text-[#7a7773]">DCP — Hotmart</p>
        </div>
        <Link
          href="/"
          className="text-sm text-[#ff4000] hover:underline font-medium"
        >
          ← Voltar ao gerador
        </Link>
      </header>

      <div className="flex-1 p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Lista de campanhas */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-sm font-bold text-[#0d0d0d]">Campanhas</h2>
            <button
              onClick={handleCopyCampaignList}
              disabled={campaigns.length === 0}
              className="text-xs border border-gray-300 hover:border-[#ff4000] hover:text-[#ff4000] text-[#7a7773] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copiedList ? "Copiado!" : "Copiar para Excel"}
            </button>
          </div>

          {loadingList ? (
            <div className="p-8 text-center text-sm text-[#7a7773]">Carregando...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#7a7773]">
              Nenhuma campanha encontrada. Gere um e-mail com rastreamento ativado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 font-semibold text-[#0d0d0d] text-xs uppercase tracking-wide">Campanha</th>
                    <th className="px-5 py-3 font-semibold text-[#0d0d0d] text-xs uppercase tracking-wide">Assunto</th>
                    <th className="px-5 py-3 font-semibold text-[#0d0d0d] text-xs uppercase tracking-wide">Data</th>
                    <th className="px-5 py-3 font-semibold text-[#0d0d0d] text-xs uppercase tracking-wide text-right">Aberturas</th>
                    <th className="px-5 py-3 font-semibold text-[#0d0d0d] text-xs uppercase tracking-wide text-right">Cliques</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-[#fff8f5] transition-colors cursor-pointer ${selectedId === c.id ? "bg-[#fff8f5] border-l-2 border-l-[#ff4000]" : ""}`}
                      onClick={() => loadStats(c.id)}
                    >
                      <td className="px-5 py-3 font-medium text-[#0d0d0d]">{c.name}</td>
                      <td className="px-5 py-3 text-[#7a7773]">{c.subject}</td>
                      <td className="px-5 py-3 text-[#7a7773] whitespace-nowrap">{fmtShortDate(c.created_at)}</td>
                      <td className="px-5 py-3 text-right font-medium text-[#0d0d0d]">{c.unique_opens ?? 0}</td>
                      <td className="px-5 py-3 text-right font-medium text-[#0d0d0d]">{c.unique_clicks ?? 0}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs text-[#ff4000] font-medium">
                          {selectedId === c.id ? "Selecionada" : "Ver detalhes →"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Detalhes da campanha selecionada */}
        {selectedId && (
          <section className="flex flex-col gap-4">
            {loadingStats ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-sm text-[#7a7773]">
                Carregando estatísticas...
              </div>
            ) : stats ? (
              <>
                {/* Cabeçalho da campanha */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#0d0d0d]">{stats.campaign.name}</h2>
                    <p className="text-sm text-[#7a7773]">
                      {stats.campaign.subject} · Criada em {fmt(stats.campaign.created_at)}
                    </p>
                  </div>
                </div>

                {/* Cards de métricas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard
                    label="Aberturas únicas"
                    value={stats.uniqueOpens}
                    sub={`${stats.openRate}% de taxa de abertura`}
                  />
                  <MetricCard
                    label="Total de aberturas"
                    value={stats.totalOpens}
                    sub="inclui múltiplas aberturas"
                  />
                  <MetricCard
                    label="Cliques únicos"
                    value={stats.uniqueClicks}
                    sub={`${stats.clickRate}% de taxa de clique`}
                  />
                  <MetricCard
                    label="ID da campanha"
                    value="—"
                    sub={stats.campaign.id}
                  />
                </div>

                {/* Tabela de links clicados */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                    <h3 className="text-sm font-bold text-[#0d0d0d]">Links mais clicados</h3>
                    <button
                      onClick={handleCopyLinks}
                      disabled={!stats.topLinks?.length}
                      className="text-xs border border-gray-300 hover:border-[#ff4000] hover:text-[#ff4000] text-[#7a7773] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {copiedLinks ? "Copiado!" : "Copiar para Excel"}
                    </button>
                  </div>

                  {!stats.topLinks?.length ? (
                    <div className="p-8 text-center text-sm text-[#7a7773]">
                      Nenhum clique registrado ainda.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-left">
                            <th className="px-5 py-3 font-semibold text-[#0d0d0d] text-xs uppercase tracking-wide">#</th>
                            <th className="px-5 py-3 font-semibold text-[#0d0d0d] text-xs uppercase tracking-wide">Label</th>
                            <th className="px-5 py-3 font-semibold text-[#0d0d0d] text-xs uppercase tracking-wide">Link</th>
                            <th className="px-5 py-3 font-semibold text-[#0d0d0d] text-xs uppercase tracking-wide text-right">Cliques</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {stats.topLinks.map((link, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-3 text-[#7a7773]">{i + 1}</td>
                              <td className="px-5 py-3 text-[#0d0d0d] font-medium max-w-[200px] truncate">
                                {link.link_label || "—"}
                              </td>
                              <td className="px-5 py-3 max-w-[320px]">
                                <a
                                  href={link.original_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#ff4000] hover:underline truncate block"
                                  title={link.original_url}
                                >
                                  {link.original_url}
                                </a>
                              </td>
                              <td className="px-5 py-3 text-right font-bold text-[#0d0d0d]">
                                {link.total_clicks}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </section>
        )}
      </div>
    </div>
  );
}
