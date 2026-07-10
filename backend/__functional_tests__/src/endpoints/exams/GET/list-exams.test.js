const { createGetRequest, prisma } = require("../../../functionalTestHelper");

describe("GET /exams", () => {
    let seededExamId;

    beforeAll(async () => {
        const exam = await prisma.exam.findFirst({
            where: { slug: "exame-funcional" }
        });
        seededExamId = exam.id;
    });

    it("deve retornar a lista de todos os exames cadastrados", async () => {
        const response = await createGetRequest("/exams");

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        const containsSeeded = response.body.some(ex => ex.id === seededExamId);
        expect(containsSeeded).toBe(true);
    });
});
