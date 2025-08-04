import {
	Calendar,
	Clock,
	DollarSign,
	Edit,
	Plus,
	Save,
	Trash2,
	X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { Account, MonthReference, TransactionCategory } from "../../types";
import { isSuccessStatus } from "../../utils/status";
import { apiClient } from "../services/api";
import { Button } from "./ui/button";

interface BulkTransactionFormProps {
	onClose: () => void;
}

interface CommonData {
	date: string;
	accountId: string;
	monthReferenceId: string;
}

interface TransactionData {
	id: string;
	time: string;
	thirdParty: string;
	value: string;
	address: string;
	description: string;
	invoiceData: string;
	categoryId: string;
}

export function BulkTransactionForm({ onClose }: BulkTransactionFormProps) {
	const [step, setStep] = useState<"common" | "transactions">("common");

	const [commonData, setCommonData] = useState<CommonData>({
		date: new Date().toISOString().slice(0, 10),
		accountId: "",
		monthReferenceId: "",
	});

	const [transactions, setTransactions] = useState<TransactionData[]>([]);
	const [editingTransaction, setEditingTransaction] =
		useState<TransactionData | null>(null);
	const [transactionForm, setTransactionForm] = useState<
		Omit<TransactionData, "id">
	>({
		time: new Date().toTimeString().slice(0, 5),
		thirdParty: "",
		value: "",
		address: "",
		description: "",
		invoiceData: "",
		categoryId: "",
	});

	const [accounts, setAccounts] = useState<Account[]>([]);
	const [categories, setCategories] = useState<TransactionCategory[]>([]);
	const [monthReferences, setMonthReferences] = useState<MonthReference[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadSelectData = useCallback(async () => {
		try {
			setLoadingData(true);

			const [accountsResponse, categoriesResponse, monthReferencesResponse] =
				await Promise.all([
					apiClient.api.accounts.get(),
					apiClient.api.categories.get(),
					apiClient.api["month-references"].get(),
				]);

			const checkAccounts =
				isSuccessStatus(accountsResponse.status) && accountsResponse.data;
			const checkCategories =
				isSuccessStatus(categoriesResponse.status) && categoriesResponse.data;
			const checkMonthReferences =
				isSuccessStatus(monthReferencesResponse.status) &&
				monthReferencesResponse.data;

			if (!checkAccounts || !checkCategories || !checkMonthReferences) {
				throw new Error("Erro ao carregar dados");
			}

			const accountsData = accountsResponse.data;
			const categoriesData = categoriesResponse.data;
			const monthReferencesData = monthReferencesResponse.data;

			setAccounts(accountsData);
			setCategories(categoriesData);
			const activeMonthReferences = monthReferencesData.filter(
				(ref: MonthReference) => ref.active,
			);
			setMonthReferences(activeMonthReferences);

			if (accountsData.length > 0) {
				setCommonData((prev) => ({
					...prev,
					accountId: accountsData[0].id,
				}));
			}
			if (categoriesData.length > 0) {
				setTransactionForm((prev) => ({
					...prev,
					categoryId: categoriesData[0].id,
				}));
			}
			if (activeMonthReferences.length > 0) {
				setCommonData((prev) => ({
					...prev,
					monthReferenceId: activeMonthReferences[0].id,
				}));
			}
		} catch (err) {
			setError("Erro ao carregar dados");
			console.error(err);
		} finally {
			setLoadingData(false);
		}
	}, []);

	useEffect(() => {
		loadSelectData();
	}, [loadSelectData]);

	const handleCommonDataChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setCommonData((prev) => ({ ...prev, [name]: value }));
	};

	const handleTransactionFormChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;
		setTransactionForm((prev) => ({ ...prev, [name]: value }));
	};

	const validateCommonData = () => {
		if (!commonData.date) {
			setError("Data é obrigatória");
			return false;
		}
		if (!commonData.accountId) {
			setError("Conta é obrigatória");
			return false;
		}
		if (!commonData.monthReferenceId) {
			setError("Mês de referência é obrigatório");
			return false;
		}
		return true;
	};

	const validateTransactionForm = () => {
		if (!transactionForm.time) {
			setError("Horário é obrigatório");
			return false;
		}
		if (!transactionForm.thirdParty.trim()) {
			setError("Terceiro é obrigatório");
			return false;
		}
		if (!transactionForm.value.trim()) {
			setError("Valor é obrigatório");
			return false;
		}
		if (!transactionForm.description.trim()) {
			setError("Descrição é obrigatória");
			return false;
		}
		if (!transactionForm.categoryId) {
			setError("Categoria é obrigatória");
			return false;
		}

		const numericValue = Number.parseFloat(transactionForm.value);
		if (Number.isNaN(numericValue)) {
			setError("Valor deve ser um número válido");
			return false;
		}

		return true;
	};

	const proceedToTransactions = () => {
		if (validateCommonData()) {
			setStep("transactions");
			setError(null);
		}
	};

	const addTransaction = () => {
		if (validateTransactionForm()) {
			const newTransaction: TransactionData = {
				...transactionForm,
				id: Date.now().toString(),
			};
			setTransactions((prev) => [...prev, newTransaction]);
			setTransactionForm({
				time: new Date().toTimeString().slice(0, 5),
				thirdParty: "",
				value: "",
				address: "",
				description: "",
				invoiceData: "",
				categoryId: transactionForm.categoryId, // Manter categoria selecionada
			});
			setError(null);
		}
	};

	const editTransaction = (transaction: TransactionData) => {
		setEditingTransaction(transaction);
		setTransactionForm({
			time: transaction.time,
			thirdParty: transaction.thirdParty,
			value: transaction.value,
			address: transaction.address,
			description: transaction.description,
			invoiceData: transaction.invoiceData,
			categoryId: transaction.categoryId,
		});
	};

	const updateTransaction = () => {
		if (!editingTransaction) return;

		if (validateTransactionForm()) {
			setTransactions((prev) =>
				prev.map((t) =>
					t.id === editingTransaction.id
						? { ...transactionForm, id: editingTransaction.id }
						: t,
				),
			);
			setEditingTransaction(null);
			setTransactionForm({
				time: new Date().toTimeString().slice(0, 5),
				thirdParty: "",
				value: "",
				address: "",
				description: "",
				invoiceData: "",
				categoryId: transactionForm.categoryId,
			});
			setError(null);
		}
	};

	const cancelEdit = () => {
		setEditingTransaction(null);
		setTransactionForm({
			time: new Date().toTimeString().slice(0, 5),
			thirdParty: "",
			value: "",
			address: "",
			description: "",
			invoiceData: "",
			categoryId: categories.length > 0 ? categories[0].id : "",
		});
		setError(null);
	};

	const removeTransaction = (id: string) => {
		setTransactions((prev) => prev.filter((t) => t.id !== id));
	};

	const saveAllTransactions = async () => {
		if (transactions.length === 0) {
			setError("Adicione pelo menos uma transação");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const promises = transactions.map((transaction) => {
				const dateTime = new Date(`${commonData.date}T${transaction.time}`);

				return apiClient.api.transactions.post({
					dateTime,
					thirdParty: transaction.thirdParty.trim(),
					value: Number.parseFloat(transaction.value),
					address: transaction.address.trim() || undefined,
					description: transaction.description.trim(),
					invoiceData: transaction.invoiceData.trim() || undefined,
					accountId: commonData.accountId,
					categoryId: transaction.categoryId,
					monthReferenceId: commonData.monthReferenceId,
				});
			});

			const results = await Promise.allSettled(promises);
			const failed = results.filter((result) => result.status === "rejected");

			if (failed.length > 0) {
				setError(`${failed.length} transações falharam ao serem criadas`);
			} else {
				onClose();
				window.location.reload();
			}
		} catch (err) {
			setError("Erro ao salvar transações");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const getCategoryName = (categoryId: string) => {
		const category = categories.find((c) => c.id === categoryId);
		return category?.name || "Categoria não encontrada";
	};

	if (loadingData) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
				<div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 p-6 border border-gray-700">
					<div className="flex justify-center items-center py-8">
						<div className="text-gray-400">Carregando dados...</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
			<div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-700">
				<div className="flex items-center justify-between p-6 border-b border-gray-700">
					<h2 className="text-lg font-semibold text-white">
						Upload em Massa de Transações
						{step === "transactions" && (
							<span className="text-sm text-gray-400 ml-2">
								({transactions.length} transação
								{transactions.length !== 1 ? "ões" : ""} no lote)
							</span>
						)}
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

				<div className="p-6">
					{error && (
						<div className="bg-red-900 border border-red-800 rounded-md p-3 mb-6">
							<div className="text-red-200 text-sm">{error}</div>
						</div>
					)}

					{/* Etapa 1: Dados Comuns */}
					{step === "common" && (
						<div className="space-y-6">
							<div>
								<h3 className="text-md font-medium text-white mb-4">
									Dados Comuns para Todas as Transações
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{/* Data */}
									<div>
										<label
											htmlFor="date"
											className="block text-sm font-medium text-gray-300 mb-1"
										>
											Data *
										</label>
										<div className="relative">
											<Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
											<input
												type="date"
												id="date"
												name="date"
												value={commonData.date}
												onChange={handleCommonDataChange}
												className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
												required
											/>
										</div>
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
											value={commonData.accountId}
											onChange={handleCommonDataChange}
											className="cursor-pointer w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
											required
										>
											{accounts.map((account) => (
												<option key={account.id} value={account.id}>
													{account.name}
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
											value={commonData.monthReferenceId}
											onChange={handleCommonDataChange}
											className="cursor-pointer w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
											required
										>
											<option value="">Selecione um mês de referência</option>
											{monthReferences.map((ref) => (
												<option key={ref.id} value={ref.id}>
													{new Date(ref.year, ref.month - 1).toLocaleString(
														"pt-BR",
														{
															month: "long",
															year: "numeric",
														},
													)}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>

							<div className="flex justify-end">
								<Button
									type="button"
									onClick={proceedToTransactions}
									className="bg-blue-600 hover:bg-blue-700 text-white"
								>
									Continuar para Transações
								</Button>
							</div>
						</div>
					)}

					{/* Etapa 2: Adicionar Transações */}
					{step === "transactions" && (
						<div className="space-y-6">
							{/* Resumo dos dados comuns */}
							<div className="bg-gray-700 rounded-lg p-4">
								<h4 className="text-sm font-medium text-white mb-2">
									Dados Comuns:
								</h4>
								<div className="text-xs text-gray-300 space-y-1">
									<div>
										Data:{" "}
										{new Date(commonData.date).toLocaleDateString("pt-BR")}
									</div>
									<div>
										Conta:{" "}
										{accounts.find((a) => a.id === commonData.accountId)?.name}
									</div>
									<div>
										Mês: {(() => {
											const monthRef = monthReferences.find(
												(m) => m.id === commonData.monthReferenceId,
											);
											return monthRef
												? new Date(
														monthRef.year,
														monthRef.month - 1,
													).toLocaleString("pt-BR", {
														month: "long",
														year: "numeric",
													})
												: "";
										})()}
									</div>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setStep("common")}
									className="mt-2 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
								>
									Alterar dados comuns
								</Button>
							</div>

							{/* Formulário para adicionar/editar transação */}
							<div className="bg-gray-700 rounded-lg p-4">
								<h4 className="text-md font-medium text-white mb-4">
									{editingTransaction ? "Editando Transação" : "Nova Transação"}
								</h4>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{/* Horário */}
									<div>
										<label
											htmlFor="time"
											className="block text-sm font-medium text-gray-300 mb-1"
										>
											Horário *
										</label>
										<div className="relative">
											<Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
											<input
												type="time"
												id="time"
												name="time"
												value={transactionForm.time}
												onChange={handleTransactionFormChange}
												className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-600 text-gray-200"
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
											value={transactionForm.thirdParty}
											onChange={handleTransactionFormChange}
											placeholder="Ex: Supermercado, Restaurante..."
											className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-600 text-gray-200 placeholder-gray-400"
											required
										/>
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
												value={transactionForm.value}
												onChange={handleTransactionFormChange}
												placeholder="0.00"
												step="0.01"
												className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-600 text-gray-200 placeholder-gray-400"
												required
											/>
										</div>
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
											value={transactionForm.address}
											onChange={handleTransactionFormChange}
											placeholder="Ex: Rua, Número, Bairro..."
											className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-600 text-gray-200 placeholder-gray-400"
										/>
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
											value={transactionForm.categoryId}
											onChange={handleTransactionFormChange}
											className="cursor-pointer w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-600 text-gray-200"
											required
										>
											{categories.map((category) => (
												<option key={category.id} value={category.id}>
													{category.name}
												</option>
											))}
										</select>
									</div>

									{/* Descrição */}
									<div className="md:col-span-2 lg:col-span-3">
										<label
											htmlFor="description"
											className="block text-sm font-medium text-gray-300 mb-1"
										>
											Descrição *
										</label>
										<textarea
											id="description"
											name="description"
											value={transactionForm.description}
											onChange={handleTransactionFormChange}
											placeholder="Descreva a transação..."
											rows={2}
											className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-600 text-gray-200 placeholder-gray-400"
											required
										/>
									</div>

									{/* Dados da Nota Fiscal */}
									<div className="md:col-span-2 lg:col-span-3">
										<label
											htmlFor="invoiceData"
											className="block text-sm font-medium text-gray-300 mb-1"
										>
											Dados da Nota Fiscal
										</label>
										<textarea
											id="invoiceData"
											name="invoiceData"
											value={transactionForm.invoiceData}
											onChange={handleTransactionFormChange}
											placeholder="Número da nota, CNPJ, etc..."
											rows={2}
											className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-600 text-gray-200 placeholder-gray-400"
										/>
									</div>
								</div>

								<div className="flex justify-end space-x-3 mt-4">
									{editingTransaction && (
										<Button
											type="button"
											variant="outline"
											onClick={cancelEdit}
											className="border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
										>
											Cancelar
										</Button>
									)}
									<Button
										type="button"
										onClick={
											editingTransaction ? updateTransaction : addTransaction
										}
										className="bg-green-600 hover:bg-green-700 text-white"
									>
										<Plus className="w-4 h-4 mr-1" />
										{editingTransaction ? "Atualizar" : "Adicionar"} Transação
									</Button>
								</div>
							</div>

							{/* Lista de transações adicionadas */}
							{transactions.length > 0 && (
								<div className="bg-gray-700 rounded-lg p-4">
									<h4 className="text-md font-medium text-white mb-4">
										Transações do Lote ({transactions.length})
									</h4>
									<div className="space-y-2 max-h-64 overflow-y-auto">
										{transactions.map((transaction) => (
											<div
												key={transaction.id}
												className="bg-gray-600 rounded p-3 flex justify-between items-start"
											>
												<div className="flex-1 text-sm">
													<div className="text-white font-medium">
														{transaction.time} - {transaction.thirdParty}
													</div>
													<div className="text-gray-300">
														R${" "}
														{Number.parseFloat(transaction.value)
															.toFixed(2)
															.replace(".", ",")}{" "}
														- {getCategoryName(transaction.categoryId)}
													</div>
													<div className="text-gray-400 text-xs mt-1">
														{transaction.description}
													</div>
												</div>
												<div className="flex space-x-2 ml-4">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => editTransaction(transaction)}
														className="p-1 text-gray-300 hover:text-white hover:bg-gray-500"
													>
														<Edit className="w-4 h-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => removeTransaction(transaction.id)}
														className="p-1 text-gray-300 hover:text-red-400 hover:bg-gray-500"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Botões de ação final */}
							<div className="flex justify-between">
								<Button
									type="button"
									variant="outline"
									onClick={() => setStep("common")}
									className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
								>
									Voltar aos Dados Comuns
								</Button>

								<Button
									type="button"
									onClick={saveAllTransactions}
									disabled={loading || transactions.length === 0}
									className="bg-blue-600 hover:bg-blue-700 text-white"
								>
									<Save className="w-4 h-4 mr-2" />
									{loading
										? "Salvando..."
										: `Salvar ${transactions.length} Transação${transactions.length !== 1 ? "ões" : ""}`}
								</Button>
							</div>
						</div>
					)}

					{/* Botão Cancelar sempre visível */}
					<div className="flex justify-end pt-6 border-t border-gray-700 mt-6">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={loading}
							className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
						>
							Cancelar
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
