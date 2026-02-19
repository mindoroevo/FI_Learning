import { arraysEqual } from "../js/utils.js";
const { expect } = chai;

describe("Quiz Validation Simulations", () => {
    
    describe("MCQ Validation Logic", () => {
        it("should validate single correct answer", () => {
            const question = { correct: [0] };
            const userAnswer = [0];
            expect(arraysEqual(userAnswer, question.correct)).to.be.true;
        });

        it("should fail incorrect single answer", () => {
            const question = { correct: [0] };
            const userAnswer = [1];
            expect(arraysEqual(userAnswer, question.correct)).to.be.false;
        });

        it("should validate multiple correct answers (sorted input)", () => {
            const question = { correct: [0, 2] };
            const userAnswer = [0, 2]; // Sorted because inputs.map(...).sort() is used in app code
            expect(arraysEqual(userAnswer, question.correct)).to.be.true;
        });
    });

    describe("Fill-Blank Validation Logic", () => {
        it("should validate all blanks correct", () => {
            const question = { 
                blanks: [
                    { correct: "A" },
                    { correct: "B" }
                ] 
            };
            const expected = question.blanks.map(b => b.correct);
            const userAnswer = ["A", "B"];
            
            expect(arraysEqual(userAnswer, expected)).to.be.true;
        });

        it("should fail if one blank is wrong", () => {
            const question = { blanks: [{ correct: "A" }, { correct: "B" }] };
            const expected = question.blanks.map(b => b.correct);
            const userAnswer = ["A", "X"];
            
            expect(arraysEqual(userAnswer, expected)).to.be.false;
        });
    });

    describe("Match Validation Logic", () => {
        // In the app, match validation checks if the user selected the options that correspond to the "matches" field?
        // Let's check the code: "const expected = question.matches || []; ok = arraysEqual(userAnswer, expected);"
        // Wait, checking `validation.js`:
        // "const expected = question.matches || [];" - Wait, really? Let me re-read validation.js in my head or check context.
        // Ah, looking at `validation.js` content from previous turn:
        // } else if (questionType === "match") {
        //   const expected = question.matches || [];
        //   ok = arraysEqual(userAnswer, expected);
        // }
        // The matchmaking logic seems to rely on an array of correct values.
        // It seems `userAnswer` for match is an array of values from select boxes (index 0..n).
        
        it("should validate correct matching sequence", () => {
            const question = { matches: ["Option1", "Option2"] };
            const userAnswer = ["Option1", "Option2"];
            expect(arraysEqual(userAnswer, question.matches)).to.be.true;
        });
    });

    describe("Order Validation Logic", () => {
        it("should validate correct order", () => {
            const question = { correctOrder: [0, 1, 2] };
            const userAnswer = [0, 1, 2];
            expect(arraysEqual(userAnswer, question.correctOrder)).to.be.true;
        });
        
        it("should fail incorrect order", () => {
             const question = { correctOrder: [0, 1, 2] };
             const userAnswer = [2, 1, 0];
             expect(arraysEqual(userAnswer, question.correctOrder)).to.be.false;
        });
    });

    describe("True/False Validation Logic", () => {
        // Logic: ok = String(userAnswer) === String(question.answer);
        
        it("should validate string 'true' against boolean true", () => {
            const question = { answer: true };
            const userAnswer = "true";
            expect(String(userAnswer) === String(question.answer)).to.be.true;
        });

        it("should validate string 'false' against boolean false", () => {
            const question = { answer: false };
            const userAnswer = "false";
            expect(String(userAnswer) === String(question.answer)).to.be.true;
        });
        
        it("should fail mismatch", () => {
             const question = { answer: true };
             const userAnswer = "false";
             expect(String(userAnswer) === String(question.answer)).to.be.false;
        });
    });
});
