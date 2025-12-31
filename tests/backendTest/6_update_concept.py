import requests
import json
from config import BASE_URL

def test_update_concept():
    print("=== TEST: UPDATE CONCEPT (UPD-01) ===")
    
    try:
        with open('tests/backendTest/token.txt', 'r') as f:
            token = f.read().strip()
            
        concept_id = None
        try:
            with open('tests/backendTest/concept_data.json', 'r') as f:
                data = json.load(f)
                concept_id = data.get("concept_id")
        except FileNotFoundError:
            print("❌ Cannot run update test without concept_id. Run 3_create_concept.py first.")
            return

        payload = {
            "concept_id": concept_id,
            "content": "# Contenido Actualizado por Python Script",
            "note": "Nota actualizada"
        }

        # UPD-01
        response = requests.put(
            f"{BASE_URL}/concepts/update-concept",
            json=payload,
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"[UPD-01] Status: {response.status_code}")

        if response.status_code == 200:
            print("✅ UPD-01 Passed: Concept updated")
        else:
            print(f"❌ UPD-01 Failed: {response.text}")

    except Exception as e:
        print(f"Test Error: {e}")

if __name__ == "__main__":
    test_update_concept()
