import os

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import jwt, JWTError
import bcrypt

from database import engine, SessionLocal
from models import Base, User
from schemas import UserCreate, UserLogin


app = FastAPI()


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Database
# ==========================================

Base.metadata.create_all(bind=engine)


# ==========================================
# JWT Settings
# ==========================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "local-development-secret-key"
)

ALGORITHM = "HS256"


# ==========================================
# Security
# ==========================================

security = HTTPBearer()


# ==========================================
# Database Dependency
# ==========================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


# ==========================================
# Password Hashing
# ==========================================

def hash_password(password: str) -> str:

    password_bytes = password.encode("utf-8")

    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(
        password_bytes,
        salt
    )

    return hashed.decode("utf-8")


# ==========================================
# Password Verification
# ==========================================

def verify_password(
    password: str,
    password_hash: str
) -> bool:

    password_bytes = password.encode("utf-8")

    hash_bytes = password_hash.encode("utf-8")

    return bcrypt.checkpw(
        password_bytes,
        hash_bytes
    )


# ==========================================
# Get Current User
# ==========================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None:

        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# ==========================================
# Home
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Backend is working!"
    }


# ==========================================
# Register
# ==========================================

@app.post("/api/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_username = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_username:

        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )


    existing_email = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_email:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )


    hashed_password = hash_password(
        user.password
    )


    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )


    db.add(new_user)

    db.commit()

    db.refresh(new_user)


    return {
        "message": "User registered successfully",
        "username": new_user.username,
        "email": new_user.email
    }


# ==========================================
# Login
# ==========================================

@app.post("/api/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()


    if not existing_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    password_correct = verify_password(
        user.password,
        existing_user.password_hash
    )


    if not password_correct:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    token_data = {
        "user_id": existing_user.id,
        "username": existing_user.username
    }


    access_token = jwt.encode(
        token_data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }


# ==========================================
# Current User
# ==========================================

@app.get("/api/me")
def get_me(
    current_user: User = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }
