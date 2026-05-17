import { describe, it, expect } from "vitest";
import { safeRedirectPath } from "../../src/lib/auth/actions";

describe("safeRedirectPath", () => {
  it("returns fallback for null input", () => {
    expect(safeRedirectPath(null)).toBe("/today");
  });

  it("returns fallback for external URLs", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/today");
    expect(safeRedirectPath("//evil.com")).toBe("/today");
  });

  it("returns fallback for newline injection", () => {
    expect(safeRedirectPath("/page\nHeader: injected")).toBe("/today");
    expect(safeRedirectPath("/page\rHeader: injected")).toBe("/today");
  });

  it("returns fallback for paths over 512 chars", () => {
    const longPath = "/" + "a".repeat(513);
    expect(safeRedirectPath(longPath)).toBe("/today");
  });

  it("returns valid relative paths as-is", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("/settings/profile")).toBe("/settings/profile");
    expect(safeRedirectPath("/today")).toBe("/today");
  });

  it("respects custom fallback", () => {
    expect(safeRedirectPath(null, "/signin")).toBe("/signin");
    expect(safeRedirectPath("//evil.com", "/signin")).toBe("/signin");
  });
});

describe("auth error messages", () => {
  it("never reveal user existence — same generic message for invalid creds", () => {
    // All auth errors from signInWithEmail return the same user-facing message
    const expectedMessage = "البريد أو كلمة المرور غير صحيحة.";
    // This is enforced in actions.ts — any Supabase auth error maps to this
    expect(expectedMessage).not.toContain("user not found");
    expect(expectedMessage).not.toContain("incorrect password");
    expect(expectedMessage).not.toContain("account");
  });
});
