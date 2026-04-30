import { useState } from "react";
import "../styles/forum.css";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("A fájl mérete nem haladhatja meg az 5MB-ot.");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (title.trim().length < 5) {
      setError("A cím legalább 5 karakter legyen.");
      return;
    }

    if (content.trim().length < 10) {
      setError("A tartalom legalább 10 karakter legyen.");
      return;
    }

    setError("");

    const newPost = {
      title,
      content,
      file: file ? {
        name: file.name,
        size: file.size,
        type: file.type
      } : null,
    };

    // ide jön majd az API
    console.log("Create post:", newPost);

    setTitle("");
    setContent("");
    setFile(null);
  };

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <h2>Új téma</h2>

      {error && <p className="error">{error}</p>}

      <input
        type="text"
        placeholder="Cím"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Tartalom..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className={`file-input-wrapper ${file ? 'has-file' : ''}`}>
        <label htmlFor="file-upload" className="file-input-label">
          <span className="file-input-icon">{file ? '?' : '?'}</span>
          <span className="file-input-text">
            {file ? file.name : "Fájl csatolása (max. 5MB)"}
          </span>
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="file-input"
        />
      </div>

      <button type="submit">Közzététel</button>
    </form>
  );
}
