# 🌱 CampoFácil

App de gestão agrícola feito pra pequenos produtores rurais. A ideia é ser simples de usar no celular e no computador, sem precisar de sistema caro ou complexo.

## O que tem no app

- **Dashboard** — resumo da propriedade, clima, alertas e estoque
- **Meus Talhões** — mapa com medição de área em hectares (OpenStreetMap)
- **Módulo de Culturas** — calcula automaticamente sementes, adubo e defensivos por hectare
- **Estoque** — controle de insumos no galpão com alertas de estoque crítico
- **Caderno de Campo** — registro de atividades por talhão
- **Financeiro** — controle de gastos e receitas por safra

## Tecnologias

**Frontend**
- React.js
- Leaflet (mapas)
- CSS puro com CSS Modules

**Backend** (em desenvolvimento)
- Node.js + Express
- PostgreSQL
- JWT para autenticação

## Como rodar

### Frontend
```bash
cd campofacil
npm install
npm start
```
Abre em `http://localhost:3000`

### Backend
```bash
cd campofacil-backend
npm install
node server.js
```
Roda em `http://localhost:5000`

### Banco de dados
- Instala o PostgreSQL
- Cria um banco chamado `campofacil`
- Roda o arquivo `tabelas.sql` no pgAdmin
- Configura o `.env` com sua senha

## Status

🚧 Em desenvolvimento — frontend concluído, backend sendo conectado às telas
