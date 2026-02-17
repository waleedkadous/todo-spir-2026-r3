describe("Project Setup", () => {
  it("should have a working test environment", () => {
    expect(1 + 1).toBe(2);
  });

  it("should have jsdom environment", () => {
    expect(typeof document).toBe("object");
    expect(typeof window).toBe("object");
  });
});
