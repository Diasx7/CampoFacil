import "./Sidebar.css";

function Sidebar({ telaAtiva, irPara }) {
  // pega os dados do usuario logado
  const usuarioSalvo = localStorage.getItem('usuario');
  const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
  const nomeCompleto = usuario?.nome || 'Usuário';
  const iniciais = nomeCompleto.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const propriedade = usuario?.nome_propriedade || '';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icone">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L10 6H15L11 9.5L12.5 15L8 12L3.5 15L5 9.5L1 6H6L8 1Z" fill="#1a3a2a" />
          </svg>
        </div>
        <span className="sidebar-logo-texto">CampoFácil</span>
      </div>

      <nav className="sidebar-nav">
        <button className={`sidebar-item ${telaAtiva === "dashboard" ? "sidebar-item-ativo" : ""}`} onClick={() => irPara("dashboard")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
          </svg>
          Dashboard
        </button>

        <span className="sidebar-secao">Lavoura</span>

        <button className={`sidebar-item ${telaAtiva === "talhoes" ? "sidebar-item-ativo" : ""}`} onClick={() => irPara("talhoes")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 8 L8 5 L11 8 L8 11 Z" fill="currentColor" opacity=".7" />
          </svg>
          Meus talhões
        </button>

        <button className={`sidebar-item ${telaAtiva === "plantios" ? "sidebar-item-ativo" : ""}`} onClick={() => irPara("plantios")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Plantios
        </button>

        <button className={`sidebar-item ${telaAtiva === "produtividade" ? "sidebar-item-ativo" : ""}`} onClick={() => irPara("produtividade")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 12 L6 8 L9 10 L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Produtividade
        </button>

        <span className="sidebar-secao">Gestão</span>

        <button className={`sidebar-item ${telaAtiva === "estoque" ? "sidebar-item-ativo" : ""}`} onClick={() => irPara("estoque")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="6" width="5" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Estoque
        </button>

        <button className={`sidebar-item ${telaAtiva === "caderno" ? "sidebar-item-ativo" : ""}`} onClick={() => irPara("caderno")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Caderno
        </button>

        <button className={`sidebar-item ${telaAtiva === "financeiro" ? "sidebar-item-ativo" : ""}`} onClick={() => irPara("financeiro")}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v1m0 4v1m-2-3h3a1 1 0 010 2H7a1 1 0 000 2h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Financeiro
        </button>
      </nav>

      <div className="sidebar-usuario">
        <div className="sidebar-avatar">{iniciais}</div>
        <div className="sidebar-usuario-info">
          <div className="sidebar-nome">{nomeCompleto}</div>
          {propriedade && <div className="sidebar-prop">{propriedade}</div>}
        </div>
        <button className="btn-logout" onClick={() => irPara("login")} title="Sair">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;