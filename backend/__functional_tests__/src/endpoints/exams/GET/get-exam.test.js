const { createGetRequest, prisma } = require("../../../functionalTestHelper");

describe("GET /exams/:idOrSlug", () => {
    let seededExamId;
    let seededExamSlug;

    beforeAll(async () => {
        const exam = await prisma.exam.findFirst({
            where: { slug: "exame-funcional" }
        });
        seededExamId = exam.id;
        seededExamSlug = exam.slug;
    });

    it("deve buscar os detalhes de um exame por ID", async () => {
        const response = await createGetRequest(`/exams/${seededExamId}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(seededExamId);
        expect(response.body.name).toBe("Exame Funcional");
    });

    it("deve buscar os detalhes de um exame por Slug", async () => {
        const response = await createGetRequest(`/exams/${seededExamSlug}`);

        expect(response.status).toBe(200);
        expect(response.body.slug).toBe(seededExamSlug);
    });

    it("deve retornar 404 para ID ou Slug nao cadastrados", async () => {
        const response = await createGetRequest("/exams/slug-inexistente-123");

        expect(response.status).toBe(404);
    });
});
