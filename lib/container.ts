import "server-only"

import { UserRepository } from "@/modules/users/user.repository"
import { SessionRepository } from "@/modules/auth/session.repository"
import { AuditRepository } from "@/modules/audit/audit.repository"
import { AuthService } from "@/modules/auth/auth.service"
import { ChatRepository, MessageRepository } from "@/modules/chat/chat.repository"
import { ChatService } from "@/modules/chat/chat.service"
import {
  AdminRoleRepository,
  AdminMfaRepository,
  AdminIpAllowlistRepository,
  AdminStatsRepository,
} from "@/modules/admin/admin.repository"
import { AdminService } from "@/modules/admin/admin.service"
import { PromptRepository } from "@/modules/prompts/prompt.repository"
import { PromptService } from "@/modules/prompts/prompt.service"

/**
 * Lightweight dependency-injection container.
 *
 * Instantiates repositories and services once and wires them together. Route
 * handlers and server components resolve dependencies from here instead of
 * constructing them ad-hoc, which keeps wiring in one place and makes the
 * services trivially testable (swap the repos in a test container).
 */
class Container {
  // Repositories
  readonly userRepository = new UserRepository()
  readonly sessionRepository = new SessionRepository()
  readonly auditRepository = new AuditRepository()
  readonly chatRepository = new ChatRepository()
  readonly messageRepository = new MessageRepository()
  readonly adminRoleRepository = new AdminRoleRepository()
  readonly adminMfaRepository = new AdminMfaRepository()
  readonly adminIpAllowlistRepository = new AdminIpAllowlistRepository()
  readonly adminStatsRepository = new AdminStatsRepository()
  readonly promptRepository = new PromptRepository()

  // Services
  readonly authService = new AuthService(
    this.userRepository,
    this.sessionRepository,
    this.auditRepository,
  )
  readonly chatService = new ChatService(
    this.chatRepository,
    this.messageRepository,
  )
  readonly adminService = new AdminService(
    this.adminRoleRepository,
    this.adminMfaRepository,
    this.adminIpAllowlistRepository,
    this.adminStatsRepository,
  )
  readonly promptService = new PromptService(
    this.promptRepository,
    this.auditRepository,
  )

  // Public getters for route handlers to call
  getChatService() {
    return this.chatService
  }

  getAdminService() {
    return this.adminService
  }

  getPromptService() {
    return this.promptService
  }
}

const globalForContainer = globalThis as unknown as {
  __mxContainer?: Container
}

export const container = globalForContainer.__mxContainer ?? new Container()

if (process.env.NODE_ENV !== "production") {
  globalForContainer.__mxContainer = container
}

export function getContainer(): Container {
  return container
}
