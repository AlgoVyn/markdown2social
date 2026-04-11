import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Workspace } from "../components/Workspace";

describe("Copy Workflow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should complete full copy workflow: edit -> preview -> copy -> toast", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    (navigator.clipboard.writeText as any) = mockWriteText;

    render(<Workspace />);

    // Verify initial state - preview shows formatted content
    expect(screen.getByText("Live Preview")).toBeInTheDocument();
    const previewContent = document.querySelector(".post-content");
    expect(previewContent?.textContent).toMatch(/Write your post here/);

    // Click copy button
    const copyButton = screen.getByText("Copy").closest("button");
    expect(copyButton).not.toBeNull();

    if (copyButton) {
      await userEvent.click(copyButton);

      // Verify clipboard was called with formatted content
      expect(mockWriteText).toHaveBeenCalledTimes(1);
      const clipboardContent = mockWriteText.mock.calls[0][0];
      
      // Content should be formatted with unicode bold
      expect(clipboardContent).toContain("𝐇𝐞𝐥𝐥𝐨 𝐋𝐢𝐧𝐤𝐞𝐝𝐈𝐧");

      // Verify success toast appears
      await waitFor(() => {
        expect(
          screen.getByText("Copied to clipboard! Paste into LinkedIn to see formatted content.")
        ).toBeInTheDocument();
      });
    }
  }, 10000);

  it("should handle copy failure gracefully", async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error("Clipboard permission denied"));
    (navigator.clipboard.writeText as any) = mockWriteText;

    render(<Workspace />);

    const copyButton = screen.getByText("Copy").closest("button");
    if (copyButton) {
      await userEvent.click(copyButton);

      // Verify error toast appears
      await waitFor(() => {
        expect(screen.getByText("Failed to copy to clipboard")).toBeInTheDocument();
      });
    }
  }, 10000);

  it("should preserve formatting when copying", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    (navigator.clipboard.writeText as any) = mockWriteText;

    render(<Workspace />);

    const copyButton = screen.getByText("Copy").closest("button");
    if (copyButton) {
      await userEvent.click(copyButton);

      const clipboardContent = mockWriteText.mock.calls[0][0];

      // Verify unicode bold formatting is preserved
      expect(clipboardContent).toContain("𝐇"); // Unicode bold H
      expect(clipboardContent).toContain("𝐞"); // Unicode bold e
    }
  }, 10000);

  it("should handle multiple copy operations", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    (navigator.clipboard.writeText as any) = mockWriteText;

    render(<Workspace />);

    const copyButton = screen.getByText("Copy").closest("button");
    if (copyButton) {
      // Copy multiple times
      await userEvent.click(copyButton);
      await userEvent.click(copyButton);
      await userEvent.click(copyButton);

      // Should have been called 3 times
      expect(mockWriteText).toHaveBeenCalledTimes(3);
    }
  }, 10000);

  it("should use memoized content for repeated copies", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    (navigator.clipboard.writeText as any) = mockWriteText;

    render(<Workspace />);

    const copyButton = screen.getByText("Copy").closest("button");
    if (copyButton) {
      await userEvent.click(copyButton);
      const firstContent = mockWriteText.mock.calls[0][0];

      await userEvent.click(copyButton);
      const secondContent = mockWriteText.mock.calls[1][0];

      // Content should be identical (memoized)
      expect(secondContent).toBe(firstContent);
    }
  }, 10000);
});
