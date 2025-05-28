import { useRef, useState, useEffect } from "react";

function Dashboard() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [filename, setFilename] = useState("");
  const [videoList, setVideoList] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordReminder, setRecordReminder] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API}/videos/list`);
      const data = await res.json();
      setVideoList(data.videos || []);
    } catch (err) {
      console.error("Failed to load video list");
    }
  };

  const isCompatible = () => {
    return !!(navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined");
  };

  const [isBrowserSupported, setIsBrowserSupported] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (!isCompatible()) {
      setIsBrowserSupported(false);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setRecordingTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraOn(true);
      alert("Camera activated");
    } catch (err) {
      alert("Camera access denied or unavailable");
    }
  };

  const triggerRecording = () => {
    const options = { mimeType: "video/webm" };
    const recorder = new MediaRecorder(mediaStream, options);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setRecordReminder(false);
  };

  const handleStartRecording = () => {
    if (!mediaStream) return alert("Please access the camera first.");
    if (recordedChunks.length > 0 && !isRecording) {
      setShowConfirmModal(true);
    } else {
      triggerRecording();
    }
  };

  const handleConfirmRecording = () => {
    setShowConfirmModal(false);
    setRecordedChunks([]);
    triggerRecording();
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setRecordReminder(true);
  };

  const handleUpload = async () => {
    if (!mediaStream) return alert("Please access the camera first.");
    if (recordedChunks.length === 0) return alert("No recording found.");
    if (!filename.trim()) return alert("Please enter a filename.");

    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const formData = new FormData();
    formData.append("video", blob, `${filename}.webm`);

    try {
      const res = await fetch(`${API}/videos/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      alert("Video uploaded successfully");
      setRecordedChunks([]);
      setFilename("");
      setRecordReminder(false);
      fetchVideos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      const res = await fetch(`${API}/videos/${name}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchVideos();
    } catch (err) {
      alert("Failed to delete video");
    }
  };

  return (
    <div className="dashboard-container">
      {!isBrowserSupported && (
        <div className="alert-warning">
          ⚠️ Your browser does not support webcam recording features. Please use Chrome, Edge, or Firefox.
        </div>
      )}
      <h2 className="dashboard-title">Video Recorder Dashboard</h2>

      {isRecording && (
        <div style={{ color: "#dc2626", fontWeight: "bold", marginBottom: "0.5rem" }}>
          ● Recording... ({formatTime(recordingTime)})
        </div>
      )}

      {recordReminder && !isRecording && recordedChunks.length > 0 && (
        <div className="alert-success">
          You have one recording waiting to upload.
        </div>
      )}

      <div className="video-wrapper">
        {!cameraOn && (
          <button className="access-button" onClick={handleStartCamera}>
            🔓 Access Camera
          </button>
        )}
        <video ref={videoRef} autoPlay muted className="video-feed" />
      </div>

      <div className="control-row">
        <button className="button-outline" onClick={handleStartRecording} disabled={isRecording}>
          Record
        </button>
        <button className="button-outline" onClick={handleStopRecording} disabled={!isRecording}>
          Stop
        </button>
        <input
          className="file-input"
          type="text"
          placeholder="Filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />
        <button
          className="button-outline"
          onClick={handleUpload}
          disabled={isRecording || recordedChunks.length === 0}
        >
          Upload
        </button>
      </div>

      {/* MODAL */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>
              ⚠️ You have a recording waiting to upload.<br />
              Continuing will discard the current recording.
            </p>
            <div className="modal-actions">
              <button className="button-outline" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button
                className="button-outline"
                style={{ backgroundColor: "#ef4444", color: "white", border: "none" }}
                onClick={handleConfirmRecording}
              >
                Continue Recording
              </button>
            </div>
          </div>
        </div>
      )}

      <hr style={{ margin: "2rem 0" }} />
      <h3 style={{ textAlign: "center" }}>Recorded Videos</h3>
      {videoList.length === 0 ? (
        <p style={{ textAlign: "center" }}>No videos uploaded yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {videoList.map((video) => (
            <div key={video} style={{ border: "1px solid #e5e7eb", padding: "1rem", borderRadius: "8px" }}>
              <video controls src={`${API.replace("/api", "")}/uploads/${video}`} width="300" />
              <p>{video}</p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <a
                  href={`${API}/videos/download/${video}`}
                  className="button-outline"
                >
                  Download
                </a>
                <button onClick={() => handleDelete(video)} className="button-outline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
