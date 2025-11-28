# Windows PDF Printer Native

A **production-ready**, **cross-platform** Node.js library for printing PDF documents with **native Windows API integration** and **CUPS support**. Built with **Clean Architecture** principles for maintainability, extensibility, and testability.

**Key Highlights:**
- 🏗️ **Clean Architecture** - Separation of concerns, dependency inversion, and SOLID principles
- 🎯 **Native Windows Printing** - Direct integration with Windows Print Spooler API (winspool.drv) via Koffi FFI
- 🐧 **Unix/Linux/macOS Support** - Seamless CUPS integration
- ✅ **DEVMODE Configuration** - Correctly applies all print settings (copies, duplex, paper size, orientation)
- 🔧 **Advanced Features** - Duplex printing, paper tray selection, color control, print quality settings
- 📦 **TypeScript First** - Full type safety with comprehensive interfaces
- 🧪 **Well-Tested** - Comprehensive test suite with 73+ passing tests

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

### 🏗️ Architecture & Code Quality
✅ **Clean Architecture** - Organized in layers (core, adapters, services, factories) for maintainability  
✅ **SOLID Principles** - Single Responsibility, Dependency Inversion, Open/Closed  
✅ **TypeScript First** - Full type safety with comprehensive interfaces and type definitions  
✅ **Testable Design** - Easy to mock and test with interface-based architecture  
✅ **Modern Node.js** - Built for Node.js 22+ with native ES modules and TypeScript support  

### 🖨️ Printing Capabilities
✅ **Cross-Platform** - Windows, Linux, and macOS with platform-specific optimizations  
✅ **Native Windows API** - Direct winspool.drv integration via Koffi FFI (no spawning processes)  
✅ **CUPS Integration** - Reliable Unix/Linux/macOS printing via CUPS `lp` command  
✅ **DEVMODE Configuration** - Correctly applies all Windows print settings (fixed in v1.0.1)  
✅ **Duplex Printing** - Full support for simplex, horizontal (short-edge), and vertical (long-edge) duplex  
✅ **Paper Configuration** - Multiple paper sizes (A3, A4, Letter, Legal, Tabloid, custom sizes)  
✅ **Tray Selection** - Choose specific paper trays/sources (Windows: upper, lower, manual feed, etc.)  
✅ **Color Control** - Switch between color and monochrome printing modes  
✅ **Print Quality** - High, medium, low, draft quality settings (Windows)  
✅ **Multiple Copies** - Print 1-9999 copies with collation support  
✅ **Raw Data Printing** - Send PCL, PostScript, ZPL, or raw data directly to printer  

### 📊 Printer Management
✅ **List Printers** - Enumerate all available system printers with detailed information  
✅ **Default Printer** - Get and use system default printer (fixed GetDefaultPrinterW API)  
✅ **Printer Capabilities** - Query duplex support, color support, available paper sizes/trays  
✅ **Printer Status** - Check printer online status, job queue, and driver information  

## Recent Improvements (v1.0.1)

### 🔧 Critical Fixes

**DEVMODE Configuration (Windows)**
- ✅ Fixed DEVMODE not being applied to print jobs
- ✅ Now correctly passes DEVMODE via PRINTER_DEFAULTS when opening printer with OpenPrinterW
- ✅ Print settings (copies, duplex, paper size, orientation, color) are now properly applied
- ✅ Added getAndConfigureDevMode() method that:
  1. Gets printer's default DEVMODE via DocumentPropertiesW
  2. Modifies it with user-provided options
  3. Validates changes with printer driver
  4. Opens printer with configured DEVMODE

**Default Printer Detection (Windows)**
- ✅ Fixed GetDefaultPrinterW API signature (changed from array to pointer)
- ✅ Now correctly returns default printer name
- ✅ Proper UTF-16 buffer allocation and decoding

**Architecture Improvements**
- ✅ Refactored to Clean Architecture with clear separation of concerns
- ✅ Created core layer with platform-agnostic types and interfaces
- ✅ Created adapters layer for Windows-specific implementations
- ✅ Added services layer for platform detection
- ✅ Implemented factory pattern for creating platform-specific instances
- ✅ 100% backward compatible - existing code continues to work

### 🧪 Testing & Verification

**New Testing Tools**
- ✅ `inspect-devmode.ts` - Inspect DEVMODE settings directly from printer
- ✅ `test-devmode.ts` - Test DEVMODE application with various configurations
- ✅ `monitor-spooler.ts` - Monitor print spooler and verify job submission
- ✅ Comprehensive testing guide in [TESTING-DEVMODE.md](TESTING-DEVMODE.md)
- ✅ Clean Architecture documentation in [CLEAN-ARCHITECTURE.md](CLEAN-ARCHITECTURE.md)

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

### Basic Usage (Facade API - Recommended)

```typescript
import { PDFPrinter, PrinterManager, getPlatform } from 'node-pdf-printer';

// Check platform
console.log('Platform:', getPlatform()); // 'windows' or 'unix'

// List available printers
const printers = await PrinterManager.getAvailablePrinters();
console.log('Available printers:', printers);

// Get default printer
const defaultPrinter = await PrinterManager.getDefaultPrinter();
console.log('Default printer:', defaultPrinter);

// Create printer instance (uses default printer)
const printer = new PDFPrinter();

// Print a PDF with default settings
await printer.print('./document.pdf');

// Print with advanced options
await printer.print('./document.pdf', {
  copies: 2,
  duplex: 'vertical',      // Long-edge binding (like a book)
  paperSize: 9,            // PAPER_A4 (Windows) or 'a4' (Unix)
  orientation: 'portrait',
  color: true,
  quality: -4,             // PRINT_QUALITY_HIGH (Windows only)
  collate: true            // Collate copies
});

// Print to specific printer
const hpPrinter = new PDFPrinter('HP LaserJet Pro');
await hpPrinter.print('./invoice.pdf', { copies: 3 });
```

### Using Factory Pattern (Clean Architecture API)

```typescript
import { PrinterFactory, type IPrinter, type IPrinterManager } from 'node-pdf-printer';

// Create platform-specific printer instance
const printer: IPrinter = PrinterFactory.createPrinter();
await printer.print('./document.pdf', { copies: 2 });

// Create platform-specific printer manager
const manager: IPrinterManager = PrinterFactory.createPrinterManager();
const printers = await manager.getAvailablePrinters();
const defaultPrinter = await manager.getDefaultPrinter();
```

### Platform-Specific Examples

**Windows:**
```typescript
import { PDFPrinter, PAPER_A4, DUPLEX_VERTICAL, PRINT_QUALITY_HIGH } from 'node-pdf-printer';

const printer = new PDFPrinter();

await printer.print('./document.pdf', {
  copies: 2,
  duplex: 'vertical',           // Use DUPLEX_VERTICAL constant or string
  paperSize: PAPER_A4,          // Use constant or numeric value (9)
  paperSource: 2,               // Lower tray
  quality: PRINT_QUALITY_HIGH,  // High quality printing
  color: true,
  collate: true
});
```

**Unix/Linux/macOS:**
```typescript
import { PDFPrinter } from 'node-pdf-printer';

const printer = new PDFPrinter();

await printer.print('./document.pdf', {
  copies: 2,
  duplex: 'vertical',      // CUPS: two-sided-long-edge
  paperSize: 'a4',         // CUPS paper size string
  orientation: 'portrait',
  color: true
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

**Print Options Explained:**

- **`copies`**: Number of copies to print (1-9999). Default: 1
  
- **`duplex`**: Duplex (double-sided) printing mode
  - `'simplex'` - Single-sided printing (one side of paper)
  - `'horizontal'` - Flip on short edge (like a notepad)
  - `'vertical'` - Flip on long edge (like a book)

- **`paperSize`**: Paper size to use
  - Windows: Numeric constant (e.g., `9` for A4, `1` for Letter)
  - Unix: String format (e.g., `'a4'`, `'letter'`, `'legal'`)
  - See [Paper Sizes constants](#paper-sizes) below

- **`paperSource`**: Paper tray/source (Windows only)
  - `1` - Upper tray
  - `2` - Lower tray
  - `3` - Middle tray
  - `4` - Manual feed
  - `7` - Auto select
  - Exact values depend on printer model

- **`orientation`**: Page orientation
  - `'portrait'` - Vertical orientation (default)
  - `'landscape'` - Horizontal orientation (90° rotation)

- **`color`**: Color printing mode
  - `true` - Color printing (if printer supports)
  - `false` - Monochrome/grayscale printing

- **`quality`**: Print quality level (Windows only)
  - `-4` - High quality (slower, more ink)
  - `-3` - Medium quality
  - `-2` - Low quality
  - `-1` - Draft quality (faster, less ink)

- **`collate`**: Collation for multiple copies
  - `true` - Print complete sets (Page 1,2,3... Page 1,2,3... Page 1,2,3...)
  - `false` - Print all of each page (Page 1,1,1... Page 2,2,2... Page 3,3,3...)
  - Only matters when `copies > 1` and document has multiple pages
  - Example: 3 copies of a 5-page document
    - Collated: ①②③④⑤ ①②③④⑤ ①②③④⑤ (ready to distribute)
    - Not collated: ①①① ②②② ③③③ ④④④ ⑤⑤⑤ (for manual assembly)

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

# Test DEVMODE configuration
npm run example:test-devmode
npm run example:monitor
```

## Testing DEVMODE Configuration

To verify that print options (copies, duplex, paper size, etc.) are being applied correctly, see the comprehensive guide: **[TESTING-DEVMODE.md](TESTING-DEVMODE.md)**

Quick test:
```bash
# Inspect DEVMODE settings directly ⭐ RECOMMENDED
npm run example:inspect-devmode

# Test with Microsoft Print to PDF
npm run example:test-devmode

# Monitor print spooler with detailed instructions
npm run example:monitor
```

**Verification methods:**
1. **⭐ DEVMODE Inspector** - `npm run example:inspect-devmode` - See all DEVMODE fields directly
2. **Windows Print Queue** - View job properties in the print queue
3. **PowerShell** - `Get-PrintJob` shows basic job info (⚠️ NOT DEVMODE settings)
4. **Process Monitor** - Use Sysinternals Process Monitor to see API calls
5. **Event Viewer** - Check Windows event logs for print job details

**Important:** PowerShell's `Get-PrintJob` does **NOT** show DEVMODE settings (duplex, paper size, orientation, etc.). Use our inspector tool instead!

See [TESTING-DEVMODE.md](TESTING-DEVMODE.md) for detailed instructions on each method.

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