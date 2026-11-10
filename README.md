# Troca Audio

## Escolha de provedor e chave por aba

Transcrição e síntese de voz: Gemini ou OpenAI. DeepSeek não é oferecido para essas funções. Edição local, remoção/troca de faixa e exportação continuam independentes de qualquer chave.

Abra **Configurar provedores para transcrição e voz** e aplique cada perfil separadamente. O modelo de transcrição e o de síntese são distintos; ambos são editáveis. As vozes acompanham o provedor de síntese selecionado.

A chave pessoal permanece apenas na memória desta página, sem localStorage, sessionStorage, arquivos ou logs do aplicativo. Recarregar/fechar exige configurar novamente. O campo é limpo ao aplicar; apagar o perfil remove a chave e interrompe a espera local. A remoção não desfaz solicitações já enviadas. Alterar provedor invalida a configuração anterior; não há fallback, reaproveitamento automático da chave de outro serviço ou repetição após erro.

**Verificar configuração sem gerar** verifica somente formato, destino e presença da chave localmente. Não contata o provedor, não comprova validade, acesso ao modelo nem cota gratuita. A geração só ocorre por ação explícita e pode consumir créditos. Os modelos iniciais são exemplos editáveis; disponibilidade e limites dependem da conta.

Opcionalmente escolha a chave do servidor de forma explícita e configure a variável do provedor no `.env`: `GEMINI_API_KEY`, `DEEPSEEK_API_KEY` ou `OPENAI_API_KEY`. Modelos são selecionados pela interface. As variáveis Gemini de modelo continuam atendendo clientes antigos da API sem seleção de provedor. Não publique `.env` reais.

O backend usa destinos HTTPS fixos, valida origem e função, limita corpo/resposta e prazo, e encaminha a chave somente em header para o serviço escolhido. A chave não entra no prompt, URL ou resposta. Não são aceitas URLs arbitrárias. Hospedagem compartilhada exige HTTPS e autenticação de usuários; o servidor padrão é local.

Testes de integração usam transporte controlado, sem geração externa ou consumo de créditos. `store: false` na OpenAI não é uma garantia de retenção zero pelo provedor; consulte as políticas de cada serviço.

Referências: [visão DeepSeek](https://api-docs.deepseek.com/guides/vision/), [OpenAI áudio](https://developers.openai.com/api/docs/guides/audio), [OpenAI TTS/PCM](https://developers.openai.com/api/docs/guides/text-to-speech), [Gemini](https://ai.google.dev/gemini-api/docs).


Troca ou remoção de áudio de vídeos curtos no navegador, com transcrição e síntese Gemini opcionais. Autor: Waly Robert. Derivado do projeto do Google AI Studio; esta edição corrige codecs fixos, formato WAV e ciclo de vida de recursos.

## Executar

Node.js 22.16 ou superior. `npm ci`, depois `npm run dev`. Importar, substituir/remover áudio e exportar funcionam sem chave de IA em navegador compatível com Canvas captureStream, Web Audio e MediaRecorder.

Para transcrição/TTS, copie `.env.example` para `.env`, configure `GEMINI_API_KEY` no servidor e execute `npm run server` em outro terminal. Roteamento `/api` pelo Vite. Produção local: `npm run build`, `npm start`, endereço `http://127.0.0.1:3001`.

## Fluxo real e limites

- Vídeo local MP4, WebM ou MOV, até 100 MB, 60 segundos e 2,1 milhões de pixels. Contêiner não garante codec suportado. A importação apenas lê metadados: não reproduz nem extrai áudio automaticamente.
- Original: prepara download dos bytes originais, preservando o formato. Remoção/substituição: regrava vídeo via Canvas a até 30 FPS e MediaRecorder, em **WebM**, negociando VP9/Opus, VP8/Opus ou WebM conforme o navegador. Sem exportação MP4 reencodificada.
- Áudio substituto local de até 20 MB, decodificável pelo navegador. A faixa começa em zero, é cortada no fim do vídeo ou deixa silêncio se terminar antes. Prévia da faixa é separada; não há edição temporal, ajuste automático de duração ou lip-sync.
- Exportação e extração ocorrem em tempo real; mantenha a aba ativa. Qualidade, taxa efetiva de frames e sincronismo dependem do navegador e dispositivo. Cancelamento, erros e substituição de arquivos encerram streams, gravadores/contextos e URLs temporárias.
- Transcrição só é solicitada por botão. O áudio extraído (até 5 MB) é enviado ao Gemini pelo servidor com o MIME do contêiner efetivamente gravado, validado por assinatura. Sem fala ou áudio inteligível pode haver resposta sem transcrição útil.
- TTS usa até 2000 caracteres e vozes predefinidas. A resposta PCM16 mono, com taxa explícita, recebe cabeçalho RIFF/WAVE real; WAV recebido é validado por assinatura. Não há clonagem de identidade vocal. Modelos são configuráveis no servidor e dependem da disponibilidade/cota do provedor.

Arquivos locais ficam no navegador no fluxo de edição. Ao consultar transcrição ou TTS, áudio/texto são enviados ao provedor e podem consumir cota. Use material autorizado e não publique gravações pessoais como exemplos. A chave não integra o bundle. O servidor local não substitui autenticação, quotas e controle de custos numa implantação pública.

## Verificação

`npm test`, `npm run test:server`, `npm run build`. Testes cobrem negociação de codecs, limites, cancelamento, falha de reprodução, descarte tardio de URL e contratos de transcrição/TTS com respostas simuladas. O CI repete instalação, testes e build. Nenhuma chamada paga é necessária nos testes; não certificam qualidade da voz ou todos os codecs/hardwares.

Esta edição adapta a interface para execução fora do Studio; o projeto no Studio permanece separado. Licença de redistribuição do código ainda não definida pelo autor; dependências mantêm suas próprias licenças.


## Início e diagnóstico simplificados

Após `npm ci`, execute `npm run diagnostico` para verificar Node, dependências, build e presença de configuração sem revelar chaves ou consumir cota. Execute `npm run iniciar` para compilar a versão atual e abrir o servidor local em um único terminal. A faixa de estado da interface distingue configuração ausente e integração ainda não comprovada. Encontrar uma chave não confirma que ela é válida nem que existe cota gratuita. Nenhum teste de geração é iniciado automaticamente.

O botão **Usar vídeo de exemplo** carrega uma mídia sintética embutida, sem upload ou dependência de IA. No Troca Audio, **Usar tom de exemplo** permite testar a substituição da faixa localmente.

A exportação aguarda a preparação das faixas antes de iniciar o gravador. Diferença de duração acima de 250 ms ou 5% (o maior) bloqueia a entrega do arquivo e informa erro; mantenha a aba ativa. Esse limite não certifica sincronismo labial.


A síntese OpenAI solicita PCM16 mono a 24 kHz e o servidor monta WAV com cabeçalho real. A transcrição OpenAI envia multipart com MIME/extensão coerentes; o Gemini recebe áudio inline. Formatos inválidos e respostas incompletas são rejeitados, sem criar áudio fictício.
