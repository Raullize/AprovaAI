const { createPostRequest } = require("../../../functionalTestHelper");

describe("POST /auth/login", () => {
    it("deve autenticar o estudante com credenciais validas e retornar o token", async () => {
        const response = await createPostRequest("/auth/login", {
            email: "estudante.functional@aprovaai.test",
            password: "Student@123"
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
        expect(typeof response.body.token).toBe("string");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user.email).toBe("estudante.functional@aprovaai.test");
    });

    it("deve retornar 401 para credenciais invalidas", async () => {
        const response = await createPostRequest("/auth/login", {
            email: "estudante.functional@aprovaai.test",
            password: "senha-incorreta"
        });

        expect(response.status).toBe(401);
    });

    it("deve retornar 400 se os dados de entrada forem invalidos", async () => {
        const response = await createPostRequest("/auth/login", {
            email: "email-invalido"
        });

        expect(response.status).toBe(400);
    });
});
