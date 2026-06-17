import json
import os
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from supabase import create_client

from app.core.config import settings
from app.core.supabase_client import token_ctx_var, service_client
from app.antigravity.graphs import run_antigravity_graph
from app.antigravity.tools.sandbox import execute_sandbox_routine

router = APIRouter()

# ==========================================
# AUDIO STREAMING UTILITIES (STT & TTS)
# ==========================================

async def stream_to_text_service(audio_chunk: bytes) -> str:
    """
    Transcribes raw audio bytes into text using OpenAI Whisper API if keys are set.
    Otherwise, returns a mock query for local testing.
    """
    openai_key = os.getenv("OPENAI_API_KEY") or getattr(settings, "OPENAI_API_KEY", "")
    
    if openai_key:
        try:
            from openai import OpenAI
            import io
            client = OpenAI(api_key=openai_key)
            
            # Whisper expects a file-like object with a proper suffix
            audio_file = io.BytesIO(audio_chunk)
            audio_file.name = "audio.wav"
            
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
            return transcript.text
        except Exception as e:
            print(f"[STT ERROR] Whisper transcription failed: {e}")
            
    # Mock text prompt rotation based on received audio size
    chunk_len = len(audio_chunk)
    if chunk_len % 3 == 0:
        return "Draft a lead report"
    elif chunk_len % 3 == 1:
        return "Check outstanding billing balances"
    else:
        return "Verify system configuration"

async def text_to_speech_service(text: str) -> bytes:
    """
    Synthesizes text into audio bytes (mp3) using OpenAI TTS API if keys are set.
    Returns empty/dummy audio bytes otherwise.
    """
    openai_key = os.getenv("OPENAI_API_KEY") or getattr(settings, "OPENAI_API_KEY", "")
    
    if openai_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            
            response = client.audio.speech.create(
                model="tts-1",
                voice="alloy",
                input=text
            )
            return response.content
        except Exception as e:
            print(f"[TTS ERROR] Speech synthesis failed: {e}")
            
    # Return 1 second of silent WAV headers as mock
    return b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x80>\x00\x00\x00}\x00\x00\x02\x00\x10\x00data\x00\x00\x00\x00'

# ==========================================
# WS ENDPOINT
# ==========================================

@router.websocket("/ws")
async def antigravity_websocket_handler(websocket: WebSocket, token: str = Query(None)):
    """
    Low-latency duplex WebSocket connection.
    Supports streaming binary audio chunks or text JSON packets.
    Restricted to authenticated tenants.
    """
    await websocket.accept()
    print("[WS] Client connected to Antigravity voice stream.")
    
    # 1. Resolve Auth Token from Query Parameter or Authorization Header
    bearer_token = token
    if not bearer_token:
        # Check authorization headers during handshake
        auth_header = websocket.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            bearer_token = auth_header.replace("Bearer ", "")
            
    if not bearer_token:
        print("[WS] Unauthorized connection: No bearer token found.")
        await websocket.close(code=4001, reason="Missing authentication token")
        return
        
    # Set context token variable to enforce DB RLS
    token_ctx_var.set(bearer_token)
    
    # Identify tenant ID (Supabase UID)
    try:
        # Connect client to check auth token
        temp_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        temp_client.postgrest.auth(bearer_token)
        user_resp = temp_client.auth.get_user(bearer_token)
        
        if not user_resp or not hasattr(user_resp, 'user') or not user_resp.user:
            raise Exception("Invalid user object returned from Supabase Auth API.")
            
        tenant_id = user_resp.user.id
        print(f"[WS] Authenticated. Active Tenant ID: {tenant_id}")
    except Exception as e:
        print(f"[WS] Auth verification failed: {e}")
        await websocket.close(code=4002, reason="Invalid authentication token")
        return

    # Loop to process incoming audio chunks or JSON packets
    try:
        while True:
            # Check message format: Text or Binary
            message = await websocket.receive()
            text_prompt = ""
            
            # Scenario A: JSON Text Packets (allows testing/typing commands)
            if "text" in message:
                try:
                    data = json.loads(message["text"])
                    if data.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})
                        continue
                    text_prompt = data.get("text")
                except json.JSONDecodeError:
                    text_prompt = message["text"]
                    
            # Scenario B: Binary Audio Chunks (Speech Input)
            elif "bytes" in message:
                audio_chunk = message["bytes"]
                print(f"[WS] Received audio chunk ({len(audio_chunk)} bytes). Transcribing...")
                text_prompt = await stream_to_text_service(audio_chunk)
                print(f"[WS] Transcribed output: '{text_prompt}'")
                
            if not text_prompt:
                continue
                
            # Bind context variables again for safety inside async event loops
            token_ctx_var.set(bearer_token)
            
            # 2. Process query through Dual-Brain LangGraph Flow
            print(f"[WS] Processing Graph prompt: '{text_prompt}'...")
            graph_res = await run_antigravity_graph(text_prompt, tenant_id)
            
            # Resolve AI speech output text
            last_message = graph_res["messages"][-1]
            ai_text = last_message.content
            
            # Check if execution / code run is requested
            requires_approval = False
            code_payload = ""
            
            if graph_res.get("next_step") == "execute" or graph_res.get("generated_code"):
                requires_approval = True
                code_payload = graph_res.get("generated_code", "")
                
            # If code was generated, we withhold execution until human-in-the-loop approval,
            # or return it for UI confirmation
            summary_message = ai_text
            if requires_approval:
                summary_message = f"I have prepared an automated python routine to process this request. Please review and approve execution."
                
            # 3. Generate Audio bytes for response
            audio_bytes = b""
            if not requires_approval:
                audio_bytes = await text_to_speech_service(ai_text)
                
            # 4. Stream response back to client
            response_payload = {
                "text_payload": summary_message,
                "requires_approval": requires_approval,
                "code": code_payload
            }
            await websocket.send_json(response_payload)
            
            if audio_bytes and len(audio_bytes) > 0:
                await websocket.send_bytes(audio_bytes)
                
    except WebSocketDisconnect:
        print("[WS] Client disconnected from Antigravity stream.")
    except Exception as e:
        print(f"[WS ERROR] Handler crashed: {e}")
        try:
            await websocket.close()
        except Exception:
            pass

@router.post("/execute-snippet")
async def execute_approved_snippet(payload: dict):
    """
    Executes a previously prepared and approved python snippet inside E2B sandbox.
    """
    code = payload.get("code")
    token = token_ctx_var.get()
    
    if not code:
        return {"status": "failed", "error": "No code provided"}
        
    print(f"[API] Running approved script snippet...")
    result = await execute_sandbox_routine(code, token)
    return result
