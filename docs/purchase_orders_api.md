# Purchase Orders API

This document describes the API endpoints for managing Purchase Orders in the system.

## Base URL

All endpoints are relative to the base API URL: `https://your-domain.com/api`

## Authentication

All endpoints require authentication using Laravel Sanctum. Include the authentication token in the request header:

```
Authorization: Bearer {your-api-token}
```

## Endpoints

### Get All Purchase Orders

Retrieve a paginated list of all purchase orders.

-   **Method**: `GET`
-   **Endpoint**: `/api/purchase-orders`
-   **Headers**:
    -   `Authorization: Bearer {token}`
    -   `Accept: application/json`

#### Query Parameters

-   `page` (optional): Page number for pagination (default: 1)
-   `per_page` (optional): Number of records per page (default: 10)

#### Response

-   **Status Code**: `200 OK`
-   **Response Body**:

```json
{
    "current_page": 1,
    "data": [
        {
            "id": 1,
            "code": "PO-001",
            "date": "2023-12-01T00:00:00.000000Z",
            "supplier_id": 1,
            "rfq_id": 1,
            "description": "Test purchase order",
            "status": "OPEN",
            "grand_total": "1500.00",
            "created_at": "2023-12-01T10:00:00.000000Z",
            "updated_at": "2023-12-01T10:00:00.000000Z",
            "supplier": {
                "id": 1,
                "name": "Supplier Name",
                "address": "Supplier Address",
                "contact": "Supplier Contact",
                "created_at": "2023-12-01T10:00:00.000000Z",
                "updated_at": "2023-12-01T10:00:00.000000Z"
            },
            "rfq": {
                "id": 1,
                "code": "RFQ-001",
                "date": "2023-11-01T00:00:00.000000Z",
                "description": "RFQ Description",
                "status": "DRAFT",
                "created_at": "2023-11-01T10:00:00.000000Z",
                "updated_at": "2023-11-01T10:00:00.000000Z"
            }
        }
    ],
    "first_page_url": "http://your-domain.com/api/purchase-orders?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://your-domain.com/api/purchase-orders?page=1",
    "links": [
        {
            "url": null,
            "label": "&laquo; Previous",
            "page": null,
            "active": false
        },
        {
            "url": "http://your-domain.com/api/purchase-orders?page=1",
            "label": "1",
            "page": 1,
            "active": true
        }
    ],
    "next_page_url": null,
    "path": "http://your-domain.com/api/purchase-orders",
    "per_page": 10,
    "prev_page_url": null,
    "to": 1,
    "total": 1
}
```

### Get Single Purchase Order

Retrieve a specific purchase order by ID.

-   **Method**: `GET`
-   **Endpoint**: `/api/purchase-orders/{id}`
-   **Headers**:
    -   `Authorization: Bearer {token}`
    -   `Accept: application/json`
-   **Path Parameters**:
    -   `id`: The ID of the purchase order to retrieve

#### Response

-   **Status Code**: `200 OK`
-   **Response Body**:

```json
{
    "id": 1,
    "code": "PO-001",
    "date": "2023-12-01T00:00:00.000000Z",
    "supplier_id": 1,
    "rfq_id": 1,
    "description": "Test purchase order",
    "status": "OPEN",
    "grand_total": "1500.00",
    "created_at": "2023-12-01T10:00:00.000000Z",
    "updated_at": "2023-12-01T10:00:00.000000Z",
    "supplier": {
        "id": 1,
        "name": "Supplier Name",
        "address": "Supplier Address",
        "contact": "Supplier Contact",
        "created_at": "2023-12-01T10:00:00.000000Z",
        "updated_at": "2023-12-01T10:00:00.000000Z"
    },
    "rfq": {
        "id": 1,
        "code": "RFQ-001",
        "date": "2023-11-01T00:00:00.000000Z",
        "description": "RFQ Description",
        "status": "DRAFT",
        "created_at": "2023-11-01T10:00:00.000000Z",
        "updated_at": "2023-11-01T10:00:00.000000Z"
    }
}
```

### Create Purchase Order

Create a new purchase order.

-   **Method**: `POST`
-   **Endpoint**: `/api/purchase-orders`
-   **Headers**:
    -   `Authorization: Bearer {token}`
    -   `Accept: application/json`
    -   `Content-Type: application/json`

#### Request Body

```json
{
    "code": "PO-002",
    "date": "2023-12-02",
    "supplier_id": 1,
    "rfq_id": 1,
    "description": "New purchase order",
    "status": "OPEN",
    "grand_total": 2500.0,
    "po_items": [
        {
            "material_id": 1,
            "name": "Material Item 1",
            "qty": 10,
            "price": 150.00
        },
        {
            "material_id": 2,
            "name": "Material Item 2",
            "qty": 5,
            "price": 200.00
        }
    ]
}
```

#### Request Parameters

-   `code` (required): Unique code for the purchase order (string, max 255 characters)
-   `date` (required): Date of the purchase order (date format: YYYY-MM-DD)
-   `supplier_id` (required): ID of the supplier (integer, must exist in suppliers table)
-   `rfq_id` (required): ID of the related RFQ (integer, must exist in rfqs table)
-   `description` (optional): Description of the purchase order (string)
-   `status` (required): Status of the purchase order (enum: OPEN, RECEIVED)
-   `grand_total` (required): Total amount of the purchase order (numeric, minimum 0)
-   `po_items` (required): Array of purchase order items (array of objects)
    -   `po_items[].material_id` (required): ID of the material (integer, must exist in materials table)
    -   `po_items[].name` (required): Name of the item (string, max 255 characters)
    -   `po_items[].qty` (required): Quantity of the item (integer, minimum 1)
    -   `po_items[].price` (optional): Price of the item (numeric, minimum 0)

#### Response

-   **Status Code**: `201 Created`
-   **Response Body**:

```json
{
    "id": 2,
    "code": "PO-002",
    "date": "2023-12-02T00:00:00.000000Z",
    "supplier_id": 1,
    "rfq_id": 1,
    "description": "New purchase order",
    "status": "OPEN",
    "grand_total": "2500.00",
    "created_at": "2023-12-02T10:00:00.000000Z",
    "updated_at": "2023-12-02T10:00:00.000000Z",
    "supplier": {
        "id": 1,
        "name": "Supplier Name",
        "address": "Supplier Address",
        "contact": "Supplier Contact",
        "created_at": "2023-12-01T10:00:00.000000Z",
        "updated_at": "2023-12-01T10:00:00.000000Z"
    },
    "rfq": {
        "id": 1,
        "code": "RFQ-001",
        "date": "2023-11-01T00:00:00.000000Z",
        "description": "RFQ Description",
        "status": "DRAFT",
        "created_at": "2023-11-01T10:00:00.000000Z",
        "updated_at": "2023-11-01T10:00:00.000000Z"
    },
    "poItems": [
        {
            "id": 1,
            "po_id": 2,
            "material_id": 1,
            "name": "Material Item 1",
            "qty": 10,
            "price": "150.00",
            "created_at": "2023-12-02T10:00:00.000000Z",
            "updated_at": "2023-12-02T10:00:00.000000Z"
        },
        {
            "id": 2,
            "po_id": 2,
            "material_id": 2,
            "name": "Material Item 2",
            "qty": 5,
            "price": "200.00",
            "created_at": "2023-12-02T10:00:00.000000Z",
            "updated_at": "2023-12-02T10:00:00.000000Z"
        }
    ]
}
```

### Update Purchase Order

Update an existing purchase order.

-   **Method**: `PUT` or `PATCH`
-   **Endpoint**: `/api/purchase-orders/{id}`
-   **Headers**:
    -   `Authorization: Bearer {token}`
    -   `Accept: application/json`
    -   `Content-Type: application/json`
-   **Path Parameters**:
    -   `id`: The ID of the purchase order to update

#### Request Body

```json
{
    "code": "PO-002",
    "date": "2023-12-02",
    "supplier_id": 2,
    "rfq_id": 2,
    "description": "Updated purchase order",
    "status": "RECEIVED",
    "grand_total": 3000.0
}
```

#### Request Parameters

Same as create endpoint, but all fields are optional for updates.

#### Response

-   **Status Code**: `200 OK`
-   **Response Body**:

```json
{
    "id": 2,
    "code": "PO-002",
    "date": "2023-12-02T00:00:00.000000Z",
    "supplier_id": 2,
    "rfq_id": 2,
    "description": "Updated purchase order",
    "status": "RECEIVED",
    "grand_total": "3000.00",
    "created_at": "2023-12-02T10:00:00.000000Z",
    "updated_at": "2023-12-03T10:00:00.000000Z",
    "supplier": {
        "id": 2,
        "name": "Updated Supplier Name",
        "address": "Updated Supplier Address",
        "contact": "Updated Supplier Contact",
        "created_at": "2023-12-02T10:00:00.000000Z",
        "updated_at": "2023-12-02T10:00:00.000000Z"
    },
    "rfq": {
        "id": 2,
        "code": "RFQ-002",
        "date": "2023-11-02T00:00:00.000000Z",
        "description": "Updated RFQ Description",
        "status": "DRAFT",
        "created_at": "2023-11-02T10:00:00.000000Z",
        "updated_at": "2023-11-02T10:00:00.000000Z"
    }
}
```

### Delete Purchase Order

Delete a specific purchase order.

-   **Method**: `DELETE`
-   **Endpoint**: `/api/purchase-orders/{id}`
-   **Headers**:
    -   `Authorization: Bearer {token}`
    -   `Accept: application/json`
-   **Path Parameters**:
    -   `id`: The ID of the purchase order to delete

#### Response

-   **Status Code**: `200 OK`
-   **Response Body**:

```json
{
    "message": "Purchase order deleted successfully"
}
```

## Error Responses

### Validation Error

-   **Status Code**: `422 Unprocessable Entity`
-   **Response Body**:

```json
{
    "errors": {
        "field_name": [
            "The field_name field is required.",
            "The selected field_name is invalid."
        ]
    }
}
```

### Not Found

-   **Status Code**: `404 Not Found`
-   **Response Body**:

```json
{
    "message": "Resource not found"
}
```

### Unauthorized

-   **Status Code**: `401 Unauthorized`
-   **Response Body**:

```json
{
    "message": "Unauthenticated."
}
```

## Status Values

The purchase order status can have the following values:

-   `OPEN`: Purchase order is open and pending
-   `RECEIVED`: Purchase order has been received

## Related Models

-   **Supplier**: Each purchase order is associated with a supplier
-   **RFQ**: Each purchase order is associated with a Request for Quotation (RFQ)
