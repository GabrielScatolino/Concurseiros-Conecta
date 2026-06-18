const App = (() => {

  const historico = [];

  const TELAS = {
    login: 'tela_login',
    cadastro: 'tela_cadastro',
    recuperar_senha: 'tela_senha',
    confirmacao: 'tela_confirmacao',
    home: 'tela_home',
    cadastrar_concurso: 'tela_cadastrar_concurso',
    concursos: 'tela_concursos',
    buscar: 'tela_buscar',
    configuracoes: 'tela_configuracoes',
    perfil: 'tela_perfil',
  };

  const NAV_CONFIG = {
    home: 'nav-home',
    cadastrar_concurso: 'nav-home',
    concursos: 'nav-conexoes',
    buscar: 'nav-buscar',
    configuracoes: 'nav-configuracoes',
    perfil: 'nav-configuracoes',
  };

  const bottomNav = () => document.getElementById('bottom-nav');
  const viewport = () => document.getElementById('app-viewport');

  function ir(nomeTela) {
    const idAlvo = TELAS[nomeTela];
    if (!idAlvo) { console.warn(`[App] Tela desconhecida: "${nomeTela}"`); return; }

    // Desativa todas as telas
    document.querySelectorAll('.tela').forEach(el => el.classList.remove('ativa'));

    // Ativa a tela destino
    const telaEl = document.getElementById(idAlvo);
    if (!telaEl) { console.warn(`[App] #${idAlvo} não encontrado`); return; }
    telaEl.classList.add('ativa');

    // Gerencia bottom-nav
    const nav = bottomNav();
    if (NAV_CONFIG[nomeTela]) {
      nav.classList.add('visivel');
      // Remove ativo de todos os botões nav
      nav.querySelectorAll('button').forEach(b => b.classList.remove('nav-ativo'));
      // Ativa o botão correto
      const ativoBtn = document.getElementById(NAV_CONFIG[nomeTela]);
      if (ativoBtn) ativoBtn.classList.add('nav-ativo');
    } else {
      nav.classList.remove('visivel');
    }

    // Histórico
    if (historico[historico.length - 1] !== nomeTela) historico.push(nomeTela);

    // Rola viewport ao topo
    const vp = viewport();
    if (vp) vp.scrollTop = 0;
  }

  function voltar() {
    historico.pop();
    const anterior = historico.pop() || 'login';
    ir(anterior);
  }

  function logout() {
    if (!confirm('Deseja sair da sua conta?')) return;
    historico.length = 0;
    ir('login');
  }

  // ── Handlers de formulários ──────────────────────────────────

  async function cadastrarConcurso(e) {
    e.preventDefault();
    const cargo = document.getElementById('cargo').value.trim();
    const banca = document.getElementById('banca').value.trim();
    const local = document.getElementById('local').value.trim();
    const urlEdital = document.getElementById('url_edital').value.trim();
    const dataProva = document.getElementById('data_prova').value;

    console.log('[Cadastrar Concurso] Dados do formulário:', { cargo, id_banca: banca, local, url_edital: urlEdital, data: dataProva });

    if (!cargo || !banca || !local || !dataProva || !urlEdital) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const body = { cargo, id_banca: banca, local, url_edital: urlEdital, data: dataProva };
      console.log('[Cadastrar Concurso] Enviando POST /api/concursos:', body);

      const resposta = await fetch('http://localhost:3000/api/concursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      console.log('[Cadastrar Concurso] Resposta HTTP:', resposta.status);
      const dados = await resposta.json();
      console.log('[Cadastrar Concurso] Dados retornados:', dados);

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao cadastrar concurso.');
      }

      alert('Concurso cadastrado com sucesso!');
      document.getElementById('form-concurso').reset();
      ir('home');
    } catch (erro) {
      console.error('[Cadastrar Concurso] Erro:', erro.message);
      alert(erro.message);
    }
  }

  function buscar(e) {
    e.preventDefault();
    const termo = document.getElementById('campo-busca').value.trim();
    if (!termo) return;
    alert(`Buscando por: "${termo}"`);
  }

  async function verTodosConcursos() {
    console.log('[Listar Concursos] Buscando todos os concursos...');
    try {
      const resposta = await fetch('http://localhost:3000/api/concursos');
      console.log('[Listar Concursos] Resposta HTTP:', resposta.status);
      const dados = await resposta.json();
      console.log('[Listar Concursos] Dados retornados:', dados);

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao buscar concursos.');
      }

      if (!dados.length) {
        alert('Nenhum concurso cadastrado.');
        return;
      }

      renderizarConcursos(dados);
      alert(dados.length + ' concurso(s) encontrado(s).');
    } catch (erro) {
      alert(erro.message);
    }
  }

  async function excluirConcurso(id) {
    console.log('[Excluir Concurso] ID recebido:', id);
    if (!confirm('Deseja realmente excluir este concurso?')) return;

    try {
      const resposta = await fetch('http://localhost:3000/api/concursos/' + id, {
        method: 'DELETE',
      });

      console.log('[Excluir Concurso] Resposta HTTP:', resposta.status);
      const dados = await resposta.json();
      console.log('[Excluir Concurso] Dados retornados:', dados);

      if (!resposta.ok) {
        throw new Error(dados.error || 'Erro ao excluir concurso.');
      }

      alert('Concurso excluído com sucesso!');

      const botaoExcluir = document.querySelector('.btn-excluir[data-id="' + id + '"]');
      const card = botaoExcluir ? botaoExcluir.closest('.concurso-card') : null;
      if (card) card.remove();
    } catch (erro) {
      alert(erro.message);
    }
  }

  function renderizarConcursos(concursos) {
    const container = document.getElementById('concursos-container');
    container.innerHTML = '';

    concursos.forEach(function (concurso) {
      const card = document.createElement('div');
      card.className = 'concurso-card';

      card.innerHTML = `
        <h3>${concurso.cargo}</h3>
        <p><strong>ID:</strong> ${concurso.id_concurso}</p>
        <p><strong>Banca:</strong> ${concurso.bancaRef ? concurso.bancaRef.nome : 'N/A'}</p>
        <p><strong>Local:</strong> ${concurso.local || 'N/A'}</p>
        <p><strong>Data:</strong> ${concurso.data ? new Date(concurso.data).toLocaleDateString('pt-BR') : 'N/A'}</p>
        <p><strong>Edital:</strong> ${concurso.url_edital ? '<a href="' + concurso.url_edital + '" target="_blank">Link</a>' : 'N/A'}</p>
        <div class="card-acoes">
          <button type="button" class="btn-editar" data-id="${concurso.id_concurso}">Editar</button>
          <button type="button" class="btn-excluir" data-id="${concurso.id_concurso}">Excluir</button>
        </div>
      `;

      container.appendChild(card);
    });
  }

  async function buscarConcursoPorId() {
    const id = document.getElementById('input-busca-id').value.trim();

    console.log('[Buscar Concurso] ID digitado:', id);

    if (!id) {
      alert('Informe o ID do concurso.');
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3000/api/concursos/' + id);
      console.log('[Buscar Concurso] Resposta HTTP:', resposta.status);
      const dados = await resposta.json();
      console.log('[Buscar Concurso] Dados retornados:', dados);

      if (!resposta.ok) {
        throw new Error(dados.error || 'Concurso não encontrado.');
      }

      const container = document.getElementById('concursos-container');
      container.innerHTML = '';

      const card = document.createElement('div');
      card.className = 'concurso-card';

      card.innerHTML = `
        <h3>${dados.cargo}</h3>
        <p><strong>ID:</strong> ${dados.id_concurso}</p>
        <p><strong>Banca:</strong> ${dados.bancaRef ? dados.bancaRef.nome : 'N/A'}</p>
        <p><strong>Local:</strong> ${dados.local || 'N/A'}</p>
        <p><strong>Data:</strong> ${dados.data ? new Date(dados.data).toLocaleDateString('pt-BR') : 'N/A'}</p>
        <p><strong>Edital:</strong> ${dados.url_edital ? '<a href="' + dados.url_edital + '" target="_blank">Link</a>' : 'N/A'}</p>
        <div class="card-acoes">
          <button type="button" class="btn-editar" data-id="${dados.id_concurso}">Editar</button>
          <button type="button" class="btn-excluir" data-id="${dados.id_concurso}">Excluir</button>
        </div>
      `;

      container.appendChild(card);
      alert('Concurso encontrado!');
    } catch (erro) {
      alert(erro.message);
    }
  }

  // ── Init ─────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    ir('login');
    console.log('[App] Concurseiros Conecta iniciado.');

    const btnVerTodos = document.getElementById('btn-ver-todos');
    const btnBuscarId = document.getElementById('btn-buscar-id');

    if (btnVerTodos) {
      btnVerTodos.addEventListener('click', verTodosConcursos);
    }

    if (btnBuscarId) {
      btnBuscarId.addEventListener('click', buscarConcursoPorId);
    }

    document.addEventListener('click', function(evento) {
      if (evento.target.classList.contains('btn-excluir')) {
        const id = evento.target.getAttribute('data-id');
        if (id) excluirConcurso(id);
      }
    });
  });

  return { ir, voltar, logout, cadastrarConcurso, buscar, verTodosConcursos, buscarConcursoPorId, excluirConcurso };

})();