const { createPostRequest, createPostRequestWithAuth, prisma } = require("../../../functionalTestHelper");

describe("POST /simulations/:id/answers", () => {
    let studentToken;
    let levelId;
    let questionId;
    let correctOptionId;
    let incorrectOptionId;
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

        const incorrectOption = await prisma.option.findFirst({
            where: { questionId: questionId, isCorrect: false }
        });
        incorrectOptionId = incorrectOption.id;
    });

    beforeEach(async () => {
        const response = await createPostRequestWithAuth("/simulations/start", {
            levelId: levelId
        }, studentToken);
        simulationId = response.body.id;
    });

    it("deve registrar a resposta correta de uma questao no simulado", async () => {
        const response = await createPostRequestWithAuth(
            `/simulations/${simulationId}/answers`,
            {
                questionId: questionId,
                selectedOptions: [correctOptionId],
                timeSpent: 10,
                isFlaggedForReview: false
            },
            studentToken
        );

        expect(response.status).toBe(201);
        expect(response.body.isCorrect).toBe(true);
        expect(response.body.questionId).toBe(questionId);
    });

    it("deve registrar a resposta incorreta de uma questao no simulado", async () => {
        const response = await createPostRequestWithAuth(
            `/simulations/${simulationId}/answers`,
            {
                questionId: questionId,
                selectedOptions: [incorrectOptionId],
                timeSpent: 15,
                isFlaggedForReview: true
            },
            studentToken
        );

        expect(response.status).toBe(201);
        expect(response.body.isCorrect).toBe(false);
        expect(response.body.isFlaggedForReview).toBe(true);
    });

    it("deve retornar 400 se tentar responder com corpo de dados incompleto", async () => {
        const response = await createPostRequestWithAuth(
            `/simulations/${simulationId}/answers`,
            {
                questionId: questionId
            },
            studentToken
        );

        expect(response.status).toBe(400);
    });
});
