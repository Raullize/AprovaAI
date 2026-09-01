const { createPostRequest } = require("../../../functionalTestHelper");

describe("POST /auth/register", () => {
    const uniqueSuffix = Date.now();
    const newStudentEmail = `novo.estudante.${uniqueSuffix}.functional@aprovaai.test`;
    const newStudentUsername = `u_${uniqueSuffix}`;

    it("deve registrar um novo estudante com sucesso", async () => {
        const response = await createPostRequest("/auth/register", {
            fullName: "Novo Estudante Funcional",
            username: newStudentUsername,
            email: newStudentEmail,
            password: "Password@123",
            dateOfBirth: "2000-01-01"
        });

        expect(response.status).toBe(201);
        expect(response.body.email).toBe(newStudentEmail);
        expect(response.body.username).toBe(newStudentUsername);
    });

    it("deve retornar 400 se tentar registrar com e-mail duplicado", async () => {
        const response = await createPostRequest("/auth/register", {
            fullName: "Estudante Duplicado",
            username: `dup_${uniqueSuffix}`,
            email: newStudentEmail,
            password: "Password@123",
            dateOfBirth: "2000-01-01"
        });

        expect(response.status).toBe(400);
    });
});
