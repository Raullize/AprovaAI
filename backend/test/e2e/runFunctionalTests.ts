import { spawnSync } from 'node:child_process';
import { applicationBaseUrl } from './helpers/testHelper';

const BACKEND_ROOT = process.cwd();

function runCommand(
  command: string,
  args: string[],
  cwd: string = BACKEND_ROOT,
) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

async function waitForApplicationReadiness() {
  const readinessUrl = `${applicationBaseUrl}/api/health`;
  const maximumAttempts = 30;

  console.log(`Aguardando prontidao da aplicacao em: ${readinessUrl}`);

  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      const response = await fetch(readinessUrl);

      if (response.ok) {
        console.log('Aplicacao pronta para receber os testes funcionais.');
        return;
      }
    } catch (error) {
      if (attempt === maximumAttempts) {
        throw error;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('A aplicacao nao ficou pronta para os testes funcionais.');
}

let jestExitCode = 1;

async function runFunctionalSuite() {
  await waitForApplicationReadiness();

  const seedExitCode = runCommand(
    'npx',
    ['tsx', 'test/e2e/seed.ts'],
    BACKEND_ROOT,
  );

  if (seedExitCode !== 0) {
    console.error('Falha ao rodar o seed. Abortando testes.');
    process.exit(seedExitCode);
  }

  try {
    jestExitCode = runCommand(
      'npx',
      ['jest', '--config', 'test/jest-e2e.json', '--runInBand'],
      BACKEND_ROOT,
    );
  } finally {
    console.log('Iniciando rollback da base de dados...');
    runCommand('npx', ['tsx', 'test/e2e/rollback.ts'], BACKEND_ROOT);
  }

  process.exit(jestExitCode);
}

void runFunctionalSuite().catch((error) => {
  console.error('Falha ao executar a suite funcional:', error);
  process.exit(1);
});
