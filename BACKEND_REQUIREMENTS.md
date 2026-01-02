# Dad&Dude Training Platform - Backend Requirements

## Overview
This document outlines the backend API requirements for the Dad&Dude training platform. The backend must be implemented using Java and MySQL with proper security measures including password hashing and comprehensive security features.

## Technology Stack
- **Backend Framework**: Java (Spring Boot recommended)
- **Database**: MySQL
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Architecture**: RESTful API following OOP principles

## Security Requirements

### Password Security
- All passwords MUST be hashed using bcrypt or similar strong hashing algorithm
- Minimum password requirements should be enforced
- Never store plain text passwords

### Authentication
- Implement JWT-based authentication
- Token should be returned on successful login
- Protected endpoints should validate JWT tokens
- Include user role (trainee/admin) in JWT payload

### Authorization
- Role-based access control (RBAC)
- Trainees can only access their own data
- Admins have full access to all features
- Validate user permissions on every protected endpoint

### Input Validation
- Validate all input data on the server side
- Sanitize inputs to prevent SQL injection
- Use prepared statements for all database queries
- Implement proper error handling without exposing sensitive information

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('trainee', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Quizzes Table
```sql
CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    time_limit INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Questions Table
```sql
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    correct_option_id INT NOT NULL,
    points INT NOT NULL DEFAULT 1,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);
```

### Question Options Table
```sql
CREATE TABLE question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
```

### Quiz Attempts Table
```sql
CREATE TABLE quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    total_points INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
```

### User Answers Table
```sql
CREATE TABLE user_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option_id INT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

### Manuals Table
```sql
CREATE TABLE manuals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Manual Tags Table
```sql
CREATE TABLE manual_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manual_id INT NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (manual_id) REFERENCES manuals(id) ON DELETE CASCADE
);
```

### Feedback Table
```sql
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'reviewed', 'resolved') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Admin Comments Table
```sql
CREATE TABLE admin_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_id INT NOT NULL,
    admin_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
**Description**: Authenticate user and return JWT token
**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": "trainee|admin"
  },
  "token": "jwt_token_here"
}
```

#### GET /api/auth/me
**Description**: Get current authenticated user
**Headers**: `Authorization: Bearer <token>`
**Response**: User object

### Quiz Endpoints

#### GET /api/quizzes
**Description**: Get all quizzes (with questions)
**Headers**: `Authorization: Bearer <token>`
**Response**: Array of quiz objects

#### GET /api/quizzes/{id}
**Description**: Get specific quiz by ID
**Headers**: `Authorization: Bearer <token>`
**Response**: Quiz object with questions

#### POST /api/quizzes
**Description**: Create new quiz (admin only)
**Headers**: `Authorization: Bearer <token>`
**Request Body**: Quiz object with questions
**Response**: Created quiz object

#### PUT /api/quizzes/{id}
**Description**: Update quiz (admin only)
**Headers**: `Authorization: Bearer <token>`
**Request Body**: Updated quiz object
**Response**: Updated quiz object

#### DELETE /api/quizzes/{id}
**Description**: Delete quiz (admin only)
**Headers**: `Authorization: Bearer <token>`
**Response**: Success message

#### POST /api/quizzes/{id}/submit
**Description**: Submit quiz attempt
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedOptionId": 3
    }
  ]
}
```
**Response**: Quiz attempt result with score

#### GET /api/quiz-attempts
**Description**: Get quiz attempts (filtered by user for trainees, all for admins)
**Headers**: `Authorization: Bearer <token>`
**Query Params**: `userId` (optional, admin only)
**Response**: Array of quiz attempt objects

### Manual Endpoints

#### GET /api/manuals
**Description**: Get all manuals
**Headers**: `Authorization: Bearer <token>`
**Response**: Array of manual objects with tags

#### GET /api/manuals/{id}
**Description**: Get specific manual by ID
**Headers**: `Authorization: Bearer <token>`
**Response**: Manual object with tags

#### POST /api/manuals
**Description**: Create new manual (admin only)
**Headers**: `Authorization: Bearer <token>`
**Request Body**: Manual object with tags array
**Response**: Created manual object

#### PUT /api/manuals/{id}
**Description**: Update manual (admin only)
**Headers**: `Authorization: Bearer <token>`
**Request Body**: Updated manual object
**Response**: Updated manual object

#### DELETE /api/manuals/{id}
**Description**: Delete manual (admin only)
**Headers**: `Authorization: Bearer <token>`
**Response**: Success message

### Feedback Endpoints

#### GET /api/feedback
**Description**: Get feedback (trainee sees own, admin sees all)
**Headers**: `Authorization: Bearer <token>`
**Query Params**: `userId` (optional, admin only)
**Response**: Array of feedback objects with admin comments

#### POST /api/feedback
**Description**: Create new feedback
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "userId": 1,
  "subject": "string",
  "message": "string",
  "status": "pending"
}
```
**Response**: Created feedback object

#### POST /api/feedback/{id}/comments
**Description**: Add admin comment to feedback (admin only)
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "comment": "string"
}
```
**Response**: Created admin comment object

#### PUT /api/feedback/{id}/status
**Description**: Update feedback status (admin only)
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "status": "pending|reviewed|resolved"
}
```
**Response**: Updated feedback object

## OOP Design Principles to Implement

### Encapsulation
- Use private fields with public getters/setters
- Hide implementation details within classes
- Example: User class should encapsulate password hashing logic

### Inheritance
- Create base Entity class with common fields (id, createdAt, updatedAt)
- Extend base classes for specific entities
- Use abstract classes for shared behavior

### Polymorphism
- Implement interfaces for service layers
- Use method overloading where appropriate
- Example: QuizService interface with multiple implementations

### Abstraction
- Define clear interfaces for services
- Separate business logic from data access
- Use DTOs (Data Transfer Objects) for API responses

### SOLID Principles
- **Single Responsibility**: Each class should have one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes should be substitutable for base classes
- **Interface Segregation**: Many specific interfaces over one general interface
- **Dependency Inversion**: Depend on abstractions, not concrete implementations

## Recommended Project Structure
```
src/main/java/com/daddude/training/
├── config/
│   ├── SecurityConfig.java
│   └── DatabaseConfig.java
├── controller/
│   ├── AuthController.java
│   ├── QuizController.java
│   ├── ManualController.java
│   └── FeedbackController.java
├── service/
│   ├── AuthService.java
│   ├── QuizService.java
│   ├── ManualService.java
│   └── FeedbackService.java
├── repository/
│   ├── UserRepository.java
│   ├── QuizRepository.java
│   ├── ManualRepository.java
│   └── FeedbackRepository.java
├── model/
│   ├── User.java
│   ├── Quiz.java
│   ├── Question.java
│   ├── Manual.java
│   └── Feedback.java
├── dto/
│   ├── LoginRequest.java
│   ├── AuthResponse.java
│   └── QuizSubmissionRequest.java
├── security/
│   ├── JwtUtil.java
│   └── JwtAuthenticationFilter.java
└── exception/
    ├── UnauthorizedException.java
    └── ResourceNotFoundException.java
```

## Testing Requirements
- Unit tests for all service layer methods
- Integration tests for API endpoints
- Test authentication and authorization
- Test input validation
- Test error handling

## Additional Security Considerations
- Enable CORS with appropriate origins
- Implement rate limiting on authentication endpoints
- Log security events (failed logins, unauthorized access attempts)
- Use HTTPS in production
- Implement database connection pooling
- Use environment variables for sensitive configuration
- Regular security audits and dependency updates

## Environment Configuration
Create an `application.properties` file:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/daddude_training
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000
```
