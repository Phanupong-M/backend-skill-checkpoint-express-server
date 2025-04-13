# Question Answer API Server

A RESTful API server built with Express.js for managing questions and answers, including voting functionality.

## Features

- Question management (CRUD operations)
- Answer management (CRUD operations)
- Voting system for answers
- PostgreSQL database integration
- Swagger API documentation
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend-skill-checkpoint-express-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up the PostgreSQL database:
- Create a database named `QuestionAnswerDB`
- Update the database connection string in `utils/db.mjs` if needed

4. Start the development server:
```bash
npm start
```

The server will start on port 4000.

## API Endpoints

### Questions
- `GET /questions` - Get all questions
- `POST /questions` - Create a new question
- `GET /questions/:questionId` - Get a specific question
- `PUT /questions/:questionId` - Update a question
- `DELETE /questions/:questionId` - Delete a question
- `GET /questions/search` - Search questions by title or category

### Answers for a question
- `POST /questions/:questionId/answers` - Create an answer for a question
- `GET /questions/:questionId/answers` -  Get answers for a question
- `DELETE /questions/:questionId/answers` - Delete answers for a question

### Votes
- `POST /questions/:questionId/vote` - Vote on a question
- `POST /answers/:answerId/vote` - Vote on an answer


## Technologies Used

- Express.js - Web framework
- PostgreSQL - Database
- pg - PostgreSQL client for Node.js
- Swagger - API documentation
- Nodemon - Development server with auto-reload

## API Documentation

The API documentation is available through Swagger UI. Access it at:
```
http://localhost:4000/api-docs
```

## Error Handling

The API includes proper error handling for:
- Invalid requests
- Resource not found
- Database errors
- Invalid vote values


