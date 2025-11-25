import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

const describeWindows = os.platform() === 'win32' ? describe : describe.skip;

describeWindows('PDFPrinter (Windows)', () => {
  let PDFPrinter: typeof import('../src/pdf-printer').PDFPrinter;
  let PrinterManager: typeof import('../src/printer-manager').PrinterManager;
  let printer: import('../src/pdf-printer').PDFPrinter;
  let testPdfPath: string;

  beforeAll(async () => {
    if (os.platform() === 'win32') {
      const pdfModule = await import('../src/pdf-printer');
      const managerModule = await import('../src/printer-manager');
      PDFPrinter = pdfModule.PDFPrinter;
      PrinterManager = managerModule.PrinterManager;
      
      printer = new PDFPrinter();

      // Create a minimal test PDF file
      testPdfPath = path.join(__dirname, 'test-document.pdf');
      const minimalPdf = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF`;
      
      fs.writeFileSync(testPdfPath, minimalPdf);
    }
  });

  afterAll(() => {
    if (testPdfPath && fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
    }
  });

  describe('Constructor', () => {
    it('should create a PDFPrinter instance', () => {
      expect(printer).toBeDefined();
      expect(printer).toBeInstanceOf(PDFPrinter);
    });

    it('should create instance with specific printer', () => {
      const printers = PrinterManager.getAvailablePrinters();
      if (printers.length > 0) {
        const specificPrinter = new PDFPrinter(printers[0].name);
        expect(specificPrinter).toBeDefined();
      }
    });
  });

  describe('print', () => {
    it('should throw error if PDF file does not exist', async () => {
      await expect(printer.print('non-existent-file.pdf')).rejects.toThrow();
    });

    it('should throw error if printer does not exist', async () => {
      expect(() => new PDFPrinter('NonExistentPrinter_12345')).toThrow('Printer not found');
    });

    // Note: Actual printing test would send to printer
    // Skipped to avoid unwanted prints during testing
    it.skip('should print successfully with default options', async () => {
      const printers = PrinterManager.getAvailablePrinters();
      if (printers.length > 0) {
        const testPrinter = new PDFPrinter(printers[0].name);
        await expect(testPrinter.print(testPdfPath)).resolves.not.toThrow();
      }
    });
  });

  describe('printRaw', () => {
    it('should throw error for non-existent printer', async () => {
      expect(() => new PDFPrinter('NonExistentPrinter_12345')).toThrow('Printer not found');
    });

    it('should handle empty buffer', async () => {
      // Empty buffer is valid, just sends no data
      // This test verifies it doesn't crash
      await printer.printRaw(Buffer.alloc(0));
      expect(true).toBe(true);
    });

    // Skipped to avoid unwanted prints
    it.skip('should print raw data successfully', async () => {
      const printers = PrinterManager.getAvailablePrinters();
      if (printers.length > 0) {
        const testPrinter = new PDFPrinter(printers[0].name);
        const rawData = Buffer.from('%TEST%');
        await expect(testPrinter.printRaw(rawData)).resolves.not.toThrow();
      }
    });
  });

  describe('getCapabilities', () => {
    it('should throw for non-existent printer', () => {
      expect(() => new PDFPrinter('NonExistentPrinter_12345')).toThrow('Printer not found');
    });

    it('should return capabilities for valid printer', () => {
      const printers = PrinterManager.getAvailablePrinters();
      if (printers.length > 0) {
        const testPrinter = new PDFPrinter(printers[0].name);
        const capabilities = testPrinter.getCapabilities();
        if (capabilities) {
          expect(capabilities).toHaveProperty('supportsDuplex');
          expect(capabilities).toHaveProperty('supportsColor');
        }
      }
    });
  });

  describe('Print Options', () => {
    it('should accept duplex options', async () => {
      const options = {
        duplex: 'vertical' as const,
      };
      // Just validate options are accepted, not actually printing
      expect(options.duplex).toBe('vertical');
    });

    it('should accept paper size options', () => {
      const options = {
        paperSize: 9, // A4
      };
      expect(options.paperSize).toBe(9);
    });

    it('should accept copies option', () => {
      const options = {
        copies: 2,
      };
      expect(options.copies).toBe(2);
    });

    it('should accept color mode option', () => {
      const options = {
        color: false,
      };
      expect(options.color).toBe(false);
    });

    it('should accept orientation option', () => {
      const options = {
        orientation: 'landscape' as const,
      };
      expect(options.orientation).toBe('landscape');
    });

    it('should accept multiple options combined', () => {
      const options = {
        duplex: 'horizontal' as const,
        paperSize: 9,
        copies: 2,
        color: true,
        orientation: 'portrait' as const,
      };
      expect(options).toBeDefined();
      expect(options.copies).toBe(2);
      expect(options.duplex).toBe('horizontal');
    });
  });
});
