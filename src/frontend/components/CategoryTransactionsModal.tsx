import { X } from "lucide-react";
import React from "react";
import type { Account, Transaction, TransactionCategory } from "../../types";
import { formatCurrency } from "../../utils/formatters";
import { Button } from "./ui/button";

interface CategoryTransactionsModalProps {
	category: TransactionCategory;
	account: Account;
	transactions: Transaction[];
	total: number;
	onClose: () => void;
	onEdit: (transaction: Transaction) => void;
	onDelete: (transactionId: string) => void;
	onView: (transaction: Transaction) => void;
}

export function CategoryTransactionsModal({
	category,
	account,
	transactions,
	total,
	onClose,
	onView,
}: CategoryTransactionsModalProps) {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-gray-800 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<div>
						<h2 className="text-xl font-semibold text-gray-200">
							{category.name}
						</h2>
						<p className="text-sm text-gray-400">
							{account.name} -{formatCurrency(total)}
						</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-200"
					>
						<X className="w-5 h-5" />
					</Button>
				</div>

				<div className="p-4 overflow-y-auto max-h-[60vh]">
					<div className="space-y-2">
						{transactions.map((transaction) => (
							<button
								type="button"
								key={transaction.id}
								className="flex items-center justify-between py-3 px-4 bg-gray-700 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-600 transition-colors"
								onClick={() => onView(transaction)}
							>
								<div className="flex-1">
									<div className="text-gray-200 font-medium">
										{transaction.thirdParty}
									</div>
									<div className="text-sm text-gray-400">
										{transaction.description}
									</div>
									<div className="text-sm text-gray-500">
										{new Date(transaction.dateTime).toLocaleDateString("pt-BR")}
									</div>
								</div>
								<div
									className={`text-lg font-semibold ${
										transaction.value >= 0 ? "text-green-400" : "text-red-400"
									}`}
								>
									{formatCurrency(transaction.value)}
								</div>
							</button>
						))}
					</div>
				</div>

				<div className="p-4 border-t border-gray-700 bg-gray-750">
					<div className="flex justify-between items-center">
						<span className="text-gray-300">
							Total de {transactions.length} transação(ões)
						</span>
						<span
							className={`text-lg font-semibold ${
								total >= 0 ? "text-green-400" : "text-red-400"
							}`}
						>
							{formatCurrency(total)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
