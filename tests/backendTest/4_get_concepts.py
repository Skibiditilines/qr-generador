import requests
from config import BASE_URL

def test_get_concepts():
    print("=== TEST: GET CONCEPTS (CON-01) ===")
    
    try:
        with open('tests/backendTest/token.txt', 'r') as f:
            token = f.read().strip()

        response = requests.get(
            f"{BASE_URL}/concepts/get-concepts",
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"[CON-01] Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ CON-01 Passed: Retrieved {len(data)} concepts")
            else:
                print("❌ CON-01 Failed: Response is not a list")
        else:
            print(f"❌ CON-01 Failed: {response.text}")

    except Exception as e:
        print(f"Test Error: {e}")

if __name__ == "__main__":
    test_get_concepts()
