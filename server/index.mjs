import {resolveAI,generateText,AIError,checkOrigin} from './textProviders.mjs';
import {handleAIConfig} from './aiConfig.mjs';
import {generateSpeech,transcribeAudio} from './audioProviders.mjs';
import {OPENAI_VOICES} from '../utils/aiProviders.mjs';
import {createServer} from 'node:http';import {readFile,stat} from 'node:fs/promises';import {resolve,sep,extname} from 'node:path';import {fileURLToPath} from 'node:url';
import {audioResponseToWav,sniffAudio} from '../utils/audio.mjs';
const dist=fileURLToPath(new URL('../dist/',import.meta.url));
export const voices=['Zephyr','Puck','Charon','Kore','Fenrir'];
export function validateInput(input){
 if(!input||!['transcribe','speech'].includes(input.action))throw Error('Ação inválida.');
 if(input.action==='speech'){if(typeof input.text!=='string'||!input.text.trim()||input.text.length>2000||![...voices,...OPENAI_VOICES].includes(input.voice))throw Error('Texto (até 2000 caracteres) ou voz inválidos.');}
 else if(!input.reference)throw Error('Áudio de transcrição ausente.');
 if(input.reference){
  if(input.action!=='transcribe'||typeof input.reference.data!=='string'||input.reference.data.length>7000000||!/^[A-Za-z0-9+/]*={0,2}$/.test(input.reference.data))throw Error('Referência inválida.');
  const bytes=Buffer.from(input.reference.data,'base64');if(bytes.toString('base64')!==input.reference.data||!bytes.length||bytes.length>5*1024*1024||sniffReference(bytes)!==input.reference.mimeType)throw Error('Referência: use WAV ou MP3 de até 5 MB, com formato correto.');
 }
 return input;
}
export function sniffReference(bytes){
 const text=(a,b)=>bytes.subarray(a,b).toString();
 if(bytes.length>=4&&bytes.subarray(0,4).toString('hex')==='1a45dfa3')return 'audio/webm';
 if(text(0,4)==='OggS')return 'audio/ogg';
 if(bytes.length>=12&&text(4,8)==='ftyp')return 'audio/mp4';
 return sniffAudio(bytes);
}
export function createApp({key=process.env.GEMINI_API_KEY,model=process.env.GEMINI_MODEL||'gemini-2.5-flash',ttsModel=process.env.GEMINI_TTS_MODEL||'gemini-2.5-flash-preview-tts',request=fetch,allowedOrigin=process.env.ALLOWED_ORIGIN||'http://127.0.0.1:5173'}={}){
 if(![model,ttsModel].every(m=>/^[a-zA-Z0-9._-]+$/.test(m)))throw Error('Modelo inválido.');let busy=false;
 return createServer(async(req,res)=>{
  const send=(status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(data));},route=(req.url||'/').split('?')[0];
  if(route==='/api/health'&&req.method==='GET')return send(200,{configured:Boolean(key)});
  if(route==='/api/ai/config'&&req.method==='POST')return handleAIConfig(req,res,{key,model,allowedOrigin,capabilities:['transcription','speech']});
  if(route==='/api/analyze'&&req.method==='POST'){
   if(!checkOrigin(req,allowedOrigin))return send(403,{error:'Origem não autorizada.'});
   if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'Envie JSON.'});if(busy)return send(429,{error:'Uma geração já está em andamento.'});busy=true;
   try{
    const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>8*1024*1024)return send(413,{error:'Solicitação muito grande.'});chunks.push(chunk);}
    let input,selected;try{const raw=JSON.parse(Buffer.concat(chunks).toString('utf8'));input=validateInput(raw);selected=resolveAI(raw.ai,req.headers['x-ai-key'],{key,model:raw.action==='speech'?ttsModel:model});}catch(e){return send(e instanceof AIError?e.status:400,{error:e instanceof SyntaxError?'JSON inválido.':e.message});}
    try{return send(200,input.action==='speech'?await generateSpeech(selected,input.text,input.voice,request):await transcribeAudio(selected,input.reference,request));}catch(e){return send(e instanceof AIError?e.status:502,{error:e instanceof AIError?e.message:'Resposta de áudio inválida.',code:e instanceof AIError?e.code:'AI_FAILURE'});}
   }finally{busy=false;}
  }
  if(route.startsWith('/api/'))return send(404,{error:'Rota não encontrada.'});if(!['GET','HEAD'].includes(req.method))return send(405,{error:'Método não permitido.'});
  try{const path=resolve(dist,'.'+decodeURIComponent(route==='/'?'/index.html':route));if(!path.startsWith(resolve(dist)+sep)||!(await stat(path)).isFile())return send(404,{error:'Arquivo não encontrado.'});const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};res.writeHead(200,{'content-type':types[extname(path)]||'application/octet-stream','x-content-type-options':'nosniff'});res.end(req.method==='HEAD'?undefined:await readFile(path));}catch{return send(404,{error:'Execute npm run build.'});}
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))createApp().listen(Number(process.env.PORT||3001),'127.0.0.1',()=>console.log('Aplicação: http://127.0.0.1:'+(process.env.PORT||3001)));
