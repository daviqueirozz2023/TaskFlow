
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configurar SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=taskflow.db"));

var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles();


// Corrigir prioridades vazias de tarefas antigas
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    var tarefasSemPrioridade = await db.Tarefas
        .Where(t => t.Prioridade == "" || t.Prioridade == null)
        .ToListAsync();

    foreach (var tarefa in tarefasSemPrioridade)
    {
        tarefa.Prioridade = "Media";
    }

    await db.SaveChangesAsync();
}


// GET - Consultar todas as tarefas
app.MapGet("/tarefas", async (AppDbContext db) =>
{
    return await db.Tarefas.ToListAsync();
});

// POST - Criar tarefa

app.MapPost("/tarefas", async (
    NovaTarefa dados,
    AppDbContext db) =>
{


    var prioridade = string.IsNullOrWhiteSpace(dados.Prioridade)
        ? "Media"
        : dados.Prioridade.Trim();

    string[] prioridadesValidas =
    {
        "Baixa",
        "Media",
        "Alta"
    };

    if (!prioridadesValidas.Contains(prioridade))
    {
        return Results.BadRequest("Prioridade inválida.");
    }


    if (string.IsNullOrWhiteSpace(dados.Titulo))
    {
        return Results.BadRequest(
            "O título é obrigatório."
        );
    }

    

    var categoria = string.IsNullOrWhiteSpace(dados.Categoria)
        ? "Pessoal"
        : dados.Categoria.Trim();

    string[] categoriasValidas =
    {
        "Pessoal",
        "Trabalho",
        "Estudos"
    };

    if (!categoriasValidas.Contains(categoria))
    {
        return Results.BadRequest(
            "Categoria inválida."
        );
    }

    
    var tarefa = new Tarefa
    {
        Titulo = dados.Titulo.Trim(),
        Categoria = categoria,
        Prioridade = prioridade,
        DataVencimento = dados.DataVencimento,
        Concluida = false
    };


    db.Tarefas.Add(tarefa);

    await db.SaveChangesAsync();

    return Results.Created(
        $"/tarefas/{tarefa.Id}",
        tarefa
    );
});


// PUT - Concluir tarefa
app.MapPut("/tarefas/{id}/concluir", async (
    int id,
    AppDbContext db) =>
{
    var tarefa = await db.Tarefas.FindAsync(id);

    if (tarefa == null)
        return Results.NotFound();

    tarefa.Concluida = true;
    await db.SaveChangesAsync();

    return Results.Ok(tarefa);
});

// DELETE - Eliminar tarefa
app.MapDelete("/tarefas/{id}", async (
    int id,
    AppDbContext db) =>
{
    var tarefa = await db.Tarefas.FindAsync(id);

    if (tarefa == null)
        return Results.NotFound();

    db.Tarefas.Remove(tarefa);
    await db.SaveChangesAsync();

    return Results.NoContent();
});


 // PUT - Editar título e categoria da tarefa
app.MapPut("/tarefas/{id:int}", async (
    int id,
    EditarTarefa dados,
    AppDbContext db) =>
{
    var tarefa = await db.Tarefas.FindAsync(id);

    if (tarefa == null)
    {
        return Results.NotFound("Tarefa não encontrada.");
    }

    if (string.IsNullOrWhiteSpace(dados.Titulo))
    {
        return Results.BadRequest("O título é obrigatório.");
    }

    string[] categoriasValidas =
    {
        "Pessoal",
        "Trabalho",
        "Estudos"
    };

    if (!categoriasValidas.Contains(dados.Categoria))
    {
        return Results.BadRequest("Categoria inválida.");
    }


    var prioridade = string.IsNullOrWhiteSpace(dados.Prioridade)
        ? "Media"
        : dados.Prioridade.Trim();

    string[] prioridadesValidas =
    {
        "Baixa",
        "Media",
        "Alta"
    };

    if (!prioridadesValidas.Contains(prioridade))
    {
        return Results.BadRequest("Prioridade inválida.");
    }


    tarefa.Titulo = dados.Titulo.Trim();
    tarefa.Categoria = dados.Categoria;
    tarefa.Prioridade = prioridade;
    tarefa.DataVencimento = dados.DataVencimento;

    await db.SaveChangesAsync();

    return Results.Ok(tarefa);
});


app.Run();

public class Tarefa
{
    public int Id { get; set; }
    public string Titulo { get; set; } = "";
    public bool Concluida { get; set; }
    public string Categoria { get; set; } = "Pessoal";
    public string Prioridade { get; set; } = "Media";
    public DateOnly? DataVencimento { get; set; }


}

public record NovaTarefa(
    string Titulo,
    string? Categoria,
    string? Prioridade,
    DateOnly? DataVencimento
);

public record EditarTarefa(
    string Titulo,
    string Categoria,
    string? Prioridade,
    DateOnly? DataVencimento
);



