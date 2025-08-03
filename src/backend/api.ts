import { Elysia } from "elysia";
import AccountController from "./controllers/Accounts/Controller";
import AuthController from "./controllers/Auth/Controller";
import CategoryController from "./controllers/Categories/Controller";
import MonthReferenceController from "./controllers/MonthReference/Controller";
import TransactionController from "./controllers/Transactions/Controller";
import { AuthService, InvalidCredentialsError } from "./services/AuthService";

const api = new Elysia({
	prefix: "/api",
})
	.onBeforeHandle(async ({ cookie, status, route }) => {
		if (route.startsWith("/api/auth")) {
			return;
		}
		const token = cookie.token.value;
		if (!token) {
			return status(401, {
				error: "Unauthorized",
			});
		}
		const decoded = await AuthService.verify(token);
		if (!decoded || decoded instanceof InvalidCredentialsError) {
			return status(401, {
				error: "Unauthorized",
			});
		}
	})
	.use(AuthController)
	.use(AccountController)
	.use(TransactionController)
	.use(CategoryController)
	.use(MonthReferenceController)
	.use(TransactionController);

export default api;
