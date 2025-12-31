import subprocess
import os
import sys

# Define test files (Relative path from Project Root)
BACKEND_TESTS = [
    os.path.join("tests", "backendTest", "1_login.py"),
    os.path.join("tests", "backendTest", "2_get_auth.py"),
    os.path.join("tests", "backendTest", "3_create_concept.py"),
    os.path.join("tests", "backendTest", "4_get_concepts.py"),
    os.path.join("tests", "backendTest", "5_get_concept_slug.py"),
    os.path.join("tests", "backendTest", "6_update_concept.py"),
    os.path.join("tests", "backendTest", "7_delete_concept.py")
]

FRONTEND_TESTS = [
    os.path.join("tests", "frontendTest", "login_e2e.py")
]

def run_script(rel_path, root_dir):
    """Runs a python script as a subprocess with the project root as CWD"""
    print(f"\n▶️  Running {rel_path}...")
    try:
        # Use the current python interpreter (from venv)
        cmd = [sys.executable, rel_path]
        
        result = subprocess.run(
            cmd,
            cwd=root_dir,           # Set CWD to Project Root so relative paths in tests work
            check=True,             # Raise error on failure
            capture_output=False,   # Print directly to console
            text=True
        )
        print("✅ Passed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed with exit code {e.returncode}")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

def main():
    # Calculate Project Root (Assuming this script is in /tests/ folder)
    script_dir = os.path.dirname(os.path.abspath(__file__)) # .../qr-generador/tests
    project_root = os.path.dirname(script_dir)              # .../qr-generador
    
    print(f"🚀 Starting Test Suite...")
    print(f"📍 Project Root detected: {project_root}")
    print("-" * 50)

    # 1. Backend Tests
    print("\n📦 --- BACKEND TESTS ---")
    for test in BACKEND_TESTS:
        if not run_script(test, project_root):
            print("\n🛑 Stopping execution due to Backend Test failure.")
            sys.exit(1)

    # 2. Frontend Tests
    print("\n🖥️  --- FRONTEND TESTS ---")
    print("(Make sure local frontend server is running at http://localhost:3000)")
    
    # Check if playwright browsers are installed (Naive check or just run)
    # Just run; if it fails user will see playwright error.
    for test in FRONTEND_TESTS:
        if not run_script(test, project_root):
             print("\n⚠️ Frontend test failed.")
             # We might not want to exit immediately for frontend if there are multiple, but here is only one.

    print("-" * 50)
    print("🏁  All tests finished.")

if __name__ == "__main__":
    main()
