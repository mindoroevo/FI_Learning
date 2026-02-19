import { 
    escapeHtml, 
    escapeAttr, 
    inlineMd, 
    generateTocId, 
    arraysEqual, 
    shuffleArray 
} from "../js/utils.js";

const { expect } = chai;

describe("Utility Functions", () => {

    describe("escapeHtml", () => {
        it("should escape special characters", () => {
            const input = '<script>alert("xss")</script>';
            const expected = '&lt;script&gt;alert("xss")&lt;/script&gt;';
            expect(escapeHtml(input)).to.equal(expected);
        });

        it("should handle strings without special characters", () => {
            expect(escapeHtml("Hello World")).to.equal("Hello World");
        });
    });

    describe("escapeAttr", () => {
        it("should escape double quotes", () => {
            const input = 'foo"bar';
            const expected = 'foo&quot;bar';
            // Note: escapeAttr calls escapeHtml internally so < is also escaped
            expect(escapeAttr(input)).to.equal(expected);
        });
    });

    describe("inlineMd", () => {
        it("should handle bold text", () => {
            expect(inlineMd("**Bold**")).to.equal("<strong>Bold</strong>");
        });

        it("should handle italic text (single asterisk)", () => {
            expect(inlineMd("*Italic*")).to.equal("<em>Italic</em>");
        });

        it("should handle inline code", () => {
            expect(inlineMd("`code`")).to.equal("<code>code</code>");
        });

        it("should escape HTML within markdown", () => {
            expect(inlineMd("`<b>code</b>`")).to.equal("<code>&lt;b&gt;code&lt;/b&gt;</code>");
        });
    });

    describe("generateTocId", () => {
        it("should generate a slug from text", () => {
            expect(generateTocId("Hello World")).to.equal("hello-world");
        });

        it("should handle special characters (umlauts)", () => {
            expect(generateTocId("Hällo Wörld")).to.equal("hällo-wörld");
        });

        it("should remove non-alphanumeric characters except hyphen", () => {
            expect(generateTocId("Hello. World!")).to.equal("hello-world");
        });
    });

    describe("arraysEqual", () => {
        it("should return true for identical arrays", () => {
            expect(arraysEqual([1, 2, 3], [1, 2, 3])).to.be.true;
        });

        it("should return false for different lengths", () => {
            expect(arraysEqual([1, 2], [1, 2, 3])).to.be.false;
        });

        it("should return false for different content", () => {
            expect(arraysEqual([1, 2, 3], [1, 2, 4])).to.be.false;
        });

        it("should return true for empty arrays", () => {
            expect(arraysEqual([], [])).to.be.true;
        });
    });

    describe("shuffleArray", () => {
        it("should preserve all elements (length check)", () => {
            const arr = [1, 2, 3, 4, 5];
            const originalLength = arr.length;
            shuffleArray(arr);
            expect(arr.length).to.equal(originalLength);
        });

        it("should contain the same elements after shuffle", () => {
            const arr = [1, 2, 3];
            const copy = [...arr];
            shuffleArray(arr);
            expect(arr.sort()).to.deep.equal(copy.sort());
        });
    });

});
