import requests
import json
from config import BASE_URL

def test_delete_concept():
    print("=== TEST: DELETE CONCEPT (DEL-01) ===")
    
    try:
        with open('tests/backendTest/token.txt', 'r') as f:
            token = f.read().strip()
            
        concept_id = None
        try:
            with open('tests/backendTest/concept_data.json', 'r') as f:
                data = json.load(f)
                concept_id = data.get("concept_id")
        except FileNotFoundError:
            print("❌ Cannot run delete test without concept_id. Run 3_create_concept.py first.")
            return

        # DEL-01
        response = requests.delete(
            f"{BASE_URL}/concepts/delete-concept",
            params={"id": concept_id},
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"[DEL-01] Status: {response.status_code}")

        if response.status_code == 200:
            print("✅ DEL-01 Passed: Concept deleted (soft delete)")
        else:
            print(f"❌ DEL-01 Failed: {response.text}")

    except Exception as e:
        print(f"Test Error: {e}")

if __name__ == "__main__":
    test_delete_concept()
