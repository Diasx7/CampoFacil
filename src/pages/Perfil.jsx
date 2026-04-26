import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import "./Perfil.css";

function Perfil({ irPara }) {
  const [form, setForm] = useState({ nome: "", email: "", nome_propriedade: "", estado: "", area_total: "" });
  const [formSenha, setFormSenha] = useState({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [sucessoSenha, setSucessoSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [erroSenha, setErroSenha] = useState("");

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
      localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario));
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      setErro('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  async function trocarSenha(e) {
    e.preventDefault();
    setErroSenha("");
    setSucessoSenha(false);

    if (formSenha.novaSenha !== formSenha.confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }

    if (formSenha.novaSenha.length < 6) {
      setErroSenha("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setSalvandoSenha(true);
    try {
      await api.put('/auth/senha', {
        senhaAtual: formSenha.senhaAtual,
        novaSenha: formSenha.novaSenha,
      });
      setSucessoSenha(true);
      setFormSenha({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
      setTimeout(() => setSucessoSenha(false), 3000);
    } catch (err) {
      setErroSenha(err.response?.data?.erro || 'Erro ao trocar senha.');
    } finally {
      setSalvandoSenha(false);
    }
  }

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
            {/* avatar */}
            <div className="perfil-card perfil-avatar-card">
              <div className="perfil-avatar">{iniciais}</div>
              <div className="perfil-avatar-nome">{form.nome}</div>
              <div className="perfil-avatar-prop">{form.nome_propriedade}</div>
              <div className="perfil-avatar-email">{form.email}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* dados pessoais */}
              <div className="perfil-card">
                {sucesso && <div className="perfil-sucesso">Perfil atualizado com sucesso!</div>}
                {erro && <div className="perfil-erro">{erro}</div>}
                <form onSubmit={salvarPerfil}>
                  <div className="perfil-secao-titulo">Dados pessoais</div>
                  <div className="campo">
                    <label className="label">Nome completo</label>
                    <input type="text" className="input" required
                      value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                  </div>
                  <div className="campo">
                    <label className="label">E-mail</label>
                    <input type="email" className="input" disabled value={form.email}
                      style={{ opacity: 0.6, cursor: "not-allowed" }} />
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

              {/* trocar senha */}
              <div className="perfil-card">
                {sucessoSenha && <div className="perfil-sucesso">Senha alterada com sucesso!</div>}
                {erroSenha && <div className="perfil-erro">{erroSenha}</div>}
                <form onSubmit={trocarSenha}>
                  <div className="perfil-secao-titulo">Trocar senha</div>
                  <div className="campo">
                    <label className="label">Senha atual</label>
                    <input type="password" className="input" required placeholder="••••••••"
                      value={formSenha.senhaAtual} onChange={(e) => setFormSenha({ ...formSenha, senhaAtual: e.target.value })} />
                  </div>
                  <div className="linha-2">
                    <div className="campo">
                      <label className="label">Nova senha</label>
                      <input type="password" className="input" required placeholder="••••••••"
                        value={formSenha.novaSenha} onChange={(e) => setFormSenha({ ...formSenha, novaSenha: e.target.value })} />
                    </div>
                    <div className="campo">
                      <label className="label">Confirmar senha</label>
                      <input type="password" className="input" required placeholder="••••••••"
                        value={formSenha.confirmarSenha} onChange={(e) => setFormSenha({ ...formSenha, confirmarSenha: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" className="btn-salvar-perfil" disabled={salvandoSenha}>
                    {salvandoSenha ? "Alterando..." : "Alterar senha"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Perfil;