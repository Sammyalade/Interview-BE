const registerDocs = {
  tags: ["Admin Onboarding"],
  description: "Create a new admin user",
  operationId: "createUser",
  security: [
    {
      bearerAuth: [],
    },
  ],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/createRegisterUserBody",
        },
      },
    },
    required: true,
  },
  responses: {
    200: {
      description: "User created successfully!",
      content: {
        "application/json": {
           schema: {
            type: "object",
            properties: {
              data: {
                example: {
                  user: {
                    type: "object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "60564fcb544047cdc3844818",
                      },
                      firstname: { type: "string", example: "John" },
                      lastname: { type: "string", example: "Snow" },
                      email: { type: "string", example: "john.snow@email.com" },
                      gender: { type: "string", example: "male" },
                      dateOfBirth: {
                        type: "string",
                        format: "date",
                        example: "1990-01-01",
                      },
                      accent: { type: "string", example: "American" },
                    },
                  },
                },

                message: { type: "string", example: "Registration Succesful" },
              },
              responseMessage: { type: "string", example: "Login Successful" },
              responseCode: { type: "number", example: 200 },
            },
          },
        },
      },
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example:
                  "Please fill in all required fields, firstname, lastname, email, gender, dateOfBirth, accent, consent, password, role",
              },
            },
          },
        },
      },
    },
    409: {
      description: "Conflict",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "User already registered",
              },
            },
          },
        },
      },
    },
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Registration Failed: Internal Server Error",
              },
            },
          },
        },
      },
    },
  },
};

const createRegisterUserBody = {
  type: "object",
  properties: {
    firstname: {
      type: "string",
      example: "John",
    },
    lastname: {
      type: "string",
      example: "Snow",
    },
    email: {
      type: "string",
      example: "john.snow@email.com",
    },  
    password: {
      type: "string",
      description: "unencrypted user's password",
      example: "Password.2024$",
    },
  },
};

const loginDocs = {
  tags: ["Admin Onboarding"],
  description: "Login a user",
  operationId: "loginUser",
  requestBody: {
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/createLoginUserBody",
        },
      },
    },
    required: true,
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                example: {
                  userInfo: {
                    type: "object",
                    properties: {
                      _id: {
                        type: "string",
                        example: "60564fcb544047cdc3844818",
                      },
                      firstname: { type: "string", example: "John" },
                      lastname: { type: "string", example: "Snow" },
                      email: { type: "string", example: "john.snow@email.com" },
                      gender: { type: "string", example: "male" },
                      dateOfBirth: {
                        type: "string",
                        format: "date",
                        example: "1990-01-01",
                      },
                      accent: { type: "string", example: "American" },
                    },
                  },
                },

                token: { type: "string", example: "jwt-token" },
              },
              responseMessage: { type: "string", example: "Login Successful" },
              responseCode: { type: "number", example: 200 },
            },
          },
        },
      },
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Please Add Email and password",
              },
            },
          },
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Invalid email or Password",
              },
            },
          },
        },
      },
    },
    404: {
      description: "User not Found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "User not Found Please Sign-up",
              },
            },
          },
        },
      },
    },
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Registration Failed: Internal Server Error",
              },
            },
          },
        },
      },
    },
  },
};
const createLoginUserBody = {
  type: "object",
  properties: {
    email: {
      type: "string",
      example: "john.snow@email.com",
    },

    password: {
      type: "string",
      description: "unencrypted user's password",
      example: "Password.2024$",
    },
  },
};

const verifyUserDocs = {
  tags: ["Admin Onboarding"],
  description: "Verify a user by ID",
  operationId: "verifyUser",
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "The ID of the user to verify",
      schema: {
        type: "string",
        example: "6659c2006ec4a67201818810",
      },
    },
  ],
  responses: {
    200: {
      description: "User Successfully Verified",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "string",
                example: "null",
              },
              responseMessage: {
                type: "string",
                example: "User Successfully Verified",
              },
              responseCode: {
                type: "number",
                example: 200,
              },
            },
          },
        },
      },
    },
    201: {
      description: "User not Found Please Sign-up",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "string",
                example: "null",
              },
              responseMessage: {
                type: "string",
                example: "User not Found Please Sign-up",
              },
              responseCode: {
                type: "number",
                example: 201,
              },
            },
          },
        },
      },
    },
    230: {
      description: "User Already Verified,  please Login",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "string",
                example: "null",
              },
              responseMessage: {
                type: "string",
                example: "User Already Verified,  please Login",
              },
              responseCode: {
                type: "number",
                example: 230,
              },
            },
          },
        },
      },
    },
  },
};

const getUserDocs = {
  tags: ["Admin Onboarding"],
  description: "Get user profile data",
  operationId: "getUser",
  security: [
    {
      bearerAuth: [],
    },
  ],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "The ID of the user to verify",
      schema: {
        type: "string",
        example: "6659c2006ec4a67201818810",
      },
    },
  ],
  responses: {
    200: {
      description: "User Profile displayed successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/getUserBody",
          },
        },
      },
    },
    201: {
      description: "User Not Found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "User Not Found",
              },
            },
          },
        },
      },
    },
  },

  description:
    "Include the bearer token in the request headers for authentication.",
};

const getUserBody = {
  type: "object",
  properties: {
    _id: {
      type: "string",
      example: "60564fcb544047cdc3844818",
    },
    firstname: {
      type: "string",
      example: "John",
    },
    lastname: {
      type: "string",
      example: "Doe",
    },
    email: {
      type: "string",
      example: "john.doe@email.com",
    },
    role: {
      type: "string",
      example: "USER",
    },
  },
};

module.exports = {
  registerDocs,
  createRegisterUserBody,
  loginDocs,
  createLoginUserBody,
  verifyUserDocs,
  getUserDocs,
  getUserBody,
};
