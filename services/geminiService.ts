import {requestAI,type AISettings} from './aiClient';
export async function callAudioService(payload:object,signal:AbortSignal,settings:AISettings){return requestAI(payload,settings,signal);}
