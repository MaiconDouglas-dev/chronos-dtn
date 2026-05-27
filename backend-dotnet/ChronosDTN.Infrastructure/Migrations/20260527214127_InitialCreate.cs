using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChronosDTN.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NOS_SATELLITES",
                columns: table => new
                {
                    ID = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NOME = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    ENDERECO_IP = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    PORTA = table.Column<int>(type: "INTEGER", nullable: false),
                    STATUS = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    CRIADO_EM = table.Column<long>(type: "INTEGER", nullable: false),
                    ATUALIZADO_EM = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NOS_SATELLITES", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "OPERADORAS_AERO",
                columns: table => new
                {
                    ID = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NOME = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    CODIGO = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OPERADORAS_AERO", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "TRANSACOES_AUDITADAS",
                columns: table => new
                {
                    ID = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PACOTE_ID = table.Column<long>(type: "INTEGER", nullable: false),
                    OPERADORA_ID = table.Column<long>(type: "INTEGER", nullable: false),
                    ACAO = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    DATA_HORA = table.Column<long>(type: "INTEGER", nullable: false),
                    DETALHES = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TRANSACOES_AUDITADAS", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "FILA_PACOTES_DTN",
                columns: table => new
                {
                    ID = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PAYLOAD = table.Column<string>(type: "TEXT", nullable: false),
                    NO_ORIGEM_ID = table.Column<long>(type: "INTEGER", nullable: false),
                    NO_DESTINO_ID = table.Column<long>(type: "INTEGER", nullable: false),
                    OPERADORA_ID = table.Column<long>(type: "INTEGER", nullable: false),
                    TAMANHO = table.Column<long>(type: "INTEGER", nullable: false),
                    DATA_CRIACAO = table.Column<long>(type: "INTEGER", nullable: false),
                    DATA_EXPIRACAO = table.Column<long>(type: "INTEGER", nullable: false),
                    STATUS = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FILA_PACOTES_DTN", x => x.ID);
                    table.ForeignKey(
                        name: "FK_FILA_PACOTES_DTN_OPERADORAS_AERO_OPERADORA_ID",
                        column: x => x.OPERADORA_ID,
                        principalTable: "OPERADORAS_AERO",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FILA_PACOTES_DTN_OPERADORA_ID",
                table: "FILA_PACOTES_DTN",
                column: "OPERADORA_ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FILA_PACOTES_DTN");

            migrationBuilder.DropTable(
                name: "NOS_SATELLITES");

            migrationBuilder.DropTable(
                name: "TRANSACOES_AUDITADAS");

            migrationBuilder.DropTable(
                name: "OPERADORAS_AERO");
        }
    }
}
