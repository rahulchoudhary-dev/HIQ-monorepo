import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import { FileText, File, X, ShieldCheck, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { supabase } from "@/lib/supabaseClient";
import useCurrentUser from "@/hooks/useCurrentUser";

export default function FileUploadSQS({ agent, onResponse }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { currentUser } = useCurrentUser();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [authUserId, setAuthUserId] = useState(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [isWorking, setIsWorking] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [status, setStatus] = useState("");
  const [responseData, setResponseData] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();
        setCurrentUserId(data?.id);
        setAuthUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const pickFileIcon = (name) => {
    const ext = (name.split(".").pop() || "").toLowerCase();
    return ext === "pdf" ? FileText : File;
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const list = Array.from(e.dataTransfer.files || []);
    if (!list.length) return;
    addSelected(list);
  }, []);

  const handleFileSelect = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    addSelected(list);
    e.currentTarget.value = "";
  };

  const addSelected = (list) => {
    setFiles((prev) => {
      const remainingSlots = Math.max(0, 5 - prev.length);
      const limitedAdditions = list.slice(0, remainingSlots);
      if (list.length > remainingSlots) {
        setErrorBanner("You can upload a maximum of 5 files.");
      } else {
        setErrorBanner(null);
      }
      const next = [
        ...prev,
        ...limitedAdditions.map((f, i) => ({
          id: `${Date.now()}-${prev.length + i}`,
          file: f,
          status: "idle",
          error: null,
        })),
      ];
      return next;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setErrorBanner(null);
    setStatus("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeItem = (id) => {
    setFiles((prev) => prev.filter((x) => x.id !== id));
  };

  // ---------- Upload Logic ----------
  const start = async () => {
    if (!agent) {
      setStatus("Please select an agent from the sidebar.");
      return;
    }

    if (files.length === 0) {
      setStatus("Please select at least one file.");
      return;
    }

    try {
      setIsWorking(true);
      setStatus("Generating upload URLs...");
      setErrorBanner(null);

      // 1️⃣ Request pre-signed URLs from backend
      const presignedRes = await axios.post(
        `${API_BASE_URL}/api/v1/presigned-urls`,
        {
          files: files.map((f) => ({
            fileName: f.file.name,
            fileType: f.file.type,
          })),
        }
      );

      const urls = presignedRes.data.urls;
      console.log("urls", urls);
      setStatus("Uploading files to S3...");

      // 2️⃣ Upload files to S3 using pre-signed URLs
      await Promise.all(
        files.map(async (fileItem, idx) => {
          const { url } = urls[idx];
          fileItem.status = "uploading";
          await axios.put(url, fileItem.file, {
            headers: { "Content-Type": fileItem.file.type },
            onUploadProgress: (progressEvent) => {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              fileItem.status = `uploading ${percent}%`;
              setFiles([...files]);
            },
          });
          fileItem.status = "uploaded";
          fileItem.fileUrl = url.split("?")[0]; // remove query params
          fileItem.fileKey = urls[idx].key;
        })
      );

      setStatus("Saving file metadata...");

      // 3️⃣ Send metadata to your reports API
      const metadata = files.map((f) => ({
        userId: currentUser?.auth_user_id,
        attachmentsUrl: f.fileUrl,
        fileName: f.file.name,
        path: f.fileKey,
        size: f.file.size,
        stage: "Pending",
        status: "Needs-Review",
        uploaded_by: currentUser?.auth_user_id,
        site: agent?.site || "NSW",
        agent_id: agent?.id,
        agent_name: agent?.name,
      }));
      console.log("metadata", metadata);
      const saveRes = await axios.post(
        `${API_BASE_URL}/api/v1/upload-reports`,
        { attachments: metadata }
      );

      setResponseData(saveRes.data);
      setStatus("✅ Upload successful!");

      if (onResponse) {
        onResponse({
          result: saveRes.data,
          files: files.map((f) => f.file.name),
        });
      }

      setTimeout(() => clearAll(), 1500);
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("❌ Upload failed.");
      setErrorBanner(error.message);
      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: "error", error: error.message }))
      );
    } finally {
      setIsWorking(false);
    }
  };

  const StepItem = ({ index, title, desc }) => (
    <li className="flex items-start gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-full border text-sm font-semibold bg-blue-100 text-blue-700 border-blue-200">
        {index}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
    </li>
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // ---------- Render ----------
  if (!agent) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-card border rounded-2xl p-10 text-center max-w-md shadow-sm">
          <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Select an Agent
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            Choose an agent from the sidebar to enable file upload.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">File Upload</h2>
      <div className="border rounded-2xl p-5 bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm">
        <h3 className="font-semibold mb-3">How it works</h3>
        <ol className="grid gap-4 md:grid-cols-3">
          <StepItem
            index={1}
            title="Select files"
            desc="Drag & drop or browse multiple files."
          />
          <StepItem
            index={2}
            title="Uploading"
            desc="Files are sent to backend API."
          />
          <StepItem
            index={3}
            title="Completed"
            desc="Files uploaded successfully."
          />
        </ol>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl p-10 text-center transition-all duration-300 border-2 border-dashed ${isDragOver ? "border-primary" : "border-border"
          } backdrop-blur-sm bg-white/60 dark:bg-gray-900/40`}
      >
        <Upload
          className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? "text-primary" : "text-muted-foreground"
            }`}
        />
        <h3 className="text-lg font-semibold mb-2">
          {isDragOver ? "Drop your files here" : "Upload files"}
        </h3>
        <p className="text-muted-foreground mb-5">
          Drag & drop multiple files here, or click to browse.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
          multiple
          accept=".pdf"
        />
        <Button asChild variant="outline" disabled={files.length >= 5}>
          <label
            htmlFor="file-input"
            className={`cursor-pointer ${files.length >= 5 ? "pointer-events-none opacity-60" : ""}`}
            title={files.length >= 5 ? "Maximum of 5 files selected" : ""}
          >
            Browse Files
          </label>
        </Button>

        <div className="mt-3 text-xs font-semibold text-blue-600">
          Max 5 files · PDFs under 600 pages
        </div>


        {files.length >= 5 && (
          <div className="mt-2 text-xs text-muted-foreground">
            You have selected the maximum of 5 files.
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="bg-card/70 backdrop-blur-sm border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Selected files ({files.length})</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={isWorking}
            >
              Clear
            </Button>
          </div>

          <ul className="space-y-2">
            {files.map((item) => {
              const Icon = pickFileIcon(item.file.name);
              return (
                <li key={item.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {item.file.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(item.file.size)} · {item.status}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={isWorking}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex gap-2 items-center">
            <Button
              onClick={start}
              disabled={isWorking || files.length === 0}
              className="flex-1 cursor-pointer"
            >
              {isWorking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…
                </>
              ) : status === "✅ Upload successful!" ? (
                "✅ Uploaded Successfully!"
              ) : (
                "Start Upload"
              )}
            </Button>
          </div>
        </div>
      )}

      {errorBanner && (
        errorBanner === "You can upload a maximum of 5 files." ? (
          <div className="bg-blue-100 border border-blue-300 rounded-2xl p-4">
            <p className="text-blue-700 text-sm mt-1">{errorBanner}</p>
          </div>
        ) : (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4">
            <p className="text-destructive font-medium">Error</p>
            <p className="text-destructive/80 text-sm mt-1">{errorBanner}</p>
          </div>
        )
      )}
    </div>
  );
}
