import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NLInput } from "@/components/NLInput";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("NLInput", () => {
  const defaultProps = {
    todos: [
      {
        id: "id-1",
        title: "Test Todo",
        priority: "medium" as const,
        status: "pending" as const,
        createdAt: "2026-02-17T10:00:00.000Z",
        updatedAt: "2026-02-17T10:00:00.000Z",
      },
    ],
    onAddTodo: jest.fn(),
    onUpdateTodo: jest.fn(),
    onDeleteTodo: jest.fn(),
    onToggleTodo: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the NL input form", () => {
    render(<NLInput {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Ask anything/)).toBeInTheDocument();
    expect(screen.getByText("Ask")).toBeInTheDocument();
  });

  it("should disable submit when input is empty", () => {
    render(<NLInput {...defaultProps} />);
    const button = screen.getByText("Ask");
    expect(button).toBeDisabled();
  });

  it("should send request and display query response", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: "query",
        message: "Found 1 todo",
        todoIds: ["id-1"],
      }),
    });

    render(<NLInput {...defaultProps} />);
    await user.type(screen.getByPlaceholderText(/Ask anything/), "show all todos");
    await user.click(screen.getByText("Ask"));

    expect(await screen.findByText("Found 1 todo")).toBeInTheDocument();
    expect(screen.getByText("Test Todo")).toBeInTheDocument();
  });

  it("should auto-apply create action", async () => {
    const user = userEvent.setup();
    const onAddTodo = jest.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: "create",
        message: "Created 'Buy milk'",
        todo: { title: "Buy milk", priority: "high" },
      }),
    });

    render(<NLInput {...defaultProps} onAddTodo={onAddTodo} />);
    await user.type(screen.getByPlaceholderText(/Ask anything/), "add buy milk");
    await user.click(screen.getByText("Ask"));

    await screen.findByText("Created 'Buy milk'");
    expect(onAddTodo).toHaveBeenCalledWith({ title: "Buy milk", priority: "high" });
  });

  it("should auto-apply toggle action", async () => {
    const user = userEvent.setup();
    const onToggleTodo = jest.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: "toggle",
        message: "Marked as done",
        todoId: "id-1",
      }),
    });

    render(<NLInput {...defaultProps} onToggleTodo={onToggleTodo} />);
    await user.type(screen.getByPlaceholderText(/Ask anything/), "mark test done");
    await user.click(screen.getByText("Ask"));

    await screen.findByText("Marked as done");
    expect(onToggleTodo).toHaveBeenCalledWith("id-1");
  });

  it("should show delete confirmation for delete action", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: "delete",
        message: "Delete Test Todo?",
        todoId: "id-1",
      }),
    });

    render(<NLInput {...defaultProps} />);
    await user.type(screen.getByPlaceholderText(/Ask anything/), "delete test todo");
    await user.click(screen.getByText("Ask"));

    expect(await screen.findByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should confirm delete when user clicks Delete", async () => {
    const user = userEvent.setup();
    const onDeleteTodo = jest.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: "delete",
        message: "Delete Test Todo?",
        todoId: "id-1",
      }),
    });

    render(<NLInput {...defaultProps} onDeleteTodo={onDeleteTodo} />);
    await user.type(screen.getByPlaceholderText(/Ask anything/), "delete test");
    await user.click(screen.getByText("Ask"));

    const deleteBtn = await screen.findByText("Delete");
    await user.click(deleteBtn);
    expect(onDeleteTodo).toHaveBeenCalledWith("id-1");
  });

  it("should display error response", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: "error",
        message: "Something went wrong",
      }),
    });

    render(<NLInput {...defaultProps} />);
    await user.type(screen.getByPlaceholderText(/Ask anything/), "invalid");
    await user.click(screen.getByText("Ask"));

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("should display clarification with clickable options", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: "clarification",
        message: "Which todo?",
        options: ["Option A", "Option B"],
      }),
    });

    render(<NLInput {...defaultProps} />);
    await user.type(screen.getByPlaceholderText(/Ask anything/), "mark done");
    await user.click(screen.getByText("Ask"));

    expect(await screen.findByText("Which todo?")).toBeInTheDocument();
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("should handle HTTP error responses gracefully", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        type: "error",
        message: "Too many requests. Please try again shortly.",
      }),
    });

    render(<NLInput {...defaultProps} />);
    await user.type(screen.getByPlaceholderText(/Ask anything/), "show todos");
    await user.click(screen.getByText("Ask"));

    expect(await screen.findByText(/Too many requests/)).toBeInTheDocument();
  });

  it("should handle network errors gracefully", async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<NLInput {...defaultProps} />);
    await user.type(screen.getByPlaceholderText(/Ask anything/), "show todos");
    await user.click(screen.getByText("Ask"));

    expect(await screen.findByText(/Failed to reach the server/)).toBeInTheDocument();
  });
});
