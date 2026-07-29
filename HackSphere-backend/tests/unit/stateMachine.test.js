import { canTransition, TRANSITION_MAPS } from "../../src/utils/stateMachine.js";

describe("State Machine Validator Engine", () => {
  describe("Hackathon Status Transitions", () => {
    test("allows valid transition from draft to published", () => {
      expect(canTransition("hackathon", "draft", "published")).toBe(true);
    });

    test("allows valid transition from published to registration_closed", () => {
      expect(canTransition("hackathon", "published", "registration_closed")).toBe(true);
    });

    test("rejects invalid transition from draft directly to completed", () => {
      expect(canTransition("hackathon", "draft", "completed")).toBe(false);
    });

    test("rejects transition from completed back to draft", () => {
      expect(canTransition("hackathon", "completed", "draft")).toBe(false);
    });
  });

  describe("Submission Status Transitions", () => {
    test("allows transition from draft to submitted", () => {
      expect(canTransition("submission", "draft", "submitted")).toBe(true);
    });

    test("allows transition from submitted to under_review", () => {
      expect(canTransition("submission", "submitted", "under_review")).toBe(true);
    });

    test("rejects transition from draft to scored without review", () => {
      expect(canTransition("submission", "draft", "scored")).toBe(false);
    });
  });
});
