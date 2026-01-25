import { describe, expect, it } from "vitest";
import { escapeHtml } from "./helpers";

describe("escapeHtml", () => {
  it("escapes ampersand", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
    expect(escapeHtml("&&")).toBe("&amp;&amp;");
  });

  it("escapes less-than and greater-than", () => {
    expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
    expect(escapeHtml("</script>")).toBe("&lt;/script&gt;");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
    expect(escapeHtml('value="test"')).toBe("value=&quot;test&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("'hello'")).toBe("&#039;hello&#039;");
    expect(escapeHtml("value='test'")).toBe("value=&#039;test&#039;");
  });

  it("escapes all special characters together", () => {
    expect(escapeHtml('<div class="test">Hello & World</div>')).toBe(
      "&lt;div class=&quot;test&quot;&gt;Hello &amp; World&lt;/div&gt;",
    );
  });

  it("returns empty string for empty input", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("leaves safe characters unchanged", () => {
    expect(escapeHtml("Hello World 123")).toBe("Hello World 123");
    expect(escapeHtml("test@example.com")).toBe("test@example.com");
  });

  it("handles strings with only special characters", () => {
    expect(escapeHtml("&<>\"'")).toBe("&amp;&lt;&gt;&quot;&#039;");
  });
});
