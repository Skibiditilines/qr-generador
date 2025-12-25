from app.core.security import create_access_token
import jwt
from app.core.config import settings

def verify_token_logic():
    print("Testing JWT generation...")
    data = {"sub": "test_user"}
    token = create_access_token(data)
    print(f"Generated token: {token}")
    
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    print(f"Decoded data: {decoded}")
    
    assert decoded["sub"] == "test_user"
    assert "exp" in decoded
    print("✅ JWT logical verification successful")

if __name__ == "__main__":
    verify_token_logic()
