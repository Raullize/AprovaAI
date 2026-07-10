const path = require("node:path");
const dotenv = require("dotenv");
const request = require("supertest");

dotenv.config({
    path: path.resolve(__dirname, "../.env")
});
dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});

function loadFixtures() {
    return require("./fixtures/local.json");
}

const fixtures = loadFixtures();
const applicationBaseUrl = process.env.APPLICATION_BASE_URL || fixtures.application.baseUrl;

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
