let times = [];

const posicoes = [
    "goleiro",
    "fixo",
    "ala_direito",
    "ala_esquerdo",
    "pivo",
    "reserva1",
    "reserva2",
    "reserva3",
    "reserva4",
    "reserva5"
];

async function carregarTimes() {
    const { data, error } = await supabaseClient
        .from("jogadores")
        .select("*")
        .order("time", { ascending: true });

    if (error) {
        console.error("Erro ao carregar times:", error);
        return;
    }

    times = data || [];

    const selects = [
        "time_vencedor",
        "time_perdedor",
        "proximo_time1",
        "proximo_time2",
        "time_jogador"
    ];

    selects.forEach(id => {
        const select = document.getElementById(id);

        if (!select) return;

        select.innerHTML = '<option value="">Selecione o time</option>';

        times.forEach(time => {
            const option = document.createElement("option");
            option.value = time.time;
            option.textContent = time.time;
            select.appendChild(option);
        });
    });
}

async function preencherArtilheiros(nomeTime, ids) {
    ids.forEach(id => {
        const select = document.getElementById(id);

        if (select) {
            select.innerHTML = '<option value="">Carregando...</option>';
        }
    });

    if (!nomeTime) {
        ids.forEach(id => {
            const select = document.getElementById(id);

            if (select) {
                select.innerHTML = '<option value="">Selecione o jogador</option>';
            }
        });

        return;
    }

    const { data, error } = await supabaseClient
        .from("jogadores")
        .select("*")
        .eq("time", nomeTime)
        .single();

    if (error) {
        console.error("Erro ao carregar jogadores:", error);

        ids.forEach(id => {
            const select = document.getElementById(id);

            if (select) {
                select.innerHTML = '<option value="">Erro ao carregar</option>';
            }
        });

        return;
    }

    const jogadores = posicoes
        .map(posicao => data[posicao])
        .filter(jogador => jogador && jogador.trim() !== "");

    ids.forEach(id => {
        const select = document.getElementById(id);

        if (!select) return;

        select.innerHTML = '<option value="">Selecione o jogador</option>';

        jogadores.forEach(jogador => {
            const option = document.createElement("option");
            option.value = jogador;
            option.textContent = jogador;
            select.appendChild(option);
        });
    });
}

document.getElementById("time_vencedor").addEventListener("change", function() {
    preencherArtilheiros(this.value, ["gol1", "gol2"]);
});

document.getElementById("time_perdedor").addEventListener("change", function() {
    preencherArtilheiros(this.value, ["gol3", "gol4"]);
});

document.getElementById("form-cadastro").addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const mensagem = document.getElementById("mensagem-cadastro");

    const pegarNumero = id => {
        const valor = document.getElementById(id).value;
        return valor === "" ? null : Number(valor);
    };

    const pegarTexto = id => {
        const valor = document.getElementById(id).value;
        return valor === "" ? null : valor;
    };

    const novoJogo = {
        time_vencedor: pegarTexto("time_vencedor"),
        time_perdedor: pegarTexto("time_perdedor"),
        gols_vencedor: pegarNumero("gols_vencedor"),
        gols_perdedor: pegarNumero("gols_perdedor"),
        gols_vencedor_f: pegarNumero("gols_vencedor_f"),
        gols_perdedor_f: pegarNumero("gols_perdedor_f"),
        gol1: pegarTexto("gol1"),
        gol2: pegarTexto("gol2"),
        gol3: pegarTexto("gol3"),
        gol4: pegarTexto("gol4")
    };

    if (novoJogo.time_vencedor === novoJogo.time_perdedor) {
        mensagem.textContent = "Os times precisam ser diferentes.";
        mensagem.className = "erro";
        return;
    }

    mensagem.textContent = "Enviando...";
    mensagem.className = "";

    const { error } = await supabaseClient
        .from("resultados")
        .insert([novoJogo]);

    if (error) {
        console.error("Erro ao cadastrar resultado:", error);
        mensagem.textContent = "Erro ao cadastrar o resultado.";
        mensagem.className = "erro";
        return;
    }

    mensagem.textContent = "Resultado cadastrado com sucesso!";
    mensagem.className = "sucesso";

    this.reset();

    preencherArtilheiros("", ["gol1", "gol2"]);
    preencherArtilheiros("", ["gol3", "gol4"]);

    if (typeof carregarResultados === "function") {
        carregarResultados();
    }
});

document.getElementById("form-proximo-jogo").addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const mensagem = document.getElementById("mensagem-proximo-jogo");

    const novoJogo = {
        time1: document.getElementById("proximo_time1").value,
        time2: document.getElementById("proximo_time2").value,
        data: document.getElementById("proximo_data").value,
        hora: document.getElementById("proximo_hora").value,
        local: document.getElementById("proximo_local").value.trim()
    };

    if (novoJogo.time1 === novoJogo.time2) {
        mensagem.textContent = "Os times precisam ser diferentes.";
        mensagem.className = "erro";
        return;
    }

    mensagem.textContent = "Enviando...";
    mensagem.className = "";

    const { error } = await supabaseClient
        .from("proximos_jogos")
        .insert([novoJogo]);

    if (error) {
        console.error("Erro ao cadastrar próximo jogo:", error);
        mensagem.textContent = "Erro ao cadastrar o próximo jogo.";
        mensagem.className = "erro";
        return;
    }

    mensagem.textContent = "Próximo jogo cadastrado com sucesso!";
    mensagem.className = "sucesso";

    this.reset();
});

document.getElementById("form-jogador").addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome_jogador").value.trim();
    const nomeTime = document.getElementById("time_jogador").value;
    const posicao = document.getElementById("posicao_jogador").value;
    const mensagem = document.getElementById("mensagem-jogador");

    if (!nome || !nomeTime || !posicao) {
        mensagem.textContent = "Preencha todos os campos.";
        mensagem.className = "erro";
        return;
    }

    const time = times.find(item => item.time === nomeTime);

    if (!time) {
        mensagem.textContent = "Time não encontrado.";
        mensagem.className = "erro";
        return;
    }

    if (time[posicao]) {
        mensagem.textContent = `Essa posição já está ocupada por ${time[posicao]}.`;
        mensagem.className = "erro";
        return;
    }

    const jogadoresDoTime = posicoes
        .map(pos => time[pos])
        .filter(jogador => jogador);

    const jogadorExiste = jogadoresDoTime.some(jogador =>
        jogador.toLowerCase() === nome.toLowerCase()
    );

    if (jogadorExiste) {
        mensagem.textContent = "Esse jogador já está cadastrado nesse time.";
        mensagem.className = "erro";
        return;
    }

    mensagem.textContent = "Adicionando...";
    mensagem.className = "";

    const atualizacao = {};
    atualizacao[posicao] = nome;

    const { error } = await supabaseClient
        .from("jogadores")
        .update(atualizacao)
        .eq("id", time.id);

    if (error) {
        console.error("Erro ao adicionar jogador:", error);
        mensagem.textContent = "Erro ao adicionar jogador.";
        mensagem.className = "erro";
        return;
    }

    mensagem.textContent = "Jogador adicionado com sucesso!";
    mensagem.className = "sucesso";

    this.reset();

    await carregarTimes();
});

carregarTimes();