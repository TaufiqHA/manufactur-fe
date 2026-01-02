# RFQ Item API Documentation

This document provides comprehensive documentation for the RFQ Item API endpoints.

## Base URL
All API endpoints are prefixed with `/api/`.

## Authentication
All endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:
```
Authorization: Bearer {your-token-here}
```

## Endpoints

### 1. Get All RFQ Items
**GET** `/api/rfq-items`

#### Description
Retrieve a list of all RFQ items with their related RFQ and Material data.

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

#### Response
- **Status Code:** `200 OK`
- **Content-Type:** `application/json`

#### Response Body
```json
[
  {
    "id": 1,
    "rfq_id": 1,
    "material_id": 1,
    "name": "Sample Item",
    "qty": 10,
    "price": "100.50",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
  }
]
```

#### Example Request
```bash
curl -X GET \
  "http://localhost:8000/api/rfq-items" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

---

### 2. Get Single RFQ Item
**GET** `/api/rfq-items/{id}`

#### Description
Retrieve a specific RFQ item by its ID with related RFQ and Material data.

#### Path Parameters
- `id` (integer, required): The ID of the RFQ item to retrieve.

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

#### Response
- **Status Code:** `200 OK`
- **Content-Type:** `application/json`

#### Response Body
```json
{
  "id": 1,
  "rfq_id": 1,
  "material_id": 1,
  "name": "Sample Item",
  "qty": 10,
  "price": "100.50",
  "created_at": "2023-01-01T00:00:00.000000Z",
  "updated_at": "2023-01-01T00:00:00.000000Z"
}
```

#### Example Request
```bash
curl -X GET \
  "http://localhost:8000/api/rfq-items/1" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

---

### 3. Create RFQ Item
**POST** `/api/rfq-items`

#### Description
Create a new RFQ item.

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

#### Request Body
```json
{
  "rfq_id": 1,
  "material_id": 1,
  "name": "New RFQ Item",
  "qty": 5,
  "price": 150.75
}
```

#### Request Body Parameters
- `rfq_id` (integer, required): The ID of the associated RFQ. Must exist in the `rfqs` table.
- `material_id` (integer, required): The ID of the associated material. Must exist in the `materials` table.
- `name` (string, required): The name of the RFQ item. Maximum 255 characters.
- `qty` (integer, required): The quantity of the item. Must be greater than 0.
- `price` (number, optional): The price of the item. Must be a positive number with up to 2 decimal places.

#### Response
- **Status Code:** `201 Created`
- **Content-Type:** `application/json`

#### Response Body
```json
{
  "id": 1,
  "rfq_id": 1,
  "material_id": 1,
  "name": "New RFQ Item",
  "qty": 5,
  "price": "150.75",
  "created_at": "2023-01-01T00:00:00.000000Z",
  "updated_at": "2023-01-01T00:00:00.000000Z"
}
```

#### Example Request
```bash
curl -X POST \
  "http://localhost:8000/api/rfq-items" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "rfq_id": 1,
    "material_id": 1,
    "name": "New RFQ Item",
    "qty": 5,
    "price": 150.75
  }'
```

#### Error Response
- **Status Code:** `422 Unprocessable Entity`
- **Content-Type:** `application/json`

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "rfq_id": [
      "The rfq id field is required.",
      "The selected rfq id is invalid."
    ],
    "name": [
      "The name field is required.",
      "The name must not exceed 255 characters."
    ],
    "qty": [
      "The qty field is required.",
      "The qty must be an integer.",
      "The qty must be at least 1."
    ]
  }
}
```

---

### 4. Update RFQ Item
**PUT/PATCH** `/api/rfq-items/{id}`

#### Description
Update an existing RFQ item.

#### Path Parameters
- `id` (integer, required): The ID of the RFQ item to update.

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "Updated RFQ Item",
  "qty": 10,
  "price": 200.00
}
```

#### Request Body Parameters
- `rfq_id` (integer, optional): The ID of the associated RFQ. Must exist in the `rfqs` table.
- `material_id` (integer, optional): The ID of the associated material. Must exist in the `materials` table.
- `name` (string, optional): The name of the RFQ item. Maximum 255 characters.
- `qty` (integer, optional): The quantity of the item. Must be greater than 0.
- `price` (number, optional): The price of the item. Must be a positive number with up to 2 decimal places.

#### Response
- **Status Code:** `200 OK`
- **Content-Type:** `application/json`

#### Response Body
```json
{
  "id": 1,
  "rfq_id": 1,
  "material_id": 1,
  "name": "Updated RFQ Item",
  "qty": 10,
  "price": "200.00",
  "created_at": "2023-01-01T00:00:00.000000Z",
  "updated_at": "2023-01-02T00:00:00.000000Z"
}
```

#### Example Request
```bash
curl -X PUT \
  "http://localhost:8000/api/rfq-items/1" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated RFQ Item",
    "qty": 10,
    "price": 200.00
  }'
```

#### Error Response
- **Status Code:** `422 Unprocessable Entity`
- **Content-Type:** `application/json`

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": [
      "The name must not exceed 255 characters."
    ],
    "qty": [
      "The qty must be an integer.",
      "The qty must be at least 1."
    ]
  }
}
```

---

### 5. Delete RFQ Item
**DELETE** `/api/rfq-items/{id}`

#### Description
Delete an existing RFQ item.

#### Path Parameters
- `id` (integer, required): The ID of the RFQ item to delete.

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

#### Response
- **Status Code:** `204 No Content`

#### Example Request
```bash
curl -X DELETE \
  "http://localhost:8000/api/rfq-items/1" \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"
```

---

## Error Responses

### 401 Unauthorized
Returned when the request lacks valid authentication credentials.

```json
{
  "message": "Unauthenticated."
}
```

### 404 Not Found
Returned when the requested resource does not exist.

```json
{
  "message": "The requested resource was not found."
}
```

### 422 Unprocessable Entity
Returned when the request contains invalid data.

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "Error message 1",
      "Error message 2"
    ]
  }
}
```

## Data Models

### RFQ Item Object
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier for the RFQ item |
| rfq_id | integer | ID of the associated RFQ |
| material_id | integer | ID of the associated material |
| name | string | Name of the RFQ item |
| qty | integer | Quantity of the item |
| price | decimal | Price of the item (up to 2 decimal places) |
| created_at | datetime | Timestamp when the record was created |
| updated_at | datetime | Timestamp when the record was last updated |

## Relationships
- **RFQ Item** belongs to **RFQ** (rfq_id references rfqs.id)
- **RFQ Item** belongs to **Material** (material_id references materials.id)