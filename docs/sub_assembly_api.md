# Sub Assembly API Documentation

## Overview
The Sub Assembly API provides endpoints for managing sub assembly components in the manufacturing system. Sub assemblies are components that are part of larger project items and may have their own production processes.

## Base URL
```
https://your-api-domain.com/api
```

## Authentication
All endpoints require authentication using a Bearer token. Include the token in the Authorization header:
```
Authorization: Bearer {your-api-token}
```

## Endpoints

### 1. Get All Sub Assemblies
Retrieve a paginated list of all sub assemblies.

- **Method**: `GET`
- **Endpoint**: `/sub-assemblies`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Response
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "item_id": 1,
        "name": "Engine Component",
        "qty_per_parent": 2,
        "total_needed": 10,
        "completed_qty": 5,
        "total_produced": 8,
        "consumed_qty": 3,
        "material_id": 1,
        "processes": [
          {
            "name": "Machining",
            "duration": 60,
            "status": "completed"
          }
        ],
        "step_stats": {
          "total_steps": 5,
          "completed_steps": 3,
          "pending_steps": 2
        },
        "is_locked": false,
        "created_at": "2024-01-01T10:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z",
        "item": {
          "id": 1,
          "name": "Project Item Name",
          // ... other item fields
        },
        "material": {
          "id": 1,
          "name": "Steel Plate",
          // ... other material fields
        }
      }
    ],
    "links": {
      "first": "http://your-api-domain.com/api/sub-assemblies?page=1",
      "last": "http://your-api-domain.com/api/sub-assemblies?page=3",
      "prev": null,
      "next": "http://your-api-domain.com/api/sub-assemblies?page=2"
    },
    "meta": {
      "current_page": 1,
      "from": 1,
      "last_page": 3,
      "links": [...],
      "path": "http://your-api-domain.com/api/sub-assemblies",
      "per_page": 15,
      "to": 15,
      "total": 45
    }
  }
}
```

### 2. Create Sub Assembly
Create a new sub assembly.

- **Method**: `POST`
- **Endpoint**: `/sub-assemblies`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
  - `Content-Type: application/json`

#### Request Body
```json
{
  "item_id": 1,
  "name": "New Sub Assembly",
  "qty_per_parent": 3,
  "total_needed": 15,
  "completed_qty": 0,
  "total_produced": 0,
  "consumed_qty": 0,
  "material_id": 2,
  "processes": [
    {
      "name": "Assembly",
      "duration": 120,
      "status": "pending"
    }
  ],
  "step_stats": {
    "total_steps": 4,
    "completed_steps": 0,
    "pending_steps": 4
  },
  "is_locked": false
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 2,
    "item_id": 1,
    "name": "New Sub Assembly",
    "qty_per_parent": 3,
    "total_needed": 15,
    "completed_qty": 0,
    "total_produced": 0,
    "consumed_qty": 0,
    "material_id": 2,
    "processes": [
      {
        "name": "Assembly",
        "duration": 120,
        "status": "pending"
      }
    ],
    "step_stats": {
      "total_steps": 4,
      "completed_steps": 0,
      "pending_steps": 4
    },
    "is_locked": false,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z",
    "item": {
      "id": 1,
      "name": "Project Item Name",
      // ... other item fields
    },
    "material": {
      "id": 2,
      "name": "Material Name",
      // ... other material fields
    }
  }
}
```

### 3. Get Single Sub Assembly
Retrieve a specific sub assembly by ID.

- **Method**: `GET`
- **Endpoint**: `/sub-assemblies/{id}`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "item_id": 1,
    "name": "Engine Component",
    "qty_per_parent": 2,
    "total_needed": 10,
    "completed_qty": 5,
    "total_produced": 8,
    "consumed_qty": 3,
    "material_id": 1,
    "processes": [
      {
        "name": "Machining",
        "duration": 60,
        "status": "completed"
      }
    ],
    "step_stats": {
      "total_steps": 5,
      "completed_steps": 3,
      "pending_steps": 2
    },
    "is_locked": false,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "item": {
      "id": 1,
      "name": "Project Item Name",
      // ... other item fields
    },
    "material": {
      "id": 1,
      "name": "Steel Plate",
      // ... other material fields
    }
  }
}
```

### 4. Update Sub Assembly
Update an existing sub assembly.

- **Method**: `PUT` or `PATCH`
- **Endpoint**: `/sub-assemblies/{id}`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`
  - `Content-Type: application/json`

#### Request Body
```json
{
  "name": "Updated Sub Assembly",
  "qty_per_parent": 4,
  "material_id": 3,
  "is_locked": true
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "item_id": 1,
    "name": "Updated Sub Assembly",
    "qty_per_parent": 4,
    "total_needed": 10,
    "completed_qty": 5,
    "total_produced": 8,
    "consumed_qty": 3,
    "material_id": 3,
    "processes": [
      {
        "name": "Machining",
        "duration": 60,
        "status": "completed"
      }
    ],
    "step_stats": {
      "total_steps": 5,
      "completed_steps": 3,
      "pending_steps": 2
    },
    "is_locked": true,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T13:00:00Z",
    "item": {
      "id": 1,
      "name": "Project Item Name",
      // ... other item fields
    },
    "material": {
      "id": 3,
      "name": "Aluminum Sheet",
      // ... other material fields
    }
  }
}
```

### 5. Delete Sub Assembly
Delete a sub assembly.

- **Method**: `DELETE`
- **Endpoint**: `/sub-assemblies/{id}`
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Accept: application/json`

#### Response
```json
{
  "success": true,
  "message": "Sub assembly deleted successfully"
}
```

## Error Responses

### Validation Error
When request data fails validation:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field_name": [
      "The field_name field is required.",
      "The field_name must be a string.",
      // ... other validation messages
    ]
  }
}
```

### Not Found Error
When a sub assembly doesn't exist:
```json
{
  "success": false,
  "message": "Sub assembly not found"
}
```

### Unauthorized Error
When authentication fails:
```json
{
  "message": "Unauthenticated."
}
```

## Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| item_id | integer | Yes | ID of the associated project item |
| name | string | Yes | Name of the sub assembly |
| qty_per_parent | integer | Yes | Quantity needed per parent item |
| total_needed | integer | Yes | Total quantity needed |
| completed_qty | integer | No | Quantity completed |
| total_produced | integer | No | Total quantity produced |
| consumed_qty | integer | No | Quantity consumed |
| material_id | integer | No | ID of the associated material |
| processes | JSON | Yes | Array of process information |
| step_stats | JSON | No | Statistics about production steps |
| is_locked | boolean | Yes | Whether the sub assembly is locked for changes |