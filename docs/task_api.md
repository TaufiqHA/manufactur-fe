# Task API Documentation

This document provides comprehensive documentation for the Task API endpoints in the manufacturing application.

## Base URL

All API endpoints are prefixed with `/api/`.

## Authentication

All endpoints require authentication using Sanctum tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer {your-token-here}
```

## Common Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

For errors:
```json
{
  "success": false,
  "message": "Error message",
  "errors": {}
}
```

## Endpoints

### 1. List All Tasks

**GET** `/api/tasks`

#### Description
Retrieve a list of all tasks with their related data.

#### Headers
- `Authorization: Bearer {token}`

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "project_id": "uuid-string",
      "project_name": "Project Name",
      "item_id": "uuid-string",
      "item_name": "Item Name",
      "sub_assembly_id": "uuid-string",
      "sub_assembly_name": "Sub Assembly Name",
      "step": "Manufacturing Step",
      "machine_id": "uuid-string",
      "target_qty": 100,
      "daily_target": 20,
      "completed_qty": 45,
      "defect_qty": 2,
      "status": "IN_PROGRESS",
      "note": "Optional note",
      "total_downtime_minutes": 30,
      "created_at": "2023-01-01T00:00:00.000000Z",
      "updated_at": "2023-01-01T00:00:00.000000Z"
    }
  ]
}
```

### 2. Create a New Task

**POST** `/api/tasks`

#### Description
Create a new task.

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
```json
{
  "project_id": "uuid-string",
  "project_name": "Project Name",
  "item_id": "uuid-string",
  "item_name": "Item Name",
  "step": "Manufacturing Step",
  "target_qty": 100,
  "status": "PENDING",
  "sub_assembly_id": "uuid-string", // optional
  "sub_assembly_name": "Sub Assembly Name", // optional
  "machine_id": "uuid-string", // optional
  "daily_target": 20, // optional
  "completed_qty": 0, // optional, defaults to 0
  "defect_qty": 0, // optional, defaults to 0
  "note": "Optional note", // optional
  "total_downtime_minutes": 0 // optional, defaults to 0
}
```

#### Validation Rules
- `project_id`: required, must exist in projects table
- `project_name`: required, string, max 255 characters
- `item_id`: required, must exist in project_items table
- `item_name`: required, string, max 255 characters
- `step`: required, string, max 255 characters
- `target_qty`: required, integer, minimum 0
- `status`: required, one of PENDING, IN_PROGRESS, PAUSED, COMPLETED, DOWNTIME
- `sub_assembly_id`: optional, must exist in sub_assemblies table if provided
- `machine_id`: optional, must exist in machines table if provided
- `daily_target`: optional, integer, minimum 0
- `completed_qty`: optional, integer, minimum 0, defaults to 0
- `defect_qty`: optional, integer, minimum 0, defaults to 0
- `note`: optional, string
- `total_downtime_minutes`: optional, integer, minimum 0, defaults to 0

#### Response

**Success Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 1,
    "project_id": "uuid-string",
    "project_name": "Project Name",
    "item_id": "uuid-string",
    "item_name": "Item Name",
    "sub_assembly_id": "uuid-string",
    "sub_assembly_name": "Sub Assembly Name",
    "step": "Manufacturing Step",
    "machine_id": "uuid-string",
    "target_qty": 100,
    "daily_target": 20,
    "completed_qty": 0,
    "defect_qty": 0,
    "status": "PENDING",
    "note": "Optional note",
    "total_downtime_minutes": 0,
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
  }
}
```

**Error Response (422):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "field_name": [
      "Error message"
    ]
  }
}
```

### 3. Get a Specific Task

**GET** `/api/tasks/{id}`

#### Description
Retrieve a specific task by ID.

#### Path Parameters
- `id`: Task ID (required)

#### Headers
- `Authorization: Bearer {token}`

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_id": "uuid-string",
    "project_name": "Project Name",
    "item_id": "uuid-string",
    "item_name": "Item Name",
    "sub_assembly_id": "uuid-string",
    "sub_assembly_name": "Sub Assembly Name",
    "step": "Manufacturing Step",
    "machine_id": "uuid-string",
    "target_qty": 100,
    "daily_target": 20,
    "completed_qty": 45,
    "defect_qty": 2,
    "status": "IN_PROGRESS",
    "note": "Optional note",
    "total_downtime_minutes": 30,
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
  }
}
```

### 4. Update a Task

**PUT** `/api/tasks/{id}` or **PATCH** `/api/tasks/{id}`

#### Description
Update an existing task. PATCH allows partial updates.

#### Path Parameters
- `id`: Task ID (required)

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body (all fields optional unless specified)
```json
{
  "project_id": "uuid-string", // optional, but required if included
  "project_name": "Updated Project Name", // optional, but required if included
  "item_id": "uuid-string", // optional, but required if included
  "item_name": "Updated Item Name", // optional, but required if included
  "step": "Updated Manufacturing Step", // optional, but required if included
  "target_qty": 150, // optional, but required if included
  "status": "IN_PROGRESS", // optional, but required if included
  "sub_assembly_id": "uuid-string", // optional
  "sub_assembly_name": "Updated Sub Assembly Name", // optional
  "machine_id": "uuid-string", // optional
  "daily_target": 25, // optional
  "completed_qty": 50, // optional
  "defect_qty": 3, // optional
  "note": "Updated note", // optional
  "total_downtime_minutes": 45 // optional
}
```

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "project_id": "uuid-string",
    "project_name": "Updated Project Name",
    "item_id": "uuid-string",
    "item_name": "Updated Item Name",
    "sub_assembly_id": "uuid-string",
    "sub_assembly_name": "Updated Sub Assembly Name",
    "step": "Updated Manufacturing Step",
    "machine_id": "uuid-string",
    "target_qty": 150,
    "daily_target": 25,
    "completed_qty": 50,
    "defect_qty": 3,
    "status": "IN_PROGRESS",
    "note": "Updated note",
    "total_downtime_minutes": 45,
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-02T00:00:00.000000Z"
  }
}
```

### 5. Delete a Task

**DELETE** `/api/tasks/{id}`

#### Description
Delete a specific task.

#### Path Parameters
- `id`: Task ID (required)

#### Headers
- `Authorization: Bearer {token}`

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### 6. Update Task Status

**PATCH** `/api/tasks/{id}/status`

#### Description
Update only the status of a task.

#### Path Parameters
- `id`: Task ID (required)

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
```json
{
  "status": "IN_PROGRESS"
}
```

#### Validation Rules
- `status`: required, one of PENDING, IN_PROGRESS, PAUSED, COMPLETED, DOWNTIME

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "id": 1,
    "status": "IN_PROGRESS",
    // ... other task fields
  }
}
```

### 7. Update Task Completion

**PATCH** `/api/tasks/{id}/completion`

#### Description
Update completion and defect quantities for a task.

#### Path Parameters
- `id`: Task ID (required)

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
```json
{
  "completed_qty": 50,
  "defect_qty": 2
}
```

#### Validation Rules
- `completed_qty`: required, integer, minimum 0
- `defect_qty`: optional, integer, minimum 0

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task completion updated successfully",
  "data": {
    "id": 1,
    "completed_qty": 50,
    "defect_qty": 2,
    // ... other task fields
  }
}
```

### 8. Update Task Downtime

**PATCH** `/api/tasks/{id}/downtime`

#### Description
Update downtime minutes and related notes for a task.

#### Path Parameters
- `id`: Task ID (required)

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
```json
{
  "total_downtime_minutes": 60,
  "note": "Machine maintenance"
}
```

#### Validation Rules
- `total_downtime_minutes`: required, integer, minimum 0
- `note`: optional, string

#### Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task downtime updated successfully",
  "data": {
    "id": 1,
    "total_downtime_minutes": 60,
    "note": "Machine maintenance",
    // ... other task fields
  }
}
```

## Status Values

The `status` field can have one of the following values:
- `PENDING`: Task is pending
- `IN_PROGRESS`: Task is currently in progress
- `PAUSED`: Task is paused
- `COMPLETED`: Task is completed
- `DOWNTIME`: Task is experiencing downtime

## Error Codes

- `200`: Success
- `201`: Created
- `401`: Unauthorized
- `404`: Resource not found
- `422`: Validation error
- `500`: Server error

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All quantities are non-negative integers
- Foreign key constraints ensure data integrity
- The API follows RESTful conventions