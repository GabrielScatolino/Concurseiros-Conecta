const App = (() => {

  const historico = [];

  const TELAS = {
    login:            'tela_login',
    cadastro:         'tela_cadastro',
    recuperar_senha:  'tela_senha',
    confirmacao:      'tela_confirmacao',
    home:             'tela_home',
    cadastrar_concurso: 'tela_cadastrar_concurso',
    concursos:         'tela_concursos',
    buscar:           'tela_buscar',
    configuracoes:    'tela_configuracoes',
    perfil:           'tela_perfil',
  };

  const NAV_CONFIG = {
    home:               'nav-home',
    cadastrar_concurso: 'nav-home',
    concursos:           'nav-conexoes',
    buscar:             'nav-buscar',
    configuracoes:      'nav-configuracoes',
    perfil:             'nav-configuracoes',
  };

  const bottomNav = () => document.getElementById('bottom-nav');
  const viewport  = () => document.getElementById('app-viewport');

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

  function cadastrarConcurso(e) {
    e.preventDefault();
    const cargo = document.getElementById('cargo').value.trim();
    const banca = document.getElementById('banca').value.trim();
    const local = document.getElementById('local').value.trim();
    const urlEdital = document.getElementById('url_edital').value.trim();
    const dataProva = document.getElementById('data_prova').value;

    if (!cargo || !banca || !local || !dataProva || !urlEdital) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    alert('Concurso cadastrado com sucesso!');
    document.getElementById('form-concurso').reset();
    ir('home');
  }

  function buscar(e) {
    e.preventDefault();
    const termo = document.getElementById('campo-busca').value.trim();
    if (!termo) return;
    alert(`Buscando por: "${termo}"`);
  }

  // ── Init ─────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    ir('login');
    console.log('[App] Concurseiros Conecta iniciado.');
  });

  return { ir, voltar, logout, cadastrarConcurso, buscar };

})();