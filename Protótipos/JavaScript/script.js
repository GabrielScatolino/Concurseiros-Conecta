function mostrarTela(idTela) {

    const telas = document.querySelectorAll('.tela');

    telas.forEach((tela) => {
        tela.classList.remove('ativa');
    });

    document.getElementById(idTela)
        .classList.add('ativa');
}