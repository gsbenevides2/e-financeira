import { LogOut } from "lucide-react"
import React from "react"
import { useNavigate } from "react-router"
import { apiClient } from "../services/api"
import { Button } from "./ui/button"
import { useTabs } from "./ui/tabs"

export function LogOutScreen() {
  const { onValueChange } = useTabs()
  const router = useNavigate()
  const handleLogout = async () => {
    await apiClient.api.auth.logout.post()
    router("/login")
  }
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-semibold text-white">
        Deseja realmente sair?
      </h2>
      <p className="text-white">
        Você será desconectado da sua conta.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Confirmar
        </Button>
        <Button
          onClick={() => onValueChange("transactions")}
          variant="outline"
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
