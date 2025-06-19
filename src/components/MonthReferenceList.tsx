import { Edit, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { MonthReference } from "../types";
import { MonthReferenceEditForm } from "./MonthReferenceEditForm";
import { MonthReferenceForm } from "./MonthReferenceForm";
import { Button } from "./ui/button";

export const MonthReferenceList: React.FC = () => {
    const [monthReferences, setMonthReferences] = useState<MonthReference[]>(
        [],
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMonthReference, setEditingMonthReference] = useState<
        MonthReference | null
    >(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/month-references");
            if (!response.ok) {
                throw new Error("Erro ao carregar meses de referência");
            }

            const data = await response.json();
            setMonthReferences(data);
        } catch (err) {
            setError("Erro ao carregar meses de referência");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (
            !confirm("Tem certeza que deseja excluir este mês de referência?")
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/month-references/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Erro ao excluir mês de referência");
            }
            await loadData();
        } catch (err) {
            setError("Erro ao excluir mês de referência");
            console.error(err);
        }
    };

    const handleEdit = (monthReference: MonthReference) => {
        setEditingMonthReference(monthReference);
    };

    const handleCloseForm = () => {
        setShowAddForm(false);
        setEditingMonthReference(null);
    };

    const handleSave = () => {
        loadData();
        handleCloseForm();
    };

    if (loading) {
        return <div className="text-center py-4">Carregando...</div>;
    }

    if (error) {
        return (
            <div className="text-red-500 text-center py-4">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-200">
                    Meses de Referência
                </h2>
                <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Adicionar Mês de Referência
                </Button>
            </div>

            {showAddForm && (
                <MonthReferenceForm
                    onClose={handleCloseForm}
                    onSave={handleSave}
                />
            )}

            {editingMonthReference && (
                <MonthReferenceEditForm
                    monthReference={editingMonthReference}
                    onClose={handleCloseForm}
                    onSave={handleSave}
                />
            )}

            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Mês
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Ano
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {monthReferences.map((monthRef) => (
                            <tr key={monthRef.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                                    {monthRef.month}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                                    {monthRef.year}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleEdit(monthRef)}
                                        className="text-blue-500 hover:text-blue-400"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleDelete(monthRef.id)}
                                        className="text-red-500 hover:text-red-400 ml-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
