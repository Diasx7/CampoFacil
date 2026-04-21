import "./Loading.css";

function Loading({ texto = "Carregando..." }) {
  return (
    <div className="loading-tela">
      <div className="loading-conteudo">
        <div className="loading-logo">
          <svg width="32" height="32" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L10 6H15L11 9.5L12.5 15L8 12L3.5 15L5 9.5L1 6H6L8 1Z" fill="#4ade80" />
          </svg>
        </div>
        <div className="loading-spinner"></div>
        <p className="loading-texto">{texto}</p>
      </div>
    </div>
  );
}

export default Loading;