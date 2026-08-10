// Este arquivo depende de supabaseClient.js (inclua-o ANTES deste no HTML)

async function carregarResultados() {
    const container = document.getElementById('conteudo-resultados');

    try {
        const { data, error } = await supabaseClient
            .from('resultados')
            .select('*')
            .order('criado_em', { ascending: false }); // mais recentes primeiro

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = "<div class='loading'>Nenhum jogo cadastrado na aba de resultados ainda.</div>";
            return;
        }

        let htmlCards = '<div class="grid-resultados">';

        data.forEach((jogo) => {
            const timeVencedor = jogo.time_vencedor;
            const timePerdedor = jogo.time_perdedor;
            const golsVencedor = jogo.gols_vencedor ?? 0;
            const golsPerdedor = jogo.gols_perdedor ?? 0;
            const golsVencedorf = jogo.gols_vencedor_f;
            const golsPerdedorf = jogo.gols_perdedor_f;
            const mostrarPlacarF = golsVencedorf !== null && golsPerdedorf !== null
                && golsVencedorf !== undefined && golsPerdedorf !== undefined;

            const artilheirosVencedor = [jogo.gol1, jogo.gol2].filter(Boolean).join('<br>');
            const artilheirosPerdedor = [jogo.gol3, jogo.gol4].filter(Boolean).join('<br>');
            const temArtilheiros = artilheirosVencedor !== '' || artilheirosPerdedor !== '';

            htmlCards += `
            <div class="card-placar">
                <div class="confronto">
                    <div class="time-box time-vencedor">${timeVencedor}</div>
                    <div class="placar-numeros">${golsVencedor} - ${golsPerdedor}</div>
                    <div class="time-box time-perdedor">${timePerdedor}</div>

                    <div class="tabelaart tabelaart-vencedor">${temArtilheiros ? artilheirosVencedor : '&nbsp;'}</div>
                    <div class="placar-f">${mostrarPlacarF ? `${golsVencedorf} - ${golsPerdedorf}` : '&nbsp;'}</div>
                    <div class="tabelaart tabelaart-perdedor">${temArtilheiros ? artilheirosPerdedor : '&nbsp;'}</div>
                </div>
                <div class="status-partida">Fim de jogo</div>
            </div>
            `;
        });

        htmlCards += '</div>';
        container.innerHTML = htmlCards;

    } catch (erro) {
        console.error("Erro ao carregar resultados do Supabase:", erro);
        container.innerHTML = "<div class='loading'>Erro ao carregar os resultados. Verifique a conexão com o Supabase (URL/chave em supabaseClient.js e as políticas de RLS).</div>";
    }
}

carregarResultados();