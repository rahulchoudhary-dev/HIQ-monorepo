import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ShieldCheck } from "lucide-react";

export default function QLDComplianceForm({ agent, onResponse, authUserId }) {
  const [taskName, setTaskName] = useState("");
  const [relevantText, setRelevantText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const nonImageFiles = files.filter((file) => !file.type.startsWith("image/"));

    if (nonImageFiles.length > 0) {
      setError("Only image files can be uploaded (e.g., PNG, JPG, GIF).");
    } else {
      setError(null);
    }

    if (imageFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...imageFiles]);
    }

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!relevantText.trim() && selectedImages.length === 0) {
      setError("Please provide either relevant text or at least one image");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();

      // Add task name
      if (taskName.trim()) {
        formData.append("taskName", taskName.trim());
      }

      // Add relevant text
      if (relevantText.trim()) {
        formData.append("relevantText", relevantText.trim());
      }

      // Add images
      selectedImages.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      // Add image count
      formData.append("imageCount", selectedImages.length.toString());

      // Add auth_user_id provided from parent (if available)
      if (authUserId) {
        formData.append("auth_user_id", authUserId);
      }

      const response = await fetch(
        "https://gluagents.xyz/webhook/a69f19d3-cd8c-4a13-9ed8-7df49d7c39b1",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let result;

      try {
        result = JSON.parse(text);
      } catch {
        result = { response: text };
      }

      // Create a filename for the response
      const fileName = `qld-compliance-${new Date().toISOString().slice(0, 10)}.json`;

      onResponse?.({ result, fileName });

      // Reset form
      setTaskName("");
      setRelevantText("");
      setSelectedImages([]);
    } catch (err) {
      setError(err.message || "Failed to submit form");
    } finally {
      setIsUploading(false);
    }
  };

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
            Choose an agent from the sidebar to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-card border rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          QLD Waste Compliance Checker
        </h2>
        <p className="text-muted-foreground mb-6">
          Submit relevant texts and images for compliance checking
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Name Field */}
          <div className="space-y-2">
            <Label htmlFor="taskName" className="text-sm font-medium">
              Task Name
            </Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name..."
              disabled={isUploading}
            />
          </div>

          {/* Relevant Texts Field */}
          <div className="space-y-2">
            <Label htmlFor="relevantText" className="text-sm font-medium">
              Relevant Texts
            </Label>
            <textarea
              id="relevantText"
              value={relevantText}
              onChange={(e) => setRelevantText(e.target.value)}
              placeholder="Enter relevant text for compliance checking..."
              className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-input bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isUploading}
            />
          </div>

          {/* Relevant Images Field */}
          <div className="space-y-2">
            <Label htmlFor="images" className="text-sm font-medium">
              Relevant Images
            </Label>

            <input
              type="file"
              id="images"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              multiple
              className="hidden"
              disabled={isUploading}
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Images
            </Button>

            {/* Image Preview */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg border border-input overflow-hidden bg-muted">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={isUploading}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isUploading} className="w-full" size="lg">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Compliance Check"
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive font-medium">Error</p>
              <p className="text-destructive/80 text-sm mt-1">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

