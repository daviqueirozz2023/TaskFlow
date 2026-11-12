
const API = "/tarefas";
let categoriaAtual = "Todas";


const lista = document.getElementById("listaTarefas");
const form = document.getElementById("formTarefa");
const titulo = document.getElementById("titulo");
const mensagem = document.getElementById("mensagem");

// Consultar tarefas
async function carregarTarefas() {
    try {
        mensagem.textContent = "";

        const resposta = await fetch(API);

        if (!resposta.ok) {
            throw new Error("Erro ao consultar tarefas.");
        }

        
        const tarefas = await resposta.json();

        // ATUALIZAR ESTATÍSTICAS

        const total = tarefas.length;

        const concluidas = tarefas.filter(
            tarefa => tarefa.concluida === true
        ).length;

        const pendentes = total - concluidas;

        document.getElementById("totalTarefas").textContent = total;

        document.getElementById("tarefasPendentes").textContent = pendentes;

        document.getElementById("tarefasConcluidas").textContent = concluidas;


        const tarefasFiltradas = tarefas.filter(tarefa => {
            return categoriaAtual === "Todas" ||
                tarefa.categoria === categoriaAtual;
        });

        lista.replaceChildren();

        const estadoVazio = document.getElementById("estadoVazio");

        estadoVazio.hidden = tarefasFiltradas.length > 0;

        tarefasFiltradas.forEach(tarefa => {

            const li = document.createElement("li");

            
            const informacoes = document.createElement("div");
            informacoes.className = "informacoes-tarefa";

            // Título da tarefa
            const nome = document.createElement("span");
            nome.textContent = tarefa.titulo;

            if (tarefa.concluida) {
                nome.classList.add("concluida");
            }

            // Categoria da tarefa
            const categoriaTexto = document.createElement("small");
            categoriaTexto.className = "categoria-texto";

            const icones = {
                Pessoal: "🏠",
                Trabalho: "💼",
                Estudos: "📚"
            };

            const categoria = tarefa.categoria || "Pessoal";

            categoriaTexto.textContent =
                `${icones[categoria] || "📋"} ${categoria}`;

            informacoes.appendChild(nome);
            informacoes.appendChild(categoriaTexto);


            // Mostrar prioridade da tarefa
            const prioridade = tarefa.prioridade || "Media";

            const prioridadeTexto = document.createElement("span");

            prioridadeTexto.className =
                `etiqueta-prioridade prioridade-${prioridade.toLowerCase()}`;

            prioridadeTexto.textContent = {
                Baixa: "🟢 Baixa",
                Media: "🟡 Média",
                Alta: "🔴 Alta"
            }[prioridade] || "🟡 Média";

            informacoes.appendChild(prioridadeTexto);



            const acoes = document.createElement("div");
            acoes.className = "acoes";


            // Botão para editar tarefa
            const editar = document.createElement("button");

            editar.textContent = "✏️";
            editar.title = "Editar tarefa";
            editar.className = "botao-editar";

            editar.onclick = () => abrirEdicao(tarefa);

            acoes.appendChild(editar);


            if (!tarefa.concluida) {
                const concluir = document.createElement("button");
                concluir.textContent = "✓";
                concluir.title = "Concluir tarefa";
                concluir.onclick = () => concluirTarefa(tarefa.id);
                acoes.appendChild(concluir);
            }

            const excluir = document.createElement("button");
            excluir.textContent = "Excluir";
            excluir.className = "excluir";
            excluir.onclick = () => excluirTarefa(tarefa.id);
            acoes.appendChild(excluir);

            li.append(informacoes, acoes);
            lista.appendChild(li);
        });
    } catch (erro) {
        mensagem.textContent = erro.message;
    }
}


// CRIAR TAREFA

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const valor = titulo.value.trim();

    if (!valor) return;

    const seletorCategoria =
        document.getElementById("categoriaTarefa");

    // Se estiver dentro de uma categoria,
    // usamos essa categoria automaticamente.
    const categoriaSelecionada =
        categoriaAtual === "Todas"
            ? seletorCategoria.value
            : categoriaAtual;
    
    const prioridadeSelecionada =
        document.getElementById("prioridadeTarefa").value;


    try {
        const resposta = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                titulo: valor,
                categoria: categoriaSelecionada,
                prioridade: prioridadeSelecionada
            })

        });

        if (!resposta.ok) {
            const detalhe = await resposta.text();
            throw new Error(
                `Erro ao criar tarefa: ${detalhe}`
            );
        }

        titulo.value = "";

        // Atualizar tarefas e estatísticas
        await carregarTarefas();

        // Fechar formulário mobile
        form.classList.remove("aberto");

    } catch (erro) {
        mensagem.textContent = erro.message;
    }
});



// Concluir tarefa
async function concluirTarefa(id) {
    try {
        const resposta = await fetch(
            `${API}/${id}/concluir`,
            { method: "PUT" }
        );

        if (!resposta.ok) {
            throw new Error("Erro ao concluir tarefa.");
        }

        await carregarTarefas();
    } catch (erro) {
        mensagem.textContent = erro.message;
    }
}

// Excluir tarefa
async function excluirTarefa(id) {
    try {
        const resposta = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        if (!resposta.ok) {
            throw new Error("Erro ao excluir tarefa.");
        }

        await carregarTarefas();
    } catch (erro) {
        mensagem.textContent = erro.message;
    }
}

carregarTarefas();


// CONTROLO DO MODO ESCURO

const botaoTema = document.getElementById("botaoTema");

// Aplicar o tema selecionado
function aplicarTema(tema) {
    const escuro = tema === "dark";

    document.body.classList.toggle("dark", escuro);

    botaoTema.textContent = escuro
        ? "☀️ Modo Claro"
        : "🌙 Modo Escuro";

    botaoTema.setAttribute("aria-pressed", String(escuro));
}

// Recuperar tema guardado
const temaGuardado = localStorage.getItem("tema");

aplicarTema(temaGuardado === "dark" ? "dark" : "light");

// Alternar tema ao clicar no botão
botaoTema.addEventListener("click", () => {
    const temaAtual = document.body.classList.contains("dark");

    const novoTema = temaAtual ? "light" : "dark";

    aplicarTema(novoTema);
    localStorage.setItem("tema", novoTema);
});


// INTERAÇÕES MOBILE

const botaoMenu = document.getElementById("botaoMenu");
const menuLateral = document.getElementById("menuLateral");
const fecharMenu = document.getElementById("fecharMenu");
const overlayMenu = document.getElementById("overlayMenu");
const botaoFlutuante = document.getElementById("botaoFlutuante");
const formularioMobile = document.getElementById("formTarefa");

function alternarMenu(aberto) {
    menuLateral.classList.toggle("aberto", aberto);
    overlayMenu.classList.toggle("aberto", aberto);
}

botaoMenu.addEventListener("click", () => alternarMenu(true));
fecharMenu.addEventListener("click", () => alternarMenu(false));
overlayMenu.addEventListener("click", () => alternarMenu(false));

botaoFlutuante.addEventListener("click", () => {
    formularioMobile.classList.toggle("aberto");

    if (formularioMobile.classList.contains("aberto")) {
        document.getElementById("titulo").focus();
    }
});




// FILTROS DE CATEGORIAS

const botoesCategorias =
    document.querySelectorAll(".filtro-categoria");


const botaoTodas = document.querySelector(
    '.filtro-categoria[data-categoria="Todas"]'
);

if (botaoTodas) {
    botaoTodas.classList.add("ativo");
}


botoesCategorias.forEach(botao => {
    botao.addEventListener("click", async () => {

        categoriaAtual = botao.dataset.categoria;


        const seletorCategoria =
            document.getElementById("categoriaTarefa");

        // Sincronizar o formulário com o filtro selecionado
        if (categoriaAtual !== "Todas") {
            seletorCategoria.value = categoriaAtual;
        }


        // Destacar categoria selecionada
        botoesCategorias.forEach(b => {
            b.classList.remove("ativo");
        });

        botao.classList.add("ativo");

        // Atualizar o título da lista
        document.querySelector(".area-tarefas h2")
            .textContent = categoriaAtual === "Todas"
                ? "As minhas tarefas"
                : categoriaAtual;

        // Fechar menu lateral
        alternarMenu(false);

        // Recarregar tarefas
        await carregarTarefas();
    });
});


// EDIÇÃO DE TAREFAS

const modalEditar = document.getElementById("modalEditar");
const formEditar = document.getElementById("formEditar");
const editarTitulo = document.getElementById("editarTitulo");
const editarCategoria = document.getElementById("editarCategoria");
const cancelarEdicao = document.getElementById("cancelarEdicao");
const erroEdicao = document.getElementById("erroEdicao");

let tarefaEmEdicao = null;

// Abrir janela com os dados atuais
function abrirEdicao(tarefa) {
    tarefaEmEdicao = tarefa.id;

    editarTitulo.value = tarefa.titulo;
    editarCategoria.value = tarefa.categoria || "Pessoal";
    document.getElementById("editarPrioridade").value =
    tarefa.prioridade || "Media";

    erroEdicao.textContent = "";

    modalEditar.hidden = false;
    editarTitulo.focus();
}

// Fechar janela
function fecharEdicao() {
    modalEditar.hidden = true;
    tarefaEmEdicao = null;
}

cancelarEdicao.addEventListener("click", fecharEdicao);

// Fechar com a tecla ESC
document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !modalEditar.hidden) {
        fecharEdicao();
    }
});

// Salvar alterações
formEditar.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const novoTitulo = editarTitulo.value.trim();
    const novaCategoria = editarCategoria.value;
    const novaPrioridade =
        document.getElementById("editarPrioridade").value;


    if (!novoTitulo || tarefaEmEdicao === null) return;

    try {
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
                prioridade: novaPrioridade
                })

            }
        );

        if (!resposta.ok) {
            const detalhe = await resposta.text();
            throw new Error(`Erro ao editar: ${detalhe}`);
        }

        fecharEdicao();
        await carregarTarefas();

    } catch (erro) {
        erroEdicao.textContent = erro.message;
    }
});

