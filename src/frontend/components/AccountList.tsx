import { Edit, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { Account } from "../../types";
import { AccountTypes } from "../../types";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { isSuccessStatus } from "../../utils/status";
import { apiClient } from "../services/api";
import { AccountEditForm } from "./AccountEditForm";
import { Button } from "./ui/button";

export function AccountList() {
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [balances, setBalances] = useState<Record<string, number>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [editingAccount, setEditingAccount] = useState<Account | null>(null);

	const loadAccounts = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const accountsResponse = await apiClient.api.accounts.get();
			const accountsData = accountsResponse.data;
			if (!isSuccessStatus(accountsResponse.status) || !accountsData) {
				throw new Error("Erro ao carregar contas");
			}

			const balancesPromises = accountsData.map(async (account) => {
				const balanceResponse = await apiClient.api
					.accounts({
						id: account.id,
					})
					.balance.get();

				if (!isSuccessStatus(balanceResponse.status) || !balanceResponse.data) {
					throw new Error("Erro ao carregar saldo");
				}

				return {
					id: account.id,
					balance: balanceResponse.data,
				};
			});

			const balancesPromisesData = await Promise.all(balancesPromises);

			const balancesData = balancesPromisesData.reduce(
				(
					acc: Record<string, number>,
					curr: { id: string; balance: number },
				) => {
					acc[curr.id] = curr.balance;
					return acc;
				},
				{},
			);

			setAccounts(accountsData);
			setBalances(balancesData);
		} catch (err) {
			setError("Erro ao carregar contas");
			console.error(err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadAccounts();
	}, []);

	const handleDelete = async (id: string) => {
		if (!confirm("Tem certeza que deseja excluir esta conta?")) {
			return;
		}

		try {
			const response = await apiClient.api
				.accounts({
					id,
				})
				.delete();

			if (!isSuccessStatus(response.status)) {
				throw new Error("Erro ao excluir conta");
			}

			await loadAccounts();
		} catch (err) {
			setError("Erro ao excluir conta");
			console.error(err);
		}
	};

	const handleEditAccount = (account: Account) => {
		setEditingAccount(account);
	};

	const handleCloseEditForm = () => {
		setEditingAccount(null);
	};

	const handleSaveAccount = () => {
		loadAccounts(); // Recarrega os dados após salvar
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-8">
				<div className="text-gray-400">Carregando contas...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-900 border border-red-800 rounded-md p-4">
				<div className="text-red-200">{error}</div>
				<Button
					variant="outline"
					size="sm"
					onClick={loadAccounts}
					className="mt-2 border-red-700 text-red-300 hover:bg-red-800"
				>
					Tentar novamente
				</Button>
			</div>
		);
	}

	if (accounts.length === 0) {
		return (
			<div className="text-center py-8">
				<div className="text-gray-400 mb-4">Nenhuma conta encontrada</div>
				<p className="text-sm text-gray-500">
					Clique em "Nova Conta" para adicionar sua primeira conta.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-4">
				<div className="grid gap-4">
					{accounts.map((account) => (
						<div
							key={account.id}
							className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700 transition-colors bg-gray-800"
						>
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<h3 className="font-medium text-gray-200">{account.name}</h3>
									<p className="text-sm text-gray-400 mt-1">
										{account.accountType === AccountTypes.CREDIT
											? "Cartão de Crédito"
											: "Conta Débito"}
									</p>
									<p className="text-sm text-gray-400">
										Criado em {formatDateTime(account.createdAt)}
									</p>
								</div>

								<div className="flex items-center space-x-4">
									<div className="text-right">
										<div className="text-sm text-gray-400">Saldo Atual</div>
										<div
											className={`font-medium ${
												balances[account.id] >= 0
													? "text-green-400"
													: "text-red-400"
											}`}
										>
											{formatCurrency(balances[account.id] || 0)}
										</div>
									</div>

									<div className="flex items-center space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleEditAccount(account)}
											className="text-blue-400 hover:text-blue-300 hover:bg-blue-900 border-blue-600"
										>
											<Edit className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDelete(account.id)}
											className="text-red-400 hover:text-red-300 hover:bg-red-900 border-red-600"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Modal de Edição */}
			{editingAccount && (
				<AccountEditForm
					account={editingAccount}
					onClose={handleCloseEditForm}
					onSave={handleSaveAccount}
				/>
			)}
		</>
	);
}
