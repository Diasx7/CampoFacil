import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import "./Perfil.css";

function Perfil({ irPara }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    nome_propriedade: "",
    estado: "",
    area_total: "",
  });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarPerfil();
  }, []);

  async function buscarPerfil() {
    try {
      const resposta = await api.get('/auth/perfil');
      setForm({
        nome: resposta.data.nome || "",
        email: resposta.data.email || "",
        nome_propriedade: resposta.data.nome_propriedade || "",
        estado: resposta.data.estado || "",
        area_total: resposta.data.area_total || "",
      });
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarPerfil(e) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso(false);

    try {
      const resposta = await api.put('/auth/perfil', {
        nome: form.nome,
        nome_propriedade: form.nome_propriedade,
        estado: form.estado,
        area_total: form.area_total,
      });

      // atualiza o usuario no localStorage
      const usuarioAtualizado = resposta.data.usuario;
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      setErro('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  // pega as iniciais do nome
  const iniciais = form.nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="perfil-pagina">
      <Sidebar telaAtiva="perfil" irPara={irPara} />

      <div className="perfil-main">
        <div className="perfil-header">
          <h1 className="perfil-titulo">Meu perfil</h1>
          <span className="perfil-sub">Gerencie suas informações pessoais e da propriedade</span>
        </div>

        {carregando ? (
          <p style={{ fontSize: "13px", color: "#888" }}>Carregando...</p>
        ) : (
          <div className="perfil-grid">
            {/* card do avatar */}
            <div className="perfil-card perfil-avatar-card">
              <div className="perfil-avatar">{iniciais}</div>
              <div className="perfil-avatar-nome">{form.nome}</div>
              <div className="perfil-avatar-prop">{form.nome_propriedade}</div>
              <div className="perfil-avatar-email">{form.email}</div>
            </div>

            {/* formulario */}
            <div className="perfil-card">
              {sucesso && (
                <div className="perfil-sucesso">Perfil atualizado com sucesso!</div>
              )}
              {erro && (
                <div className="perfil-erro">{erro}</div>
              )}

              <form onSubmit={salvarPerfil}>
                <div className="perfil-secao-titulo">Dados pessoais</div>

                <div className="campo">
                  <label className="label">Nome completo</label>
                  <input type="text" className="input" required
                    value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                </div>

                <div className="campo">
                  <label className="label">E-mail</label>
                  <input type="email" className="input" disabled
                    value={form.email} style={{ opacity: 0.6, cursor: "not-allowed" }} />
                  <span className="campo-hint">O e-mail não pode ser alterado</span>
                </div>

                <div className="perfil-secao-titulo" style={{ marginTop: "1.5rem" }}>Dados da propriedade</div>

                <div className="campo">
                  <label className="label">Nome da propriedade</label>
                  <input type="text" className="input" placeholder="Ex: Sítio Boa Esperança"
                    value={form.nome_propriedade} onChange={(e) => setForm({ ...form, nome_propriedade: e.target.value })} />
                </div>

                <div className="linha-2">
                  <div className="campo">
                    <label className="label">Estado</label>
                    <select className="input" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                      <option value="">Selecionar...</option>
                      <option>Minas Gerais</option>
                      <option>Goiás</option>
                      <option>Mato Grosso</option>
                      <option>São Paulo</option>
                      <option>Paraná</option>
                      <option>Mato Grosso do Sul</option>
                      <option>Bahia</option>
                      <option>Outros</option>
                    </select>
                  </div>
                  <div className="campo">
                    <label className="label">Área total (ha)</label>
                    <input type="number" className="input" placeholder="Ex: 50" step="0.1"
                      value={form.area_total} onChange={(e) => setForm({ ...form, area_total: e.target.value })} />
                  </div>
                </div>

                <button type="submit" className="btn-salvar-perfil" disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Perfil;