/* ============================================================
   utils.js
   Funções utilitárias puras, sem estado, reaproveitadas
   pelas classes da aplicação (classes.js) e pelo app.js.
   ============================================================ */

/**
 * Atalho para document.querySelector.
 * @param {string} seletor
 * @param {Document|Element} escopo
 * @returns {Element|null}
 */
export function $(seletor, escopo = document) {
  return escopo.querySelector(seletor);
}

/**
 * Atalho para document.querySelectorAll, já retornando um array.
 * @param {string} seletor
 * @param {Document|Element} escopo
 * @returns {Element[]}
 */
export function $all(seletor, escopo = document) {
  return Array.from(escopo.querySelectorAll(seletor));
}

/**
 * Evita que uma função seja chamada repetidas vezes em um curto
 * intervalo (usado no evento de "scroll" e "resize").
 * @param {Function} fn
 * @param {number} atraso em milissegundos
 * @returns {Function}
 */
export function debounce(fn, atraso = 150) {
  let temporizador;
  return function (...args) {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn.apply(this, args), atraso);
  };
}

/**
 * Validação simples de formato de e-mail.
 * @param {string} valor
 * @returns {boolean}
 */
export function validarEmail(valor) {
  const padrao = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return padrao.test(valor.trim());
}

/**
 * Verifica se uma string tem pelo menos um determinado
 * número de caracteres não vazios.
 * @param {string} valor
 * @param {number} minimo
 * @returns {boolean}
 */
export function validarTamanhoMinimo(valor, minimo) {
  return valor.trim().length >= minimo;
}

/**
 * Anima um número inteiro de 0 até um valor final, atualizando
 * o texto de um elemento a cada quadro (usado nas estatísticas do hero).
 * @param {Element} elemento - elemento que recebe o texto
 * @param {number} valorFinal
 * @param {number} duracaoMs
 * @param {string} sufixo - texto adicionado depois do número (ex: "%","+")
 */
export function animarContador(elemento, valorFinal, duracaoMs = 1400, sufixo = '') {
  const inicio = performance.now();

  function passo(agora) {
    const progresso = Math.min((agora - inicio) / duracaoMs, 1);
    // easing suave de desaceleração (easeOutQuad)
    const progressoSuavizado = 1 - (1 - progresso) * (1 - progresso);
    const valorAtual = Math.round(progressoSuavizado * valorFinal);

    elemento.textContent = `${valorAtual}${sufixo}`;

    if (progresso < 1) {
      requestAnimationFrame(passo);
    } else {
      elemento.textContent = `${valorFinal}${sufixo}`;
    }
  }

  requestAnimationFrame(passo);
}

/**
 * Aguarda um determinado tempo — útil para simular latência de rede
 * ao "enviar" o formulário de contato, já que não há back-end real.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
