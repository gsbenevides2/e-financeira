import { Edit, Power, PowerOff, Trash2 } from "lucide-react";
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

    const handleToggleActive = async (id: string) => {
        try {
            const response = await fetch(`/api/month-references/${id}/toggle-active`, {
                method: "PATCH",
            });
            if (!response.ok) {
                throw new Error("Erro ao alterar status da referência mensal");
            }
            await loadData();
        } catch (err) {
            setError("Erro ao alterar status da referência mensal");
            console.error(err);
        }
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {monthReferences.map((monthRef) => (
                            <tr key={monthRef.id} className={monthRef.active ? '' : 'opacity-60'}>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                                    {monthRef.month}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                                    {monthRef.year}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        monthRef.active 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {monthRef.active ? 'Ativa' : 'Inativa'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleActive(monthRef.id)}
                                        className={`${monthRef.active 
                                            ? 'text-orange-500 hover:text-orange-400' 
                                            : 'text-green-500 hover:text-green-400'
                                        } mr-2`}
                                        title={monthRef.active ? 'Inativar' : 'Ativar'}
                                    >
                                        {monthRef.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleEdit(monthRef)}
                                        className="text-blue-500 hover:text-blue-400 mr-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleDelete(monthRef.id)}
                                        className="text-red-500 hover:text-red-400"
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
