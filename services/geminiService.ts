export async function callAudioService(payload:unknown,signal:AbortSignal){
 const response=await fetch('/api/analyze',{method:'POST',signal:AbortSignal.any([signal,AbortSignal.timeout(50000)]),headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const body=await response.json();if(!response.ok)throw Error(body.error||'Falha na consulta de áudio.');return body;
}
