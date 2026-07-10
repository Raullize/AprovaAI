const { createPostRequest, createPostRequestWithAuth, prisma } = require("../../../functionalTestHelper");

describe("POST /simulations/:id/finish", () => {
    let studentToken;
    let levelId;
    let questionId;
    let correctOptionId;
    let simulationId;

    beforeAll(async () => {
        const loginResponse = await createPostRequest("/auth/login", {
            email: "estudante.functional@aprovaai.test",
            password: "Student@123"
        });
        studentToken = loginResponse.body.token;

        const level = await prisma.level.findFirst({
            where: { slug: "nivel-funcional" }
        });
        levelId = level.id;

        const question = await prisma.question.findFirst({
            where: { levelId: levelId }
        });
        questionId = question.id;

        const correctOption = await prisma.option.findFirst({
            where: { questionId: questionId, isCorrect: true }
        });
        correctOptionId = correctOption.id;
    });

    beforeEach(async () => {
        const response = await createPostRequestWithAuth("/simulations/start", {
            levelId: levelId
        }, studentToken);
        simulationId = response.body.id;
    });

    it("deve finalizar o simulado e calcular o desempenho obtido", async () => {
        // Responde a questao corretamente
        await createPostRequestWithAuth(
            `/simulations/${simulationId}/answers`,
            {
                questionId: questionId,
                selectedOptions: [correctOptionId],
                timeSpent: 20
            },
            studentToken
        );

        // Finaliza o simulado
        const response = await createPostRequestWithAuth(
            `/simulations/${simulationId}/finish`,
            {
                timeSpent: 20
            },
            studentToken
        );

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("xpGained");
        expect(response.body.examResult.status).toBe("COMPLETED");
        expect(response.body.examResult.passed).toBe(true);
        expect(response.body.examResult.score).toBe(1);
    });
});
