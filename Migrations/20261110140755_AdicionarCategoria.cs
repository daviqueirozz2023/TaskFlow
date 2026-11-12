using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Projeto_TaskFlow.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarCategoria : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Tarefas",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Tarefas");
        }
    }
}
