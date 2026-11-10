# Segurança e privacidade

Use vídeos e áudios autorizados. O fluxo local não envia arquivos; transcrição/TTS opcionais enviam áudio ou texto ao Gemini pelo servidor. Não publique `.env`, chaves ou gravações privadas.

O servidor de demonstração escuta em loopback. Implantações públicas exigem autenticação, quotas e controle de custos. Arquivos de mídia não confiáveis podem consumir memória ou explorar falhas do decodificador do navegador; mantenha-o atualizado e respeite os limites. Relate problemas com mídia sintética sem dados pessoais.


Chaves pessoais da interface são temporárias e não são gravadas pelo aplicativo. Não registre headers de autenticação no proxy. Cada perfil usa seu provedor e não tem fallback para outra chave. Apagar a configuração não desfaz consultas já enviadas. Em hospedagem pública, proteja o gateway com autenticação e limites de uso.
