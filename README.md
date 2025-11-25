# Node PDF Printer

A powerful cross-platform Node.js library for printing PDF documents. Built with native integrations for Windows (via Koffi and winspool.drv) and Unix systems (via CUPS), supporting advanced printing features like duplex printing, paper tray selection, and custom paper sizes.

[![npm version](https://img.shields.io/npm/v/node-pdf-printer.svg)](https://www.npmjs.com/package/node-pdf-printer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Platform Support](#platform-support)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

## Features

✅ **Cross-Platform** - Works seamlessly on Windows, Linux, and macOS  
✅ **Native Windows Printing** - Direct integration with Windows Print Spooler API via Koffi  
✅ **Unix/Linux Support** - Uses CUPS `lp` command for reliable printing on Unix systems  
✅ **Duplex Printing** - Full support for simplex, horizontal, and vertical duplex modes  
✅ **Paper Configuration** - Multiple paper sizes (A3, A4, Letter, Legal, Tabloid, etc.)  
✅ **Tray Selection** - Choose specific paper trays/sources (Windows only)  
✅ **Printer Management** - List, query capabilities, and manage system printers  
✅ **Color/Monochrome** - Control color modes for cost-effective printing  
✅ **Multiple Copies** - Print multiple copies with collation support  
✅ **Raw Data Printing** - Send PCL, PostScript, or raw data directly to printer  
✅ **TypeScript First** - Full TypeScript support with comprehensive type definitions  
✅ **Modern Node.js** - Built for Node.js 22+ with native TypeScript support  

## Requirements

### All Platforms
- **Node.js 22.0.0 or higher** (with native TypeScript support)

### Windows
- Windows 7 or later
- `winspool.drv` (included with Windows)
- `koffi` package (installed automatically)

### Linux/macOS
- CUPS (Common Unix Printing System) - usually pre-installed
- `lp` command-line tool
- System printer drivers configured via CUPS

## Installation

```bash
npm install node-pdf-printer
```

Or install dependencies in this repo:

```bash
npm install
```

## Quick Start

```typescript
import { PDFPrinter, listPrinters, getPlatform } from 'node-pdf-printer';

console.log('Platform:', getPlatform()); // 'windows' or 'unix'

// List available printers (async on Unix, sync on Windows)
const printers = await listPrinters();
console.log('Available printers:', printers);

// Create printer instance (uses default printer)
const printer = new PDFPrinter();

// Print a PDF with default settings
await printer.print('./document.pdf');

// Print with options (Windows)
await printer.print('./document.pdf', {
  copies: 2,
  duplex: 'vertical',
  paperSize: 9, // PAPER_A4
  color: true
});

// Print with options (Unix)
await printer.print('./document.pdf', {
  copies: 2,
  duplex: 'vertical',
  paperSize: 'a4',
  orientation: 'portrait'
});
```

## API Reference

### Classes

#### `PDFPrinter`

Main class for printing PDF documents.

**Constructor:**
```typescript
new PDFPrinter(printerName?: string)
```
- `printerName` (optional): Specific printer to use. If not provided, uses system default.

**Methods:**

##### `print(pdfPath: string, options?: PrintOptions): Promise<void>`

Print a PDF file with specified options.

```typescript
await printer.print('./report.pdf', {
  copies: 3,
  duplex: 'vertical',
  paperSize: PAPER_A4,
  orientation: 'portrait',
  color: true,
  paperSource: 1
});
```

##### `printRaw(data: Buffer, documentName?: string, options?: PrintOptions): Promise<void>`

Print raw data (PCL, PostScript, etc.) directly to printer.

```typescript
const rawData = Buffer.from('...');
await printer.printRaw(rawData, 'My Document', {
  paperSize: PAPER_LETTER
});
```

##### `getPrinterName(): string`

Get the name of the printer being used.

##### `getCapabilities(): PrinterCapabilities | null`

Get printer capabilities (duplex support, color support, etc.).

#### `PrinterManager`

Static class for managing printers.

**Static Methods:**

##### `getAvailablePrinters(): PrinterInfo[]`

Get list of all available printers.

```typescript
const printers = PrinterManager.getAvailablePrinters();
```

##### `getDefaultPrinter(): string | null`

Get the system default printer name.

##### `printerExists(printerName: string): boolean`

Check if a printer exists.

##### `getPrinterCapabilities(printerName: string): PrinterCapabilities | null`

Get capabilities for a specific printer.

### Interfaces

#### `PrintOptions`

```typescript
interface PrintOptions {
  printer?: string;           // Printer name
  copies?: number;            // Number of copies (default: 1)
  duplex?: 'simplex' | 'horizontal' | 'vertical';
  paperSize?: number;         // Paper size constant
  paperSource?: number;       // Paper tray/source
  orientation?: 'portrait' | 'landscape';
  color?: boolean;            // true = color, false = monochrome
  quality?: number;           // Print quality
  collate?: boolean;          // Collate copies
}
```

#### `PrinterInfo`

```typescript
interface PrinterInfo {
  name: string;
  serverName?: string;
  portName?: string;
  driverName?: string;
  location?: string;
  comment?: string;
  status: number;
  isDefault?: boolean;
}
```

#### `PrinterCapabilities`

```typescript
interface PrinterCapabilities {
  supportsDuplex: boolean;
  supportsColor: boolean;
  defaultPaperSize: number;
  availablePaperSizes: number[];
  availablePaperSources: number[];
}
```

### Constants

#### Paper Sizes
- `PAPER_LETTER` (1) - 8.5" x 11"
- `PAPER_LEGAL` (5) - 8.5" x 14"
- `PAPER_A4` (9) - 210mm x 297mm
- `PAPER_A3` (8) - 297mm x 420mm
- `PAPER_TABLOID` (3) - 11" x 17"

#### Duplex Modes
- `DUPLEX_SIMPLEX` (1) - Single-sided
- `DUPLEX_HORIZONTAL` (2) - Flip on short edge
- `DUPLEX_VERTICAL` (3) - Flip on long edge

#### Orientation
- `PORTRAIT` (1)
- `LANDSCAPE` (2)

#### Color Modes
- `MONOCHROME` (1)
- `COLOR` (2)

#### Print Quality
- `PRINT_QUALITY_HIGH` (-4)
- `PRINT_QUALITY_MEDIUM` (-3)
- `PRINT_QUALITY_LOW` (-2)
- `PRINT_QUALITY_DRAFT` (-1)

## Examples

### Simple Print

```typescript
import { PDFPrinter } from 'node-pdf-printer';

const printer = new PDFPrinter();
await printer.print('./document.pdf');
```

### Duplex Printing

```typescript
import { PDFPrinter, PAPER_A4 } from 'node-pdf-printer';

const printer = new PDFPrinter();

// Vertical duplex (flip on long edge)
await printer.print('./document.pdf', {
  duplex: 'vertical',
  paperSize: PAPER_A4
});
```

### Print to Specific Printer

```typescript
import { PDFPrinter } from 'node-pdf-printer';

const printer = new PDFPrinter('HP LaserJet Pro');
await printer.print('./document.pdf', {
  copies: 5,
  collate: true
});
```

### Advanced Configuration

```typescript
import { PDFPrinter, PAPER_A4, PRINT_QUALITY_HIGH } from 'node-pdf-printer';

const printer = new PDFPrinter();

await printer.print('./document.pdf', {
  copies: 3,
  duplex: 'vertical',
  paperSize: PAPER_A4,
  paperSource: 2,        // Lower tray
  orientation: 'portrait',
  color: true,
  quality: PRINT_QUALITY_HIGH,
  collate: true
});
```

### List All Printers

```typescript
import { listPrinters, PrinterManager } from 'node-pdf-printer';

const printers = listPrinters();

printers.forEach(printer => {
  console.log(`${printer.name}${printer.isDefault ? ' (DEFAULT)' : ''}`);
  
  const capabilities = PrinterManager.getPrinterCapabilities(printer.name);
  if (capabilities) {
    console.log(`  Duplex: ${capabilities.supportsDuplex}`);
    console.log(`  Color: ${capabilities.supportsColor}`);
  }
});
```

## Running Examples

```bash
# List all printers
node --experimental-strip-types examples/list-printers.ts

# Simple print
node --experimental-strip-types examples/simple-print.ts

# Duplex printing
node --experimental-strip-types examples/duplex-print.ts

# Advanced printing
node --experimental-strip-types examples/advanced-print.ts
```

Or use npm scripts:

```bash
npm run example:simple
npm run example:duplex
npm run example:advanced
```

## Troubleshooting

### Common Issues

#### "Printer not found" error

Make sure the printer name is correct. Use `listPrinters()` to see all available printers:

```typescript
import { listPrinters } from 'node-pdf-printer';
const printers = await listPrinters(); // Note: async on Unix
console.log(printers);
```

#### "Failed to start print job" error (Windows)

- Verify the printer is online and not paused
- Check you have sufficient permissions to print
- Ensure the printer driver is properly installed
- Try printing a test page from Windows Settings to confirm functionality
- Check Windows Event Viewer for detailed error messages

#### "lp: command not found" (Unix/Linux)

Install CUPS:
```bash
# Ubuntu/Debian
sudo apt-get install cups

# Fedora/RHEL
sudo yum install cups

# macOS (usually pre-installed)
brew install cups
```

#### Duplex not working

Not all printers support duplex printing. Check capabilities:

```typescript
const printer = new PDFPrinter();
const capabilities = await printer.getCapabilities();
console.log('Duplex supported:', capabilities?.supportsDuplex);
```

On Unix systems, verify CUPS configuration:
```bash
lpoptions -p YourPrinterName -l | grep Duplex
```

#### PDF not rendering correctly

This library sends raw PDF data to the printer:

- **Windows**: Ensure your printer supports PDF direct printing (PostScript/PCL)
- **Unix**: CUPS handles PDF conversion automatically if drivers are installed
- Verify the PDF file is valid and not corrupted
- For complex PDFs with advanced features, consider pre-processing
- Test with a simple single-page PDF first

#### Permission denied errors (Unix)

Add your user to the `lp` or `lpadmin` group:
```bash
sudo usermod -a -G lp $USER
# Log out and back in for changes to take effect
```

### Platform-Specific Notes

#### Windows
- Requires the printer to be installed and configured in Windows
- Driver-specific features may vary between printer models
- Some printers may require specific data formats (RAW vs. PostScript)

#### Linux
- Ensure CUPS service is running: `systemctl status cups`
- Configure printers via CUPS web interface: `http://localhost:631`
- Some features depend on PPD (PostScript Printer Description) files

#### macOS
- CUPS is pre-installed but may need to be started
- Use System Preferences → Printers & Scanners to configure printers
- Some features require specific printer drivers from manufacturer

## Platform Support

This library supports **Windows, Linux, and macOS** with platform-specific optimizations:

### Windows Implementation
- **Technology**: Native `winspool.drv` API via Koffi FFI
- **Performance**: Synchronous operations for immediate feedback
- **Capabilities**: Full control over all printer settings
- **Advanced Features**: Paper source/tray selection, print quality settings, detailed printer info

### Unix/Linux/macOS Implementation
- **Technology**: CUPS `lp` command-line interface
- **Performance**: Asynchronous operations for non-blocking execution
- **Capabilities**: Standard CUPS-supported features
- **Requirements**: CUPS installed (pre-installed on most systems)

### Feature Comparison Matrix

| Feature | Windows | Unix/Linux/macOS | Notes |
|---------|---------|------------------|-------|
| **Printer Discovery** | ✓ Sync | ✓ Async | List all available printers |
| **Default Printer** | ✓ Sync | ✓ Async | Get system default printer |
| **Duplex Printing** | ✓ | ✓ | One-sided, long-edge, short-edge |
| **Paper Size** | ✓ Numeric | ✓ String | Windows: `9` (A4), Unix: `'a4'` |
| **Paper Source/Tray** | ✓ | ✗ | Windows-only feature |
| **Print Quality** | ✓ | ✗ | Windows-only feature |
| **Color Mode** | ✓ | ✓ | Color or monochrome |
| **Orientation** | ✓ | ✓ | Portrait or landscape |
| **Multiple Copies** | ✓ | ✓ | With collation support |
| **Printer Capabilities** | ✓ | Limited | Detailed info on Windows |

### How It Works

#### Windows
Uses Koffi to interface directly with Windows Print Spooler API (`winspool.drv`):

1. **OpenPrinterW** - Opens a handle to the printer
2. **StartDocPrinterW** - Starts a print job with DOC_INFO_1W structure
3. **StartPagePrinter** - Begins a new page
4. **WritePrinter** - Sends raw PDF data to the printer
5. **EndPagePrinter** - Ends the current page
6. **EndDocPrinter** - Completes the print job
7. **ClosePrinter** - Closes the printer handle

Configuration is passed via `DEVMODE` structures to control duplex, paper size, orientation, etc.

#### Unix/Linux/macOS
Uses CUPS command-line interface:

1. Constructs `lp` command with appropriate flags
2. Passes options like `-o sides=two-sided-long-edge` for duplex
3. Executes command via Node.js `child_process`
4. Captures output and job IDs for tracking

## Testing

This library includes a comprehensive test suite covering all major functionality:

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

### Test Coverage

The test suite includes:

- **Windows API Tests**: Validates Koffi bindings, structures, and constants
- **PrinterManager Tests**: Tests printer discovery, default printer, and capabilities
- **PDFPrinter Tests**: Tests printing functionality with various options
- **Unix Printer Tests**: Tests CUPS integration (skipped on Windows)
- **Cross-Platform Tests**: Tests unified API and platform detection

Tests are automatically skipped on platforms where they don't apply (e.g., Unix tests skip on Windows).

### Test Results

```
Test Suites: 4 passed (1 skipped on non-Unix)
Tests:       73 passed, 17 skipped
Coverage:    Comprehensive coverage of all public APIs
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:
- Development setup
- Code style guidelines
- Testing requirements
- Submitting pull requests

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes in each version.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 **Documentation**: Full API reference available in this README
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/node-pdf-printer/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/node-pdf-printer/discussions)
- 📧 **Email**: your.email@example.com

## Acknowledgments

- Built with [Koffi](https://github.com/Koromix/koffi) for native Windows API integration
- CUPS (Common Unix Printing System) for Unix/Linux/macOS support
- Inspired by the Node.js printing community

## Related Projects

- [node-printer](https://github.com/tojocky/node-printer) - Alternative native printer binding
- [pdf-to-printer](https://github.com/artiebits/pdf-to-printer) - Windows-only PDF printing
- [unix-print](https://github.com/appsforartists/unix-print) - Unix-focused printing library

---

Created with ❤️ for the Node.js community