import { deleteImageFromDB, getAllImages, initDB, saveImageToDB } from "./services/database";
import type { UploadedImage } from "./types";

// Convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Render images
async function renderImages(): Promise<void> {
  const container = document.getElementById("imagesContainer");
  if (!container) return;

  const images = await getAllImages();

  // Sort by timestamp descending (newest first)
  images.sort((a, b) => b.timestamp - a.timestamp);

  // Update stats
  updateStats(images);

  if (images.length === 0) {
    container.innerHTML = `
               <div class="empty-state">
                   <div class="empty-state-icon">🖼️</div>
                   <div class="empty-state-text">No images yet. Upload some to get started!</div>
               </div>
           `;
    return;
  }

  const html = `
           <div class="images-grid">
               ${images
                 .map(
                   (img) => `
                   <div class="image-card" data-id="${img.id}">
                       <div class="image-wrapper">
                           <img src="${img.data}" alt="${img.name}">
                       </div>
                       <div class="image-info">
                           <div class="image-name" title="${img.name}">${img.name}</div>
                           <div class="image-actions">
                               <button class="btn btn-open" data-id="${img.id}">Open</button>
                               <button class="btn btn-delete" data-id="${img.id}">Delete</button>
                           </div>
                       </div>
                   </div>
               `,
                 )
                 .join("")}
           </div>
       `;

  container.innerHTML = html;
}

// Update stats
function updateStats(images: UploadedImage[]): void {
  const statsEl = document.getElementById("stats");
  if (!statsEl) return;

  const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  statsEl.textContent = `${images.length} image${images.length !== 1 ? "s" : ""} stored (${totalSizeMB} MB)`;
}

// Handle file upload
async function handleFiles(files: FileList | null): Promise<void> {
  if (!files) return;

  const fileArray = Array.from(files).filter((file) => file.type.startsWith("image/"));

  if (fileArray.length === 0) {
    alert("Please select valid image files");
    return;
  }

  for (const file of fileArray) {
    try {
      const base64 = await fileToBase64(file);
      const imageData: UploadedImage = {
        id: Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        name: file.name,
        data: base64,
        size: file.size,
        type: file.type,
        timestamp: Date.now(),
      };

      await saveImageToDB(imageData);
    } catch (error) {
      console.error("Error saving image:", error);
      alert(`Error uploading ${file.name}`);
    }
  }

  await renderImages();
}

// Open image in new tab
function openImage(id: string) {
  getAllImages().then((images) => {
    const image = images.find((img) => img.id === id);
    if (image) {
      const newWindow = open();
      if (!newWindow) return;

      newWindow.document.write(`
                   <!DOCTYPE html>
                   <html>
                   <head>
                       <title>${image.name}</title>
                       <style>
                           body { 
                               margin: 0; 
                               display: flex; 
                               justify-content: center; 
                               align-items: center; 
                               min-height: 100vh; 
                               background: #000;
                           }
                           img { 
                               max-width: 100%; 
                               max-height: 100vh; 
                               object-fit: contain;
                           }
                       </style>
                   </head>
                   <body>
                       <img src="${image.data}" alt="${image.name}">
                   </body>
                   </html>
               `);
    }
  });
}

// Delete image
async function deleteImage(id: string): Promise<void> {
  if (confirm("Are you sure you want to delete this image?")) {
    try {
      await deleteImageFromDB(id);
      await renderImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Error deleting image");
    }
  }
}

// Event listeners
const uploadBtn = document.getElementById("uploadBtn");
if (uploadBtn) {
  uploadBtn.addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  });
}

const fileInput = document.getElementById("fileInput") as HTMLInputElement;

if (fileInput) {
  fileInput.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;
    handleFiles(target.files);
    target.value = ""; // Reset input
  });
}

// Drag and drop
const uploadSection = document.getElementById("uploadSection");
if (uploadSection) {
  uploadSection.addEventListener("dragover", (e: DragEvent) => {
    e.preventDefault();
    uploadSection.classList.add("dragging");
  });

  uploadSection.addEventListener("dragleave", () => {
    uploadSection.classList.remove("dragging");
  });

  uploadSection.addEventListener("drop", (e: DragEvent) => {
    e.preventDefault();
    uploadSection.classList.remove("dragging");
    handleFiles(e.dataTransfer?.files || null);
  });
}

// Initialize app
(async function init(): Promise<void> {
  try {
    await initDB();
    await renderImages();

    const container = document.getElementById("imagesContainer");
    if (!container) return;

    container.addEventListener("click", (event: Event) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains("btn-open")) {
        const id = target.dataset.id;
        if (!id) return;
        openImage(id);
      }

      if (target.classList.contains("btn-delete")) {
        const id = target.dataset.id;
        if (!id) return;
        deleteImage(id);
      }
    });
    console.log("UploadedImage Manager initialized successfully");
  } catch (error) {
    console.error("Error initializing app:", error);
    const statsEl = document.getElementById("stats");
    if (statsEl) {
      statsEl.textContent = "Error initializing app";
    }
  }
})();
