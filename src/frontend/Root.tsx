import React from "react";
import { Outlet } from "react-router";

export const Root = () => {
    return (
        <html lang="pt-BR">
            <head>
                <meta charSet="utf-8" />
                <title>E-Financeira - Gestão Financeira</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin=""
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                >
                </link>
                <meta
                    name="description"
                    content="E-Financeira - Gestão Financeira"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="stylesheet" href="/styles.css" />
                <link rel="icon" href="/public/favicon.ico" />
            </head>
            <body>
                <Outlet />
            </body>
        </html>
    );
};
