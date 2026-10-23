import { useState, useEffect } from "react";
import "./App.css";

// The base URL for the JSONPlaceholder API
const API_URL = "https://jsonplaceholder.typicode.com/posts";

function App() {
  // ----------------------------------------------------
  // 1. STATE VARIABLES (Very basic and easy to understand)
  // ----------------------------------------------------
  // Holds the list of posts shown on the screen
  const [posts, setPosts] = useState([]);

  // Form input fields
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Tracks if we are editing an existing post (null = creating new post, number = editing that post ID)
  const [editingPostId, setEditingPostId] = useState(null);

  // Loading and feedback status messages
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    type: "info",
    text: "Welcome! Data is loaded from JSONPlaceholder.",
  });

  // ----------------------------------------------------
  // 2. GET OPERATION (Read data from API)
  // ----------------------------------------------------
  // Runs automatically when the component first loads
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setStatusMessage({ type: "info", text: "Fetching posts from API (GET)..." });

    try {
      // Fetch only 6 posts using ?_limit=6 so the page stays clean
      const response = await fetch(`${API_URL}?_limit=6`);
      const data = await response.json();

      setPosts(data);
      setStatusMessage({
        type: "success",
        text: `[GET] Successfully loaded ${data.length} posts! (Status: ${response.status})`,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      setStatusMessage({
        type: "error",
        text: "[GET] Failed to fetch posts from API.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // 3. POST OPERATION (Create new data)
  // ----------------------------------------------------
  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("Please provide both title and body!");
      return;
    }

    setLoading(true);
    setStatusMessage({ type: "info", text: "Sending new post to API (POST)..." });

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          title: title,
          body: body,
          userId: 1,
        }),
      });

      const newPost = await response.json();

      // Note: JSONPlaceholder simulates creating a resource and returns an ID (usually 101)
      // We add it to the top of our local state list so you can see it immediately on screen!
      setPosts([newPost, ...posts]);

      // Reset the form fields
      setTitle("");
      setBody("");

      setStatusMessage({
        type: "success",
        text: `[POST] Post created successfully! (Server assigned ID: ${newPost.id}, Status: ${response.status})`,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      setStatusMessage({
        type: "error",
        text: "[POST] Failed to create post.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // 4. PUT OPERATION (Update existing data)
  // ----------------------------------------------------
  // When user clicks the "Edit" button on any card
  const startEditing = (post) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setBody(post.body);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel editing mode
  const cancelEditing = () => {
    setEditingPostId(null);
    setTitle("");
    setBody("");
  };

  // Submit the update to the API
  const handleUpdatePost = async (e) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("Please provide both title and body!");
      return;
    }

    setLoading(true);
    setStatusMessage({
      type: "info",
      text: `Updating post #${editingPostId} on API (PUT)...`,
    });

    try {
      const response = await fetch(`${API_URL}/${editingPostId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          id: editingPostId,
          title: title,
          body: body,
          userId: 1,
        }),
      });

      const updatedData = await response.json();

      // Update the post in our local state list
      setPosts(
        posts.map((post) => (post.id === editingPostId ? updatedData : post))
      );

      // Clear edit mode and reset form
      setEditingPostId(null);
      setTitle("");
      setBody("");

      setStatusMessage({
        type: "success",
        text: `[PUT] Post #${editingPostId} updated successfully! (Status: ${response.status})`,
      });
    } catch (error) {
      console.error("Error updating post:", error);
      setStatusMessage({
        type: "error",
        text: `[PUT] Failed to update post #${editingPostId}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // 5. DELETE OPERATION (Delete data from API)
  // ----------------------------------------------------
  const handleDeletePost = async (id) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete post #${id}?`
    );
    if (!confirmDelete) return;

    setLoading(true);
    setStatusMessage({
      type: "info",
      text: `Deleting post #${id} from API (DELETE)...`,
    });

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      // Remove the deleted post from local state
      setPosts(posts.filter((post) => post.id !== id));

      // If we were editing this post, cancel edit mode
      if (editingPostId === id) {
        cancelEditing();
      }

      setStatusMessage({
        type: "success",
        text: `[DELETE] Post #${id} deleted successfully! (Status: ${response.status})`,
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      setStatusMessage({
        type: "error",
        text: `[DELETE] Failed to delete post #${id}.`,
      });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // 6. RENDER UI
  // ----------------------------------------------------
  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>React CRUD with JSONPlaceholder API</h1>
        <p className="subtitle">
          Demonstrating <strong>GET</strong>, <strong>POST</strong>,{" "}
          <strong>PUT</strong>, and <strong>DELETE</strong> operations in basic
          React.
        </p>

        {/* CRUD Quick Legend */}
        <div className="crud-legend">
          <span className="badge get">GET (Read)</span>
          <span className="badge post">POST (Create)</span>
          <span className="badge put">PUT (Update)</span>
          <span className="badge delete">DELETE (Remove)</span>
        </div>
      </header>

      {/* Live Status Banner */}
      <div className={`status-banner ${statusMessage.type}`}>
        <span className="status-indicator"></span>
        <span>{statusMessage.text}</span>
        <button
          className="refresh-btn"
          onClick={fetchPosts}
          disabled={loading}
          title="Reload posts from API"
        >
          🔄 Reload GET
        </button>
      </div>

      {/* Form for Creating (POST) or Editing (PUT) */}
      <div className="form-card">
        <div className="form-header">
          <h2>
            {editingPostId ? (
              <span className="form-mode editing">✏️ Edit Post #{editingPostId} (PUT)</span>
            ) : (
              <span className="form-mode creating">➕ Create New Post (POST)</span>
            )}
          </h2>
          {editingPostId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={cancelEditing}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={editingPostId ? handleUpdatePost : handleCreatePost}>
          <div className="form-group">
            <label htmlFor="post-title">Post Title</label>
            <input
              id="post-title"
              type="text"
              placeholder="e.g. Learning React CRUD Operations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="post-body">Post Content / Body</label>
            <textarea
              id="post-body"
              rows="3"
              placeholder="e.g. This is a very easy React CRUD example using fetch() and useState."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-actions">
            {editingPostId ? (
              <>
                <button
                  type="submit"
                  className="btn btn-primary btn-put"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "💾 Update Post (PUT)"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelEditing}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="btn btn-primary btn-post"
                disabled={loading}
              >
                {loading ? "Adding..." : "🚀 Add Post (POST)"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Posts Section (GET & Cards) */}
      <div className="posts-section">
        <div className="posts-header">
          <h2>All Posts ({posts.length})</h2>
          <span className="api-note">
            * Note: JSONPlaceholder mock API simulates changes without permanently modifying remote database.
          </span>
        </div>

        {loading && posts.length === 0 ? (
          <div className="empty-state">Loading posts from API...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            No posts found. Click "Reload GET" above to fetch them again!
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`post-card ${
                  editingPostId === post.id ? "card-highlight" : ""
                }`}
              >
                <div className="card-top">
                  <span className="post-id">Post #{post.id}</span>
                  {editingPostId === post.id && (
                    <span className="editing-badge">Editing now</span>
                  )}
                </div>

                <h3 className="post-title">{post.title}</h3>
                <p className="post-body">{post.body}</p>

                <div className="card-actions">
                  <button
                    className="btn btn-edit"
                    onClick={() => startEditing(post)}
                    disabled={loading}
                  >
                    ✏️ Edit (PUT)
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDeletePost(post.id)}
                    disabled={loading}
                  >
                    🗑️ Delete (DELETE)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
