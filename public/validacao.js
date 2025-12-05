document.addEventListener("DOMContentLoaded", function() {

    const formJogador = document.getElementById("formJogador");
    const formEquipe = document.getElementById("formEquipe");
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function(event) {
        const usuario = document.getElementById("usuario");
        const senha = document.getElementById("senha");

        let valid = true;

        limparErros();

        if (usuario.value.trim() === "") {
            mostrarErro(usuario, "O nome de usuário é obrigatório.");
            valid = false;
        }
        if (senha.value.trim() === "") {
            mostrarErro(senha, "A senha é obrigatória.");
            valid = false;
        }
        if (!valid) {
            event.preventDefault();
        }
    });


    formJogador.addEventListener("submit", function(event) {
        const nome = document.getElementById("nomeJogador");
        const nick = document.getElementById("nick");
        const funcao = document.getElementById("funcao");
        const elo = document.getElementById("elo");
        const genero = document.getElementById("genero");
        const equipe = document.getElementById("equipe");

        let valid = true;

        limparErros();

        if (nome.value.trim() === "") {
            mostrarErro(nome, "O nome do jogador é obrigatório.");
            valid = false;
        }
        if (nick.value.trim() === "") {
            mostrarErro(nick, "O nickname é obrigatório.");
            valid = false;
        }
        if (funcao.value === "") {
            mostrarErro(funcao, "A função é obrigatória.");
            valid = false;
        }
        if (elo.value.trim() === "") {
            mostrarErro(elo, "O elo é obrigatório.");
            valid = false;
        }
        if (genero.value === "") {
            mostrarErro(genero, "O gênero é obrigatório.");
            valid = false;
        }
        if (equipe.value === "") {
            mostrarErro(equipe, "A equipe é obrigatória.");
            valid = false;
        }

        if (!valid) {
            event.preventDefault();
        }
    });

    formEquipe.addEventListener("submit", function(event) {
        const nomeEquipe = document.getElementById("nomeEquipe");
        const capitao = document.getElementById("capitao");
        const Telefone = document.getElementById("Telefone");

        let valid = true;

        limparErros();

        if (nomeEquipe.value.trim() === "") {
            mostrarErro(nomeEquipe, "O nome da equipe é obrigatório.");
            valid = false;
        }
        if (capitao.value.trim() === "") {
            mostrarErro(capitao, "O nome do capitão é obrigatório.");
            valid = false;
        }
        if (Telefone.value.trim() === "") {
            mostrarErro(Telefone, "O telefone é obrigatório.");
            valid = false;
        }

        if (!valid) {
            event.preventDefault();
        }
    });

    function mostrarErro(input, message) {
        const erro = document.createElement("div");
        erro.className = "invalid-feedback";
        erro.innerText = message;

        input.classList.add("is-invalid");
        input.parentNode.insertBefore(erro, input.nextSibling);
    }

    function limparErros() {
        document.querySelectorAll(".invalid-feedback").forEach(e => e.remove());
        document.querySelectorAll(".is-invalid").forEach(i => i.classList.remove("is-invalid"));
    }

});
