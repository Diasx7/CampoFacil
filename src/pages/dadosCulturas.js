// dados agronômicos baseados em médias nacionais - Embrapa, Conab e Cepea 2024/25
// produtividade esperada por hectare e insumos principais por ha

export const culturas = {
  "Soja": {
    cor: "#639922",
    ciclo: "110 a 130 dias",
    espacamento: "45 a 50 cm entre linhas",
    produtividadeEsperada: "58 a 62 sacas/ha",
    insumos: [
      { nome: "Semente soja (sc 40kg)", porHectare: 1.5, unidade: "sacas", precoReferencia: 280 },
      { nome: "Adubo plantio (00-18-18)", porHectare: 250, unidade: "kg", precoReferencia: 2.8 },
      { nome: "Adubo cobertura (KCl)", porHectare: 80, unidade: "kg", precoReferencia: 3.2 },
      { nome: "Herbicida (Glifosato)", porHectare: 3, unidade: "L", precoReferencia: 18 },
      { nome: "Fungicida (2 aplicações)", porHectare: 1.2, unidade: "L", precoReferencia: 85 },
      { nome: "Inseticida", porHectare: 0.5, unidade: "L", precoReferencia: 65 },
      { nome: "Inoculante", porHectare: 1, unidade: "doses", precoReferencia: 25 },
    ],
    calendario: [
      { etapa: "Dessecação / preparo do solo", quando: "15 a 20 dias antes do plantio" },
      { etapa: "Plantio e adubação de base", quando: "Outubro a Dezembro (safra principal)" },
      { etapa: "Adubação de cobertura (KCl)", quando: "30 dias após emergência" },
      { etapa: "1ª aplicação de fungicida", quando: "R1 (início do florescimento)" },
      { etapa: "2ª aplicação de fungicida", quando: "R3 (início de granação)" },
      { etapa: "Controle de pragas (lagartas)", quando: "Monitorar a partir de V4" },
      { etapa: "Colheita", quando: "R8 (maturação plena) — Janeiro a Março" },
    ],
  },

  "Milho grão": {
    cor: "#EF9F27",
    ciclo: "120 a 145 dias",
    espacamento: "50 a 70 cm entre linhas",
    produtividadeEsperada: "110 a 140 sacas/ha",
    insumos: [
      { nome: "Semente milho (sc 60k)", porHectare: 0.33, unidade: "sacas", precoReferencia: 900 },
      { nome: "Adubo plantio (08-28-16)", porHectare: 350, unidade: "kg", precoReferencia: 3.0 },
      { nome: "Ureia (cobertura N)", porHectare: 150, unidade: "kg", precoReferencia: 3.5 },
      { nome: "Herbicida (Atrazina)", porHectare: 3, unidade: "L", precoReferencia: 22 },
      { nome: "Inseticida (Spinetoram)", porHectare: 0.4, unidade: "L", precoReferencia: 120 },
      { nome: "Fungicida foliar", porHectare: 0.5, unidade: "L", precoReferencia: 90 },
    ],
    calendario: [
      { etapa: "Dessecação e preparo do solo", quando: "15 a 20 dias antes do plantio" },
      { etapa: "Plantio e adubação de base", quando: "Outubro a Novembro (1ª safra)" },
      { etapa: "Adubação de cobertura (Ureia)", quando: "V4 a V6 (20 a 35 dias após emergência)" },
      { etapa: "Controle de lagarta-do-cartucho", quando: "A partir de V3 — monitorar" },
      { etapa: "Aplicação de fungicida", quando: "VT (pendoamento) — opcional" },
      { etapa: "Colheita", quando: "Quando grão atingir 13% de umidade" },
    ],
  },

  "Milho silagem": {
    cor: "#D85A30",
    ciclo: "100 a 120 dias",
    espacamento: "70 a 80 cm entre linhas",
    produtividadeEsperada: "40 a 60 ton de massa verde/ha",
    insumos: [
      { nome: "Semente milho silagem", porHectare: 0.33, unidade: "sacas", precoReferencia: 850 },
      { nome: "Adubo plantio (08-28-16)", porHectare: 400, unidade: "kg", precoReferencia: 3.0 },
      { nome: "Ureia (cobertura N)", porHectare: 180, unidade: "kg", precoReferencia: 3.5 },
      { nome: "Cloreto de Potássio (KCl)", porHectare: 100, unidade: "kg", precoReferencia: 3.2 },
      { nome: "Herbicida (Atrazina)", porHectare: 4, unidade: "L", precoReferencia: 22 },
      { nome: "Inseticida", porHectare: 0.4, unidade: "L", precoReferencia: 100 },
    ],
    calendario: [
      { etapa: "Preparo do solo e correção", quando: "30 dias antes do plantio" },
      { etapa: "Plantio e adubação de base", quando: "Outubro a Dezembro" },
      { etapa: "Adubação de cobertura", quando: "V4 a V6 (Ureia + KCl)" },
      { etapa: "Controle de lagarta-do-cartucho", quando: "V3 em diante — monitorar" },
      { etapa: "Ponto ideal de corte (silagem)", quando: "Grão leitoso-pastoso (R4) — 30 a 35% MS" },
    ],
  },

  "Sorgo": {
    cor: "#534AB7",
    ciclo: "100 a 130 dias",
    espacamento: "50 a 70 cm entre linhas",
    produtividadeEsperada: "80 a 100 sacas/ha",
    insumos: [
      { nome: "Semente sorgo", porHectare: 8, unidade: "kg", precoReferencia: 22 },
      { nome: "Adubo plantio (08-28-16)", porHectare: 250, unidade: "kg", precoReferencia: 3.0 },
      { nome: "Ureia (cobertura)", porHectare: 100, unidade: "kg", precoReferencia: 3.5 },
      { nome: "Herbicida pós-emergente", porHectare: 1.5, unidade: "L", precoReferencia: 35 },
      { nome: "Inseticida", porHectare: 0.3, unidade: "L", precoReferencia: 80 },
    ],
    calendario: [
      { etapa: "Plantio (2ª safra ou safrinha)", quando: "Janeiro a Fevereiro" },
      { etapa: "Adubação de cobertura", quando: "V4 a V6" },
      { etapa: "Controle de pulgão e lagarta", quando: "Monitorar do V4 ao florescimento" },
      { etapa: "Colheita", quando: "Quando grãos atingirem maturação fisiológica" },
    ],
  },

  "Capim / Pastagem": {
    cor: "#1D9E75",
    ciclo: "Perene (cortes a cada 30-40 dias)",
    espacamento: "Broadcast ou linhas de 50 cm",
    produtividadeEsperada: "15 a 25 ton MS/ha/ano",
    insumos: [
      { nome: "Semente braquiária/brachiaria", porHectare: 8, unidade: "kg", precoReferencia: 30 },
      { nome: "Adubo plantio (04-14-08)", porHectare: 200, unidade: "kg", precoReferencia: 2.5 },
      { nome: "Ureia (cobertura por corte)", porHectare: 60, unidade: "kg", precoReferencia: 3.5 },
      { nome: "Herbicida dessecação", porHectare: 3, unidade: "L", precoReferencia: 18 },
      { nome: "Calcário (correção solo)", porHectare: 2, unidade: "ton", precoReferencia: 180 },
    ],
    calendario: [
      { etapa: "Correção do solo (calcário)", quando: "60 dias antes do plantio" },
      { etapa: "Plantio na chuva", quando: "Outubro a Novembro" },
      { etapa: "Adubação de cobertura", quando: "30 dias após emergência e a cada corte" },
      { etapa: "1º corte de uniformização", quando: "45 a 60 dias após emergência" },
      { etapa: "Cortes regulares", quando: "A cada 30 a 40 dias no período chuvoso" },
    ],
  },

  "Cana-de-açúcar": {
    cor: "#B4B2A9",
    ciclo: "12 a 18 meses (cana-planta) + 5 a 6 socas",
    espacamento: "140 a 150 cm entre linhas",
    produtividadeEsperada: "80 a 100 ton de cana/ha",
    insumos: [
      { nome: "Mudas de cana (toletes)", porHectare: 8, unidade: "ton", precoReferencia: 180 },
      { nome: "Adubo plantio (05-25-25)", porHectare: 400, unidade: "kg", precoReferencia: 3.2 },
      { nome: "Adubo cobertura (KCl + Ureia)", porHectare: 250, unidade: "kg", precoReferencia: 3.0 },
      { nome: "Herbicida pré-emergente", porHectare: 4, unidade: "L", precoReferencia: 40 },
      { nome: "Inseticida (broca / cigarrinha)", porHectare: 0.5, unidade: "L", precoReferencia: 90 },
    ],
    calendario: [
      { etapa: "Preparo do solo e correção", quando: "60 dias antes do plantio" },
      { etapa: "Plantio (cana-planta)", quando: "Março a Junho ou Setembro a Novembro" },
      { etapa: "Adubação de cobertura", quando: "90 dias após plantio" },
      { etapa: "Controle de pragas (broca, cigarrinha)", quando: "Monitorar a partir de 60 dias" },
      { etapa: "Colheita (maturação)", quando: "12 a 18 meses após plantio" },
      { etapa: "Soca — tratar e adubar", quando: "Logo após cada colheita" },
    ],
  },
};

export const listaCulturas = Object.keys(culturas);