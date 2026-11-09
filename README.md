# Troca Audio

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
