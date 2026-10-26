import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "https://jsonplaceholder.typicode.com/posts";

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState(null);

  // 1. GET: Fetch 3 posts when page loads
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}?_limit=3`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // 2. POST: Create a new post
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !body) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body, userId: 1 }),
      });
      const newPost = await response.json();

      setPosts([newPost, ...posts]);
      setTitle("");
      setBody("");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // 3. PUT: Update an existing post
  const startEdit = (post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setBody(post.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title || !body) return;

    try {
      let updatedPost = { id: editingId, title, body, userId: 1 };

      // JSONPlaceholder only has posts 1-100 saved in its mock database.
      // Newly created posts have ID >= 101, which causes JSONPlaceholder to return 500.
      // So we call the API for existing posts (id <= 100), and update local state for all.
      if (editingId <= 100) {
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPost),
        });

        if (response.ok) {
          updatedPost = await response.json();
        }
      }

      setPosts(posts.map((p) => (p.id === editingId ? updatedPost : p)));
      setEditingId(null);
      setTitle("");
      setBody("");
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  // 4. DELETE: Remove a post
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      setPosts(posts.filter((p) => p.id !== id));
      if (editingId === id) {
        cancelEdit();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="container">
      <h2>React CRUD (JSONPlaceholder API)</h2>

      {/* Form for Create / Update */}
      <form onSubmit={editingId ? handleUpdate : handleCreate} className="crud-form">
        <h3>{editingId ? "Edit Post" : "Add New Post"}</h3>

        <div className="input-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            required
          />
        </div>

        <div className="input-group">
          <label>Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter content"
            rows="3"
            required
          />
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            {editingId ? "Update Post" : "Add Post"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Posts List */}
      <div className="posts-list">
        <h3>Posts ({posts.length})</h3>

        {posts.map((post) => (
          <div key={post.id} className="post-item">
            <h4>{post.title}</h4>
            <p>{post.body}</p>
            <div className="item-actions">
              <button onClick={() => startEdit(post)} className="btn btn-secondary">
                Edit
              </button>
              <button onClick={() => handleDelete(post.id)} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
