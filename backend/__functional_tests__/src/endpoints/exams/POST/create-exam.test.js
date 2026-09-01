const { createPostRequest, createPostRequestWithAuth, prisma } = require("../../../functionalTestHelper");

describe("POST /exams", () => {
    let studentToken;
    let adminToken;

    beforeAll(async () => {
        const studentLogin = await createPostRequest("/auth/login", {
            email: "estudante.functional@aprovaai.test",
            password: "Student@123"
        });
        studentToken = studentLogin.body.token;

        const adminLogin = await createPostRequest("/auth/login", {
            email: "admin.functional@aprovaai.test",
            password: "Admin@123"
        });
        adminToken = adminLogin.body.token;
    });

    it("deve permitir que o administrador crie um novo exame", async () => {
        const response = await createPostRequestWithAuth("/exams", {
            name: "Exame Adicional Funcional",
            slug: "exame-adicional-funcional",
            description: "Descricao adicional",
            status: "ACTIVE",
            category: "OUTROS",
            order: 2
        }, adminToken);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.slug).toBe("exame-adicional-funcional");

        // Limpa o registro criado para manter o banco consistente
        await prisma.exam.delete({
            where: { id: response.body.id }
        });
    });

    it("deve recusar a criacao de exame por um usuario nao-administrador", async () => {
        const response = await createPostRequestWithAuth("/exams", {
            name: "Exame Proibido",
            slug: "exame-proibido",
            category: "OUTROS"
        }, studentToken);

        expect(response.status).toBe(403);
    });
});
