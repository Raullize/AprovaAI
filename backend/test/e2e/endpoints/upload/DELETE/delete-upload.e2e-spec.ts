import supertest from 'supertest';
import { createPostRequest, applicationBaseUrl } from '../../../helpers/testHelper';

const PNG_1PX_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('DELETE /upload/:filename', () => {
  let adminToken: string;
  let studentToken: string;
  let uploadedFilename: string;

  beforeAll(async () => {
    const adminLogin = await createPostRequest('/auth/login', {
      email: 'admin.functional@aprovaai.test',
      password: 'Admin@123',
    });
    adminToken = adminLogin.body.token;

    const studentLogin = await createPostRequest('/auth/login', {
      email: 'estudante.functional@aprovaai.test',
      password: 'Student@123',
    });
    studentToken = studentLogin.body.token;

    const uploadRes = await supertest(applicationBaseUrl)
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', PNG_1PX_BUFFER, {
        filename: 'delete-teste.png',
        contentType: 'image/png',
      });
    uploadedFilename = uploadRes.body.url.split('/').pop();
  });

  afterAll(async () => {
    if (uploadedFilename) {
      await supertest(applicationBaseUrl)
        .delete(`/api/upload/${uploadedFilename}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
  });

  it('deleta imagem com admin', async () => {
    const filename = uploadedFilename;
    const response = await supertest(applicationBaseUrl)
      .delete(`/api/upload/${filename}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Arquivo deletado com sucesso');
    uploadedFilename = '';
  });

  it('retorna 403 para estudante (role STUDENT)', async () => {
    const response = await supertest(applicationBaseUrl)
      .delete('/api/upload/arquivo-inexistente.png')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(403);
  });
});