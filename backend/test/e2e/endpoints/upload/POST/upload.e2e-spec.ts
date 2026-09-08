import supertest from 'supertest';
import { createPostRequest, applicationBaseUrl } from '../../../helpers/testHelper';

const PNG_1PX_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('POST /upload', () => {
  let adminToken: string;
  let uploadedFilename: string;

  beforeAll(async () => {
    const adminLogin = await createPostRequest('/auth/login', {
      email: 'admin.functional@aprovaai.test',
      password: 'Admin@123',
    });
    adminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    if (uploadedFilename) {
      await supertest(applicationBaseUrl)
        .delete(`/api/upload/${uploadedFilename}`)
        .set('Authorization', `Bearer ${adminToken}`);
      uploadedFilename = '';
    }
  });

  it('faz upload de imagem autenticado e retorna a url', async () => {
    const response = await supertest(applicationBaseUrl)
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', PNG_1PX_BUFFER, {
        filename: 'imagem-teste.png',
        contentType: 'image/png',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('url');
    expect(response.body.url).toContain('/uploads/questions/');
    uploadedFilename = response.body.url.split('/').pop();
  });

  it('retorna 401 sem token', async () => {
    const response = await supertest(applicationBaseUrl).post('/api/upload');

    expect(response.status).toBe(401);
  });

  it('rejeita tipo de arquivo nao suportado', async () => {
    const response = await supertest(applicationBaseUrl)
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('nao sou uma imagem'), {
        filename: 'arquivo.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(400);
  });
});