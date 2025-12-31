import requests
import json
import random
from config import BASE_URL

def test_create_concept():
    print("=== TEST: CREATE CONCEPT (CRE-01 to CRE-07) ===")
    
    try:
        with open('tests/backendTest/token.txt', 'r') as f:
            token = f.read().strip()

        random_slug = f"test-concept-{random.randint(0, 10000)}"

        payload = {
            "content": "**Oferta de Prueba Python**",
            "color": "#FF5733",
            "image_url": "https://example.com/image.png",
            "slug": random_slug,
            "note": "Nota creada por python script"
        }

        # CRE-01: Creación Exitosa
        response = requests.post(
            f"{BASE_URL}/concepts/create-concept",
            json=payload,
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"[CRE-01] Status: {response.status_code}")

        if response.status_code == 201:
            data = response.json()
            print("✅ CRE-01 Passed: Concept created")
            print(f"   Slug created: {data.get('slug')}")
            
            with open('tests/backendTest/concept_data.json', 'w') as f:
                json.dump(data, f)
        else:
            print(f"❌ CRE-01 Failed: {response.text}")

        # CRE-03: Slug Duplicado
        res_dup = requests.post(
            f"{BASE_URL}/concepts/create-concept",
            json=payload,
            headers={"Authorization": f"Bearer {token}"}
        )
        if res_dup.status_code == 409:
            print("✅ CRE-03 Passed: Duplicate slug rejected")
        else:
            print(f"❌ CRE-03 Failed status: {res_dup.status_code}")

        # CRE-02: Campos faltantes
        res_missing = requests.post(
            f"{BASE_URL}/concepts/create-concept",
            json={"slug": "fail"},
            headers={"Authorization": f"Bearer {token}"}
        )
        if res_missing.status_code == 400:
            print("✅ CRE-02 Passed: Missing fields rejected")

    except FileNotFoundError:
        print("Test Error: Token file not found. Run 1_login.py first.")
    except Exception as e:
        print(f"Test Error: {e}")

if __name__ == "__main__":
    test_create_concept()
