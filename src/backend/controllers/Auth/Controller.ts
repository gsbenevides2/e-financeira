import { Elysia, t } from "elysia"
import { AuthService, InvalidCredentialsError } from "../../services/AuthService"

const AuthController = new Elysia({
  prefix: "/auth",
  detail: {
    tags: ["Auth"],
  },
})
  .post(
    "/login",
    async ({ body, status, cookie }) => {
      const { username, password } = body
      const response = await AuthService.authenticate(username, password)
      if (response instanceof InvalidCredentialsError) {
        return status(401, {
          error: "Invalid credentials",
        })
      }

      cookie.token.value = response
      cookie.token.httpOnly = true
      cookie.token.secure = true
      cookie.token.sameSite = "strict"
      cookie.token.maxAge = 3600000 // 1 hour

      return status(200, {
        success: true,
        token: response,
      })
    },
    {
      response: {
        200: t.Object({
          success: t.Boolean(),
          token: t.String(),
        }),
        401: t.Object({
          error: t.String(),
        }),
      },
      cookie: t.Object({
        token: t.Optional(t.String()),
      }),
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
      detail: {
        description: "Login to the application. This request will set a cookie with the token. The token is valid for 1 hour.",
      },
    },
  )
  .post(
    "/logout",
    async ({ cookie }) => {
      cookie.token.value = ""
      await AuthService.logout()
      return {
        success: true,
      }
    },
    {
      cookie: t.Object({
        token: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
        }),
      },
      detail: {
        description: "Logout from the application. This request will remove the cookie with the token.",
      },
    },
  )

export default AuthController
