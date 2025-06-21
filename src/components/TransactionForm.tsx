import { Calendar, DollarSign, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Account, MonthReference, TransactionCategory } from "../types";
import { Button } from "./ui/button";

interface TransactionFormProps {
    onClose: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = (
    { onClose },
) => {
    const [formData, setFormData] = useState({
        dateTime: new Date().toISOString().slice(0, 16),
        thirdParty: "",
        value: "",
        address: "",
        description: "",
        invoiceData: "",
        accountId: "",
        categoryId: "",
        monthReferenceId: "",
    });

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [monthReferences, setMonthReferences] = useState<MonthReference[]>(
        [],
    );
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSelectData();
    }, []);

    const loadSelectData = async () => {
        try {
            setLoadingData(true);
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
                !accountsResponse.ok || !categoriesResponse.ok ||
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

            // Selecionar primeira conta, categoria e mês de referência por padrão se existirem
            if (accountsData.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    accountId: accountsData[0].id,
                }));
            }
            if (categoriesData.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    categoryId: categoriesData[0].id,
                }));
            }
            if (monthReferencesData.length > 0) {
                setFormData((prev) => ({
                    ...prev,
                    monthReferenceId: monthReferencesData[0].id,
                }));
            }
        } catch (err) {
            setError("Erro ao carregar dados");
            console.error(err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validações
        if (!formData.dateTime) {
            setError("Data/hora é obrigatória");
            return;
        }
        if (!formData.thirdParty.trim()) {
            setError("Terceiro é obrigatório");
            return;
        }
        if (!formData.value.trim()) {
            setError("Valor é obrigatório");
            return;
        }
        if (!formData.description.trim()) {
            setError("Descrição é obrigatória");
            return;
        }
        if (!formData.accountId) {
            setError("Conta é obrigatória");
            return;
        }
        if (!formData.categoryId) {
            setError("Categoria é obrigatória");
            return;
        }
        if (!formData.monthReferenceId) {
            setError("Mês de referência é obrigatório");
            return;
        }

        const numericValue = parseFloat(formData.value);
        if (isNaN(numericValue)) {
            setError("Valor deve ser um número válido");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dateTime: new Date(formData.dateTime),
                    thirdParty: formData.thirdParty.trim(),
                    value: numericValue,
                    address: formData.address.trim() || undefined,
                    description: formData.description.trim(),
                    invoiceData: formData.invoiceData.trim() || undefined,
                    accountId: formData.accountId,
                    categoryId: formData.categoryId,
                    monthReferenceId: formData.monthReferenceId,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao criar transação");
            }

            onClose();
            // Recarregar a lista será feito automaticamente pelo useEffect do TransactionList
            window.location.reload(); // Solução simples para atualizar a lista
        } catch (err) {
            setError("Erro ao criar transação");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 border border-gray-700">
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-400">Carregando dados...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">
                        Nova Transação
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-900 border border-red-800 rounded-md p-3">
                            <div className="text-red-200 text-sm">{error}</div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Data/Hora */}
                        <div>
                            <label
                                htmlFor="dateTime"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Data/Hora *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="datetime-local"
                                    id="dateTime"
                                    name="dateTime"
                                    value={formData.dateTime}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Valor */}
                        <div>
                            <label
                                htmlFor="value"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Valor *
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    id="value"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 placeholder-gray-400"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Terceiro */}
                        <div>
                            <label
                                htmlFor="thirdParty"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Terceiro *
                            </label>
                            <input
                                type="text"
                                id="thirdParty"
                                name="thirdParty"
                                value={formData.thirdParty}
                                onChange={handleInputChange}
                                placeholder="Ex: Supermercado, Restaurante..."
                                className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 placeholder-gray-400"
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Endereço */}
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
                                onChange={handleInputChange}
                                placeholder="Ex: Rua, Número, Bairro..."
                                className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 placeholder-gray-400"
                                disabled={loading}
                            />
                        </div>

                        {/* Conta */}
                        <div>
                            <label
                                htmlFor="accountId"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Conta *
                            </label>
                            <select
                                id="accountId"
                                name="accountId"
                                value={formData.accountId}
                                onChange={handleInputChange}
                                className="cursor-pointer w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                                disabled={loading}
                                required
                            >
                                {accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Categoria */}
                        <div>
                            <label
                                htmlFor="categoryId"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Categoria *
                            </label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleInputChange}
                                className="cursor-pointer w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                                disabled={loading}
                                required
                            >
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Mês de Referência */}
                        <div>
                            <label
                                htmlFor="monthReferenceId"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Mês de Referência *
                            </label>
                            <select
                                id="monthReferenceId"
                                name="monthReferenceId"
                                value={formData.monthReferenceId}
                                onChange={handleInputChange}
                                className="cursor-pointer w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                                disabled={loading}
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

                        {/* Descrição */}
                        <div className="md:col-span-2">
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Descrição *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Descreva a transação..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 placeholder-gray-400"
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Dados da Nota Fiscal */}
                        <div className="md:col-span-2">
                            <label
                                htmlFor="invoiceData"
                                className="block text-sm font-medium text-gray-300 mb-1"
                            >
                                Dados da Nota Fiscal
                            </label>
                            <textarea
                                id="invoiceData"
                                name="invoiceData"
                                value={formData.invoiceData}
                                onChange={handleInputChange}
                                placeholder="Número da nota, CNPJ, etc..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 placeholder-gray-400"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? "Criando..." : "Criar Transação"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
