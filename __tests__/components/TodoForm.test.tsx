import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoForm } from "@/components/TodoForm";

describe("TodoForm", () => {
  it("should render the form with input fields", () => {
    render(<TodoForm onSubmit={jest.fn()} />);
    expect(
      screen.getByPlaceholderText("What needs to be done?")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Description (optional)")
    ).toBeInTheDocument();
    expect(screen.getByText("Add Todo")).toBeInTheDocument();
  });

  it("should call onSubmit with input values", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<TodoForm onSubmit={onSubmit} />);

    await user.type(
      screen.getByPlaceholderText("What needs to be done?"),
      "Buy groceries"
    );
    await user.click(screen.getByText("Add Todo"));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Buy groceries",
      description: undefined,
      priority: "medium",
      dueDate: undefined,
    });
  });

  it("should not submit with empty title", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<TodoForm onSubmit={onSubmit} />);

    await user.click(screen.getByText("Add Todo"));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should clear form after submit", async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={jest.fn()} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    await user.type(input, "Test Todo");
    await user.click(screen.getByText("Add Todo"));

    expect(input).toHaveValue("");
  });

  it("should show Update button when editing", () => {
    const editTodo = {
      id: "1",
      title: "Edit Me",
      priority: "high" as const,
      status: "pending" as const,
      createdAt: "2026-02-17T10:00:00.000Z",
      updatedAt: "2026-02-17T10:00:00.000Z",
    };
    render(
      <TodoForm
        onSubmit={jest.fn()}
        editingTodo={editTodo}
        onUpdate={jest.fn()}
        onCancelEdit={jest.fn()}
      />
    );
    expect(screen.getByText("Update")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
