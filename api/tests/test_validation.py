from app.schemas.user import UserLogin
from pydantic import ValidationError

def test_validation():
    print("Testing validations...\n")
    
    # Test valid
    try:
        UserLogin(account_name="admin_user", account_password="safePass1")
        print("✅ Valid user/pass accepted")
    except ValidationError as e:
        print(f"❌ Valid user/pass rejected: {e.errors()}")

    # Test invalid username (characters)
    try:
        UserLogin(account_name="admin-user!", account_password="safePass1")
        print("❌ Invalid user accepted")
    except ValidationError:
        print("✅ Invalid user (symbols) correctly rejected")

    # Test invalid password length
    try:
        UserLogin(account_name="admin", account_password="short")
        print("❌ Short password accepted")
    except ValidationError:
        print("✅ Short password correctly rejected")

    # Test dangerous characters
    try:
        UserLogin(account_name="admin", account_password="bad'pass1")
        print("❌ Dangerous password accepted")
    except ValidationError:
        print("✅ Dangerous password correctly rejected")

if __name__ == "__main__":
    test_validation()
