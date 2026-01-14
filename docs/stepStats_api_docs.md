# Step Stats API Documentation

## Overview
The Step Stats functionality tracks production progress for each process step in sub-assemblies. It monitors the quantity of items produced and available for each manufacturing step.

## Data Structure

### Step Stats Object
```json
{
  "POTONG": {
    "produced": 0,
    "available": 0
  },
  "PLONG": {
    "produced": 0,
    "available": 0
  },
  "PRESS": {
    "produced": 0,
    "available": 0
  },
  "LAS": {
    "produced": 0,
    "available": 0
  },
  "PHOSPHATING": {
    "produced": 0,
    "available": 0
  },
  "CAT": {
    "produced": 0,
    "available": 0
  },
  "PACKING": {
    "produced": 0,
    "available": 0
  }
}
```

### Properties
- `produced`: Number of items produced in this step
- `available`: Number of items available to proceed to the next step

## Supported Process Steps
- `POTONG`: Cutting
- `PLONG`: Bending
- `PRESS`: Pressing
- `LAS`: Welding
- `PHOSPHATING`: Surface Treatment
- `CAT`: Coating
- `PACKING`: Final Assembly

## API Endpoints

### GET /api/sub-assemblies
Retrieves all sub-assemblies with their step statistics.

#### Response
```json
[
  {
    "id": "string",
    "itemId": "string",
    "name": "string",
    "qtyPerParent": 0,
    "totalNeeded": 0,
    "completedQty": 0,
    "totalProduced": 0,
    "consumedQty": 0,
    "materialId": "string",
    "processes": ["string"],
    "isLocked": false,
    "stepStats": {
      "POTONG": {
        "produced": 0,
        "available": 0
      },
      "PLONG": {
        "produced": 0,
        "available": 0
      }
      // ... other steps
    }
  }
]
```

### GET /api/sub-assemblies/:id
Retrieves a specific sub-assembly by ID with its step statistics.

#### Response
```json
{
  "id": "string",
  "itemId": "string",
  "name": "string",
  "qtyPerParent": 0,
  "totalNeeded": 0,
  "completedQty": 0,
  "totalProduced": 0,
  "consumedQty": 0,
  "materialId": "string",
  "processes": ["string"],
  "isLocked": false,
  "stepStats": {
    "POTONG": {
      "produced": 0,
      "available": 0
    },
    "PLONG": {
      "produced": 0,
      "available": 0
    }
    // ... other steps
  }
}
```

### GET /api/sub-assemblies/item/:itemId
Retrieves all sub-assemblies associated with a specific item ID with their step statistics.

#### Response
```json
[
  {
    "id": "string",
    "itemId": "string",
    "name": "string",
    "qtyPerParent": 0,
    "totalNeeded": 0,
    "completedQty": 0,
    "totalProduced": 0,
    "consumedQty": 0,
    "materialId": "string",
    "processes": ["string"],
    "isLocked": false,
    "stepStats": {
      "POTONG": {
        "produced": 0,
        "available": 0
      },
      "PLONG": {
        "produced": 0,
        "available": 0
      }
      // ... other steps
    }
  }
]
```

### POST /api/sub-assemblies
Creates a new sub-assembly with initialized step statistics.

#### Request Body
```json
{
  "id": "string",
  "itemId": "string",
  "name": "string",
  "qtyPerParent": 0,
  "totalNeeded": 0,
  "completedQty": 0,
  "totalProduced": 0,
  "consumedQty": 0,
  "materialId": "string",
  "processes": ["POTONG", "LAS", "PACKING"],
  "isLocked": false
}
```

#### Response
```json
{
  "id": "string",
  "itemId": "string",
  "name": "string",
  "qtyPerParent": 0,
  "totalNeeded": 0,
  "completedQty": 0,
  "totalProduced": 0,
  "consumedQty": 0,
  "materialId": "string",
  "processes": ["POTONG", "LAS", "PACKING"],
  "isLocked": false,
  "stepStats": {
    "POTONG": {
      "produced": 0,
      "available": 0
    },
    "LAS": {
      "produced": 0,
      "available": 0
    },
    "PACKING": {
      "produced": 0,
      "available": 0
    }
  }
}
```

### PUT /api/sub-assemblies/:id
Updates an existing sub-assembly and its step statistics.

#### Request Body
```json
{
  "name": "string",
  "qtyPerParent": 0,
  "totalNeeded": 0,
  "completedQty": 0,
  "totalProduced": 0,
  "consumedQty": 0,
  "processes": ["POTONG", "LAS", "PACKING"],
  "stepStats": {
    "POTONG": {
      "produced": 5,
      "available": 5
    },
    "LAS": {
      "produced": 3,
      "available": 3
    }
  }
}
```

#### Response
```json
{
  "id": "string",
  "itemId": "string",
  "name": "string",
  "qtyPerParent": 0,
  "totalNeeded": 0,
  "completedQty": 0,
  "totalProduced": 0,
  "consumedQty": 0,
  "materialId": "string",
  "processes": ["POTONG", "LAS", "PACKING"],
  "isLocked": false,
  "stepStats": {
    "POTONG": {
      "produced": 5,
      "available": 5
    },
    "LAS": {
      "produced": 3,
      "available": 3
    },
    "PACKING": {
      "produced": 0,
      "available": 0
    }
  }
}
```

### PUT /api/sub-assemblies/item/:itemId/lock
Locks or unlocks all sub-assemblies associated with an item ID.

#### Request Body
```json
{
  "isLocked": true
}
```

#### Response
```json
{
  "message": "Sub-assemblies for item <itemId> locked successfully",
  "count": 2,
  "subAssemblies": [
    {
      "id": "string",
      "itemId": "string",
      "name": "string",
      "qtyPerParent": 0,
      "totalNeeded": 0,
      "completedQty": 0,
      "totalProduced": 0,
      "consumedQty": 0,
      "materialId": "string",
      "processes": ["POTONG", "LAS"],
      "isLocked": true,
      "stepStats": {
        "POTONG": {
          "produced": 0,
          "available": 0
        },
        "LAS": {
          "produced": 0,
          "available": 0
        }
      }
    }
  ]
}
```

## Step Stats Initialization Logic

When a sub-assembly is created or updated:

1. If `stepStats` is not provided or is empty, it will be initialized with default values for all processes in the `processes` array
2. For each process step in the `processes` array, a corresponding entry is created in `stepStats`
3. The `available` value for the first step in the process is set to `totalNeeded`
4. The `produced` value starts at 0 for all steps

## Logging

The system logs stepStats values for debugging purposes:
- When retrieving all sub-assemblies
- When retrieving a specific sub-assembly by ID
- When retrieving sub-assemblies by item ID
- When creating a new sub-assembly
- When updating an existing sub-assembly
- When locking/unlocking sub-assemblies by item ID