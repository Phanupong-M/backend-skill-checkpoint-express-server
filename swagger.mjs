import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";


const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0", 
    info: {
      title: "Questions and Answers API",
      version: "1.0.0",
      description: "API documentation for managing questions, answers, and voting",
    },
    servers: [
      {
        url: "http://localhost:4000", 
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Question: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "The question ID"
            },
            title: {
              type: "string",
              description: "The question title"
            },
            content: {
              type: "string",
              description: "The question content"
            }
          }
        },
        Answer: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "The answer ID"
            },
            content: {
              type: "string",
              description: "The answer content"
            },
            question_id: {
              type: "integer",
              description: "The ID of the question this answer belongs to"
            }
          }
        }
      }
    }
  },
  apis: ["./routes/*.mjs"], 
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);


export { swaggerDocs, swaggerUi };