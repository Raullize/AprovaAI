const { createPostRequest, createGetRequestWithAuth } = require("../../../functionalTestHelper");

describe("GET /simulations/history", () => {
    let studentToken;

    beforeAll(async () => {
        const loginResponse = await createPostRequest("/auth/login", {
            email: "estudante.functional@aprovaai.test",
            password: "Student@123"
        });
        studentToken = loginResponse.body.token;
    });

    it("deve retornar a lista do historico de simulados do usuario autenticado", async () => {
        const response = await createGetRequestWithAuth("/simulations/history", studentToken);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
