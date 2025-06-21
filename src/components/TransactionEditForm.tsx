import { formatDateTimeForInput } from "@/utils/formatters";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import type {
    Account,
    MonthReference,
    Transaction,
    TransactionCategory,
} from "../types";
import { Button } from "./ui/button";

interface TransactionEditFormProps {
    transaction?: Transaction;
    onClose: () => void;
    onSave: () => void;
}

export const TransactionEditForm: React.FC<TransactionEditFormProps> = ({
    transaction,
    onClose,
    onSave,
}) => {
    console.log(transaction);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [monthReferences, setMonthReferences] = useState<MonthReference[]>(
        [],
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        dateTime: transaction?.dateTime || new Date(),
        thirdParty: transaction?.thirdParty || "",
        value: transaction?.value.toString() || "",
        address: transaction?.address || "",
        description: transaction?.description || "",
        invoiceData: transaction?.invoiceData || "",
        accountId: transaction?.accountId || "",
        categoryId: transaction?.categoryId || "",
        monthReferenceId: transaction?.monthReferenceId || "",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                accountsResponse,
                categoriesResponse,
                monthReferencesResponse,
            ] = await Promise.all([
                fetch("/api/accounts"),
                fetch("/api/categories"),
                fetch("/api/month-references"),
            ]);

            if (
                !accountsResponse.ok ||
                !categoriesResponse.ok ||
                !monthReferencesResponse.ok
            ) {
                throw new Error("Erro ao carregar dados");
            }

            const [accountsData, categoriesData, monthReferencesData] =
                await Promise.all([
                    accountsResponse.json(),
                    categoriesResponse.json(),
                    monthReferencesResponse.json(),
                ]);

            setAccounts(accountsData);
            setCategories(categoriesData);
            setMonthReferences(monthReferencesData);

            // Se não houver transação sendo editada, selecionar a primeira conta e categoria
            if (!transaction) {
                setFormData((prev) => ({
                    ...prev,
                    accountId: accountsData[0]?.id || "",
                    categoryId: categoriesData[0]?.id || "",
                    monthReferenceId: monthReferencesData[0]?.id || "",
                }));
            }
        } catch (err) {
            setError("Erro ao carregar dados");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                transaction
                    ? `/api/transactions/${transaction.id}`
                    : "/api/transactions",
                {
                    method: transaction ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                        value: parseFloat(formData.value),
                    }),
                },
            );

            if (!response.ok) {
                throw new Error("Erro ao salvar transação");
            }

            onSave();
            onClose();
        } catch (err) {
            setError("Erro ao salvar transação");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value } = e.target;
        if (name === "dateTime") {
            setFormData((prev) => ({
                ...prev,
                [name]: new Date(value),
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
                    <p className="text-gray-200">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-200">
                        {transaction ? "Editar Transação" : "Nova Transação"}
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="dateTime"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Data e Hora
                        </label>
                        <input
                            type="datetime-local"
                            id="dateTime"
                            name="dateTime"
                            value={formatDateTimeForInput(formData.dateTime)}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="thirdParty"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Terceiro
                        </label>
                        <input
                            type="text"
                            id="thirdParty"
                            name="thirdParty"
                            value={formData.thirdParty}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="value"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Valor
                        </label>
                        <input
                            type="number"
                            id="value"
                            name="value"
                            value={formData.value}
                            onChange={handleChange}
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="address"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Endereço
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Descrição
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="invoiceData"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Dados da Nota Fiscal
                        </label>
                        <input
                            type="text"
                            id="invoiceData"
                            name="invoiceData"
                            value={formData.invoiceData}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="accountId"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Conta
                        </label>
                        <select
                            id="accountId"
                            name="accountId"
                            value={formData.accountId}
                            onChange={handleChange}
                            className="cursor-pointer w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                            required
                        >
                            <option value="">Selecione uma conta</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="categoryId"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Categoria
                        </label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            className="cursor-pointer w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                            required
                        >
                            <option value="">Selecione uma categoria</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="monthReferenceId"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Mês de Referência
                        </label>
                        <select
                            id="monthReferenceId"
                            name="monthReferenceId"
                            value={formData.monthReferenceId}
                            onChange={handleChange}
                            className="cursor-pointer w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                            required
                        >
                            <option value="">
                                Selecione um mês de referência
                            </option>
                            {monthReferences.map((ref) => (
                                <option key={ref.id} value={ref.id}>
                                    {new Date(ref.year, ref.month - 1)
                                        .toLocaleString("pt-BR", {
                                            month: "long",
                                            year: "numeric",
                                        })}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="text-gray-300 border-gray-600 hover:bg-gray-700"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
