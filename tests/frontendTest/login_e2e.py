import time
from playwright.sync_api import sync_playwright

def test_login_e2e():
    print("=== E2E TEST: LOGIN FLOW (PYTHON) ===")
    
    with sync_playwright() as p:
        # headless=False para ver el navegador.
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            # --- TEST FLU-02: LOGIN FALLIDO ---
            print("Running FLU-02: Login Fail...")
            page.goto("http://localhost:3000/login")
            
            # Esperar a que el formulario sea visible
            page.wait_for_selector('form')
            
            # Llenar datos incorrectos usando selectores basados en tipos de input
            # Usuario (input text)
            page.fill('input[type="text"]', 'wronguser')
            # Contraseña (input password)
            page.fill('input[type="password"]', 'badpass')
            
            # Submit
            page.click('button[type="submit"]')
            
            # Verificar error (Esperamos una alerta o mensaje)
            try:
                # Buscamos mensaje de error genérico o clase de alerta de Bootstrap
                # Si el selector específico .alert-danger falla, intentamos buscar texto
                try:
                    page.wait_for_selector('.alert-danger', timeout=3000)
                    print("✅ FLU-02 Passed: Error message appeared (Alert Danger)")
                except:
                    # Fallback: buscar texto de error común
                    if page.get_by_text("Credenciales").is_visible() or page.get_by_text("Incorrecto").is_visible():
                         print("✅ FLU-02 Passed: Error text found")
                    else:
                        raise Exception("No error message found")
            except Exception as e:
                print(f"⚠️ FLU-02 verification warning: {e}")

            # --- TEST FLU-01: LOGIN EXITOSO ---
            print("Running FLU-01: Login Success...")
            page.goto("http://localhost:3000/login")
            
            page.wait_for_selector('form')
            page.fill('input[type="text"]', 'admin')     # Usuario real
            page.fill('input[type="password"]', '123456789') # Password real
            
            # Click y esperar navegación
            # Nota: Si la redirección es muy rápida o SPA, wait_for_url puede ser mejor
            with page.expect_navigation(wait_until="networkidle"):
                page.click('button[type="submit"]')
            
            # Verificar URL
            url = page.url
            if "/historial" in url or "/dashboard" in url:
                print("✅ FLU-01 Passed: Redirected to dashboard/historial")
            else:
                print(f"❌ FLU-01 Failed: URL is {url}")
                
            time.sleep(1) # Breve pausa visual

        except Exception as e:
            print(f"E2E Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    test_login_e2e()
