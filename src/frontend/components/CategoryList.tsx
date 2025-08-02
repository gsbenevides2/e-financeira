import { Edit, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { TransactionCategory } from "../../types";
import { formatDateTime } from "../../utils/formatters";
import { isSuccessStatus } from "../../utils/status";
import { apiClient } from "../services/api";
import { CategoryEditForm } from "./CategoryEditForm";
import { Button } from "./ui/button";

export function CategoryList() {
	const [categories, setCategories] = useState<TransactionCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [editingCategory, setEditingCategory] =
		useState<TransactionCategory | null>(null);

	const loadCategories = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await apiClient.api.categories.get();
			if (!isSuccessStatus(response.status) || !response.data) {
				throw new Error("Erro ao carregar categorias");
			}
			const data = response.data;
			setCategories(data);
		} catch (err) {
			setError("Erro ao carregar categorias");
			console.error(err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadCategories();
	}, [loadCategories]);

	const handleDelete = async (id: string) => {
		if (!confirm("Tem certeza que deseja excluir esta categoria?")) {
			return;
		}

		try {
			const response = await apiClient.api
				.categories({
					id,
				})
				.delete();

			if (!isSuccessStatus(response.status)) {
				throw new Error("Erro ao excluir categoria");
			}
			await loadCategories();
		} catch (err) {
			setError("Erro ao excluir categoria");
			console.error(err);
		}
	};

	const handleEditCategory = (category: TransactionCategory) => {
		setEditingCategory(category);
	};

	const handleCloseEditForm = () => {
		setEditingCategory(null);
	};

	const handleSaveCategory = () => {
		loadCategories(); // Recarrega os dados após salvar
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center p-8">
				<div className="text-gray-300">Carregando categorias...</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
			{error && (
				<div className="bg-red-900 border border-red-800 p-4">
					<div className="text-red-200">{error}</div>
				</div>
			)}

			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-700">
					<thead className="bg-gray-900">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
							>
								Nome
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
							>
								Criado em
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
							>
								Atualizado em
							</th>
							<th scope="col" className="relative px-6 py-3">
								<span className="sr-only">Ações</span>
							</th>
						</tr>
					</thead>
					<tbody className="bg-gray-800 divide-y divide-gray-700">
						{categories.map((category) => (
							<tr
								key={category.id}
								className="hover:bg-gray-700 transition-colors"
							>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
									{category.name}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
									{formatDateTime(category.createdAt)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
									{formatDateTime(category.updatedAt)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
									<div className="flex items-center space-x-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleEditCategory(category)}
											className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
										>
											<Edit className="w-4 h-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDelete(category.id)}
											className="text-red-400 hover:text-red-300 hover:bg-gray-700"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{editingCategory && (
				<CategoryEditForm
					category={editingCategory}
					onClose={handleCloseEditForm}
					onSave={handleSaveCategory}
				/>
			)}
		</div>
	);
}
