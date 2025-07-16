# WhatsApp Integration API Documentation

## Overview
This document describes the WhatsApp Web.js integration endpoints for the Messaging Coordination API. These endpoints allow you to create and manage WhatsApp groups through the API.

## Prerequisites
- WhatsApp Business account or personal WhatsApp account
- Phone number for authentication
- API server must be running and accessible

## Authentication Flow

### 1. QR Code Generation
First, generate a QR code to authenticate with WhatsApp:

```http
GET /api/whatsapp/qr-code
```

**Response:**
```json
{
  "success": true,
  "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "connected": false
}
```

### 2. Check Connection Status
Check if WhatsApp is connected:

```http
GET /api/whatsapp/status
```

**Response:**
```json
{
  "success": true,
  "connected": true,
  "message": "WhatsApp is connected"
}
```

## Group Management Endpoints

### Create WhatsApp Group
Creates a new WhatsApp group with specified participants.

```http
POST /api/whatsapp/groups/create
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "groupName": "Project Team",
  "participants": [
    "+1234567890",
    "1234567890",
    "+91987654321"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp group created successfully",
  "data": {
    "groupId": "120363042123456789@g.us",
    "groupName": "Project Team",
    "participants": [
      "11234567890@c.us",
      "11234567890@c.us",
      "91987654321@c.us"
    ],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Add Members to Group
Add new members to an existing WhatsApp group.

```http
POST /api/whatsapp/groups/{groupId}/members/add
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "participants": [
    "+1555123456",
    "+1555654321"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Members added to WhatsApp group successfully",
  "data": {
    "groupId": "120363042123456789@g.us",
    "addedParticipants": [
      "11555123456@c.us",
      "11555654321@c.us"
    ],
    "result": {}
  }
}
```

### Remove Members from Group
Remove members from an existing WhatsApp group.

```http
DELETE /api/whatsapp/groups/{groupId}/members/remove
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "participants": [
    "+1555123456"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Members removed from WhatsApp group successfully",
  "data": {
    "groupId": "120363042123456789@g.us",
    "removedParticipants": [
      "11555123456@c.us"
    ],
    "result": {}
  }
}
```

### Get WhatsApp Groups
Retrieve all WhatsApp groups associated with the authenticated account.

```http
GET /api/whatsapp/groups
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp groups retrieved successfully",
  "data": {
    "groups": [
      {
        "id": "120363042123456789@g.us",
        "name": "Project Team",
        "description": "Team collaboration group",
        "participantCount": 5,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "isOwner": true
      }
    ],
    "totalGroups": 1
  }
}
```

### Get Group Information
Get detailed information about a specific WhatsApp group.

```http
GET /api/whatsapp/groups/{groupId}
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "message": "Group info retrieved successfully",
  "data": {
    "id": "120363042123456789@g.us",
    "name": "Project Team",
    "description": "Team collaboration group",
    "participants": [
      {
        "id": "11234567890@c.us",
        "isAdmin": true,
        "isSuperAdmin": false
      },
      {
        "id": "11555123456@c.us",
        "isAdmin": false,
        "isSuperAdmin": false
      }
    ],
    "participantCount": 2,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "isOwner": true
  }
}
```

## Phone Number Format
The API accepts phone numbers in various formats:
- International format: `+1234567890`
- National format: `1234567890`
- With spaces/dashes: `+1 234-567-890`

All numbers are automatically formatted to WhatsApp's required format (`{countrycode}{number}@c.us`).

## Rate Limiting
The API implements rate limiting to prevent abuse:
- General WhatsApp API calls: 100 requests per 15 minutes
- Group operations: 10 requests per 5 minutes

## Error Handling

### Common Error Responses

**WhatsApp Not Connected:**
```json
{
  "success": false,
  "message": "WhatsApp client is not connected. Please scan QR code first."
}
```

**Invalid Phone Numbers:**
```json
{
  "success": false,
  "message": "Invalid phone numbers found",
  "invalidNumbers": ["invalid-number"]
}
```

**Rate Limit Exceeded:**
```json
{
  "success": false,
  "message": "Too many WhatsApp API requests, please try again later."
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "groupName",
      "message": "Group name must be between 2 and 100 characters"
    }
  ]
}
```

## Authentication
All group management endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Logging
All WhatsApp operations are logged to `logs/whatsapp.log` with the following information:
- Connection events
- Group operations
- Phone number validation
- API operation results
- Error details

## Security Notes
- WhatsApp sessions are stored locally in `whatsapp-sessions/` directory
- Session data is persistent across server restarts
- Regular QR code re-authentication may be required
- Follow WhatsApp's Terms of Service and avoid spamming

## Example Usage Flow

1. **Initial Setup:**
   ```bash
   # Get QR code
   curl -X GET http://localhost:5000/api/whatsapp/qr-code
   
   # Scan QR code with WhatsApp mobile app
   
   # Check connection status
   curl -X GET http://localhost:5000/api/whatsapp/status
   ```

2. **Create Group:**
   ```bash
   curl -X POST http://localhost:5000/api/whatsapp/groups/create \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "groupName": "Team Meeting",
       "participants": ["+1234567890", "+1987654321"]
     }'
   ```

3. **Manage Members:**
   ```bash
   # Add members
   curl -X POST http://localhost:5000/api/whatsapp/groups/GROUP_ID/members/add \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "participants": ["+1555123456"]
     }'
   
   # Remove members
   curl -X DELETE http://localhost:5000/api/whatsapp/groups/GROUP_ID/members/remove \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "participants": ["+1555123456"]
     }'
   ```

## Troubleshooting

### Common Issues:
1. **QR Code Not Generating:** Restart the server and try again
2. **Connection Lost:** Check logs and regenerate QR code
3. **Group Creation Failed:** Verify all phone numbers are valid and registered on WhatsApp
4. **Rate Limit Hit:** Wait for the rate limit window to reset

### Log Files:
- Check `logs/whatsapp.log` for detailed operation logs
- Server console shows connection status and errors
