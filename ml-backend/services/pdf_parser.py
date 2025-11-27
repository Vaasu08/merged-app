"""
PDF Parser Service
Extract text from PDF, DOCX, and TXT files
"""

import io
from typing import Optional
import PyPDF2
import pdfplumber
from docx import Document


class PDFParser:
    """Parse various resume file formats"""
    
    def parse_file(self, file_content: bytes, filename: str) -> str:
        """
        Parse resume file and extract text
        
        Args:
            file_content: File bytes
            filename: Original filename
            
        Returns:
            Extracted text
        """
        file_ext = filename.lower().split('.')[-1]
        
        if file_ext == 'pdf':
            return self.parse_pdf(file_content)
        elif file_ext in ['docx', 'doc']:
            return self.parse_docx(file_content)
        elif file_ext == 'txt':
            return file_content.decode('utf-8', errors='ignore')
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
    
    def parse_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF"""
        text = ""
        
        # Try pdfplumber first (better for complex PDFs)
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"pdfplumber failed: {e}, trying PyPDF2")
            
            # Fallback to PyPDF2
            try:
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            except Exception as e2:
                raise ValueError(f"Failed to parse PDF: {e2}")
        
        return text.strip()
    
    def parse_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX"""
        try:
            doc = Document(io.BytesIO(file_content))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to parse DOCX: {e}")


# Singleton instance
pdf_parser = PDFParser()
