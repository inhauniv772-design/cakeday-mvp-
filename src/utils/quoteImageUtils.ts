import type { QuoteAttachmentImage } from '../types';

export const QUOTE_IMAGE_MAX_COUNT = 3;
export const QUOTE_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const QUOTE_IMAGE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file format (JPG, JPEG, PNG, WEBP) and size (<= 5MB).
 */
export function validateQuoteImageFile(file: {
  name: string;
  type: string;
  size: number;
}): ImageValidationResult {
  const normalizedType = file.type.toLowerCase().trim();
  const lowerName = file.name.toLowerCase().trim();

  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
    lowerName.endsWith(ext)
  );
  const hasAllowedMime = (
    QUOTE_IMAGE_ALLOWED_MIME_TYPES as readonly string[]
  ).includes(normalizedType);

  // Some browsers/OS setups omit type or provide image/jpg alias; verify safely
  const isImageJpgAlias = normalizedType === 'image/jpg';
  const isFormatValid =
    hasAllowedMime ||
    isImageJpgAlias ||
    (!normalizedType && hasAllowedExtension);

  if (!isFormatValid || (normalizedType && !hasAllowedMime && !isImageJpgAlias)) {
    return {
      valid: false,
      error: `${file.name}: JPG, JPEG, PNG, WEBP 형식의 이미지 파일만 첨부할 수 있습니다.`,
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: `${file.name}: 비어 있는 이미지 파일은 첨부할 수 없습니다.`,
    };
  }

  if (file.size > QUOTE_IMAGE_MAX_BYTES) {
    return {
      valid: false,
      error: `${file.name}: 파일 크기는 1장당 최대 5MB까지 첨부할 수 있습니다.`,
    };
  }

  return { valid: true };
}

export function formatFileSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function readFileAsRawDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('이미지 데이터를 읽지 못했습니다.'));
      }
    };
    reader.onerror = () => reject(new Error('이미지 파일을 읽는 중 오류가 발생했습니다.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generates a browser-storage-friendly preview Data URL (max 960px dimension)
 * so up to 3 attached 5MB photos can be persisted reliably in localStorage
 * during this frontend demo stage. In production, raw images should be uploaded
 * to a dedicated backend / cloud image storage service.
 */
async function compressImageForDemoStorage(rawDataUrl: string, mimeType: string): Promise<string> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    return rawDataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const MAX_DIM = 960;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width >= height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const targetMime =
          mimeType === 'image/png' && rawDataUrl.length < 220_000
            ? 'image/png'
            : 'image/jpeg';
        const compressed = canvas.toDataURL(targetMime, 0.78);
        resolve(compressed.length < rawDataUrl.length ? compressed : rawDataUrl);
      } catch {
        resolve(rawDataUrl);
      }
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}

export async function processQuoteImageFile(
  file: File
): Promise<{ ok: true; image: QuoteAttachmentImage } | { ok: false; error: string }> {
  const validation = validateQuoteImageFile(file);
  if (!validation.valid) {
    return { ok: false, error: validation.error || '유효하지 않은 이미지 파일입니다.' };
  }

  try {
    const rawDataUrl = await readFileAsRawDataUrl(file);
    const optimizedDataUrl = await compressImageForDemoStorage(
      rawDataUrl,
      file.type || 'image/jpeg'
    );

    return {
      ok: true,
      image: {
        id: `qimg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fileName: file.name,
        mimeType: file.type || 'image/jpeg',
        sizeBytes: file.size,
        dataUrl: optimizedDataUrl,
      },
    };
  } catch {
    return {
      ok: false,
      error: `${file.name}: 이미지 미리보기를 생성하지 못했습니다. 다른 파일로 시도해 주세요.`,
    };
  }
}
