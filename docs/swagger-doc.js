const {
  registerDocs,
  createRegisterUserBody,
  loginDocs,
  createLoginUserBody,
  verifyUserDocs,
  getUserDocs,
  getUserBody,
} = require("./auth");

const apiDocumentation = {
  openapi: "3.0.1",
  info: {
    version: "1.3.0",
    title: "Awarri LangEasy API Documentation",
    description: "API to be used by the Awarri Developers",
    contact: {
      name: "Awarri",
      email: "Sunday@awarri.com",
      url: "https://www.awarri.com/",
    },
    license: {
      name: "Apache 2.0",
      url: "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local Server",
    },
    {
      url: "https://backend-dev-tk7ash3eaa-uc.a.run.app",
      description: "Development Server",
    },
  ],
  tags: [
    {
      name: "Users Onboarding",
      description: "Api for users",
    },
  ],

  paths: {
    "/api/users/register": {
      post: registerDocs,
    },
    "/api/users/login": {
      post: loginDocs,
    },
    "/api/users/verify/{id}": {
      get: verifyUserDocs,
    },
    "/api/users/getuser": {
      get: getUserDocs,
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      createRegisterUserBody,
      createLoginUserBody,
      getUserBody,
    },
  },
};

module.exports = apiDocumentation;
