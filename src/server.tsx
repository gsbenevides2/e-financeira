import { serve } from "bun";
import index from "./index.html";
import { AccountService } from "./services/AccountService";
import { TransactionCategoryService } from "./services/TransactionCategoryService";
import { TransactionService } from "./services/TransactionService";

const server = serve({
    routes: {
        // Serve index.html for all unmatched routes.
        "/*": index,

        // Transaction Category Routes
        "/api/categories": {
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
        },

        "/api/categories/:id": {
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
        },

        // Account Routes
        "/api/accounts": {
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
        },

        "/api/accounts/:id": {
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
        },

        "/api/accounts/:id/balance": async (req) => {
            try {
                const balance = await AccountService.calculateBalance(
                    req.params.id,
                );
                return Response.json({ balance });
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        },

        "/api/accounts/:id/transactions": async (req) => {
            try {
                const transactions = await AccountService.listTransactions(
                    req.params.id,
                );
                return Response.json(transactions);
            } catch (error) {
                return Response.json({ error: error.message }, { status: 500 });
            }
        },

        "/api/accounts/:id/monthly-report": async (req) => {
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
        },

        // Transaction Routes
        "/api/transactions": {
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
                        searchText: url.searchParams.get("searchText") ||
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
        },

        "/api/transactions/:id": {
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
        },

        "/api/transactions/:id/link": {
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
        },

        "/api/transactions/:id/unlink": {
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
        },

        "/api/transactions/:id/move": {
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
        },

        "/api/transactions/:id/related": {
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
        },

        "/api/transactions/monthly-report": async (req) => {
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
        },
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
