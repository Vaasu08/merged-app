/**
 * PDF Parser wrapper for resume text extraction
 */

import { extractTextFromFile } from './fileParser';

export const pdfParser = {
  async parseFile(file: File): Promise<string> {
    return extractTextFromFile(file);
  }
};

export default pdfParser;
