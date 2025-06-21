import { serve } from "bun";
import index from "./index.html";
import { AccountService } from "./services/AccountService";
import { MonthReferenceService } from "./services/MonthReferenceService";
import { TransactionCategoryService } from "./services/TransactionCategoryService";
import { TransactionService } from "./services/TransactionService";

// Interface for Bun request with params property
interface BunRequest extends Request {
    params: Record<string, string>;
}

// Basic Authentication Configuration
const AUTH_CONFIG = {
    username: process.env.AUTH_USERNAME || "admin",
    password: process.env.AUTH_PASSWORD || "password123",
};

// Authentication middleware
function requireAuth(req: BunRequest): Response | null {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        return new Response("Authentication required", {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Basic realm="E-Financeira API"',
            },
        });
    }

    try {
        const base64Credentials = authHeader.slice(6); // Remove "Basic "
        const credentials = atob(base64Credentials);
        const [username, password] = credentials.split(":");

        if (
            username !== AUTH_CONFIG.username ||
            password !== AUTH_CONFIG.password
        ) {
            return new Response("Invalid credentials", {
                status: 401,
                headers: {
                    "WWW-Authenticate": 'Basic realm="E-Financeira API"',
                },
            });
        }

        return null; // Authentication successful
    } catch (error) {
        return new Response("Invalid authentication format", {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Basic realm="E-Financeira API"',
            },
        });
    }
}

// Helper function to wrap route handlers with authentication
function withAuth(handler: (req: BunRequest) => Promise<Response> | Response) {
    return async (req: BunRequest) => {
        const authResponse = requireAuth(req);
        if (authResponse) {
            return authResponse;
        }
        return await handler(req);
    };
}

// Helper function to wrap route objects with authentication
function withAuthObject(
    routes: Record<string, (req: BunRequest) => Promise<Response> | Response>,
) {
    const protectedRoutes: Record<
        string,
        (req: BunRequest) => Promise<Response> | Response
    > = {};
    for (const [method, handler] of Object.entries(routes)) {
        protectedRoutes[method] = withAuth(handler);
    }
    return protectedRoutes;
}

const server = serve({
    routes: {
        // Serve index.html for all unmatched routes (no auth required for static files)
        "/*": index,

        // Month Reference Routes
        "/api/month-references": withAuthObject({
            async GET(req) {
                try {
                    const monthReferences = await MonthReferenceService
                        .getAll();
                    return Response.json(monthReferences);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
            async POST(req) {
                try {
                    const data = await req.json();
                    const monthReference = await MonthReferenceService.create(
                        data,
                    );
                    return Response.json(monthReference, { status: 201 });
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
        }),

        "/api/month-references/:id": withAuthObject({
            async GET(req) {
                try {
                    const monthReference = await MonthReferenceService.getById(
                        req.params.id,
                    );
                    if (!monthReference) {
                        return Response.json({
                            error: "Month reference not found",
                        }, {
                            status: 404,
                        });
                    }
                    return Response.json(monthReference);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
            async PUT(req) {
                try {
                    const data = await req.json();
                    const monthReference = await MonthReferenceService.update({
                        id: req.params.id,
                        ...data,
                    });
                    if (!monthReference) {
                        return Response.json({
                            error: "Month reference not found",
                        }, {
                            status: 404,
                        });
                    }
                    return Response.json(monthReference);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
            async DELETE(req) {
                try {
                    const success = await MonthReferenceService.delete(
                        req.params.id,
                    );
                    if (!success) {
                        return Response.json({
                            error: "Month reference not found",
                        }, {
                            status: 404,
                        });
                    }
                    return Response.json({ success: true });
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
        }),

        "/api/month-references/find-or-create": withAuth(async (req) => {
            try {
                const url = new URL(req.url);
                const month = parseInt(url.searchParams.get("month") || "");
                const year = parseInt(url.searchParams.get("year") || "");

                if (isNaN(month) || isNaN(year)) {
                    return Response.json({
                        error: "Month and year are required",
                    }, {
                        status: 400,
                    });
                }

                const monthReference = await MonthReferenceService.findOrCreate(
                    month,
                    year,
                );
                return Response.json(monthReference);
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        }),

        "/api/month-references/:id/transactions": withAuth(async (req) => {
            try {
                const transactions = await TransactionService.search({
                    monthReferenceId: req.params.id,
                });
                return Response.json(transactions);
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        }),

        // Transaction Category Routes
        "/api/categories": withAuthObject({
            async GET(req) {
                try {
                    const categories = await TransactionCategoryService
                        .getAll();
                    return Response.json(categories);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
            async POST(req) {
                try {
                    const data = await req.json();
                    const category = await TransactionCategoryService.create(
                        data,
                    );
                    return Response.json(category, { status: 201 });
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
        }),

        "/api/categories/:id": withAuthObject({
            async GET(req) {
                try {
                    const category = await TransactionCategoryService.getById(
                        req.params.id,
                    );
                    if (!category) {
                        return Response.json({ error: "Category not found" }, {
                            status: 404,
                        });
                    }
                    return Response.json(category);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
            async PUT(req) {
                try {
                    const data = await req.json();
                    const category = await TransactionCategoryService.update({
                        id: req.params.id,
                        ...data,
                    });
                    return Response.json(category);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
            async DELETE(req) {
                try {
                    await TransactionCategoryService.delete(req.params.id);
                    return Response.json({ success: true });
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
        }),

        // Account Routes
        "/api/accounts": withAuthObject({
            async GET(req) {
                try {
                    const accounts = await AccountService.getAll();
                    return Response.json(accounts);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
            async POST(req) {
                try {
                    const data = await req.json();
                    const account = await AccountService.create(data);
                    return Response.json(account, { status: 201 });
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
        }),

        "/api/accounts/:id": withAuthObject({
            async GET(req) {
                try {
                    const account = await AccountService.getById(req.params.id);
                    if (!account) {
                        return Response.json({ error: "Account not found" }, {
                            status: 404,
                        });
                    }
                    return Response.json(account);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
            async PUT(req) {
                try {
                    const data = await req.json();
                    const account = await AccountService.update({
                        id: req.params.id,
                        ...data,
                    });
                    return Response.json(account);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
            async DELETE(req) {
                try {
                    await AccountService.delete(req.params.id);
                    return Response.json({ success: true });
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
        }),

        "/api/accounts/:id/balance": withAuth(async (req) => {
            try {
                const balance = await AccountService.calculateBalance(
                    req.params.id,
                );
                return Response.json({ balance });
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        }),

        "/api/accounts/:id/transactions": withAuth(async (req) => {
            try {
                const transactions = await AccountService.listTransactions(
                    req.params.id,
                );
                return Response.json(transactions);
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        }),

        "/api/accounts/:id/monthly-report": withAuth(async (req) => {
            try {
                const url = new URL(req.url);
                const year = parseInt(
                    url.searchParams.get("year") ||
                        new Date().getFullYear().toString(),
                );
                const month = parseInt(
                    url.searchParams.get("month") ||
                        (new Date().getMonth() + 1).toString(),
                );

                const report = await AccountService.getAccountSummary(
                    req.params.id,
                    month,
                    year,
                );
                return Response.json(report);
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        }),

        // Transaction Routes
        "/api/transactions": withAuthObject({
            async GET(req) {
                try {
                    const url = new URL(req.url);
                    const filters = {
                        accountId: url.searchParams.get("accountId") ||
                            undefined,
                        categoryId: url.searchParams.get("categoryId") ||
                            undefined,
                        startDate: url.searchParams.get("startDate")
                            ? new Date(url.searchParams.get("startDate")!)
                            : undefined,
                        endDate: url.searchParams.get("endDate")
                            ? new Date(url.searchParams.get("endDate")!)
                            : undefined,
                        minValue: url.searchParams.get("minValue")
                            ? parseFloat(url.searchParams.get("minValue")!)
                            : undefined,
                        maxValue: url.searchParams.get("maxValue")
                            ? parseFloat(url.searchParams.get("maxValue")!)
                            : undefined,
                        query: url.searchParams.get("searchText") ||
                            undefined,
                        monthReferenceId:
                            url.searchParams.get("monthReferenceId") ||
                            undefined,
                    };

                    const transactions = await TransactionService.search(
                        filters,
                    );
                    return Response.json(transactions);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
            async POST(req) {
                try {
                    const data = await req.json();
                    // Convert dateTime string back to Date object
                    const transactionData = {
                        ...data,
                        dateTime: new Date(data.dateTime),
                    };
                    const transaction = await TransactionService.create(
                        transactionData,
                    );
                    return Response.json(transaction, { status: 201 });
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
        }),

        "/api/transactions/:id": withAuthObject({
            async GET(req) {
                try {
                    const transaction = await TransactionService.getById(
                        req.params.id,
                    );
                    if (!transaction) {
                        return Response.json(
                            { error: "Transaction not found" },
                            { status: 404 },
                        );
                    }
                    return Response.json(transaction);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
            async PUT(req) {
                try {
                    const data = await req.json();
                    // Convert dateTime string back to Date object if present
                    const updateData = {
                        id: req.params.id,
                        ...data,
                    };
                    if (data.dateTime) {
                        updateData.dateTime = new Date(data.dateTime);
                    }
                    const transaction = await TransactionService.update(
                        updateData,
                    );
                    return Response.json(transaction);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
            async DELETE(req) {
                try {
                    await TransactionService.delete(req.params.id);
                    return Response.json({ success: true });
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
        }),

        "/api/transactions/:id/link": withAuthObject({
            async POST(req) {
                try {
                    const { relatedTransactionId } = await req.json();
                    await TransactionService.linkTransaction(
                        req.params.id,
                        relatedTransactionId,
                    );
                    return Response.json({ success: true });
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
        }),

        "/api/transactions/:id/unlink": withAuthObject({
            async POST(req) {
                try {
                    const { relatedTransactionId } = await req.json();
                    await TransactionService.unlinkTransaction(
                        req.params.id,
                        relatedTransactionId,
                    );
                    return Response.json({ success: true });
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
        }),

        "/api/transactions/:id/move": withAuthObject({
            async POST(req) {
                try {
                    const { newAccountId } = await req.json();
                    await TransactionService.moveToAccount(
                        req.params.id,
                        newAccountId,
                    );
                    return Response.json({ success: true });
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
        }),

        "/api/transactions/:id/related": withAuthObject({
            async GET(req) {
                try {
                    const relatedTransactions = await TransactionService
                        .getRelatedTransactions(
                            req.params.id,
                        );
                    return Response.json(relatedTransactions);
                } catch (error) {
                    return Response.json({ error: error.message }, {
                        status: 500,
                    });
                }
            },
        }),

        "/api/transactions/monthly-report": withAuth(async (req) => {
            try {
                const url = new URL(req.url);
                const year = parseInt(
                    url.searchParams.get("year") ||
                        new Date().getFullYear().toString(),
                );
                const month = parseInt(
                    url.searchParams.get("month") ||
                        (new Date().getMonth() + 1).toString(),
                );

                const report = await TransactionService.generateMonthlySummary(
                    year,
                    month,
                );
                return Response.json(report);
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        }),
    },

    development: process.env.NODE_ENV !== "production" && {
        // Enable browser hot reloading in development
        hmr: true,

        // Echo console logs from the browser to the server
        console: true,
    },
});

console.log(`🚀 E-Financeira server running at ${server.url}`);
console.log("📊 Sistema de Gestão Financeira com API REST");
console.log("🔗 Acesse o sistema no navegador para começar");
console.log("🔐 Authentication enabled for all API routes");
console.log(
    `   Default credentials: ${AUTH_CONFIG.username}/${AUTH_CONFIG.password}`,
);
console.log(
    "   Set AUTH_USERNAME and AUTH_PASSWORD environment variables to change",
);
