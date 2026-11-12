
"use strict";

// ==========================================
// TASKFLOW - CONFIGURAÇÕES INICIAIS
// ==========================================

const API = "/tarefas";

let categoriaAtual = "Todas";
let tarefaEmEdicao = null;

// Elementos principais
const lista = document.getElementById("listaTarefas");
const form = document.getElementById("formTarefa");
const titulo = document.getElementById("titulo");
const mensagem = document.getElementById("mensagem");

// Elementos do formulário de criação
const categoriaTarefa = document.getElementById("categoriaTarefa");
const prioridadeTarefa = document.getElementById("prioridadeTarefa");
const dataVencimento = document.getElementById("dataVencimento");

// Elementos do dashboard
const totalTarefas = document.getElementById("totalTarefas");
const tarefasPendentes = document.getElementById("tarefasPendentes");
const tarefasConcluidas = document.getElementById("tarefasConcluidas");
const tarefasAtrasadas = document.getElementById("tarefasAtrasadas");

// Estado vazio
const estadoVazio = document.getElementById("estadoVazio");

// ==========================================
// DATAS E PRAZOS
// ==========================================

// Retorna a data atual no formato AAAA-MM-DD
function obterDataLocal() {
    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        hoje.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

// Converte AAAA-MM-DD para DD/MM/AAAA
function formatarData(data) {
    if (!data) return "";

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
}

// Identifica o status do vencimento
function obterStatusVencimento(tarefa) {
    if (!tarefa.dataVencimento) {
        return null;
    }

    const dataFormatada = formatarData(
        tarefa.dataVencimento
    );

    // Tarefa concluída não fica atrasada
    if (tarefa.concluida) {
        return {
            texto: `📅 Prazo: ${dataFormatada}`,
            classe: "prazo-normal"
        };
    }

    const hoje = obterDataLocal();

    // Prazo já passou
    if (tarefa.dataVencimento < hoje) {
        return {
            texto: `⚠️ Atrasada desde ${dataFormatada}`,
            classe: "prazo-atrasado"
        };
    }

    // Vence hoje
    if (tarefa.dataVencimento === hoje) {
        return {
            texto: "⏰ Vence hoje",
            classe: "prazo-hoje"
        };
    }

    // Prazo futuro
    return {
        texto: `📅 Vence em ${dataFormatada}`,
        classe: "prazo-normal"
    };
}

// ==========================================
// MENSAGENS E TRATAMENTO DE ERROS
// ==========================================

function mostrarErro(erro) {
    console.error("TaskFlow:", erro);

    mensagem.textContent =
        erro.message || "Ocorreu um erro inesperado.";
}

// Extrai a mensagem de erro da API
async function verificarResposta(resposta) {
    if (resposta.ok) {
        return;
    }

    const detalhe = await resposta.text();

    throw new Error(
        detalhe || `Erro HTTP ${resposta.status}`
    );
}

// ==========================================
// DASHBOARD DE PRODUTIVIDADE
// ==========================================


function atualizarDashboard(tarefas) {
    const total = tarefas.length;

    const concluidas = tarefas.filter(
        tarefa => tarefa.concluida === true
    ).length;

    const pendentes = total - concluidas;

    // Data atual no formato AAAA-MM-DD
    const hoje = obterDataLocal();

    // Contar tarefas atrasadas
    const atrasadas = tarefas.filter(tarefa => {
        return (
            !tarefa.concluida &&
            tarefa.dataVencimento != null &&
            tarefa.dataVencimento < hoje
        );
    }).length;

    // Atualizar os cartões
    totalTarefas.textContent = total;
    tarefasPendentes.textContent = pendentes;
    tarefasConcluidas.textContent = concluidas;
    tarefasAtrasadas.textContent = atrasadas;
}


// ==========================================
// CATEGORIAS E PRIORIDADES
// ==========================================

const iconesCategorias = {
    Pessoal: "🏠",
    Trabalho: "💼",
    Estudos: "📚"
};

const nomesPrioridades = {
    Baixa: "🟢 Baixa",
    Media: "🟡 Média",
    Alta: "🔴 Alta"
};

// Trata prioridades vazias de tarefas antigas
function obterPrioridade(tarefa) {
    const prioridade = tarefa.prioridade;

    if (Object.hasOwn(
        nomesPrioridades,
        prioridade
    )) {
        return prioridade;
    }

    return "Media";
}

// ==========================================
// CRIAR ELEMENTOS VISUAIS DAS TAREFAS
// ==========================================

function criarElementoTarefa(tarefa) {
    const li = document.createElement("li");

    // Área de informações
    const informacoes = document.createElement("div");
    informacoes.className = "informacoes-tarefa";

    // Título
    const nome = document.createElement("span");
    nome.textContent = tarefa.titulo;

    if (tarefa.concluida) {
        nome.classList.add("concluida");
    }

    informacoes.appendChild(nome);

    // Categoria
    const categoria = tarefa.categoria || "Pessoal";

    const categoriaTexto = document.createElement("small");
    categoriaTexto.className = "categoria-texto";

    const iconeCategoria =
        iconesCategorias[categoria] || "📋";

    categoriaTexto.textContent =
        `${iconeCategoria} ${categoria}`;

    informacoes.appendChild(categoriaTexto);

    // Prioridade
    const prioridade = obterPrioridade(tarefa);

    const prioridadeTexto = document.createElement("span");

    prioridadeTexto.className =
        `etiqueta-prioridade prioridade-${prioridade.toLowerCase()}`;

    prioridadeTexto.textContent =
        nomesPrioridades[prioridade];

    informacoes.appendChild(prioridadeTexto);

    // Data de vencimento
    const statusPrazo = obterStatusVencimento(tarefa);

    if (statusPrazo) {
        const prazoTexto = document.createElement("small");

        prazoTexto.className = statusPrazo.classe;
        prazoTexto.textContent = statusPrazo.texto;

        informacoes.appendChild(prazoTexto);
    }

    // ======================================
    // BOTÕES DE AÇÃO
    // ======================================

    const acoes = document.createElement("div");
    acoes.className = "acoes";

    // Editar
    const editar = document.createElement("button");

    editar.type = "button";
    editar.textContent = "✏️";
    editar.title = "Editar tarefa";
    editar.setAttribute("aria-label", "Editar tarefa");

    editar.className = "botao-editar";

    editar.addEventListener("click", () => {
        abrirEdicao(tarefa);
    });

    acoes.appendChild(editar);

    // Concluir
    if (!tarefa.concluida) {
        const concluir = document.createElement("button");

        concluir.type = "button";
        concluir.textContent = "✓";
        concluir.title = "Concluir tarefa";
        concluir.setAttribute(
            "aria-label",
            "Concluir tarefa"
        );

        concluir.addEventListener("click", () => {
            concluirTarefa(tarefa.id);
        });

        acoes.appendChild(concluir);
    }

    // Excluir
    const excluir = document.createElement("button");

    excluir.type = "button";
    excluir.textContent = "Excluir";
    excluir.className = "excluir";

    excluir.addEventListener("click", () => {
        excluirTarefa(tarefa.id);
    });

    acoes.appendChild(excluir);

    li.append(informacoes, acoes);

    return li;
}

// ==========================================
// CONSULTAR E LISTAR TAREFAS
// ==========================================

async function carregarTarefas() {
    try {
        mensagem.textContent = "";

        const resposta = await fetch(API);

        await verificarResposta(resposta);

        const tarefas = await resposta.json();

        // Atualiza estatísticas gerais
        atualizarDashboard(tarefas);

        // Filtra pela categoria selecionada
        const tarefasFiltradas = tarefas.filter(tarefa => {
            const categoria = tarefa.categoria || "Pessoal";

            return categoriaAtual === "Todas" ||
                categoria === categoriaAtual;
        });

        // Limpa a lista
        lista.replaceChildren();

        // Exibe estado vazio quando necessário
        estadoVazio.hidden = tarefasFiltradas.length > 0;

        // Cria os cartões
        tarefasFiltradas.forEach(tarefa => {
            const elemento = criarElementoTarefa(tarefa);

            lista.appendChild(elemento);
        });

    } catch (erro) {
        mostrarErro(erro);
    }
}

// ==========================================
// CRIAR NOVA TAREFA
// ==========================================

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const valor = titulo.value.trim();

    if (!valor) {
        mensagem.textContent = "Digite o título da tarefa.";
        return;
    }

    // Captura a categoria
    const categoriaSelecionada =
        categoriaAtual === "Todas"
            ? categoriaTarefa.value
            : categoriaAtual;

    // Captura a prioridade
    const prioridadeSelecionada = prioridadeTarefa.value;

    // Captura a data
    const dataSelecionada = dataVencimento.value;

    try {
        mensagem.textContent = "";

        const resposta = await fetch(API, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                titulo: valor,
                categoria: categoriaSelecionada,
                prioridade: prioridadeSelecionada,
                dataVencimento: dataSelecionada || null
            })
        });

        await verificarResposta(resposta);

        // Limpa os campos após salvar
        titulo.value = "";
        dataVencimento.value = "";

        // Atualiza a lista
        await carregarTarefas();

        // Fecha formulário mobile
        form.classList.remove("aberto");

    } catch (erro) {
        mostrarErro(erro);
    }
});

// ==========================================
// CONCLUIR TAREFA
// ==========================================

async function concluirTarefa(id) {
    try {
        const resposta = await fetch(
            `${API}/${id}/concluir`,
            {
                method: "PUT"
            }
        );

        await verificarResposta(resposta);

        await carregarTarefas();

    } catch (erro) {
        mostrarErro(erro);
    }
}

// ==========================================
// EXCLUIR TAREFA
// ==========================================

async function excluirTarefa(id) {
    try {
        const resposta = await fetch(
            `${API}/${id}`,
            {
                method: "DELETE"
            }
        );

        await verificarResposta(resposta);

        await carregarTarefas();

    } catch (erro) {
        mostrarErro(erro);
    }
}

// ==========================================
// MODO CLARO E ESCURO
// ==========================================

const botaoTema = document.getElementById("botaoTema");

function aplicarTema(tema) {
    const escuro = tema === "dark";

    document.body.classList.toggle("dark", escuro);

    botaoTema.textContent = escuro
        ? "☀️ Modo Claro"
        : "🌙 Modo Escuro";

    botaoTema.setAttribute(
        "aria-pressed",
        String(escuro)
    );
}

// Recupera o tema salvo
const temaGuardado = localStorage.getItem("tema");

aplicarTema(
    temaGuardado === "dark" ? "dark" : "light"
);

// Alterna entre os temas
botaoTema.addEventListener("click", () => {
    const escuroAtivo =
        document.body.classList.contains("dark");

    const novoTema = escuroAtivo
        ? "light"
        : "dark";

    aplicarTema(novoTema);

    localStorage.setItem("tema", novoTema);
});

// ==========================================
// MENU LATERAL E MOBILE
// ==========================================

const botaoMenu = document.getElementById("botaoMenu");
const menuLateral = document.getElementById("menuLateral");
const fecharMenu = document.getElementById("fecharMenu");
const overlayMenu = document.getElementById("overlayMenu");
const botaoFlutuante = document.getElementById("botaoFlutuante");

function alternarMenu(aberto) {
    menuLateral.classList.toggle("aberto", aberto);
    overlayMenu.classList.toggle("aberto", aberto);

    botaoMenu.setAttribute(
        "aria-expanded",
        String(aberto)
    );
}

botaoMenu.addEventListener("click", () => {
    alternarMenu(true);
});

fecharMenu.addEventListener("click", () => {
    alternarMenu(false);
});

overlayMenu.addEventListener("click", () => {
    alternarMenu(false);
});

// Botão flutuante para criar tarefas no celular
botaoFlutuante.addEventListener("click", () => {
    form.classList.toggle("aberto");

    if (form.classList.contains("aberto")) {
        titulo.focus();
    }
});

// ==========================================
// FILTROS DE CATEGORIAS
// ==========================================

const botoesCategorias =
    document.querySelectorAll(".filtro-categoria");

function selecionarCategoria(categoria) {
    categoriaAtual = categoria;

    // Sincroniza o formulário
    if (categoria !== "Todas") {
        categoriaTarefa.value = categoria;
    }

    // Atualiza o destaque do menu
    botoesCategorias.forEach(botao => {
        const ativo =
            botao.dataset.categoria === categoria;

        botao.classList.toggle("ativo", ativo);
    });

    // Atualiza o título
    const tituloLista =
        document.querySelector(".area-tarefas h2");

    tituloLista.textContent =
        categoria === "Todas"
            ? "Minhas tarefas"
            : categoria;

    alternarMenu(false);

    carregarTarefas();
}

botoesCategorias.forEach(botao => {
    botao.addEventListener("click", () => {
        selecionarCategoria(
            botao.dataset.categoria
        );
    });
});

// ==========================================
// EDIÇÃO DE TAREFAS
// ==========================================

const modalEditar = document.getElementById("modalEditar");
const formEditar = document.getElementById("formEditar");
const editarTitulo = document.getElementById("editarTitulo");
const editarCategoria = document.getElementById("editarCategoria");
const editarPrioridade = document.getElementById("editarPrioridade");
const editarDataVencimento =
    document.getElementById("editarDataVencimento");

const cancelarEdicao = document.getElementById("cancelarEdicao");
const erroEdicao = document.getElementById("erroEdicao");

// Abre a janela de edição
function abrirEdicao(tarefa) {
    tarefaEmEdicao = tarefa.id;

    editarTitulo.value = tarefa.titulo;

    editarCategoria.value =
        tarefa.categoria || "Pessoal";

    editarPrioridade.value =
        obterPrioridade(tarefa);

    editarDataVencimento.value =
        tarefa.dataVencimento || "";

    erroEdicao.textContent = "";

    modalEditar.hidden = false;

    editarTitulo.focus();
}

// Fecha a janela
function fecharEdicao() {
    modalEditar.hidden = true;
    tarefaEmEdicao = null;
}

cancelarEdicao.addEventListener("click", () => {
    fecharEdicao();
});

// Fecha o modal com ESC
document.addEventListener("keydown", (evento) => {
    if (
        evento.key === "Escape" &&
        !modalEditar.hidden
    ) {
        fecharEdicao();
    }
});

// Salva a edição
formEditar.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const novoTitulo = editarTitulo.value.trim();
    const novaCategoria = editarCategoria.value;
    const novaPrioridade = editarPrioridade.value;
    const novaData = editarDataVencimento.value;

    if (!novoTitulo || tarefaEmEdicao === null) {
        erroEdicao.textContent =
            "Preencha o título da tarefa.";
        return;
    }

    try {
        erroEdicao.textContent = "";

        const resposta = await fetch(
            `${API}/${tarefaEmEdicao}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    titulo: novoTitulo,
                    categoria: novaCategoria,
                    prioridade: novaPrioridade,
                    dataVencimento: novaData || null
                })
            }
        );

        await verificarResposta(resposta);

        fecharEdicao();

        await carregarTarefas();

    } catch (erro) {
        console.error("Erro ao editar tarefa:", erro);

        erroEdicao.textContent = erro.message;
    }
});

// ==========================================
// INICIALIZAÇÃO DO TASKFLOW
// ==========================================

// Marca a categoria Todas como selecionada
botoesCategorias.forEach(botao => {
    botao.classList.toggle(
        "ativo",
        botao.dataset.categoria === categoriaAtual
    );
});

// Carrega as tarefas ao abrir a página
carregarTarefas();
