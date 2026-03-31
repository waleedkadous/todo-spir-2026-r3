import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoFilters } from "@/components/TodoFilters";

describe("TodoFilters", () => {
  const defaultProps = {
    statusFilter: "all" as const,
    priorityFilter: "all" as const,
    onStatusChange: jest.fn(),
    onPriorityChange: jest.fn(),
    completedCount: 0,
    onClearCompleted: jest.fn(),
  };

  it("should render status and priority filters", () => {
    render(<TodoFilters {...defaultProps} />);
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Priority:")).toBeInTheDocument();
    const allButtons = screen.getAllByText("all");
    expect(allButtons).toHaveLength(2); // status + priority
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
    expect(screen.getByText("low")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("should call onStatusChange when status button clicked", async () => {
    const user = userEvent.setup();
    const onStatusChange = jest.fn();
    render(<TodoFilters {...defaultProps} onStatusChange={onStatusChange} />);

    await user.click(screen.getByText("pending"));
    expect(onStatusChange).toHaveBeenCalledWith("pending");
  });

  it("should call onPriorityChange when priority button clicked", async () => {
    const user = userEvent.setup();
    const onPriorityChange = jest.fn();
    render(
      <TodoFilters {...defaultProps} onPriorityChange={onPriorityChange} />
    );

    await user.click(screen.getByText("high"));
    expect(onPriorityChange).toHaveBeenCalledWith("high");
  });

  it("should show clear completed button when completed todos exist", () => {
    render(<TodoFilters {...defaultProps} completedCount={3} />);
    expect(screen.getByText("Clear completed (3)")).toBeInTheDocument();
  });

  it("should not show clear completed button when count is 0", () => {
    render(<TodoFilters {...defaultProps} completedCount={0} />);
    expect(screen.queryByText(/Clear completed/)).not.toBeInTheDocument();
  });
});
