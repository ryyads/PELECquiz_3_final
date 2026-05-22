import {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react'

import './App.css'

function App() {

  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const inputRef = useRef(null)

  let rawApiUrl =
    import.meta.env.VITE_API_URL ||
    'http://127.0.0.1:8000/api/tasks/'

  const API_URL = rawApiUrl.endsWith('/')
    ? rawApiUrl
    : `${rawApiUrl}/`

  // FETCH TASKS

  const fetchTasks = useCallback(async () => {

    try {

      const response = await fetch(API_URL)

      const data = await response.json()

      const sortedData = data.sort(
        (a, b) => a.is_completed - b.is_completed
      )

      setTasks(sortedData)

    } catch (error) {

      console.error('Error fetching tasks:', error)

    } finally {

      setLoading(false)

    }

  }, [API_URL])

  // LOAD TASKS

  useEffect(() => {

    fetchTasks()

  }, [fetchTasks])

  // ADD TASK

  const addTask = async (e) => {

    if (e) e.preventDefault()

    if (!title.trim()) return

    try {

      const response = await fetch(API_URL, {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          title,
          is_completed: false
        }),

      })

      if (response.ok) {

        setTitle('')
        setIsAdding(false)

        fetchTasks()

      }

    } catch (error) {

      console.error(
        'Error adding task:',
        error
      )

    }

  }

  // TOGGLE COMPLETE

  const toggleComplete = async (task) => {

    try {

      await fetch(`${API_URL}${task.id}/`, {

        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          is_completed: !task.is_completed
        }),

      })

      fetchTasks()

    } catch (error) {

      console.error(
        'Error updating task:',
        error
      )

    }

  }

  // DELETE TASK

  const deleteTask = async (id) => {

    try {

      await fetch(`${API_URL}${id}/`, {

        method: 'DELETE'

      })

      fetchTasks()

    } catch (error) {

      console.error(
        'Error deleting task:',
        error
      )

    }

  }

  // START EDIT

  const startEdit = (task) => {

    setEditingTask(task.id)

    setTitle(task.title)

    setIsAdding(true)

    setTimeout(() => {

      inputRef.current?.focus()

    }, 100)

  }

  // UPDATE TASK

  const updateTask = async () => {

    if (!title.trim()) return

    try {

      await fetch(`${API_URL}${editingTask}/`, {

        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          title
        }),

      })

      setEditingTask(null)

      setTitle('')

      setIsAdding(false)

      fetchTasks()

    } catch (error) {

      console.error(
        'Error updating task:',
        error
      )

    }

  }

  // OPEN ADD BAR

  const handleAddClick = () => {

    setEditingTask(null)

    setIsAdding(true)

    setTimeout(() => {

      inputRef.current?.focus()

    }, 100)

  }

  // DATE

  const formatDate = () => {

    const options = {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }

    return new Date().toLocaleDateString(
      'en-US',
      options
    )

  }

  return (

    <div className="app-container">

      {/* LEFT PANEL */}

      <div className="left-panel">

        <div className="left-content">

          <h1>
            Task Manager
          </h1>

          <p>
            hihi
          </p>

        </div>

        <div className="stats-box">

          <div className="stat-card">

            <h2>
              {tasks.length}
            </h2>

            <span>
              Total Tasks
            </span>

          </div>

          <div className="stat-card">

            <h2>
              {
                tasks.filter(
                  task => task.is_completed
                ).length
              }
            </h2>

            <span>
              Completed
            </span>

          </div>

        </div>

      </div>

      {/* RIGHT PANEL */}

      <div className="right-panel">

        <div className="top-bar">

          <div>

            <h2>
              My Daily Tasks
            </h2>

            <p>
              {formatDate()}
            </p>

          </div>

          <button
            className="new-task-btn"
            onClick={handleAddClick}
          >

            + New Task

          </button>

        </div>

        {/* TASKS */}

        <main className="task-list-container">

          {loading ? (

            <div className="empty-state">
              Loading tasks...
            </div>

          ) : tasks.length === 0 ? (

            <div className="empty-state">
              No tasks available
            </div>

          ) : (

            <ul className="task-list">

              {tasks.map((task) => (

                <li
                  key={task.id}
                  className={`task-item ${
                    task.is_completed
                      ? 'completed'
                      : ''
                  }`}
                >

                  <div
                    className="checkbox-container"
                    onClick={() =>
                      toggleComplete(task)
                    }
                  >

                    <div className="checkbox"></div>

                  </div>

                  <div className="task-info">

                    <span className="task-title">
                      {task.title}
                    </span>

                    <span className="task-subtitle">

                      {
                        task.is_completed
                        ? 'Completed'
                        : 'Pending'
                      }

                    </span>

                  </div>

                  {/* ACTIONS */}

                  <div className="task-actions">

                    <button
                      className="edit-btn"
                      onClick={() =>
                        startEdit(task)
                      }
                    >

                      Edit

                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteTask(task.id)
                      }
                    >

                      Delete

                    </button>

                  </div>

                </li>

              ))}

            </ul>

          )}

        </main>

        {/* ADD / UPDATE */}

        {isAdding && (

          <div className="add-task-container">

            <div className="add-task-bar">

              <input
                ref={inputRef}
                type="text"
                placeholder="Enter task..."
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />

              <button
                className="save-btn"
                onClick={
                  editingTask
                    ? updateTask
                    : addTask
                }
              >

                {
                  editingTask
                    ? 'Update Task'
                    : 'Add Task'
                }

              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  )

}

export default App