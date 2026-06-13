/**
 * CONCURSEIROS CONECTA — script.js
 * SPA Controller: navegação, bottom-nav e utilitários
 */

const App = (() => {

  const historico = [];

  const TELAS = {
    login:            'tela_login',
    cadastro:         'tela_cadastro',
    recuperar_senha:  'tela_senha',
    confirmacao:      'tela_confirmacao',
    home:             'tela_home',
    cadastrar_viagem: 'tela_cadastrar_viagem',
    conexoes:         'tela_conexoes',
    buscar:           'tela_buscar',
    configuracoes:    'tela_configuracoes',
    perfil:           'tela_perfil',
  };

  // Telas que mostram a bottom-nav e qual botão fica ativo
  const NAV_CONFIG = {
    home:             'nav-home',
    cadastrar_viagem: 'nav-home',
    conexoes:         'nav-conexoes',
    buscar:           'nav-buscar',
    configuracoes:    'nav-configuracoes',
    perfil:           'nav-configuracoes',
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

  // ── Utilitários ──────────────────────────────────────────────

  function maskCPF(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9)      v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/^(\d{3})(\d{0,3}).*/, '$1.$2');
    input.value = v;
  }

  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf[10]);
  }

  // ── Handlers de formulários ──────────────────────────────────

  function cadastrarViagem(e) {
    e.preventDefault();
    const origem     = document.getElementById('origem').value.trim();
    const destino    = document.getElementById('destino').value.trim();
    const dataViagem = document.getElementById('data_viagem').value;
    const concurso   = document.getElementById('concurso').value.trim();
    const cargo      = document.getElementById('cargo').value.trim();
    const dataProva  = document.getElementById('data_prova').value;

    if (!origem || !destino || !dataViagem || !concurso || !cargo || !dataProva) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    if (new Date(dataViagem) > new Date(dataProva)) {
      alert('A data de viagem não pode ser posterior à data da prova.');
      return;
    }
    _atualizarCardHome({ destino, dataProva, concurso, cargo });
    alert('Viagem cadastrada com sucesso!');
    document.getElementById('form-viagem').reset();
    ir('home');
  }

  function buscar(e) {
    e.preventDefault();
    const termo = document.getElementById('campo-busca').value.trim();
    if (!termo) return;
    alert(`Buscando por: "${termo}"`);
  }

  function _atualizarCardHome({ destino, dataProva, concurso, cargo }) {
    const fmt = iso => { const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; };
    const ps = document.querySelectorAll('#tela_home .card-itens p');
    if (ps.length < 5) return;
    ps[0].innerHTML = `<strong>Destino: </strong>${destino}`;
    ps[1].innerHTML = `<strong>Data da prova: </strong>${fmt(dataProva)}`;
    ps[2].innerHTML = `<strong>Concurso: </strong>${concurso}`;
    ps[4].innerHTML = `<strong>Cargo: </strong>${cargo}`;
  }

  // ── Init ─────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    ir('login');
    console.log('[App] Concurseiros Conecta iniciado.');
  });

  return { ir, voltar, logout, maskCPF, validarCPF, cadastrarViagem, buscar };

})();