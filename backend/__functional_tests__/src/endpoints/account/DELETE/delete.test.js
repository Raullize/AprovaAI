const request = require("supertest");
const { createPostRequest, applicationBaseUrl } = require("../../../functionalTestHelper");

describe("DELETE /account", () => {
    let tempUserToken;
    const uniqueSuffix = Date.now();
    const tempEmail = `account.temp.delete.${uniqueSuffix}.functional@aprovaai.test`;
    const tempUsername = `u_del_${uniqueSuffix}`;

    beforeAll(async () => {
        const registerResponse = await createPostRequest("/auth/register", {
            fullName: "Usuario Delete Temporario",
            username: tempUsername,
            email: tempEmail,
            password: "Password@123",
            dateOfBirth: "1995-05-15"
        });

        const loginResponse = await createPostRequest("/auth/login", {
            email: tempEmail,
            password: "Password@123"
        });
        tempUserToken = loginResponse.body.token;
    });

    it("deve excluir a conta com sucesso usando DELETE", async () => {
        const response = await request(applicationBaseUrl)
            .delete("/api/account")
            .set("Authorization", `Bearer ${tempUserToken}`);

        expect(response.status).toBe(200);

        // Validar que o perfil nao e mais retornado (pois o usuario foi excluido)
        const profileResponse = await request(applicationBaseUrl)
            .get("/api/account/profile")
            .set("Authorization", `Bearer ${tempUserToken}`);

        expect(profileResponse.status).toBe(200);
        expect(profileResponse.body.email).toBeUndefined();
    });
});
