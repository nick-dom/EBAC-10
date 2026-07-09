/* ============================================================
   classes.js
   Componentes da página organizados como classes ES6.
   Cada classe é responsável por uma única parte da interface.
   ============================================================ */

import { $, $all, debounce, validarEmail, validarTamanhoMinimo, animarContador, aguardar } from './utils.js';

/**
 * Controla o menu de navegação mobile (hambúrguer).
 * Usa o checkbox como fonte de verdade (funciona mesmo sem JS)
 * e adiciona comportamentos extras: fechar com ESC, fechar ao
 * clicar em um link e travar o scroll do body quando aberto.
 */
export class MenuMobile {
  constructor({ checkboxId = 'menu-toggle', navId = 'nav-principal' } = {}) {
    this.checkbox = document.getElementById(checkboxId);
    this.nav = document.getElementById(navId);

    if (!this.checkbox || !this.nav) return;

    this.links = $all('a', this.nav);
    this._ligarEventos();
  }

  fechar() {
    this.checkbox.checked = false;
    document.body.classList.remove('menu-aberto');
  }

  _ligarEventos() {
    // Trava o scroll da página enquanto o menu mobile está aberto
    this.checkbox.addEventListener('change', () => {
      document.body.classList.toggle('menu-aberto', this.checkbox.checked);
    });

    // Fecha o menu ao clicar em qualquer link de navegação
    this.links.forEach((link) => {
      link.addEventListener('click', () => this.fechar());
    });

    // Fecha o menu com a tecla ESC
    document.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape' && this.checkbox.checked) {
        this.fechar();
      }
    });
  }
}

/**
 * Destaca, no menu de navegação, o link correspondente à seção
 * visível na tela no momento (scrollspy), usando IntersectionObserver.
 */
export class ScrollSpyNavegacao {
  constructor({ secaoSeletor = 'main > section[id]', linkSeletor = '[data-nav-link]' } = {}) {
    this.secoes = $all(secaoSeletor);
    this.links = $all(linkSeletor);

    if (!this.secoes.length || !this.links.length) return;

    this._observar();
  }

  _marcarLinkAtivo(idSecao) {
    this.links.forEach((link) => {
      const alvo = link.getAttribute('href') === `#${idSecao}`;
      link.classList.toggle('nav__link--ativo', alvo);
    });
  }

  _observar() {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            this._marcarLinkAtivo(entrada.target.id);
          }
        });
      },
      {
        // considera a seção "ativa" quando cruza a faixa central da tela
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0,
      }
    );

    this.secoes.forEach((secao) => observador.observe(secao));
  }
}

/**
 * Anima os números da seção de estatísticas do hero (ex.: 120+, 98%, 9)
 * contando de 0 até o valor final assim que entram na tela.
 */
export class ContadorEstatisticas {
  constructor({ containerId = 'hero-stats', numeroSeletor = '.contador' } = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.numeros = $all(numeroSeletor, this.container);
    this.jaAnimou = false;

    this._observar();
  }

  _animarTodos() {
    if (this.jaAnimou) return;
    this.jaAnimou = true;

    this.numeros.forEach((elemento) => {
      const valorFinal = Number(elemento.dataset.valorFinal || 0);
      const sufixo = elemento.dataset.sufixo || '';
      animarContador(elemento, valorFinal, 1400, sufixo);
    });
  }

  _observar() {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            this._animarTodos();
            observador.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observador.observe(this.container);
  }
}

/**
 * Valida e "envia" o formulário de contato.
 * Como o site não tem back-end, o envio real é simulado —
 * mas toda a validação de campos é executada de verdade.
 */
export class FormularioContato {
  constructor({ formularioId = 'formulario-contato' } = {}) {
    this.formulario = document.getElementById(formularioId);
    if (!this.formulario) return;

    this.campoNome = $('#nome', this.formulario);
    this.campoEmail = $('#email', this.formulario);
    this.campoMensagem = $('#mensagem', this.formulario);
    this.contadorMensagem = document.getElementById('contador-mensagem');
    this.feedback = document.getElementById('formulario-feedback');
    this.botaoEnviar = $('button[type="submit"]', this.formulario);

    this._ligarEventos();
    this._atualizarContadorMensagem();
  }

  _mostrarErro(campo, mensagem) {
    const alvo = this.formulario.querySelector(`[data-erro-para="${campo.id}"]`);
    campo.classList.toggle('campo__entrada--invalido', Boolean(mensagem));
    if (alvo) alvo.textContent = mensagem || '';
  }

  _validarCampos() {
    let valido = true;

    if (!validarTamanhoMinimo(this.campoNome.value, 2)) {
      this._mostrarErro(this.campoNome, 'Digite seu nome completo.');
      valido = false;
    } else {
      this._mostrarErro(this.campoNome, '');
    }

    if (!validarEmail(this.campoEmail.value)) {
      this._mostrarErro(this.campoEmail, 'Digite um e-mail válido.');
      valido = false;
    } else {
      this._mostrarErro(this.campoEmail, '');
    }

    if (!validarTamanhoMinimo(this.campoMensagem.value, 10)) {
      this._mostrarErro(this.campoMensagem, 'Conte um pouco mais sobre o seu projeto (mín. 10 caracteres).');
      valido = false;
    } else {
      this._mostrarErro(this.campoMensagem, '');
    }

    return valido;
  }

  _atualizarContadorMensagem() {
    if (!this.contadorMensagem) return;
    const max = this.campoMensagem.maxLength > 0 ? this.campoMensagem.maxLength : 500;
    this.contadorMensagem.textContent = `${this.campoMensagem.value.length}/${max}`;
  }

  async _aoEnviar(evento) {
    evento.preventDefault();

    if (!this._validarCampos()) {
      this.feedback.textContent = 'Verifique os campos destacados antes de enviar.';
      this.feedback.className = 'formulario__feedback formulario__feedback--erro';
      return;
    }

    const textoOriginal = this.botaoEnviar.textContent;
    this.botaoEnviar.disabled = true;
    this.botaoEnviar.textContent = 'Enviando...';
    this.feedback.textContent = '';
    this.feedback.className = 'formulario__feedback';

    // Simula uma chamada de rede, já que este projeto é front-end puro
    await aguardar(900);

    this.feedback.textContent = `Mensagem enviada! Em breve alguém do time responde em ${this.campoEmail.value}.`;
    this.feedback.className = 'formulario__feedback formulario__feedback--sucesso';

    this.formulario.reset();
    this._atualizarContadorMensagem();
    this.botaoEnviar.disabled = false;
    this.botaoEnviar.textContent = textoOriginal;
  }

  _ligarEventos() {
    this.formulario.addEventListener('submit', (evento) => this._aoEnviar(evento));

    this.campoMensagem.addEventListener('input', () => this._atualizarContadorMensagem());

    // Remove o estado de erro assim que a pessoa começa a corrigir o campo
    [this.campoNome, this.campoEmail, this.campoMensagem].forEach((campo) => {
      campo.addEventListener('input', () => this._mostrarErro(campo, ''));
    });
  }
}

/**
 * Mostra um botão flutuante de "voltar ao topo" depois que a pessoa
 * rola a página além de um determinado limite.
 */
export class BotaoVoltarTopo {
  constructor({ botaoId = 'botao-topo', limiteScroll = 500 } = {}) {
    this.botao = document.getElementById(botaoId);
    if (!this.botao) return;

    this.limiteScroll = limiteScroll;
    this._ligarEventos();
  }

  _atualizarVisibilidade() {
    const visivel = window.scrollY > this.limiteScroll;
    this.botao.classList.toggle('botao-topo--visivel', visivel);
  }

  _ligarEventos() {
    window.addEventListener('scroll', debounce(() => this._atualizarVisibilidade(), 100));

    this.botao.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
