import requests
import json
import os
from config import BASE_URL, USERS

def test_login():
    print("=== TEST: LOGIN (LOG-01 to LOG-06) ===")
    
    try:
        # LOG-01: Login Exitoso
        url = f"{BASE_URL}/users/login"
        response = requests.post(url, json=USERS["admin"])
        
        print(f"[LOG-01] Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                print("✅ LOG-01 Passed: Login successful")
                # Crear directorio si no existe (aunque ya debería existir por structure)
                os.makedirs('tests/backendTest', exist_ok=True)
                with open('tests/backendTest/token.txt', 'w') as f:
                    f.write(data["access_token"])
            else:
                print(f"❌ LOG-01 Failed: No access_token in response {data}")
        else:
            print(f"❌ LOG-01 Failed: {response.text}")

        # LOG-02: Credenciales faltantes
        res_missing = requests.post(url, json={"user": "admin"})
        if res_missing.status_code == 400:
            print("✅ LOG-02 Passed: Missing credentials handled")
        else:
            print(f"❌ LOG-02 Failed status: {res_missing.status_code}")

        # LOG-04: Contraseña incorrecta
        res_wrong = requests.post(url, json=USERS["invalid"])
        if res_wrong.status_code == 401:
            print("✅ LOG-04 Passed: Invalid credentials handled")
        else:
            print(f"❌ LOG-04 Failed status: {res_wrong.status_code}")

    except Exception as e:
        print(f"Test Error: {e}")

if __name__ == "__main__":
    test_login()
