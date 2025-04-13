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
  },
  apis: ["./routes/*.mjs"], 
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);


export { swaggerDocs, swaggerUi };