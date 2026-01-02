# PoItem API Documentation

## Overview
The PoItem API provides endpoints to manage Purchase Order Items in the system. These endpoints allow you to create, read, update, and delete PoItem records.

## Base URL
```
https://your-api-domain.com/api
```

## Authentication
All endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:
```
Authorization: Bearer {your-token}
```

## Endpoints

### 1. Get All PoItems
- **Method**: GET
- **URL**: `/po-items`
- **Description**: Retrieve a list of all PoItems with their associated PurchaseOrder and Material information.

#### Headers
```
Authorization: Bearer {your-token}
Accept: application/json
```

#### Response
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "po_id": 1,
      "material_id": 1,
      "name": "Item Name",
      "qty": 10,
      "price": "100.00",
      "created_at": "2023-01-01T00:00:00.000000Z",
      "updated_at": "2023-01-01T00:00:00.000000Z",
      "purchaseOrder": {
        "id": 1,
        "name": "Purchase Order Name",
        // ... other purchase order fields
      },
      "material": {
        "id": 1,
        "name": "Material Name",
        // ... other material fields
      }
    }
  ]
}
```

### 2. Get Single PoItem
- **Method**: GET
- **URL**: `/po-items/{id}`
- **Description**: Retrieve a specific PoItem by its ID.

#### Path Parameters
- `id` (integer): The ID of the PoItem to retrieve.

#### Headers
```
Authorization: Bearer {your-token}
Accept: application/json
```

#### Response
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "po_id": 1,
    "material_id": 1,
    "name": "Item Name",
    "qty": 10,
    "price": "100.00",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z",
    "purchaseOrder": {
      "id": 1,
      "name": "Purchase Order Name",
      // ... other purchase order fields
    },
    "material": {
      "id": 1,
      "name": "Material Name",
      // ... other material fields
    }
  }
}
```

- **Error Response**: `404 Not Found`
```json
{
  "success": false,
  "message": "PoItem not found"
}
```

### 3. Create PoItem
- **Method**: POST
- **URL**: `/po-items`
- **Description**: Create a new PoItem.

#### Headers
```
Authorization: Bearer {your-token}
Content-Type: application/json
Accept: application/json
```

#### Request Body
```json
{
  "po_id": 1,
  "material_id": 1,
  "name": "New Item Name",
  "qty": 15,
  "price": 150.75
}
```

#### Request Body Parameters
- `po_id` (integer, required): The ID of the associated Purchase Order (must exist in purchase_orders table).
- `material_id` (integer, required): The ID of the associated Material (must exist in materials table).
- `name` (string, required, max: 255): The name of the PoItem.
- `qty` (integer, required, min: 1): The quantity of the item.
- `price` (decimal, optional, min: 0): The price of the item (up to 15 digits with 2 decimal places).

#### Response
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "po_id": 1,
    "material_id": 1,
    "name": "New Item Name",
    "qty": 15,
    "price": "150.75",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z",
    "purchaseOrder": {
      "id": 1,
      "name": "Purchase Order Name",
      // ... other purchase order fields
    },
    "material": {
      "id": 1,
      "name": "Material Name",
      // ... other material fields
    }
  },
  "message": "PoItem created successfully"
}
```

- **Error Response**: `422 Unprocessable Entity`
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "field_name": [
      "The error message for the field."
    ]
  }
}
```

### 4. Update PoItem
- **Method**: PUT
- **URL**: `/po-items/{id}`
- **Description**: Update an existing PoItem.

#### Path Parameters
- `id` (integer): The ID of the PoItem to update.

#### Headers
```
Authorization: Bearer {your-token}
Content-Type: application/json
Accept: application/json
```

#### Request Body
```json
{
  "po_id": 1,
  "material_id": 1,
  "name": "Updated Item Name",
  "qty": 20,
  "price": 200.50
}
```

#### Request Body Parameters
- `po_id` (integer, optional): The ID of the associated Purchase Order.
- `material_id` (integer, optional): The ID of the associated Material.
- `name` (string, optional, max: 255): The name of the PoItem.
- `qty` (integer, optional, min: 1): The quantity of the item.
- `price` (decimal, optional, min: 0): The price of the item.

#### Response
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "po_id": 1,
    "material_id": 1,
    "name": "Updated Item Name",
    "qty": 20,
    "price": "200.50",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-02T00:00:00.000000Z",
    "purchaseOrder": {
      "id": 1,
      "name": "Purchase Order Name",
      // ... other purchase order fields
    },
    "material": {
      "id": 1,
      "name": "Material Name",
      // ... other material fields
    }
  },
  "message": "PoItem updated successfully"
}
```

- **Error Response**: `404 Not Found`
```json
{
  "success": false,
  "message": "PoItem not found"
}
```

- **Error Response**: `422 Unprocessable Entity`
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "field_name": [
      "The error message for the field."
    ]
  }
}
```

### 5. Delete PoItem
- **Method**: DELETE
- **URL**: `/po-items/{id}`
- **Description**: Delete a specific PoItem by its ID.

#### Path Parameters
- `id` (integer): The ID of the PoItem to delete.

#### Headers
```
Authorization: Bearer {your-token}
Accept: application/json
```

#### Response
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "PoItem deleted successfully"
}
```

- **Error Response**: `404 Not Found`
```json
{
  "success": false,
  "message": "PoItem not found"
}
```

## Error Responses

### Common Error Codes
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Requested resource does not exist
- `422 Unprocessable Entity`: Validation errors in the request data
- `500 Internal Server Error`: Server-side error

## Notes
- All timestamps are in ISO 8601 format (YYYY-MM-DDTHH:MM:SS.SSSSSSZ)
- The `po_id` field references the `purchase_orders` table and will cascade delete (if PO is deleted, items are also deleted)
- The `material_id` field references the `materials` table and is restricted from deletion (material cannot be deleted while in use)