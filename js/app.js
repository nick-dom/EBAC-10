/* ============================================================
   app.js
   Ponto de entrada da aplicação. Importa utilitários e classes
   e inicializa cada componente da página assim que o DOM
   estiver pronto.
   ============================================================ */

import { MenuMobile, ScrollSpyNavegacao, ContadorEstatisticas, FormularioContato, BotaoVoltarTopo } from './classes.js';

function atualizarAnoRodape() {
  const elementoAno = document.getElementById('ano-atual');
  if (elementoAno) {
    elementoAno.textContent = new Date().getFullYear();
  }
}

function iniciarAplicacao() {
  new MenuMobile();
  new ScrollSpyNavegacao();
  new ContadorEstatisticas();
  new FormularioContato();
  new BotaoVoltarTopo();
  atualizarAnoRodape();
}

document.addEventListener('DOMContentLoaded', iniciarAplicacao);
