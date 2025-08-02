import { X } from "lucide-react";
import React, { useState } from "react";
import type { TransactionCategory } from "../../types";
import { isSuccessStatus } from "../../utils/status";
import { apiClient } from "../services/api";
import { Button } from "./ui/button";

interface CategoryEditFormProps {
	category: TransactionCategory;
	onClose: () => void;
	onSave: () => void;
}

export function CategoryEditForm({
	category,
	onClose,
	onSave,
}: CategoryEditFormProps) {
	const [formData, setFormData] = useState({
		name: category.name,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			setError("Nome da categoria é obrigatório");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const response = await apiClient.api
				.categories({
					id: category.id,
				})
				.put({
					name: formData.name.trim(),
				});

			if (!isSuccessStatus(response.status)) {
				throw new Error("Erro ao atualizar categoria");
			}

			onSave();
			onClose();
		} catch (err) {
			setError("Erro ao atualizar categoria");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
			<div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
				<div className="flex items-center justify-between p-6 border-b border-gray-700">
					<h2 className="text-lg font-semibold text-white">Editar Categoria</h2>
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
							Nome da Categoria *
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							placeholder="Ex: Alimentação, Transporte, Lazer..."
							className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 placeholder-gray-400"
							disabled={loading}
							required
						/>
						<p className="text-xs text-gray-400 mt-1">
							Escolha um nome descritivo para facilitar a organização das suas
							transações.
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
							disabled={loading}
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							{loading ? "Salvando..." : "Salvar Alterações"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
