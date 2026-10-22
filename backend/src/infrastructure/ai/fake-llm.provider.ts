import {
  LlmGenerateRequest,
  LlmGenerateResult,
  LlmProvider,
} from '../../application/ai/ports/llm-provider';

const DEMO_REPLY =
  'Estou em modo de demonstração porque a chave do Gemini não está configurada. ' +
  'Assim que a integração estiver ativa, posso tirar suas dúvidas sobre os conteúdos e sobre como usar o AprovaAI.';

export class FakeLlmProvider extends LlmProvider {
  generate(request: LlmGenerateRequest): Promise<LlmGenerateResult> {
    void request;
    return Promise.resolve({ text: DEMO_REPLY });
  }
}
