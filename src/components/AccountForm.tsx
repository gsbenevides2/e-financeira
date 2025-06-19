import { X } from "lucide-react";
import React, { useState } from "react";
import { AccountTypes } from "../types";
import { Button } from "./ui/button";

interface AccountFormProps {
    onClose: () => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({ onClose }) => {
    const [name, setName] = useState("");
    const [accountType, setAccountType] = useState<AccountTypes>(
        AccountTypes.DEBIT,
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Nome da conta é obrigatório");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/accounts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    accountType,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao criar conta");
            }

            onClose();
            // Recarregar a lista será feito automaticamente pelo useEffect do AccountList
            window.location.reload(); // Solução simples para atualizar a lista
        } catch (err) {
            setError("Erro ao criar conta");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 border border-gray-700">
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">
                        Nova Conta
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

                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Nome da Conta *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Nubank, Inter, Carteira..."
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 placeholder-gray-400"
                            disabled={loading}
                            autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Escolha um nome descritivo para facilitar a
                            identificação da conta.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="accountType"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Tipo de Conta *
                        </label>
                        <select
                            id="accountType"
                            value={accountType}
                            onChange={(e) =>
                                setAccountType(e.target.value as AccountTypes)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                            disabled={loading}
                        >
                            <option value={AccountTypes.DEBIT}>
                                Conta Débito
                            </option>
                            <option value={AccountTypes.CREDIT}>
                                Cartão de Crédito
                            </option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                            Selecione o tipo de conta para melhor organização
                            das suas finanças.
                        </p>
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
                            disabled={loading || !name.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? "Criando..." : "Criar Conta"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
