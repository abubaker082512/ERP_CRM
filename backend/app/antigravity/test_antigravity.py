import asyncio
import sys
import os

# Set working directory to allow local imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.services.embeddings import embedding_service
from app.antigravity.graphs import run_antigravity_graph
from app.antigravity.tools.sandbox import execute_sandbox_routine
from app.api.v1.antigravity import stream_to_text_service, text_to_speech_service

async def test_embedding_service():
    print("\n--- Testing Embedding Service ---")
    text = "Draft a lead report for the sales team."
    vector = embedding_service.get_embedding(text)
    
    assert len(vector) == 1536, f"Expected 1536 dimensions, got {len(vector)}"
    assert isinstance(vector[0], float), "Expected vector values to be floats"
    print("✅ Embedding service test passed!")

async def test_langgraph_workflow():
    print("\n--- Testing LangGraph Workflows ---")
    prompt = "Create a lead report"
    tenant_id = "test-tenant-uuid-1234"
    
    result = await run_antigravity_graph(prompt, tenant_id)
    assert "messages" in result, "Result must contain messages list"
    assert len(result["messages"]) > 0, "Messages must not be empty"
    
    last_msg = result["messages"][-1]
    print(f"AI Response: {last_msg.content}")
    print(f"Next step resolved: {result.get('next_step')}")
    print(f"Generated Code: {result.get('generated_code')}")
    print("✅ LangGraph workflow test passed!")

async def test_sandbox_runner():
    print("\n--- Testing Sandbox Executor ---")
    script = "print('Hello from the E2B offline sandbox!')"
    res = await execute_sandbox_routine(script, token="dummy-token")
    
    assert res["status"] == "success", f"Sandbox failed: {res}"
    assert "Hello from the E2B" in res["output"], f"Expected output missing: {res}"
    print(f"Sandbox Output: {res['output'].strip()}")
    print("✅ Sandbox runner test passed!")

async def test_audio_streaming_services():
    print("\n--- Testing Audio Gateway Services ---")
    # Test audio-to-text transcriber mock/live
    dummy_audio = b"\x00\x01\x02\x03\x04"
    text = await stream_to_text_service(dummy_audio)
    assert len(text) > 0, "Transcribed text must not be empty"
    print(f"Transcribed Text: {text}")
    
    # Test text-to-speech mock/live
    speech_bytes = await text_to_speech_service("System online.")
    assert len(speech_bytes) > 0, "Speech bytes must not be empty"
    print(f"Synthesized Audio size: {len(speech_bytes)} bytes")
    print("✅ Audio streaming services test passed!")

async def main():
    print("🛸 Starting Antigravity System Integration Tests...")
    try:
        await test_embedding_service()
        await test_langgraph_workflow()
        await test_sandbox_runner()
        await test_audio_streaming_services()
        print("\n🎉 ALL ANTIGRAVITY INTEGRATION TESTS PASSED SUCCESSFULLY!")
    except Exception as e:
        print(f"\n❌ Test suite failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
