import requests
from config import BASE_URL

def test_get_auth():
    print("=== TEST: GET AUTH ===")
    
    try:
        with open('tests/backendTest/token.txt', 'r') as f:
            token = f.read().strip()

        response = requests.get(
            f"{BASE_URL}/users/get-auth",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            print("✅ Get Auth Passed")
        else:
            print(f"❌ Get Auth Failed: {response.text}")

    except FileNotFoundError:
        print("Test Error: Token file not found. Run 1_login.py first.")
    except Exception as e:
        print(f"Test Error: {e}")

if __name__ == "__main__":
    test_get_auth()
