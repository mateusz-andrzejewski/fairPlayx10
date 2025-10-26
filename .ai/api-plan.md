# REST API Plan for FairPlay Platform

## 1. Resources

Based on the database schema and PRD requirements, the main API resources are:

- **Users** (`users` table) - User accounts with authentication, roles, and status
- **Players** (`players` table) - Player profiles with skill ratings and positions
- **Events** (`events` table) - Football match events with parameters
- **Event Signups** (`event_signups` table) - Player registrations for events
- **Team Assignments** (`team_assignments` table) - Team assignments after draw
- **Audit Logs** (`audit_logs` table) - Audit trail for critical changes

Additional business logic resources:
- **Authentication** - Supabase Auth integration
- **Event Draw** - Team balancing algorithm
- **Dashboard** - Dashboard data

## 2. Endpoints

### Users Resource

**GET /api/users**
- **Description**: List users (admin only)
- **Query Parameters**: 
  - `page` (integer, default: 1) - Page number for pagination
  - `limit` (integer, default: 20) - Items per page
  - `status` (enum: pending, approved) - Filter by status
  - `role` (enum: admin, organizer, player) - Filter by role
  - `search` (string) - Search by first_name, last_name, or email
- **Response**: 
```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "player",
      "status": "approved",
      "player_id": 123,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 403 Forbidden

**GET /api/users/{id}**
- **Description**: Get user details (admin or own profile)
- **Response**: User object (same structure as above)
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 403 Forbidden, 404 Not Found

**PATCH /api/users/{id}/approve**
- **Description**: Approve pending user account and assign role (admin only)
- **Request Body**:
```json
{
  "role": "player",
  "player_id": 123
}
```
- **Response**: Updated user object
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request (invalid role), 401 Unauthorized, 403 Forbidden, 404 Not Found

**DELETE /api/users/{id}**
- **Description**: Soft delete user (admin only)
- **Response**: Empty body
- **Success Codes**: 204 No Content
- **Error Codes**: 401 Unauthorized, 403 Forbidden, 404 Not Found

### Players Resource

**GET /api/players**
- **Description**: List players with filtering and search
- **Query Parameters**:
  - `page`, `limit` - Pagination
  - `position` (enum: forward, midfielder, defender, goalkeeper) - Filter by position
  - `search` (string) - Search by name
  - `include_skill_rate` (boolean) - Include skill_rate in response (admin only)
- **Response**:
```json
{
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "position": "forward",
      "skill_rate": 8, // Only for admin
      "date_of_birth": "1990-01-01",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

**GET /api/players/{id}**
- **Description**: Get player details
- **Response**: Player object
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

**POST /api/players**
- **Description**: Create new player (admin/organizer)
- **Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "position": "forward",
  "skill_rate": 7,
  "date_of_birth": "1990-01-01"
}
```
- **Response**: Created player object
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 403 Forbidden

**PATCH /api/players/{id}**
- **Description**: Update player (admin only for skill_rate)
- **Request Body**: Partial player object
- **Response**: Updated player object
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

**DELETE /api/players/{id}**
- **Description**: Soft delete player (admin only)
- **Response**: Empty body
- **Success Codes**: 204 No Content
- **Error Codes**: 401 Unauthorized, 403 Forbidden, 404 Not Found

### Events Resource

**GET /api/events**
- **Description**: List events with filtering
- **Query Parameters**:
  - `page`, `limit` - Pagination
  - `status` (enum: draft, active, completed) - Filter by status
  - `location` (string) - Filter by location
  - `date_from`, `date_to` - Date range filter
  - `organizer_id` (integer) - Filter by organizer
- **Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Weekend Match",
      "location": "Central Park",
      "event_datetime": "2024-01-15T14:00:00Z",
      "max_places": 22,
      "optional_fee": 10.00,
      "status": "active",
      "current_signups_count": 18,
      "organizer_id": 5,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

**GET /api/events/{id}**
- **Description**: Get event details with signups
- **Response**: Event object with nested signups
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

**POST /api/events**
- **Description**: Create new event (organizer/admin)
- **Request Body**:
```json
{
  "name": "Weekend Match",
  "location": "Central Park",
  "event_datetime": "2024-01-15T14:00:00Z",
  "max_places": 22,
  "optional_fee": 10.00
}
```
- **Response**: Created event object
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 403 Forbidden

**PATCH /api/events/{id}**
- **Description**: Update event (organizer/admin)
- **Request Body**: Partial event object
- **Response**: Updated event object
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

**DELETE /api/events/{id}**
- **Description**: Soft delete event (admin only)
- **Response**: Empty body
- **Success Codes**: 204 No Content
- **Error Codes**: 401 Unauthorized, 403 Forbidden, 404 Not Found

### Event Signups Resource

**GET /api/events/{eventId}/signups**
- **Description**: List signups for an event (organizer/admin)
- **Query Parameters**:
  - `page`, `limit` - Pagination
  - `status` (enum: pending, confirmed, withdrawn) - Filter by status
- **Response**:
```json
{
  "data": [
    {
      "id": 1,
      "event_id": 5,
      "player_id": 10,
      "signup_timestamp": "2024-01-01T10:00:00Z",
      "status": "confirmed",
      "resignation_timestamp": null
    }
  ],
  "pagination": { ... }
}
```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 403 Forbidden

**POST /api/events/{eventId}/signups**
- **Description**: Sign up for event (player) or add player (organizer)
- **Request Body** (for organizer adding players):
```json
{
  "player_id": 123
}
```
- **Response**: Created signup object
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 409 Conflict (already signed up)

**PATCH /api/events/{eventId}/signups/{signupId}**
- **Description**: Update signup status (organizer/admin)
- **Request Body**:
```json
{
  "status": "confirmed"
}
```
- **Response**: Updated signup object
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

**DELETE /api/events/{eventId}/signups/{signupId}**
- **Description**: Withdraw from event (player/organizer)
- **Response**: Empty body
- **Success Codes**: 204 No Content
- **Error Codes**: 401 Unauthorized, 403 Forbidden, 404 Not Found

### Team Assignments Resource

**GET /api/events/{eventId}/teams**
- **Description**: Get team assignments for event (organizer/admin)
- **Response**:
```json
{
  "data": [
    {
      "id": 1,
      "signup_id": 5,
      "team_number": 1,
      "assignment_timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}
```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 403 Forbidden

**POST /api/events/{eventId}/draw**
- **Description**: Run team draw algorithm (organizer/admin)
- **Request Body**:
```json
{
  "iterations": 20,
  "balance_threshold": 0.07
}
```
- **Response**:
```json
{
  "success": true,
  "teams": [
    {
      "team_number": 1,
      "players": [
        {
          "player_id": 1,
          "player_name": "John Doe",
          "position": "forward",
          "skill_rate": 8
        }
      ],
      "stats": {
        "avg_skill_rate": 7.5,
        "positions": {"forward": 5, "midfielder": 4, "defender": 3, "goalkeeper": 1}
      }
    }
  ],
  "balance_achieved": true
}
```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 403 Forbidden

**POST /api/events/{eventId}/teams**
- **Description**: Manually assign teams (organizer/admin)
- **Request Body**:
```json
{
  "assignments": [
    {
      "signup_id": 1,
      "team_number": 1
    }
  ]
}
```
- **Response**: Created assignments array
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 403 Forbidden

### Dashboard Resource

**GET /api/dashboard**
- **Description**: Get personalized dashboard data
- **Response** (varies by role):
```json
{
  "user": { /* current user data */ },
  "upcoming_events": [ /* next 5 events */ ],
  "my_signups": [ /* user's signups */ ],
  "organized_events": [ /* for organizers */ ],
  "pending_users": 5 // for admin
}
```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized


## 3. Authentication and Authorization

The API uses Supabase Authentication with JWT tokens for session management. All requests require a valid JWT token in the Authorization header (`Bearer <token>`).

Role-based access control is implemented using JWT claims:
- **admin**: Full access to all resources
- **organizer**: Can manage their own events and signups
- **player**: Can view events, manage their own signups

Row Level Security (RLS) policies in PostgreSQL enforce data access restrictions at the database level, complementing API-level authorization checks.

## 4. Validation and Business Logic

### Validation Rules

**Users**:
- Email format validation
- Password strength requirements
- Required: email, password, first_name, last_name, consent_date, consent_version
- Role must be one of: admin, organizer, player
- Status must be one of: pending, approved

**Players**:
- first_name, last_name: required, max 100 chars
- position: required enum value
- skill_rate: 1-10 integer (admin only)
- date_of_birth: optional valid date

**Events**:
- name, location: required, max 200 chars
- event_datetime: required, must be future date
- max_places: required, > 0
- optional_fee: optional, >= 0 if provided
- status: draft, active, completed

**Event Signups**:
- Unique constraint: one signup per player per event
- Status transitions: pending → confirmed/withdrawn

**Team Assignments**:
- team_number: > 0
- Unique per signup

### Business Logic Implementation

1. **User Approval Workflow**: Admin reviews pending accounts, optionally links to existing player profiles, assigns roles
2. **Event Signup Process**: One-click signup with timestamp ordering, automatic capacity tracking
3. **Team Draw Algorithm**: Iterative balancing algorithm considering positions and skill rates with configurable thresholds
4. **Audit Trail**: All critical operations (user approval, player changes, event modifications) are logged to audit_logs table
5. **Soft Deletes**: Resources are marked as deleted rather than physically removed to maintain data integrity
6. **Real-time Updates**: WebSocket integration for live updates on signup counts and event status changes
