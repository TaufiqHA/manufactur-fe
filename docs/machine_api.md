# Machine API Documentation

## Base URL
All API endpoints are prefixed with `/api/`

## Authentication
All endpoints require authentication using Sanctum tokens. Include the token in the `Authorization` header:
```
Authorization: Bearer {your-api-token}
```

## Endpoints

### List All Machines
Get a list of all machines belonging to the authenticated user.

- **Method**: `GET`
- **URL**: `/api/machines`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Response
- **Success (200)**: Returns an array of machine objects
```json
[
  {
    "id": 1,
    "user_id": 1,
    "code": "MCH-TEST001",
    "name": "Test Machine",
    "type": "CNC",
    "capacity_per_hour": 100,
    "status": "RUNNING",
    "is_maintenance": false,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
]
```

### Create a Machine
Create a new machine.

- **Method**: `POST`
- **URL**: `/api/machines`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
  - `Content-Type: application/json`

#### Request Body
```json
{
  "user_id": 1,
  "code": "MCH-NEW001",
  "name": "New Machine",
  "type": "LATHE",
  "capacity_per_hour": 50,
  "status": "IDLE",
  "is_maintenance": false
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | integer | Yes | ID of the user who owns the machine |
| code | string | Yes | Unique code for the machine (max 255 chars) |
| name | string | Yes | Name of the machine (max 255 chars) |
| type | string | Yes | Type of machine (e.g., CNC, LATHE, MILLING) (max 255 chars) |
| capacity_per_hour | integer | Yes | Production capacity per hour (min 0) |
| status | string | Yes | Machine status (IDLE, RUNNING, MAINTENANCE, OFFLINE, DOWNTIME) |
| is_maintenance | boolean | Yes | Whether the machine is under maintenance |

#### Response
- **Success (201)**: Returns the created machine object
```json
{
  "id": 2,
  "user_id": 1,
  "code": "MCH-NEW001",
  "name": "New Machine",
  "type": "LATHE",
  "capacity_per_hour": 50,
  "status": "IDLE",
  "is_maintenance": false,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

- **Validation Error (422)**: Returns validation errors
```json
{
  "message": "The code field is required.",
  "errors": {
    "code": [
      "The code field is required."
    ]
  }
}
```

### Get a Machine
Retrieve a specific machine by ID.

- **Method**: `GET`
- **URL**: `/api/machines/{id}`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of the machine to retrieve |

#### Response
- **Success (200)**: Returns the machine object
```json
{
  "id": 1,
  "user_id": 1,
  "code": "MCH-TEST001",
  "name": "Test Machine",
  "type": "CNC",
  "capacity_per_hour": 100,
  "status": "RUNNING",
  "is_maintenance": false,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

- **Not Found (404)**: Machine not found
- **Unauthorized (403)**: User doesn't have access to this machine

### Update a Machine
Update an existing machine.

- **Method**: `PUT` or `PATCH`
- **URL**: `/api/machines/{id}`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
  - `Content-Type: application/json`

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of the machine to update |

#### Request Body
```json
{
  "name": "Updated Machine Name",
  "status": "MAINTENANCE",
  "capacity_per_hour": 75
}
```

#### Response
- **Success (200)**: Returns the updated machine object
```json
{
  "id": 1,
  "user_id": 1,
  "code": "MCH-TEST001",
  "name": "Updated Machine Name",
  "type": "CNC",
  "capacity_per_hour": 75,
  "status": "MAINTENANCE",
  "is_maintenance": false,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T11:00:00Z"
}
```

- **Validation Error (422)**: Returns validation errors
- **Unauthorized (403)**: User doesn't have access to this machine

### Delete a Machine
Delete a specific machine.

- **Method**: `DELETE`
- **URL**: `/api/machines/{id}`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | ID of the machine to delete |

#### Response
- **Success (204)**: No content returned
- **Unauthorized (403)**: User doesn't have access to this machine

## Status Values
The `status` field can have one of the following values:
- `IDLE`: Machine is idle
- `RUNNING`: Machine is currently running
- `MAINTENANCE`: Machine is under maintenance
- `OFFLINE`: Machine is offline
- `DOWNTIME`: Machine is experiencing downtime

## Error Responses
All error responses follow the same structure:
```json
{
  "message": "Error message",
  "errors": {
    "field_name": [
      "Error details"
    ]
  }
}
```