using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Projeto_TaskFlow.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarDataVencimento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "DataVencimento",
                table: "Tarefas",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataVencimento",
                table: "Tarefas");
        }
    }
}
