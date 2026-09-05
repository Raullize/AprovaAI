import {
  createPostRequest,
  createPostRequestWithAuth,
  createDeleteRequestWithAuth,
  prisma,
} from '../../../helpers/testHelper';

describe('DELETE /questions/:id', () => {
  let adminToken: string;
  let simulationId: string;
  let createdQuestionId: string;

  beforeAll(async () => {
    const adminLogin = await createPostRequest('/auth/login', {
      email: 'admin.functional@aprovaai.test',
      password: 'Admin@123',
    });
    adminToken = adminLogin.body.token;

    const simulation = await prisma.simulation.findFirst({
      where: { slug: 'simulado-funcional' },
    });
    if (!simulation) throw new Error('Seed funcional nao preparou simulado');
    simulationId = simulation.id;

    const createRes = await createPostRequestWithAuth(
      '/questions',
      {
        content: 'Questao smoke test delete',
        type: 'SINGLE_CHOICE',
        simulationId,
        explanation: 'Explicacao delete smoke',
        options: [
          { text: 'Alternativa Certa', isCorrect: true },
          { text: 'Alternativa Errada', isCorrect: false },
        ],
      },
      adminToken,
    );
    createdQuestionId = createRes.body.id;
  });

  it('apaga questao com admin', async () => {
    const deleteRes = await createDeleteRequestWithAuth(
      `/questions/${createdQuestionId}`,
      adminToken,
    );
    expect(deleteRes.status).toBe(200);
    createdQuestionId = '';
  });
});
