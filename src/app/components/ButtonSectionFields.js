const INPUT_CLASS =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#0d0d0d] focus:outline-none focus:ring-2 focus:ring-[#ff4000] focus:border-transparent";

export default function ButtonSectionFields({ section, onChange }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-[#0d0d0d]">
          Estilo do botão
        </label>
        <select
          className={`${INPUT_CLASS} bg-white`}
          value={section.buttonStyle ?? "large"}
          onChange={(e) => onChange("buttonStyle", e.target.value)}
        >
          <option value="large">Botão grande</option>
          <option value="link">Botão link</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-[#0d0d0d]">
          Texto do botão
        </label>
        <input
          type="text"
          className={INPUT_CLASS}
          placeholder="Ex: Acessar ferramenta"
          value={section.text ?? ""}
          onChange={(e) => onChange("text", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-[#0d0d0d]">
          URL de destino
        </label>
        <input
          type="url"
          className={INPUT_CLASS}
          placeholder="https://..."
          value={section.url ?? ""}
          onChange={(e) => onChange("url", e.target.value)}
        />
      </div>
    </>
  );
}
