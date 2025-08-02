import { Edit, Trash2, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { Account, Transaction, TransactionCategory } from "../../types";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { isSuccessStatus } from "../../utils/status";
import { apiClient } from "../services/api";
import { Button } from "./ui/button";

interface TransactionDetailsModalProps {
	transaction: Transaction;
	onClose: () => void;
	onEdit?: (transaction: Transaction) => void;
	onDelete?: (transactionId: string) => void;
}

export function TransactionDetailsModal({
	transaction,
	onClose,
	onEdit,
	onDelete,
}: TransactionDetailsModalProps) {
	const [relatedTransactions, setRelatedTransactions] = useState<Transaction[]>(
		[],
	);
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [categories, setCategories] = useState<TransactionCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const relatedPromise = apiClient.api
				.transactions({
					id: transaction.id,
				})
				.related.get();
			const accountsPromise = apiClient.api.accounts.get();
			const categoriesPromise = apiClient.api.categories.get();

			const [relatedResponse, accountsResponse, categoriesResponse] =
				await Promise.all([relatedPromise, accountsPromise, categoriesPromise]);
			const checkRelated =
				isSuccessStatus(relatedResponse.status) && relatedResponse.data;
			const checkAccounts =
				isSuccessStatus(accountsResponse.status) && accountsResponse.data;
			const checkCategories =
				isSuccessStatus(categoriesResponse.status) && categoriesResponse.data;

			if (!checkRelated || !checkAccounts || !checkCategories) {
				throw new Error("Erro ao carregar dados");
			}

			const relatedData = relatedResponse.data;
			const accountsData = accountsResponse.data;
			const categoriesData = categoriesResponse.data;

			setRelatedTransactions(relatedData);
			setAccounts(accountsData);
			setCategories(categoriesData);
		} catch (err) {
			setError("Erro ao carregar dados");
			console.error(err);
		} finally {
			setLoading(false);
		}
	}, [transaction.id]);

	const getAccountName = (accountId: string) => {
		const account = accounts.find((a) => a.id === accountId);
		return account?.name || "Conta não encontrada";
	};

	const getCategoryName = (categoryId: string) => {
		const category = categories.find((c) => c.id === categoryId);
		return category?.name || "Categoria não encontrada";
	};

	const handleEdit = () => {
		onClose();
		if (onEdit) {
			onEdit(transaction);
		}
	};

	const handleDelete = () => {
		onClose();
		if (onDelete) {
			onDelete(transaction.id);
		}
	};

	useEffect(() => {
		loadData();
	}, [loadData]);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
			<div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-700">
					<div>
						<h2 className="text-lg font-semibold text-white">
							Detalhes da Transação
						</h2>
						<p className="text-sm text-gray-400 mt-1">
							{transaction.thirdParty} - {formatCurrency(transaction.value)}
						</p>
					</div>
					<div className="flex items-center gap-2">
						{onEdit && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleEdit}
								className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
								title="Editar transação"
							>
								<Edit className="w-4 h-4" />
							</Button>
						)}
						{onDelete && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleDelete}
								className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
								title="Excluir transação"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						)}
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							className="p-2 text-gray-400 hover:text-white hover:bg-gray-700"
							title="Fechar"
						>
							<X className="w-4 h-4" />
						</Button>
					</div>
				</div>

				{/* Content */}
				<div className="p-6">
					{error && (
						<div className="mb-6 p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-200">
							{error}
						</div>
					)}

					{/* Transaction Details */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						<div className="space-y-4">
							<h3 className="text-lg font-medium text-gray-200">
								Informações Principais
							</h3>
							<div className="space-y-2">
								<div>
									<span className="text-sm text-gray-400">Data/Hora:</span>
									<p className="text-gray-200">
										{formatDateTime(transaction.dateTime)}
									</p>
								</div>
								<div>
									<span className="text-sm text-gray-400">Terceiro:</span>
									<p className="text-gray-200">{transaction.thirdParty}</p>
								</div>
								<div>
									<span className="text-sm text-gray-400">Valor:</span>
									<p
										className={`font-medium ${
											transaction.value >= 0 ? "text-green-400" : "text-red-400"
										}`}
									>
										{formatCurrency(transaction.value)}
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-medium text-gray-200">
								Classificação
							</h3>
							<div className="space-y-2">
								<div>
									<span className="text-sm text-gray-400">Conta:</span>
									<p className="text-gray-200">
										{getAccountName(transaction.accountId)}
									</p>
								</div>
								<div>
									<span className="text-sm text-gray-400">Categoria:</span>
									<p className="text-gray-200">
										{getCategoryName(transaction.categoryId)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Additional Details */}
					{(transaction.description ||
						transaction.address ||
						transaction.invoiceData) && (
						<div className="mb-8">
							<h3 className="text-lg font-medium text-gray-200 mb-4">
								Detalhes Adicionais
							</h3>
							<div className="space-y-4">
								{transaction.description && (
									<div>
										<span className="text-sm text-gray-400">Descrição:</span>
										<p className="text-gray-200 mt-1">
											{transaction.description}
										</p>
									</div>
								)}
								{transaction.address && (
									<div>
										<span className="text-sm text-gray-400">Endereço:</span>
										<p className="text-gray-200 mt-1">{transaction.address}</p>
									</div>
								)}
								{transaction.invoiceData && (
									<div>
										<span className="text-sm text-gray-400">
											Dados da Nota Fiscal:
										</span>
										<p className="text-gray-200 mt-1">
											{transaction.invoiceData}
										</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Related Transactions */}
					<div>
						<h3 className="text-lg font-medium text-gray-200 mb-4">
							Transações Relacionadas
						</h3>
						{loading ? (
							<div className="text-center py-8">
								<div className="text-gray-400">
									Carregando transações relacionadas...
								</div>
							</div>
						) : relatedTransactions.length === 0 ? (
							<div className="text-center py-8 bg-gray-800/50 border border-gray-700 rounded-lg">
								<div className="text-gray-400">
									Nenhuma transação relacionada encontrada
								</div>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<thead>
										<tr className="border-b border-gray-700">
											<th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
												Data/Hora
											</th>
											<th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
												Terceiro
											</th>
											<th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
												Valor
											</th>
											<th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
												Conta
											</th>
											<th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
												Categoria
											</th>
										</tr>
									</thead>
									<tbody>
										{relatedTransactions.map((relatedTx) => (
											<tr
												key={relatedTx.id}
												className="border-b border-gray-700/50 hover:bg-gray-700/30"
											>
												<td className="px-4 py-2 text-sm text-gray-200">
													{formatDateTime(relatedTx.dateTime)}
												</td>
												<td className="px-4 py-2 text-sm text-gray-200">
													{relatedTx.thirdParty}
												</td>
												<td
													className={`px-4 py-2 text-sm font-medium ${
														relatedTx.value >= 0
															? "text-green-400"
															: "text-red-400"
													}`}
												>
													{formatCurrency(relatedTx.value)}
												</td>
												<td className="px-4 py-2 text-sm text-gray-200">
													{getAccountName(relatedTx.accountId)}
												</td>
												<td className="px-4 py-2 text-sm text-gray-200">
													{getCategoryName(relatedTx.categoryId)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
