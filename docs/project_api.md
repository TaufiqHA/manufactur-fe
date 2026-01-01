# Project API Documentation

This document describes the API endpoints for managing projects in the system.

## Base URL
All endpoints are prefixed with `/api/` and require authentication using Sanctum tokens.

## Authentication
All endpoints require a valid Sanctum authentication token to be included in the request header:
```
Authorization: Bearer {your-token-here}
```

## Endpoints

### List All Projects
**GET** `/api/projects`

Retrieves a list of all projects.

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
[
  {
    "id": 1,
    "code": "PROJ-001",
    "name": "Website Development",
    "customer": "ABC Company",
    "start_date": "2024-01-01",
    "deadline": "2024-06-30",
    "status": "IN_PROGRESS",
    "progress": 45,
    "qty_per_unit": 1,
    "procurement_qty": 100,
    "total_qty": 100,
    "unit": "unit",
    "is_locked": false,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z"
  }
]
```

### Get Single Project
**GET** `/api/projects/{id}`

Retrieves details of a specific project by ID.

#### Path Parameters
- `id` (integer, required): The ID of the project to retrieve

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
{
  "id": 1,
  "code": "PROJ-001",
  "name": "Website Development",
  "customer": "ABC Company",
  "start_date": "2024-01-01",
  "deadline": "2024-06-30",
  "status": "IN_PROGRESS",
  "progress": 45,
  "qty_per_unit": 1,
  "procurement_qty": 100,
  "total_qty": 100,
  "unit": "unit",
  "is_locked": false,
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-15T10:30:00.000000Z"
}
```

### Create New Project
**POST** `/api/projects`

Creates a new project.

#### Request Body
- Content-Type: `application/json`

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| code | string | Yes | Unique project code | Max 255 characters, must be unique |
| name | string | Yes | Project name | Max 255 characters |
| customer | string | Yes | Customer name | Max 255 characters |
| start_date | date | Yes | Project start date | Format: YYYY-MM-DD |
| deadline | date | Yes | Project deadline | Format: YYYY-MM-DD, must be >= start_date |
| status | string | Yes | Project status | One of: PLANNED, IN_PROGRESS, COMPLETED, ON_HOLD |
| progress | integer | Yes | Progress percentage | 0-100 |
| qty_per_unit | integer | Yes | Quantity per unit | Must be >= 0 |
| procurement_qty | integer | Yes | Procurement quantity | Must be >= 0 |
| total_qty | integer | Yes | Total quantity | Must be >= 0 |
| unit | string | Yes | Unit of measurement | Max 50 characters |
| is_locked | boolean | Yes | Lock status | true or false |

#### Example Request
```json
{
  "code": "PROJ-002",
  "name": "Mobile App Development",
  "customer": "XYZ Corp",
  "start_date": "2024-02-01",
  "deadline": "2024-08-31",
  "status": "PLANNED",
  "progress": 0,
  "qty_per_unit": 1,
  "procurement_qty": 50,
  "total_qty": 50,
  "unit": "unit",
  "is_locked": false
}
```

#### Response
- Status: `201 Created`
- Content-Type: `application/json`

```json
{
  "id": 2,
  "code": "PROJ-002",
  "name": "Mobile App Development",
  "customer": "XYZ Corp",
  "start_date": "2024-02-01",
  "deadline": "2024-08-31",
  "status": "PLANNED",
  "progress": 0,
  "qty_per_unit": 1,
  "procurement_qty": 50,
  "total_qty": 50,
  "unit": "unit",
  "is_locked": false,
  "created_at": "2024-01-15T11:00:00.000000Z",
  "updated_at": "2024-01-15T11:00:00.000000Z"
}
```

### Update Project
**PUT** `/api/projects/{id}` or **PATCH** `/api/projects/{id}`

Updates an existing project. Both PUT and PATCH methods are supported.

#### Path Parameters
- `id` (integer, required): The ID of the project to update

#### Request Body
Same fields as the Create endpoint, but all fields are optional (only provided fields will be updated).

#### Example Request
```json
{
  "name": "Updated Mobile App Development",
  "status": "IN_PROGRESS",
  "progress": 25
}
```

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
{
  "id": 2,
  "code": "PROJ-002",
  "name": "Updated Mobile App Development",
  "customer": "XYZ Corp",
  "start_date": "2024-02-01",
  "deadline": "2024-08-31",
  "status": "IN_PROGRESS",
  "progress": 25,
  "qty_per_unit": 1,
  "procurement_qty": 50,
  "total_qty": 50,
  "unit": "unit",
  "is_locked": false,
  "created_at": "2024-01-15T11:00:00.000000Z",
  "updated_at": "2024-01-15T12:00:00.000000Z"
}
```

### Delete Project
**DELETE** `/api/projects/{id}`

Deletes an existing project.

#### Path Parameters
- `id` (integer, required): The ID of the project to delete

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
{
  "message": "Project deleted successfully"
}
```

## Error Responses

### Validation Error
- Status: `422 Unprocessable Entity`
- Content-Type: `application/json`

```json
{
  "errors": {
    "code": [
      "The code field is required.",
      "The code has already been taken."
    ],
    "name": [
      "The name field is required."
    ],
    "progress": [
      "The progress must be between 0 and 100."
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
  "message": "Project not found."
}
```

## Status Values

The `status` field can have one of the following values:
- `PLANNED`: Project is in planning phase
- `IN_PROGRESS`: Project is currently being worked on
- `COMPLETED`: Project has been completed
- `ON_HOLD`: Project is temporarily paused

## Notes
- All date fields should be in `YYYY-MM-DD` format
- The `is_locked` field indicates whether the project is locked for editing
- The `progress` field represents the completion percentage (0-100)
- All endpoints require authentication with a valid Sanctum token