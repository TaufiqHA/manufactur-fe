# User API Documentation

This document describes the API endpoints for managing users in the system.

## Base URL
All endpoints are prefixed with `/api/` and require authentication using Sanctum tokens.

## Authentication
All endpoints require a valid Sanctum authentication token to be included in the request header:
```
Authorization: Bearer {your-token-here}
```

## Endpoints

### List All Users
**GET** `/api/users`

Retrieves a list of all users.

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": "2024-01-01T00:00:00.000000Z",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "email_verified_at": "2024-01-02T00:00:00.000000Z",
    "created_at": "2024-01-02T00:00:00.000000Z",
    "updated_at": "2024-01-14T09:15:00.000000Z"
  }
]
```

### Get Single User
**GET** `/api/users/{id}`

Retrieves details of a specific user by ID.

#### Path Parameters
- `id` (integer, required): The ID of the user to retrieve

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "email_verified_at": "2024-01-01T00:00:00.000000Z",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-15T10:30:00.000000Z"
}
```

### Create New User
**POST** `/api/users`

Creates a new user.

#### Request Body
- Content-Type: `application/json`

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| name | string | Yes | User's full name | Max 255 characters |
| email | string | Yes | User's email address | Must be unique and valid email format |
| password | string | Yes | User's password | Min 8 characters |
| password_confirmation | string | Yes | Password confirmation | Must match password field |

#### Example Request
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Response
- Status: `201 Created`
- Content-Type: `application/json`

```json
{
  "id": 3,
  "name": "New User",
  "email": "newuser@example.com",
  "email_verified_at": null,
  "created_at": "2024-01-15T11:00:00.000000Z",
  "updated_at": "2024-01-15T11:00:00.000000Z"
}
```

### Update User
**PUT** `/api/users/{id}` or **PATCH** `/api/users/{id}`

Updates an existing user. Both PUT and PATCH methods are supported.

#### Path Parameters
- `id` (integer, required): The ID of the user to update

#### Request Body
Same fields as the Create endpoint, but password fields are optional (only required if changing the password).

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| name | string | No | User's full name | Max 255 characters |
| email | string | No | User's email address | Must be unique and valid email format |
| password | string | No | User's new password | Min 8 characters (only required if changing) |
| password_confirmation | string | No | Password confirmation | Must match password field (only required if changing password) |

#### Example Request
```json
{
  "name": "Updated User Name",
  "email": "updateduser@example.com"
}
```

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
{
  "id": 3,
  "name": "Updated User Name",
  "email": "updateduser@example.com",
  "email_verified_at": null,
  "created_at": "2024-01-15T11:00:00.000000Z",
  "updated_at": "2024-01-15T12:00:00.000000Z"
}
```

### Delete User
**DELETE** `/api/users/{id}`

Deletes an existing user.

#### Path Parameters
- `id` (integer, required): The ID of the user to delete

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
{
  "message": "User deleted successfully"
}
```

## Error Responses

### Validation Error
- Status: `422 Unprocessable Entity`
- Content-Type: `application/json`

```json
{
  "errors": {
    "email": [
      "The email field is required.",
      "The email has already been taken.",
      "The email must be a valid email address."
    ],
    "name": [
      "The name field is required.",
      "The name must not exceed 255 characters."
    ],
    "password": [
      "The password field is required.",
      "The password must be at least 8 characters."
    ]
  }
}
```

### Unauthorized Access
- Status: `401 Unauthorized`
- Content-Type: `application/json`

```json
{
  "message": "Unauthenticated."
}
```

### Not Found
- Status: `404 Not Found`
- Content-Type: `application/json`

```json
{
  "message": "User not found."
}
```

### Forbidden Access
- Status: `403 Forbidden`
- Content-Type: `application/json`

```json
{
  "message": "This action is unauthorized."
}
```

## Password Requirements

When creating or updating a user's password, the following requirements apply:
- Minimum length of 8 characters
- Should contain a mix of uppercase, lowercase, numbers, and special characters (implementation dependent)
- Must match the confirmation field

## Notes
- Email addresses must be unique across all users
- The `email_verified_at` field indicates when the user's email was verified
- All endpoints require authentication with a valid Sanctum token
- The `password_confirmation` field is required when creating or updating passwords
- Deleted users are permanently removed from the system