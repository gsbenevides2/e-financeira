import { X } from "lucide-react";
import React, { useState } from "react";
import type { MonthReference } from "../../types";
import { isSuccessStatus } from "../../utils/status";
import { apiClient } from "../services/api";
import { Button } from "./ui/button";

interface MonthReferenceEditFormProps {
    monthReference: MonthReference;
    onClose: () => void;
    onSave: () => void;
}

export const MonthReferenceEditForm: React.FC<MonthReferenceEditFormProps> = ({
    monthReference,
    onClose,
    onSave,
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        month: monthReference.month,
        year: monthReference.year,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.api["month-references"]({
                id: monthReference.id
            }).put({
                month: formData.month,
                year: formData.year,
            });

            if (!isSuccessStatus(response.status)) {
                throw new Error("Erro ao atualizar mês de referência");
            }

            onSave();
        } catch (err) {
            setError("Erro ao atualizar mês de referência");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-200">
                        Editar Mês de Referência
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-300"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 text-red-500 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="month"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Mês
                        </label>
                        <select
                            id="month"
                            value={formData.month}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    month: parseInt(e.target.value),
                                })}
                            className="cursor-pointer w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                            required
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                (month) => (
                                    <option key={month} value={month}>
                                        {month}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="year"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Ano
                        </label>
                        <input
                            type="number"
                            id="year"
                            value={formData.year}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    year: parseInt(e.target.value),
                                })}
                            min={2000}
                            max={2100}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="ghost"
                            className="text-gray-400 hover:text-gray-300"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
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
