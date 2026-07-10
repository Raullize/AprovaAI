const path = require("node:path");
const dotenv = require("dotenv");
const request = require("supertest");

// Carrega variaveis do arquivo .env local do __functional_tests__ primeiro para ter precedencia
dotenv.config({
    path: path.resolve(__dirname, "../.env")
});

// Carrega variaveis do arquivo .env da raiz do backend apenas para preencher o que estiver faltando
dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});

function loadFixtures() {
    return require("./fixtures/local.json");
}

const fixtures = loadFixtures();

// O port padrao do AprovaAI e 3001
const applicationBaseUrl = process.env.APPLICATION_BASE_URL || fixtures.application.baseUrl;

// Resolucao absoluta do PrismaClient do backend para evitar problemas de inicializacao local
const prismaClientPath = path.resolve(__dirname, "../../node_modules/@prisma/client");
const { PrismaClient } = require(prismaClientPath);
const prisma = new PrismaClient();

function createGetRequest(resourcePath) {
    return request(applicationBaseUrl)
        .get(`/api${resourcePath}`)
        .set("Content-Type", "application/json");
}

function createGetRequestWithAuth(resourcePath, token) {
    return request(applicationBaseUrl)
        .get(`/api${resourcePath}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`);
}

function createPostRequest(resourcePath, payload) {
    return request(applicationBaseUrl)
        .post(`/api${resourcePath}`)
        .set("Content-Type", "application/json")
        .send(payload);
}

function createPostRequestWithAuth(resourcePath, payload, token) {
    return request(applicationBaseUrl)
        .post(`/api${resourcePath}`)
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);
}

module.exports = {
    fixtures,
    applicationBaseUrl,
    prisma,
    createGetRequest,
    createGetRequestWithAuth,
    createPostRequest,
    createPostRequestWithAuth
};
