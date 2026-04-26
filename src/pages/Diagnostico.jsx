import { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import "./Diagnostico.css";

const GEMINI_KEY = "AIzaSyDUIu63X1Iz6JZ0T4BsX7uvR_RRMZq9GMA";

function Diagnostico({ irPara }) {
  const [imagem, setImagem] = useState(null);
  const [imagemBase64, setImagemBase64] = useState(null);
  const [imagemTipo, setImagemTipo] = useState("image/jpeg");
  const [analisando, setAnalisando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const inputRef = useRef(null);

  function selecionarImagem(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    setResultado(null);
    setErro(null);
    setImagemTipo(arquivo.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagem(ev.target.result);
      setImagemBase64(ev.target.result.split(",")[1]);
    };
    reader.readAsDataURL(arquivo);
  }

  async function analisarImagem() {
    if (!imagemBase64) return;
    setAnalisando(true);
    setResultado(null);
    setErro(null);

    const prompt = `Você é um agrônomo especialista em diagnóstico de pragas e doenças em culturas brasileiras.

Analise esta imagem de uma planta/lavoura e responda APENAS com um JSON válido, sem texto antes ou depois, sem markdown:

{
  "diagnostico": "nome da praga ou doença identificada",
  "confianca": "Alta / Média / Baixa",
  "descricao": "descrição breve do problema em 2 linhas",
  "sintomas": ["sintoma 1", "sintoma 2", "sintoma 3"],
  "tratamento": ["medida 1", "medida 2", "medida 3"],
  "prevencao": ["dica 1", "dica 2"],
  "urgencia": "Imediata / Moderada / Baixa",
  "culturasAfetadas": ["cultura 1", "cultura 2"]
}

Se não for possível identificar problema, use "Não identificado" no diagnóstico.`;

    try {
      const resposta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ inline_data: { mime_type: imagemTipo, data: imagemBase64 } }, { text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
          }),
        }
      );

      if (resposta.status === 429) throw new Error("429");
      if (!resposta.ok) throw new Error("erro_api");

      const dados = await resposta.json();
      const texto = dados.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!texto) throw new Error("Resposta vazia");

      const limpo = texto.replace(/```json|```/g, "").trim();
      const json = JSON.parse(limpo);
      setResultado(json);
    } catch (err) {
      console.error("Erro na análise:", err);
      if (err.message === "429") {
        setErro("Muitas análises em pouco tempo. Aguarde 1 minuto e tente novamente.");
      } else {
        setErro("Não foi possível analisar a imagem. Tente novamente com uma foto mais nítida.");
      }
    } finally {
      setAnalisando(false);
    }
  }

  function limpar() {
    setImagem(null);
    setImagemBase64(null);
    setResultado(null);
    setErro(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function corUrgencia(urgencia) {
    if (urgencia === "Imediata") return { bg: "#fcebeb", cor: "#A32D2D" };
    if (urgencia === "Moderada") return { bg: "#FAEEDA", cor: "#633806" };
    return { bg: "#eaf3de", cor: "#3B6D11" };
  }

  function corConfianca(confianca) {
    if (confianca === "Alta") return "#3B6D11";
    if (confianca === "Média") return "#633806";
    return "#A32D2D";
  }

  return (
    <div className="diag-pagina">
      <Sidebar telaAtiva="diagnostico" irPara={irPara} />
      <div className="diag-main">
        <div className="diag-header">
          <div>
            <h1 className="diag-titulo">Diagnóstico de pragas</h1>
            <span className="diag-sub">Tire uma foto da planta afetada e a IA identifica a praga ou doença</span>
          </div>
        </div>

        <div className="diag-grid">
          <div className="diag-upload-card">
            <div className="upload-area" onClick={() => inputRef.current?.click()}>
              {!imagem ? (
                <div className="upload-placeholder">
                  <div className="upload-icone">📸</div>
                  <p className="upload-texto">Clique para selecionar uma foto</p>
                  <p className="upload-sub">JPG, PNG — foto da folha, caule ou fruto afetado</p>
                </div>
              ) : (
                <div className="upload-imagem-preview">
                  <img src={imagem} alt="Planta" className="preview-img" />
                </div>
              )}
            </div>

            <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={selecionarImagem} capture="environment" />

            <div className="upload-botoes">
              {imagem && <button className="btn-limpar" onClick={limpar}>Limpar</button>}
              <button className="btn-analisar" onClick={analisarImagem} disabled={!imagem || analisando}>
                {analisando ? "Analisando..." : "🔍 Analisar imagem"}
              </button>
            </div>

            {analisando && (
              <div className="diag-loading">
                <div className="diag-spinner"></div>
                <p>A IA está analisando sua imagem...</p>
              </div>
            )}

            {erro && <div className="diag-erro">{erro}</div>}

            <div className="dicas-card">
              <div className="dicas-titulo">Dicas para melhor diagnóstico</div>
              <div className="dica-item">📷 Foto nítida e bem iluminada</div>
              <div className="dica-item">🍃 Foque na área afetada da planta</div>
              <div className="dica-item">🌿 Inclua folha, caule ou fruto com sintoma</div>
              <div className="dica-item">☀️ Prefira fotos com luz natural</div>
            </div>
          </div>

          <div className="diag-resultado">
            {!resultado ? (
              <div className="resultado-vazio">
                <div className="resultado-vazio-icone">🔬</div>
                <p>Selecione uma foto e clique em "Analisar imagem" para receber o diagnóstico</p>
              </div>
            ) : (
              <>
                <div className="resultado-cabecalho">
                  <div>
                    <div className="resultado-diagnostico">{resultado.diagnostico}</div>
                    <div className="resultado-culturas">{resultado.culturasAfetadas?.join(", ")}</div>
                  </div>
                  <div className="resultado-badges">
                    {resultado.urgencia && (
                      <span className="badge-urgencia" style={corUrgencia(resultado.urgencia)}>
                        {resultado.urgencia === "Imediata" ? "⚠️" : resultado.urgencia === "Moderada" ? "⚡" : "✅"} {resultado.urgencia}
                      </span>
                    )}
                    <span className="badge-confianca" style={{ color: corConfianca(resultado.confianca) }}>
                      Confiança: {resultado.confianca}
                    </span>
                  </div>
                </div>

                <div className="resultado-descricao">{resultado.descricao}</div>

                {resultado.sintomas?.length > 0 && (
                  <div className="resultado-secao">
                    <div className="secao-titulo">🔍 Sintomas identificados</div>
                    {resultado.sintomas.map((s, i) => (
                      <div key={i} className="secao-item">
                        <div className="item-dot" style={{ background: "#E24B4A" }}></div>
                        {s}
                      </div>
                    ))}
                  </div>
                )}

                {resultado.tratamento?.length > 0 && (
                  <div className="resultado-secao">
                    <div className="secao-titulo">💊 Tratamento recomendado</div>
                    {resultado.tratamento.map((t, i) => (
                      <div key={i} className="secao-item">
                        <div className="item-dot" style={{ background: "#2d6a4f" }}></div>
                        {t}
                      </div>
                    ))}
                  </div>
                )}

                {resultado.prevencao?.length > 0 && (
                  <div className="resultado-secao">
                    <div className="secao-titulo">🛡️ Prevenção</div>
                    {resultado.prevencao.map((p, i) => (
                      <div key={i} className="secao-item">
                        <div className="item-dot" style={{ background: "#378ADD" }}></div>
                        {p}
                      </div>
                    ))}
                  </div>
                )}

                <div className="resultado-aviso">
                  ⚠️ Este diagnóstico é uma sugestão da IA. Consulte sempre um agrônomo para confirmar e receber prescrição adequada.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Diagnostico;