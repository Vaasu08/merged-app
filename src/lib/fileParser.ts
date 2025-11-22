import * as pdfjsLib from 'pdfjs-dist';

// Set worker source using unpkg to match the installed version exactly
// We use .mjs extension as modern pdfjs-dist uses ES modules
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type;

    console.log(`📄 Parsing file: ${file.name} (${fileType}) using PDF.js v${pdfjsLib.version}`);

    try {
        if (fileType === 'application/pdf') {
            return await extractTextFromPDF(file);
        } else if (fileType === 'text/plain') {
            return await extractTextFromTXT(file);
        } else {
            throw new Error(`Unsupported file type: ${fileType}. Please upload a PDF or TXT file.`);
        }
    } catch (error: any) {
        console.error('❌ Text extraction failed:', error);
        throw new Error(error.message || 'Failed to extract text');
    }
};

const extractTextFromTXT = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target?.result as string || '');
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};

const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();

        // Load the document
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';
        console.log(`📑 PDF loaded. Pages: ${pdf.numPages}`);

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }

        if (!fullText.trim()) {
            throw new Error('PDF contains no extractable text (it might be an image scan).');
        }

        return fullText;
    } catch (error: any) {
        console.error('PDF Parsing Error:', error);
        if (error.name === 'MissingPDFException') {
            throw new Error('Invalid or corrupted PDF file.');
        }
        throw error;
    }
};
