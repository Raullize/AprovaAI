const request = require("supertest");
const { createPostRequest, applicationBaseUrl } = require("../../../functionalTestHelper");

describe("PATCH /account/profile", () => {
    let tempUserToken;
    const uniqueSuffix = Date.now();
    const tempEmail = `account.temp.patch.${uniqueSuffix}.functional@aprovaai.test`;
    const tempUsername = `u_pat_${uniqueSuffix}`;

    beforeAll(async () => {
        await createPostRequest("/auth/register", {
            fullName: "Usuario Patch Temporario",
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

    it("deve atualizar o perfil usando PATCH", async () => {
        const response = await request(applicationBaseUrl)
            .patch("/api/account/profile")
            .set("Authorization", `Bearer ${tempUserToken}`)
            .send({
                fullName: "Nome Atualizado Funcional",
                username: `${tempUsername}_new`,
                email: tempEmail
            });

        expect(response.status).toBe(200);
        expect(response.body.fullName).toBe("Nome Atualizado Funcional");
        expect(response.body.username).toBe(`${tempUsername}_new`);
    });
});
