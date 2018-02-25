describe("functions", () => {
  describe("applyDefaults", () => {
    it("merges two objects together", () => {
      let result = applyDefaults({ a: 1 }, { b: 2 });
      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
    });

    it("lets first object win", () => {
      let result = applyDefaults({ a: 1 }, { a: 2 });
      expect(result.a).toBe(1);
    });

    it("lets undefined lose", () => {
      let result = applyDefaults(
        { a: <number | undefined>undefined },
        { a: <number | undefined>2 }
      );
      expect(result.a).toBe(2);
    });

    it("lets null lose", () => {
      let result = applyDefaults(
        { a: <number | null>null },
        { a: <number | null>2 }
      );
      expect(result.a).toBe(2);
    });

    it("keeps original referrence", () => {
      let orig = { a: 1 };
      let result = applyDefaults(orig, { b: 2 });
      orig.a = 3;
      expect(result.a).toBe(3);
    });
  });
});
