# EnglishUp API Documentation

Base URL: `http://localhost:3000`

## Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Words](#words)
- [Progress](#progress)

## Authentication

### Register
Create a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Request Body**:
```json
{
  "username": "string",
  "fullname": "string",
  "password": "string"
}
```
- **Success Response**:
  - **Code**: 200
  - **Content**:
```json
{
  "success": true,
  "message": "Đăng ký thành công"
}
```
- **Error Response**:
  - **Code**: 400
  - **Content**:
```json
{
  "success": false,
  "message": "Username đã tồn tại"
}
```

### Login
Authenticate a user.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **Success Response**:
  - **Code**: 200
  - **Content**:
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "string",
    "username": "string",
    "fullname": "string"
  }
}
```
- **Error Response**:
  - **Code**: 401
  - **Content**:
```json
{
  "success": false,
  "message": "Username hoặc mật khẩu không đúng"
}
```

## Users

### Get All Users
Get list of all users.

- **URL**: `/users`
- **Method**: `GET`
- **Headers**: 
  - `Authorization`: `Bearer {token}`
- **Success Response**:
  - **Code**: 200
  - **Content**:
```json
{
  "success": true,
  "users": [
    {
      "id": "string",
      "username": "string",
      "fullname": "string"
    }
  ]
}
```

### Get User by ID
Get details of a specific user.

- **URL**: `/users/:id`
- **Method**: `GET`
- **Headers**: 
  - `Authorization`: `Bearer {token}`
- **Success Response**:
  - **Code**: 200
  - **Content**:
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "fullname": "string"
  }
}
```

### Update User
Update user information.

- **URL**: `/users/:id`
- **Method**: `PUT`
- **Headers**: 
  - `Authorization`: `Bearer {token}`
- **Request Body**:
```json
{
  "fullname": "string",
  "password": "string"  // Optional
}
```
- **Success Response**:
  - **Code**: 200
  - **Content**:
```json
{
  "success": true,
  "message": "Cập nhật thành công"
}
```

## Words

### Get All Words
Get list of all words.

- **URL**: `/words`
- **Method**: `GET`
- **Headers**: 
  - `Authorization`: `Bearer {token}`
- **Query Parameters**:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
- **Success Response**:
  - **Code**: 200
  - **Content**:
```json
{
  "success": true,
  "words": [
    {
      "id": "string",
      "word": "string",
      "meaning": "string",
      "example": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "totalPages": "number"
}
```

### Add New Word
Add a new word to the database.

- **URL**: `/words`
- **Method**: `POST`
- **Headers**: 
  - `Authorization`: `Bearer {token}`
- **Request Body**:
```json
{
  "word": "string",
  "meaning": "string",
  "example": "string"
}
```
- **Success Response**:
  - **Code**: 201
  - **Content**:
```json
{
  "success": true,
  "message": "Thêm từ thành công",
  "word": {
    "id": "string",
    "word": "string",
    "meaning": "string",
    "example": "string"
  }
}
```

### Get Word by ID
Get details of a specific word.

- **URL**: `/words/:id`
- **Method**: `GET`
- **Headers**: 
  - `Authorization`: `Bearer {token}`
- **Success Response**:
  - **Code**: 200
  - **Content**:
```json
{
  "success": true,
  "word": {
    "id": "string",
    "word": "string",
    "meaning": "string",
    "example": "string"
  }
}
```

### Update Word
Update a word's information.

- **URL**: `/words/:id`
- **Method**: `PUT`
- **Headers**: 
  - `Authorization`: `Bearer {token}`
- **Request Body**:
```json
{
  "word": "string",
  "meaning": "string",
  "example": "string"
}
```
- **Success Response**:
  - **Code**: 200
  - **Content**:
```json
{
  "success": true,
  "message": "Cập nhật thành công"
}
```

### Delete Word
Delete a word from the database.

- **URL**: `/words/:id`
- **Method**: `DELETE`
- **Headers**: 
  - `Authorization`: `Bearer {token}`
- **Success Response**:
  - **Code**: 200
  - **Content**:
```json
{
  "success": true,
  "message": "Xóa từ thành công"
}
```

## Progress

### Get Learning Progress
Get user's learning progress.

- **URL**: `/progress`
- **Method**: `GET`
- **Headers**: 
  - `Authorization`: `Bearer {token}`
- **Success Response**:
  - **Code**: 200
  - **Content**:
```json
{
  "success": true,
  "progress": {
    "userId": "string",
    "wordsLearned": "number",
    "lastStudied": "date",
    "streak": "number",
    "wordsList": [
      {
        "wordId": "string",
        "status": "string",
        "lastReviewed": "date"
      }
    ]
  }
}
```

### Update Progress
Update user's learning progress.

- **URL**: `/progress`
- **Method**: `POST`
- **Headers**: 
  - `Authorization`: `Bearer {token}`
- **Request Body**:
```json
{
  "wordId": "string",
  "status": "string",  // "learned" | "reviewing" | "difficult"
  "lastReviewed": "date"
}
```
- **Success Response**:
  - **Code**: 200
  - **Content**:
```json
{
  "success": true,
  "message": "Cập nhật tiến độ thành công"
}
```

## Error Responses

### Common Error Responses

#### Authentication Error
- **Code**: 401
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

#### Validation Error
- **Code**: 400
```json
{
  "success": false,
  "message": "Validation error message"
}
```

#### Not Found Error
- **Code**: 404
```json
{
  "success": false,
  "message": "Resource not found"
}
```

#### Server Error
- **Code**: 500
```json
{
  "success": false,
  "message": "Internal server error"
}
```