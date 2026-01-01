# Authentication API Documentation

This document describes the API endpoints for user authentication in the system.

## Base URL
All endpoints are prefixed with `/api/` unless otherwise specified.

## Endpoints

### Login
**POST** `/api/login`

Authenticates a user and returns a Sanctum token for subsequent API requests.

#### Request Body
- Content-Type: `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

#### Example Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "email_verified_at": "2024-01-01T00:00:00.000000Z",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  },
  "token": "1|exampleTokenHere1234567890abcdef"
}
```

#### Error Response
- Status: `422 Unprocessable Entity` (for validation errors)
- Content-Type: `application/json`

```json
{
  "errors": {
    "email": [
      "The email field is required.",
      "The email must be a valid email address."
    ],
    "password": [
      "The password field is required."
    ]
  }
}
```

- Status: `401 Unauthorized` (for invalid credentials)
- Content-Type: `application/json`

```json
{
  "message": "Invalid credentials"
}
```

### Get User Profile
**GET** `/api/me`

Retrieves the authenticated user's profile information.

#### Headers
- `Authorization: Bearer {your-sanctum-token}`

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "email_verified_at": "2024-01-01T00:00:00.000000Z",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

#### Error Response
- Status: `401 Unauthorized` (for invalid or missing token)
- Content-Type: `application/json`

```json
{
  "message": "Unauthenticated."
}
```

### Logout
**POST** `/api/logout`

Invalidates the current Sanctum token, effectively logging the user out.

#### Headers
- `Authorization: Bearer {your-sanctum-token}`

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
{
  "message": "Logged out successfully"
}
```

#### Error Response
- Status: `401 Unauthorized` (for invalid or missing token)
- Content-Type: `application/json`

```json
{
  "message": "Unauthenticated."
}
```

## Authentication Flow

1. **Login**: User sends email and password to `/api/login`
2. **Token Receipt**: Server returns user data and Sanctum token
3. **Authenticated Requests**: Include `Authorization: Bearer {token}` header for protected endpoints
4. **Logout**: Send POST request to `/api/logout` to invalidate the token

## Token Security

- Sanctum tokens are stored in the database and associated with the user
- Tokens should be kept secure and not exposed in client-side code unnecessarily
- Tokens can be invalidated by logging out or manually revoking them
- Each login generates a new token, and previous tokens remain valid until explicitly revoked

## Error Handling

Common error responses across all auth endpoints:

### Unauthorized Access
- Status: `401 Unauthorized`
- Message: "Unauthenticated." or "Invalid credentials"

### Validation Errors
- Status: `422 Unprocessable Entity`
- Contains detailed error messages for each invalid field

### Server Errors
- Status: `500 Internal Server Error`
- Message: "Server error occurred"

## Notes
- Passwords should meet the application's security requirements
- Email addresses must be unique in the system
- Tokens have no expiration by default (unless configured otherwise)
- The `/api/me` endpoint can be used to validate if a token is still valid