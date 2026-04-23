# 📄 API Documentation – Frinder

---

## 🔐 Authentication API

### POST /backend/api/login.php
Description: Authenticate user and return user details

Request Body:
{
  "email": "user@gmail.com",
  "password": "123456"
}

Response:
{
  "success": true,
  "user_id": 1,
  "message": "Login successful"
}

---

### POST /backend/api/signup.php
Description: Register a new user

Request Body:
{
  "name": "User",
  "email": "user@gmail.com",
  "password": "123456"
}

Response:
{
  "success": true,
  "message": "User registered successfully"
}

---

### POST /backend/api/verify_otp.php (Optional)
Description: Verify OTP for user authentication

Request Body:
{
  "email": "user@gmail.com",
  "otp": "123456"
}

---

## 👤 User API

### GET /backend/api/profile.php
Description: Get user profile data

Query Params:
?id=1

Response:
{
  "id": 1,
  "name": "User",
  "email": "user@gmail.com"
}

---

### POST /backend/api/update_profile.php
Description: Update user profile

Request Body:
{
  "id": 1,
  "name": "Updated Name"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully"
}

---

## 💬 Match / Request API

### GET /backend/api/get_matches.php
Description: Fetch matched users

Query Params:
?user_id=1

Response:
{
  "success": true,
  "matches": []
}

---

### POST /backend/api/send_request.php
Description: Send match request / like

Request Body:
{
  "from_user": 1,
  "to_user": 2
}

Response:
{
  "success": true,
  "message": "Request sent successfully"
}

---

### POST /backend/api/respond_request.php
Description: Accept or reject match request

Request Body:
{
  "request_id": 10,
  "action": "accept"
}

Response:
{
  "success": true,
  "message": "Request updated"
}

---

## 📂 File Upload API

### POST /backend/api/upload_profile.php
Description: Upload user profile image

Request Type:
multipart/form-data

Form Data:
file: (image file)

Response:
{
  "success": true,
  "file_path": "uploads/profile.jpg"
}

---

## ⚠️ Notes

- All APIs return JSON format
- Use fetch() or AJAX in frontend
- Backend built with PHP
- Use POST method for secure operations
- Ensure proper validation and sanitization