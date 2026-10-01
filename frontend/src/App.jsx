import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Pending",
    priority: "Medium",
  });

  const loadTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      status: "Pending",
      priority: "Medium",
    });

    setEditingTask(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingTask) {
        await axios.put(
          `${API_URL}/tasks/${editingTask.id}`,
          form
        );
      } else {
        await axios.post(`${API_URL}/tasks`, form);
      }

      resetForm();
      loadTasks();
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      loadTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const pending = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">TASK MANAGEMENT</p>
          <h1>Project Dashboard</h1>
          <p className="subtitle">
            Organize work, track progress, and stay focused.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          + New Task
        </button>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span>Total Tasks</span>
          <strong>{tasks.length}</strong>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <strong>{pending}</strong>
        </div>

        <div className="stat-card">
          <span>In Progress</span>
          <strong>{inProgress}</strong>
        </div>

        <div className="stat-card">
          <span>Completed</span>
          <strong>{completed}</strong>
        </div>
      </section>

      <section className="toolbar">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </section>

      {showForm && (
        <section className="form-card">
          <div className="form-header">
            <h2>{editingTask ? "Edit Task" : "Create Task"}</h2>

            <button
              className="close-button"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              name="title"
              placeholder="Task title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              rows="4"
            />

            <div className="form-row">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                {editingTask ? "Update Task" : "Create Task"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="tasks-section">
        <div className="section-header">
          <div>
            <h2>Tasks</h2>
            <p>{filteredTasks.length} task(s) shown</p>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>Create a task or adjust your filters.</p>
          </div>
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => (
              <article className="task-card" key={task.id}>
                <div className="task-main">
                  <div className="task-top">
                    <h3>{task.title}</h3>

                    <span
                      className={`priority priority-${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <p>{task.description}</p>

                  <div className="task-meta">
                    <span className="status">
                      {task.status}
                    </span>

                    <span>
                      Created{" "}
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="task-actions">
                  <button onClick={() => handleEdit(task)}>
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
