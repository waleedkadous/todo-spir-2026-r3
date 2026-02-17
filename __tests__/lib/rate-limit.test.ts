import { checkRateLimit, resetRateLimitStore } from "@/lib/rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("should allow requests under the limit", () => {
    for (let i = 0; i < 20; i++) {
      const result = checkRateLimit("test-ip");
      expect(result.allowed).toBe(true);
    }
  });

  it("should reject requests over the limit", () => {
    for (let i = 0; i < 20; i++) {
      checkRateLimit("test-ip");
    }
    const result = checkRateLimit("test-ip");
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeDefined();
  });

  it("should track IPs independently", () => {
    for (let i = 0; i < 20; i++) {
      checkRateLimit("ip-1");
    }
    const blocked = checkRateLimit("ip-1");
    expect(blocked.allowed).toBe(false);

    const allowed = checkRateLimit("ip-2");
    expect(allowed.allowed).toBe(true);
  });
});
