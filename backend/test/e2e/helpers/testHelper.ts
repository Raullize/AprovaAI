import path from 'node:path';
import dotenv from 'dotenv';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const fixtures = {
  application: {
    baseUrl: process.env.APPLICATION_BASE_URL || 'http://localhost:3001',
  },
};

export const applicationBaseUrl =
  process.env.APPLICATION_BASE_URL || fixtures.application.baseUrl;

export const prisma = new PrismaClient();

const API_PREFIX = '/api';

export function createGetRequest(resourcePath: string) {
  return supertest(applicationBaseUrl)
    .get(`${API_PREFIX}${resourcePath}`)
    .set('Content-Type', 'application/json');
}

export function createGetRequestWithAuth(resourcePath: string, token: string) {
  return supertest(applicationBaseUrl)
    .get(`${API_PREFIX}${resourcePath}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`);
}

export function createPostRequest(resourcePath: string, payload: unknown) {
  return supertest(applicationBaseUrl)
    .post(`${API_PREFIX}${resourcePath}`)
    .set('Content-Type', 'application/json')
    .send(payload);
}

export function createPostRequestWithAuth(
  resourcePath: string,
  payload: unknown,
  token: string,
) {
  return supertest(applicationBaseUrl)
    .post(`${API_PREFIX}${resourcePath}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);
}

export function createPatchRequestWithAuth(
  resourcePath: string,
  payload: unknown,
  token: string,
) {
  return supertest(applicationBaseUrl)
    .patch(`${API_PREFIX}${resourcePath}`)
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);
}

export function createDeleteRequestWithAuth(resourcePath: string, token: string) {
  return supertest(applicationBaseUrl)
    .delete(`${API_PREFIX}${resourcePath}`)
    .set('Authorization', `Bearer ${token}`);
}
