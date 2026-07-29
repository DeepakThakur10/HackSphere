import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HackSphere API Documentation",
      version: "1.0.0",
      description: "Interactive OpenAPI documentation for the HackSphere Full-Stack Hackathon Management Platform.",
      contact: {
        name: "HackSphere DeepMind Team",
        url: "https://hacksphere.dev",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
