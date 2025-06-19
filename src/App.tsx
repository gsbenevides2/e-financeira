import { BarChart3, CreditCard, FileText, PlusIcon, Tag } from "lucide-react";
import React, { useState } from "react";
import { AccountForm } from "./components/AccountForm";
import { AccountList } from "./components/AccountList";
import { CategoryForm } from "./components/CategoryForm";
import { CategoryList } from "./components/CategoryList";
import { MonthlyExpenseReport } from "./components/MonthlyExpenseReport";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

type ModalState = {
  type: "transaction" | "account" | "category" | null;
  isOpen: boolean;
};

const App: React.FC = () => {
  const [modal, setModal] = useState<ModalState>({
    type: null,
    isOpen: false,
  });

  const newButtonClick = () => {
    const currentTab = document.querySelector("#tabs");
    const currentTabValue = currentTab?.getAttribute("data-current-tab");
    if (currentTabValue === "transactions") {
      handleOpenModal("transaction");
    } else if (currentTabValue === "accounts") {
      handleOpenModal("account");
    } else if (currentTabValue === "categories") {
      handleOpenModal("category");
    }
  };

  const handleOpenModal = (type: ModalState["type"]) => {
    setModal({ type, isOpen: true });
  };

  const handleCloseModal = () => {
    setModal({ type: null, isOpen: false });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            E-Financeira
          </h1>
          <p className="text-gray-400 mt-2">
            Gerencie suas finanças de forma simples e eficiente
          </p>
        </header>

        <Tabs defaultValue="transactions" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-gray-800 border border-gray-700">
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100"
              >
                <FileText className="w-4 h-4 mr-2" />
                Transações
              </TabsTrigger>
              <TabsTrigger
                value="accounts"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Contas
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100"
              >
                <Tag className="w-4 h-4 mr-2" />
                Categorias
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </TabsTrigger>
            </TabsList>

            <div>
              {modal.isOpen
                ? (
                  modal.type === "transaction"
                    ? <TransactionForm onClose={handleCloseModal} />
                    : modal.type === "account"
                    ? <AccountForm onClose={handleCloseModal} />
                    : modal.type === "category"
                    ? <CategoryForm onClose={handleCloseModal} />
                    : null
                )
                : null}

              {/* Botão de Ação */}
              {!modal.isOpen && (
                <Button
                  onClick={newButtonClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Novo
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="transactions">
            <TransactionList />
          </TabsContent>

          <TabsContent value="accounts">
            <AccountList />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryList />
          </TabsContent>

          <TabsContent value="reports">
            <MonthlyExpenseReport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default App;
