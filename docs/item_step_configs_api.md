# Item Step Configs API Documentation

## Overview
The Item Step Configs API allows you to manage step configurations for project items. This includes creating, reading, updating, and deleting step configurations that define the process steps for manufacturing or production items.

## Base URL
```
/api/item-step-configs
```

## Authentication
All endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:
```
Authorization: Bearer {your-token-here}
```

## Endpoints

### 1. Get All Item Step Configs
**GET** `/api/item-step-configs`

Retrieve a list of all item step configurations.

#### Response
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "item_id": 1,
            "step": "Cutting",
            "sequence": 1,
            "created_at": "2024-01-01T10:00:00.000000Z",
            "updated_at": "2024-01-01T10:00:00.000000Z",
            "item": {
                "id": 1,
                "project_id": 1,
                "name": "Sample Item",
                "dimensions": "10x20x30",
                "thickness": "5mm",
                "qty_set": 1,
                "quantity": 100,
                "unit": "pcs",
                "is_bom_locked": false,
                "is_workflow_locked": false,
                "flow_type": "assembly",
                "warehouse_qty": 0,
                "shipped_qty": 0,
                "created_at": "2024-01-01T10:00:00.000000Z",
                "updated_at": "2024-01-01T10:00:00.000000Z"
            }
        }
    ]
}
```

### 2. Get Single Item Step Config
**GET** `/api/item-step-configs/{id}`

Retrieve a specific item step configuration by ID.

#### Parameters
- `id` (integer): The ID of the item step configuration to retrieve

#### Response
```json
{
    "success": true,
    "data": {
        "id": 1,
        "item_id": 1,
        "step": "Cutting",
        "sequence": 1,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z",
        "item": {
            "id": 1,
            "project_id": 1,
            "name": "Sample Item",
            "dimensions": "10x20x30",
            "thickness": "5mm",
            "qty_set": 1,
            "quantity": 100,
            "unit": "pcs",
            "is_bom_locked": false,
            "is_workflow_locked": false,
            "flow_type": "assembly",
            "warehouse_qty": 0,
            "shipped_qty": 0,
            "created_at": "2024-01-01T10:00:00.000000Z",
            "updated_at": "2024-01-01T10:00:00.000000Z"
        }
    }
}
```

### 3. Create Item Step Config
**POST** `/api/item-step-configs`

Create a new item step configuration.

#### Request Body
```json
{
    "item_id": 1,
    "step": "Cutting",
    "sequence": 1
}
```

#### Parameters
- `item_id` (integer, required): The ID of the project item this step config belongs to
- `step` (string, required): The name of the process step
- `sequence` (integer, required): The sequence number for this step

#### Response
```json
{
    "success": true,
    "message": "Item step config created successfully",
    "data": {
        "id": 1,
        "item_id": 1,
        "step": "Cutting",
        "sequence": 1,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z",
        "item": {
            "id": 1,
            "project_id": 1,
            "name": "Sample Item",
            "dimensions": "10x20x30",
            "thickness": "5mm",
            "qty_set": 1,
            "quantity": 100,
            "unit": "pcs",
            "is_bom_locked": false,
            "is_workflow_locked": false,
            "flow_type": "assembly",
            "warehouse_qty": 0,
            "shipped_qty": 0,
            "created_at": "2024-01-01T10:00:00.000000Z",
            "updated_at": "2024-01-01T10:00:00.000000Z"
        }
    }
}
```

### 4. Update Item Step Config
**PUT** `/api/item-step-configs/{id}` or **PATCH** `/api/item-step-configs/{id}`

Update an existing item step configuration.

#### Parameters
- `id` (integer): The ID of the item step configuration to update
- `item_id` (integer, optional): The ID of the project item this step config belongs to
- `step` (string, optional): The name of the process step
- `sequence` (integer, optional): The sequence number for this step

#### Request Body
```json
{
    "item_id": 1,
    "step": "Milling",
    "sequence": 2
}
```

#### Response
```json
{
    "success": true,
    "message": "Item step config updated successfully",
    "data": {
        "id": 1,
        "item_id": 1,
        "step": "Milling",
        "sequence": 2,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T11:00:00.000000Z",
        "item": {
            "id": 1,
            "project_id": 1,
            "name": "Sample Item",
            "dimensions": "10x20x30",
            "thickness": "5mm",
            "qty_set": 1,
            "quantity": 100,
            "unit": "pcs",
            "is_bom_locked": false,
            "is_workflow_locked": false,
            "flow_type": "assembly",
            "warehouse_qty": 0,
            "shipped_qty": 0,
            "created_at": "2024-01-01T10:00:00.000000Z",
            "updated_at": "2024-01-01T10:00:00.000000Z"
        }
    }
}
```

### 5. Delete Item Step Config
**DELETE** `/api/item-step-configs/{id}`

Delete an item step configuration.

#### Parameters
- `id` (integer): The ID of the item step configuration to delete

#### Response
```json
{
    "success": true,
    "message": "Item step config deleted successfully"
}
```

### 6. Get Step Configs by Project Item ID
**GET** `/api/project-items/{itemId}/step-configs`

Retrieve all step configurations for a specific project item, ordered by sequence.

#### Parameters
- `itemId` (integer): The ID of the project item

#### Response
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "item_id": 1,
            "step": "Cutting",
            "sequence": 1,
            "created_at": "2024-01-01T10:00:00.000000Z",
            "updated_at": "2024-01-01T10:00:00.000000Z"
        },
        {
            "id": 2,
            "item_id": 1,
            "step": "Milling",
            "sequence": 2,
            "created_at": "2024-01-01T10:00:00.000000Z",
            "updated_at": "2024-01-01T10:00:00.000000Z"
        }
    ]
}
```

## Error Responses

### Validation Error
```json
{
    "success": false,
    "message": "Validation error",
    "errors": {
        "item_id": [
            "The item id field is required.",
            "The selected item id is invalid."
        ],
        "step": [
            "The step field is required.",
            "The step must not exceed 255 characters."
        ],
        "sequence": [
            "The sequence field is required.",
            "The sequence must be an integer.",
            "The sequence must be at least 0."
        ]
    }
}
```

### Not Found Error
```json
{
    "success": false,
    "message": "Project item not found"
}
```

## Data Model

### ItemStepConfigs
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier for the item step config |
| item_id | integer | Foreign key referencing the project item |
| step | string | Name of the process step |
| sequence | integer | Sequence number for ordering steps |
| created_at | datetime | Timestamp when the record was created |
| updated_at | datetime | Timestamp when the record was last updated |

## Relationships
- `item`: Belongs to a ProjectItem (project_items table)