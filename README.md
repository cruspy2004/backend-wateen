# Messaging Coordination API

A backend API for an internal messaging coordination app that helps companies organize groups and communicate with members. Built with Node.js, Express, PostgreSQL, and Sequelize following clean architecture principles.

## 🚀 Features

- **User Authentication**: JWT-based registration and login
- **Group Management**: Create and manage groups
- **Member Management**: Add members to groups with role-based permissions
- **Message System**: Send messages within groups
- **User Search**: Search for users by name or email
- **Clean Architecture**: Well-structured codebase following best practices

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd messaging-coordination-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/messaging_coordination_db
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   PORT=5000
   NODE_ENV=development
   ```

4. **Setup PostgreSQL Database**
   ```bash
   # Create database
   createdb messaging_coordination_db
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE messaging_coordination_db;
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

7. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## 📂 Project Structure

```
messaging-coordination-api/
├── config/
│   ├── database.js          # Database configuration
│   └── config.json          # Sequelize CLI config
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── groupController.js   # Group management logic
│   ├── memberController.js  # Member management logic
│   └── messageController.js # Message handling logic
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   ├── errorHandler.js     # Centralized error handling
│   ├── logger.js           # Request logging
│   └── validation.js       # Input validation middleware
├── migrations/             # Database migrations
├── models/
│   ├── User.js            # User model
│   ├── Group.js           # Group model
│   ├── Member.js          # Member model
│   ├── Message.js         # Message model
│   └── index.js           # Model associations
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── groups.js          # Group routes
│   ├── users.js           # User routes
│   └── messages.js        # Message routes
├── seeders/               # Database seeders
├── utils/
│   └── jwt.js            # JWT utility functions
├── server.js             # Main server file
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (protected)

### Groups
- `POST /api/groups` - Create a new group (protected)
- `GET /api/groups` - List all groups (protected)
- `GET /api/groups/:id` - Get specific group (protected)

### Members
- `POST /api/groups/:groupId/members` - Add member to group (protected)
- `GET /api/groups/:groupId/members/pending` - Get pending members (protected)
- `PATCH /api/groups/:groupId/members/activate` - Activate membership (protected)

### Users
- `GET /api/users/search?query=` - Search users by name or email (protected)

### Messages
- `POST /api/messages` - Compose a message (protected)
- `GET /api/messages/group/:groupId` - Get messages for a group (protected)

### Health Check
- `GET /health` - Server health check

## 📝 API Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create a group (requires authentication)
```bash
curl -X POST http://localhost:5000/api/groups \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "name": "Engineering Team"
  }'
```

### Send a message
```bash
curl -X POST http://localhost:5000/api/messages \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "groupId": 1,
    "message": "Hello everyone!"
  }'
```

## 🗄️ Database Schema

### Users Table
- `id` (Primary Key)
- `name` (String, Required)
- `email` (String, Unique, Required)
- `password` (String, Hashed, Required)
- `created_at`, `updated_at` (Timestamps)

### Groups Table
- `id` (Primary Key)
- `name` (String, Required)
- `created_at`, `updated_at` (Timestamps)

### Members Table
- `id` (Primary Key)
- `group_id` (Foreign Key to Groups)
- `user_id` (Foreign Key to Users)
- `status` (ENUM: 'pending', 'active')
- `role` (ENUM: 'admin', 'member')
- `created_at`, `updated_at` (Timestamps)

### Messages Table
- `id` (Primary Key)
- `group_id` (Foreign Key to Groups)
- `sender_id` (Foreign Key to Users)
- `message` (Text, Required)
- `created_at`, `updated_at` (Timestamps)

## 🧪 Testing

The project includes sample seeders with test data:

### Demo Users (password: `password123`)
- John Doe (john@example.com)
- Jane Smith (jane@example.com)
- Mike Johnson (mike@example.com)
- Sarah Williams (sarah@example.com)
- David Brown (david@example.com)

### Demo Groups
- Engineering Team
- Marketing Team
- Sales Team
- Support Team
- HR Team

## 📦 Available Scripts

```bash
npm start          # Start the server in production mode
npm run dev        # Start the server in development mode with nodemon
npm test           # Run tests (Jest)
npm run migrate    # Run database migrations
npm run migrate:undo # Undo last migration
npm run seed       # Run all seeders
npm run seed:undo  # Undo all seeders
npm run db:setup   # Create database, run migrations, and seed data
```

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Input validation and sanitization
- Role-based access control
- Protected routes middleware
- Centralized error handling

## 🚦 Error Handling

The API uses a centralized error handling system with consistent response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error array if applicable"]
}
```

## 🎯 Future Enhancements

- WhatsApp Business API integration
- Real-time messaging with WebSockets
- File upload support
- Message read receipts
- Push notifications
- Admin dashboard
- API rate limiting
- Email notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please create an issue in the repository or contact the development team.
