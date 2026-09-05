import { createPostRequest } from '../../helpers/testHelper';

describe('POST /auth/register', () => {
  const uniqueSuffix = Date.now();
  const newStudentEmail = `novo.estudante.${uniqueSuffix}.functional@aprovaai.test`;
  const newStudentUsername = `u_${uniqueSuffix}`;

  it('deve registrar um novo estudante com sucesso', async () => {
    const response = await createPostRequest('/auth/register', {
      fullName: 'Novo Estudante Funcional',
      username: newStudentUsername,
      email: newStudentEmail,
      password: 'Password@123',
      dateOfBirth: '2000-01-01',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(typeof response.body.id).toBe('string');
    expect(response.body.fullName).toBe('Novo Estudante Funcional');
    expect(response.body.username).toBe(newStudentUsername);
    expect(response.body.email).toBe(newStudentEmail);
    expect(response.body).toHaveProperty('dateOfBirth');
    expect(response.body.role).toBe('STUDENT');
    expect(response.body).toHaveProperty('subscriptionPlan');
    expect(typeof response.body.subscriptionPlan).toBe('string');
    expect(typeof response.body.xp).toBe('number');
  });

  it('deve retornar 400 se tentar registrar com e-mail duplicado', async () => {
    const response = await createPostRequest('/auth/register', {
      fullName: 'Estudante Duplicado',
      username: `dup_${uniqueSuffix}`,
      email: newStudentEmail,
      password: 'Password@123',
      dateOfBirth: '2000-01-01',
    });

    expect(response.status).toBe(400);
  });
});
