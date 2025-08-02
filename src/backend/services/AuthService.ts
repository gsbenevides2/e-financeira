import crypto from "node:crypto"
import * as jose from "jose"

export class InvalidCredentialsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidCredentialsError"
  }
}

export class AuthService {
  token: string | null = null
  static username: string = Bun.env.AUTH_USERNAME ?? ""
  static password: string = Bun.env.AUTH_PASSWORD ?? ""
  static secret: string = Bun.env.AUTH_SECRET ?? ""
  static sessionId: string | null = null

  static generateUniqueSessionId() {
    this.sessionId = crypto.randomBytes(32).toString("hex")
  }

  static async authenticate(username: string, password: string) {
    if (username !== this.username) {
      return new InvalidCredentialsError("Invalid email")
    }

    if (password !== this.password) {
      return new InvalidCredentialsError("Invalid password")
    }

    this.generateUniqueSessionId()

    const privateKey = new TextEncoder().encode(`${this.secret}:${this.sessionId}`)
    const token = await new jose.SignJWT({ username }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(privateKey)

    return token
  }

  static async verify(token: string) {
    if (!this.sessionId) {
      return new InvalidCredentialsError("No session id found")
    }

    const privateKey = new TextEncoder().encode(`${this.secret}:${this.sessionId}`)
    const { payload } = await jose.jwtVerify(token, privateKey)
    return payload
  }

  static async logout() {
    this.sessionId = null
  }
}
