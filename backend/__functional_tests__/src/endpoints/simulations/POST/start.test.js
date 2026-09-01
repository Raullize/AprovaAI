const { createPostRequest, createPostRequestWithAuth, prisma } = require("../../../functionalTestHelper");

describe("POST /simulations/start", () => {
    let studentToken;
    let levelId;

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
    });

    it("deve iniciar um simulado com sucesso para um nivel valido", async () => {
        const response = await createPostRequestWithAuth("/simulations/start", {
            levelId: levelId
        }, studentToken);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.levelId).toBe(levelId);
        expect(response.body.status).toBe("IN_PROGRESS");
    });

    it("deve retornar 404 ao tentar iniciar um simulado com ID de nivel inexistente", async () => {
        const nonExistentLevelId = "00000000-0000-0000-0000-000000000000";
        const response = await createPostRequestWithAuth("/simulations/start", {
            levelId: nonExistentLevelId
        }, studentToken);

        expect(response.status).toBe(404);
    });

    it("deve retornar 401 ao tentar iniciar sem estar autenticado", async () => {
        const response = await createPostRequest("/simulations/start", {
            levelId: levelId
        });

        expect(response.status).toBe(401);
    });
});
