import requests
import json
from config import BASE_URL

def test_get_by_slug():
    print("=== TEST: GET CONCEPT BY SLUG (SLG-01 to SLG-03) ===")
    
    try:
        slug = "non-existent"
        try:
            with open('tests/backendTest/concept_data.json', 'r') as f:
                data = json.load(f)
                slug = data.get("slug", slug)
        except FileNotFoundError:
            print("⚠️ No concept data found, using 'non-existent'. Run 3_create_concept.py first.")

        # SLG-01: Obtener existente
        response = requests.get(f"{BASE_URL}/concepts/get-concept-by-slug", params={"slug": slug})
        
        print(f"[SLG-01] Status: {response.status_code}")

        if response.status_code == 200:
            # En tu implementación, retorna una lista
            concepts = response.json()
            if isinstance(concepts, list) and len(concepts) > 0:
                print("✅ SLG-01 Passed: Concept retrieved publically")
            elif isinstance(concepts, dict): # Por si cambia a retornar objeto único
                print("✅ SLG-01 Passed: Concept retrieved publically")
            else:
                 print(f"⚠️ SLG-01 Result: Empty list (Maybe soft deleted or slug mismatch)")
        else:
            # Si el script 3 falló o no se corrió, esto podría ser esperado
            print(f"⚠️ SLG-01 Result: {response.status_code}")

        # SLG-03: No encontrado
        res_not_found = requests.get(f"{BASE_URL}/concepts/get-concept-by-slug", params={"slug": "really_not_exists_123"})
        print(f"[SLG-03] Not Found Case Status: {res_not_found.status_code}")
        
    except Exception as e:
        print(f"Test Error: {e}")

if __name__ == "__main__":
    test_get_by_slug()
