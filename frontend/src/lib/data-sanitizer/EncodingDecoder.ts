import type {
  EncodingType,
  EncodingResult,
  DetectedEncoding,
} from './types';

export class EncodingDecoder {
  /**
   * Auto-detect encoding from raw bytes
   * Uses BOM detection + statistical analysis
   */
  autoDetect(bytes: Uint8Array): DetectedEncoding {
    // Step 1: Check BOM (Byte Order Mark)
    const bomResult = this.checkBOM(bytes);
    if (bomResult.confidence >= 0.95) {
      return bomResult;
    }

    // Step 2: Statistical analysis for UTF-8 vs GBK
    const analysis = this.analyzeBytes(bytes);

    // Step 3: Decision based on analysis
    if (analysis.utf8Likelihood > 0.85) {
      return {
        encoding: 'utf-8',
        confidence: analysis.utf8Likelihood,
        reasons: ['High valid UTF-8 sequence ratio'],
      };
    }

    if (analysis.gbkLikelihood > 0.70) {
      return {
        encoding: 'gbk',
        confidence: analysis.gbkLikelihood,
        reasons: [
          'Detected high-byte Chinese character patterns',
          'Low UTF-8 sequence validity',
        ],
      };
    }

    // Default: try UTF-8 first
    return {
      encoding: 'utf-8',
      confidence: 0.6,
      reasons: ['Default fallback'],
    };
  }

  /**
   * Check for BOM (Byte Order Mark)
   */
  private checkBOM(bytes: Uint8Array): DetectedEncoding {
    if (bytes.length >= 3) {
      // UTF-8 BOM: EF BB BF
      if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
        return {
          encoding: 'utf-8',
          confidence: 1.0,
          reasons: ['UTF-8 BOM detected'],
        };
      }
    }

    if (bytes.length >= 2) {
      // UTF-16 BOMs
      if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
        return {
          encoding: 'utf-16be',
          confidence: 0.9,
          reasons: ['UTF-16 BE BOM detected'],
        };
      }
      if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
        return {
          encoding: 'utf-16le',
          confidence: 0.9,
          reasons: ['UTF-16 LE BOM detected'],
        };
      }
    }

    return {
      encoding: 'auto',
      confidence: 0,
      reasons: ['No BOM detected'],
    };
  }

  /**
   * Statistical analysis of byte patterns
   * Counts valid UTF-8 sequences vs high-byte GBK patterns
   */
  private analyzeBytes(bytes: Uint8Array): {
    utf8Likelihood: number;
    gbkLikelihood: number;
    validUtf8Sequences: number;
    totalSequences: number;
  } {
    let validUtf8Sequences = 0;
    let totalSequences = 0;
    let gbkHighBytes = 0;
    let i = 0;

    while (i < bytes.length) {
      const byte = bytes[i];

      // Check for UTF-8 multi-byte sequences
      if ((byte & 0x80) === 0) {
        // ASCII
        validUtf8Sequences++;
        totalSequences++;
        i++;
      } else if ((byte & 0xE0) === 0xC0) {
        // 2-byte UTF-8 sequence
        if (i + 1 < bytes.length && (bytes[i + 1] & 0xC0) === 0x80) {
          validUtf8Sequences++;
          totalSequences++;
          i += 2;
        } else {
          totalSequences++;
          i++;
        }
      } else if ((byte & 0xF0) === 0xE0) {
        // 3-byte UTF-8 sequence (includes CJK)
        if (i + 2 < bytes.length &&
            (bytes[i + 1] & 0xC0) === 0x80 &&
            (bytes[i + 2] & 0xC0) === 0x80) {
          validUtf8Sequences++;
          totalSequences++;
          i += 3;
        } else {
          totalSequences++;
          i++;
        }
      } else if ((byte & 0xF8) === 0xF0) {
        // 4-byte UTF-8 sequence
        if (i + 3 < bytes.length &&
            (bytes[i + 1] & 0xC0) === 0x80 &&
            (bytes[i + 2] & 0xC0) === 0x80 &&
            (bytes[i + 3] & 0xC0) === 0x80) {
          validUtf8Sequences++;
          totalSequences++;
          i += 4;
        } else {
          totalSequences++;
          i++;
        }
      } else {
        // Check for GBK high bytes (0x81-0xFE)
        if (byte >= 0x81 && byte <= 0xFE) {
          gbkHighBytes++;
          if (i + 1 < bytes.length && bytes[i + 1] >= 0x40 && bytes[i + 1] <= 0xFE) {
            i += 2;
          } else {
            i++;
          }
        } else {
          i++;
        }
      }
    }

    const utf8Likelihood = totalSequences > 0 ? validUtf8Sequences / totalSequences : 0;
    const gbkScore = gbkHighBytes / (bytes.length / 2);
    const gbkLikelihood = Math.min(gbkScore + 0.2, 1.0);

    return {
      utf8Likelihood,
      gbkLikelihood,
      validUtf8Sequences,
      totalSequences,
    };
  }

  /**
   * Decode bytes with specific encoding using TextDecoder
   */
  decode(bytes: Uint8Array, encoding: EncodingType): string {
    if (encoding === 'auto') {
      const detected = this.autoDetect(bytes);
      return this.decode(bytes, detected.encoding);
    }

    try {
      const decoderEncoding = this.mapEncoding(encoding);
      const decoder = new TextDecoder(decoderEncoding, { fatal: false });
      return decoder.decode(bytes);
    } catch {
      // Fallback: try UTF-8
      const decoder = new TextDecoder('utf-8', { fatal: false });
      return decoder.decode(bytes);
    }
  }

  /**
   * Map encoding names to TextDecoder compatible names
   */
  private mapEncoding(encoding: EncodingType): string {
    switch (encoding) {
      case 'utf-8':
        return 'utf-8';
      case 'utf-16be':
        return 'utf-16be';
      case 'utf-16le':
        return 'utf-16le';
      case 'gbk':
        return 'gbk';
      case 'gb2312':
        return 'gb2312';
      case 'windows-1252':
        return 'windows-1252';
      default:
        return 'utf-8';
    }
  }

  /**
   * Try auto-detect first, fallback to manual
   */
  decodeSmart(bytes: Uint8Array, fallbackEncoding?: EncodingType): EncodingResult {
    const detected = this.autoDetect(bytes);
    const decoded = this.decode(bytes, detected.encoding);
    const fixedRate = this.calculateFixRate(decoded);

    if (fixedRate >= 0.9) {
      return {
        success: true,
        encoding: detected.encoding,
        confidence: detected.confidence,
        fixedRate,
        rawText: decoded,
        isValid: true,
      };
    }

    if (fallbackEncoding && fallbackEncoding !== 'auto') {
      const fallbackDecoded = this.decode(bytes, fallbackEncoding);
      const fallbackFixRate = this.calculateFixRate(fallbackDecoded);

      if (fallbackFixRate > fixedRate) {
        return {
          success: true,
          encoding: fallbackEncoding,
          confidence: 0.7,
          fixedRate: fallbackFixRate,
          rawText: fallbackDecoded,
          isValid: fallbackFixRate >= 0.8,
        };
      }
    }

    return {
      success: true,
      encoding: detected.encoding,
      confidence: detected.confidence,
      fixedRate,
      rawText: decoded,
      isValid: fixedRate >= 0.7,
    };
  }

  /**
   * Calculate fix rate - percentage of corrupted chars fixed
   */
  calculateFixRate(text: string): number {
    if (!text) return 1;

    const corruptedPatterns = [
      '锟斤拷',
      '烫烫烫',
      /�/g,
      /�/gi,
    ];

    let corruptedCount = 0;

    for (const pattern of corruptedPatterns) {
      if (typeof pattern === 'string') {
        corruptedCount += (text.match(new RegExp(pattern, 'g')) || []).length * pattern.length;
      } else {
        corruptedCount += (text.match(pattern) || []).length;
      }
    }

    // Match isolated unprintable control chars (except common whitespace),
    // replacement characters (U+FFFD), and invalid UTF-8 surrogate halves
    const mojibakeBlocks = text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F�\uD800-\uDFFF]+/g) || [];
    for (const block of mojibakeBlocks) {
      corruptedCount += block.length;
    }

    const totalChars = text.length;
    if (totalChars === 0) return 1;

    return Math.max(0, 1 - (corruptedCount / totalChars));
  }
}