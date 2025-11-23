import requests
import json

BASE_URL = "http://localhost:8000"

def test_sentiment_analysis():
    print("Testing Sentiment Analysis...")
    
    test_cases = [
        "I am very happy with the service, it is great!",
        "This is terrible, I hate it.",
        "I am interested in your product.",
        "The service was okay, nothing special."
    ]
    
    for text in test_cases:
        try:
            response = requests.get(f"{BASE_URL}/test-ai/sentiment", params={"text": text})
            if response.status_code == 200:
                print(f"\nInput: '{text}'")
                print(f"Output: {json.dumps(response.json(), indent=2)}")
            else:
                print(f"Failed. Status: {response.status_code}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_sentiment_analysis()
