import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Linkly",
            version: "1.0.0",
            description: `
                A URL Shortener API.
                This API allows users to create, retrieve, track, and delete shortened URLs.
                Interactive documentation available at: /api-docs
            `,
        },

        servers: [
            {
                url: "https://linkly-url-shortener-hsqj.onrender.com",
                description: "Production"
            },
            {
                url: "http://localhost:3000",
                description: "Development server",
            },
        ],

        tags: [
            {
                name: "Links",
                description: "Create, read, delete short links",
            },
            {
                name: "Redirects",
                description: "Redirect to target URL and rocord clicks",
            },
            {
                name: "Analytics",
                description: "Click log",
            },
            {
                name: "Health",
                description: "Live check",
            },
        ],
        paths: {
            "/health": {
                get: {
                    tags: ["Health"],
                    summary: "Live check",
                    responses: {
                        "200": {
                            description: "Server is live and running",
                            content: {
                                "application/json": {
                                    "schema": {
                                        type: "object",
                                        properties: {
                                            status: {
                                                type: "string",
                                                example: "ok"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/links": {
                post: {
                    tags: ["Links"],
                    summary: "Create a short code",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/CreateLinkRequest"
                                }
                            }
                        }
                    },
                    responses: {
                        "201": {
                            description: "link created",
                            content: {
                               "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Link"
                                    }
                                } 
                            }
                        },
                        "400": {
                            $ref: "#/components/responses/ValidationError"
                        },
                        "409": {
                            $ref: "#/components/responses/Conflict"
                        },
                    }
                }
            },
            "/links/{code}": {
                get: {
                    tags: ["Links"],
                    summary: "Get link metadata (Does not record click)",
                    parameters: [
                        {
                            $ref: "#/components/parameters/Code"
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Link Metadata",
                            content: {
                               "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/Link"
                                    }
                                } 
                            }
                        },
                        "404": {
                            $ref: "#/components/responses/NotFound"
                        }
                    }
                },
                delete: {
                    tags: ["Links"],
                    summary: "Delete a link and it's clicks (cascade delete)",
                    parameters: [
                        {
                            $ref: "#/components/parameters/Code"
                        }
                    ],
                    responses: {
                        "204": {
                            description: "Deleted"
                        },
                        "404": {
                            $ref: "#/components/responses/NotFound"
                        }
                    }
                }

            },
            "/links/{code}/clicks": {
                get: {
                    tags: ["Analytics"],
                    summary: "Keyset paginated click log for a link",
                    parameters: [
                        {
                            $ref: "#/components/parameters/Code"
                        },
                        {
                            name: "after",
                            in: "query",
                            description: "Cursor returned from the previous response. Omit for the first page.",
                            schema: {
                                type: "integer",
                                minimum: 1
                            }
                        },
                        {
                            name: "limit",
                            in: "query",
                            description: "Number of records to return",
                            schema: {
                                type: "integer",
                                minimum: 1,
                                maximum: 100,
                                default: 20
                            }
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Clicks page",
                            content: {
                               "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/ClickPage"
                                    }
                                } 
                            }
                        },
                        "400": {
                            $ref: "#/components/responses/ValidationError"
                        },
                        "404": {
                            $ref: "#/components/responses/NotFound"
                        }
                    }
                },
            },
            "/{code}": {
                get: {
                    tags: ["Redirects"],
                    summary: "Redirect to target URL and record click",
                    parameters: [
                        {
                            $ref: "#/components/parameters/Code"
                        }
                    ],
                    responses: {
                        "302": {
                            description: "Found, redirect to target_url",
                            headers: {
                                Location: {
                                    schema: {
                                        type: "string",
                                        format: "uri"
                                    }
                                }
                            }
                        },
                        "404": {
                            $ref: "#/components/responses/NotFound"
                        },
                        "410": {
                            description: "Gone, Link expired"
                        }
                    }
                }
            },
            "/links/{code}/clicks.csv": {
                get: {
                    tags: ["Analytics"],
                    summary: "Export click history as CSV",
                    parameters: [
                        {
                            $ref: "#/components/parameters/Code"
                        }
                    ],
                    responses: {
                        "200": {
                            description: "CSV export",
                            content: {
                               "text/csv": {
                                    schema: {
                                        type: "string"
                                    }
                                } 
                            }
                        },
                        "404": {
                            $ref: "#/components/responses/NotFound"
                        }
                    }
                }
            },
        },
        components: {
            parameters: {
                Code: {
                    name: "code",
                    in: "path",
                    required: true,
                    schema: {
                        type: "string",
                        pattern: "^[A-Za-z0-9_-]+$"
                    }
                }
            },
            schemas: {
                CreateLinkRequest: {
                    type: "object",
                    required: ["target_url"],
                    properties: {
                        target_url: {
                            type: "string",
                            format: "uri",
                            description: "Using http or http"
                        },
                        code: {
                            type: "string",
                            pattern: "^[A-Za-z0-9_-]{3,16}$",
                            description: "Optional, or auto if missing",
                            example: "my-portfolio"
                        },
                        expires_at: {
                            type: "string",
                            format: "date-time",
                            description: "Optional ISO 8601 timestamp, after this the link return 410"
                        },
                    }
                },
                Link: {
                    type: "object",
                    properties: {
                        code: {
                            type: "string"
                        },
                        target_url: {
                            type: "string",
                            format: "uri",

                            example: "https://github.com"
                        },
                        created_at: {
                            type: "string",
                            format: "date-time"
                        },
                        expires_at: {
                            type: "string",
                            format: "date-time",
                            nullable: true
                        },
                        click_count: {
                            type: "integer",
                            minimum: 0,
                            example: 42
                        },
                    }
                },
                Click: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer"
                        },
                        clicked_at: {
                            type: "string",
                            format: "date-time"
                        },
                        referrer: {
                            type: "string",
                            nullable: true
                        },
                        user_agent: {
                            type: "string",
                            nullable: true
                        },
                    }
                },
                ClickPage: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/Click"
                            }
                        },
                        next_cursor: {
                            type: "integer",
                            nullable: true,
                            description: "Use as the value of ?after= on the next request. Null means no more results."
                        }
                    },
                    example: {
                        data: [
                            {
                                id: 50,
                                referrer: "https://twitter.com",
                                user_agent: "Mozilla/5.0",
                                clicked_at: "2026-10-27T10:00:00Z"
                            },
                            {
                                id: 49,
                                referrer: null,
                                user_agent: "PostmanRuntime/7.45.0",
                                clicked_at: "2026-10-27T09:58:00Z"
                            }
                        ],
                        next_cursor: 49
                    }
                },
                Error: {
                    type: "object",
                    properties: {
                        error: {
                            type: "string"
                        },
                        message: {
                            type: "string"
                        },
                        issues: {
                            type: "array",
                            items: {
                                type: "objects",
                                properties: {
                                    path: {
                                        type: "array",
                                        items: {
                                            type: "string"
                                        }
                                    },
                                    message: {
                                        type: "string"
                                    }
                                }
                            }
                            
                        }
                    }
                }
            },
            responses: {
                NotFound: {
                    description: "Resource not found",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Error"
                            }
                        } 
                    }
                },
                Conflict: {
                    description: "Code already exist",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Error"
                            }
                        } 
                    }
                },
                ValidationError: {
                    description: "Invalid input (Zod issues)",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Error"
                            }
                        } 
                    }
                }
            }
        }

    },

    // Search source files for Swagger JSDoc comments
    apis: ["./src/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
