import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload-signature',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-signature.html',
  styleUrls: ['./upload-signature.scss']
})
export class UploadSignature implements OnInit {
  @Output() signatureUploaded = new EventEmitter<string>();
  @Output() signatureRemoved = new EventEmitter<void>();
  @Output() signatureDataChanged = new EventEmitter<{imageUrl?: string, signatureText: string}>();
  
  previewUrl: string | null = null;
  signatureText: string = 'Departamento de Ingeniería de Sistemas\nPontificia Universidad Javeriana';
  isDragOver = false;
  errorMessage: string | null = null;
  isProcessing = false;

  private readonly maxFileSize = 2 * 1024 * 1024; // 2MB
  private readonly allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  ngOnInit() {
    // Emit initial signature data
    this.emitSignatureData();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fileInput?.click();
    }
  }

  removeSignature(event: Event) {
    event.stopPropagation();
    this.previewUrl = null;
    this.errorMessage = null;
    this.signatureRemoved.emit();
    this.emitSignatureData();
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSignatureTextChange() {
    this.emitSignatureData();
  }

  private emitSignatureData() {
    this.signatureDataChanged.emit({
      imageUrl: this.previewUrl || undefined,
      signatureText: this.signatureText
    });
  }

  private processFile(file: File) {
    this.errorMessage = null;
    this.isProcessing = true;

    // Validate file type
    if (!this.allowedTypes.includes(file.type)) {
      this.errorMessage = 'Tipo de archivo no válido. Solo se permiten PNG y JPG.';
      this.isProcessing = false;
      return;
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      this.errorMessage = 'El archivo es demasiado grande. Tamaño máximo: 2MB.';
      this.isProcessing = false;
      return;
    }

    // Process the image
    this.compressAndResizeImage(file)
      .then((compressedDataUrl) => {
        this.previewUrl = compressedDataUrl;
        this.signatureUploaded.emit(this.previewUrl);
        this.emitSignatureData();
        this.isProcessing = false;
      })
      .catch((error) => {
        this.errorMessage = 'Error al procesar la imagen. Inténtalo de nuevo.';
        this.isProcessing = false;
        console.error('Error processing image:', error);
      });
  }

  private compressAndResizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto del canvas'));
        return;
      }

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        const maxWidth = 300;
        const maxHeight = 150;
        
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = maxWidth / aspectRatio;
          } else {
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to data URL with compression
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));

      // Create object URL for the image
      img.src = URL.createObjectURL(file);
    });
  }
}
