# backend/test_groq.py
import os
import httpx
import asyncio
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

async def test_groq_api():
    api_key = os.getenv("GROQ_API_KEY")
    
    print(f"🔍 Looking for GROQ_API_KEY...")
    print(f"📁 Current directory: {os.getcwd()}")
    print(f"🔑 API Key found: {'Yes' if api_key else 'No'}")
    
    if not api_key:
        print("❌ GROQ_API_KEY not found in environment variables")
        return
    
    if api_key:
        print(f"✅ GROQ_API_KEY loaded successfully")
        print(f"📝 Key starts with: {api_key[:10]}...")
    
    # Current available Groq models (as of 2024)
    available_models = [
        "llama-3.1-8b-instant",  # Fastest
        "llama-3.1-70b-versatile",  # Most powerful
        "llama-3.2-1b-preview",  # Lightweight
        "llama-3.2-3b-preview",  # Balanced
        "llama-3.2-11b-vision-preview",  # Multimodal
        "llama-3.2-90b-vision-preview",  # Largest
        "mixtral-8x7b-32768",  # Good for complex tasks
    ]
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test with the first available model
    model_to_test = available_models[0]  # Start with the fastest
    
    payload = {
        "model": model_to_test,
        "messages": [{"role": "user", "content": "Say 'Hello World' in a creative way"}],
        "temperature": 0.7,
        "max_tokens": 100
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"🚀 Testing model: {model_to_test}")
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Groq API is working!")
                print(f"🤖 Response: {result['choices'][0]['message']['content']}")
                print(f"📊 Model: {result['model']}")
                print(f"⏱️ Tokens used: {result['usage']['total_tokens']}")
                return True
            else:
                print(f"❌ Groq API error with {model_to_test}: {response.status_code}")
                print(f"📄 Response: {response.text}")
                
                # Try the next model if the first fails
                if len(available_models) > 1:
                    print(f"🔄 Trying next available model...")
                    model_to_test = available_models[1]
                    payload["model"] = model_to_test
                    
                    print(f"🚀 Testing model: {model_to_test}")
                    response = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        json=payload,
                        headers=headers,
                        timeout=30.0
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        print("✅ Groq API is working!")
                        print(f"🤖 Response: {result['choices'][0]['message']['content']}")
                        print(f"📊 Model: {result['model']}")
                        print(f"⏱️ Tokens used: {result['usage']['total_tokens']}")
                        return True
                
                return False
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return False

async def list_available_models():
    """List all available models from Groq API"""
    api_key = os.getenv("GROQ_API_KEY")
    
    if not api_key:
        print("❌ GROQ_API_KEY not found")
        return
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print("📋 Fetching available models from Groq API...")
            response = await client.get(
                "https://api.groq.com/openai/v1/models",
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Available Groq Models:")
                for model in result['data']:
                    print(f"  - {model['id']} (owned_by: {model.get('owned_by', 'unknown')})")
            else:
                print(f"❌ Failed to fetch models: {response.status_code}")
                print(f"📄 Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Error fetching models: {e}")

if __name__ == "__main__":
    print("🧪 Testing Groq API Connection")
    print("=" * 50)
    
    # First list available models
    asyncio.run(list_available_models())
    
    print("\n" + "=" * 50)
    print("🧪 Testing Chat Completion")
    print("=" * 50)
    
    # Then test chat completion
    success = asyncio.run(test_groq_api())
    
    if success:
        print("\n🎉 All tests passed! Your Groq API is working correctly.")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")