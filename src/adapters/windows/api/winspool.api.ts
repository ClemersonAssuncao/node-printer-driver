// Windows Printing API Types and Constants
import koffi from 'koffi';
import * as os from 'os';

// Duplex modes
export const DUPLEX_SIMPLEX = 1;
export const DUPLEX_HORIZONTAL = 2;
export const DUPLEX_VERTICAL = 3;

// Paper sizes (common ones)
export const PAPER_LETTER = 1;
export const PAPER_LEGAL = 5;
export const PAPER_A4 = 9;
export const PAPER_A3 = 8;
export const PAPER_TABLOID = 3;

// Print quality
export const PRINT_QUALITY_HIGH = -4;
export const PRINT_QUALITY_MEDIUM = -3;
export const PRINT_QUALITY_LOW = -2;
export const PRINT_QUALITY_DRAFT = -1;

// Printer access rights
export const PRINTER_ACCESS_ADMINISTER = 0x00000004;
export const PRINTER_ACCESS_USE = 0x00000008;
export const PRINTER_ALL_ACCESS = 0x000F000C;

// Document flags
export const DI_APPBANDING = 0x00000001;
export const DI_ROPS_READ_DESTINATION = 0x00000002;

// Page orientation
export const PORTRAIT = 1;
export const LANDSCAPE = 2;

// Color mode
export const MONOCHROME = 1;
export const COLOR = 2;

// Only load Windows DLLs on Windows platform
const isWindows = os.platform() === 'win32';
const winspool = isWindows ? koffi.load('winspool.drv') : null as any;
const kernel32 = isWindows ? koffi.load('kernel32.dll') : null as any;

// Global cache to store Koffi structures (prevents "Duplicate type name" error on re-import)
const structCache = (globalThis as any).__koffi_struct_cache__ || {};
if (!(globalThis as any).__koffi_struct_cache__) {
  (globalThis as any).__koffi_struct_cache__ = structCache;
}

// Helper to create or reuse Koffi structures
function defineStruct(name: string, definition: any) {
  // Return cached structure if it exists
  if (structCache[name]) {
    return structCache[name];
  }
  
  // Create new structure and cache it
  try {
    const struct = koffi.struct(name, definition);
    structCache[name] = struct;
    return struct;
  } catch (error: any) {
    // If Koffi already has this structure registered internally but not in our cache,
    // it means another import path created it. We can't retrieve it, so we'll throw.
    if (error?.message?.includes('Duplicate type name')) {
      throw new Error(
        `Structure "${name}" was already defined by Koffi in another context. ` +
        `This usually means the module was imported multiple times in incompatible ways. ` +
        `Please ensure consistent import paths.`
      );
    }
    throw error;
  }
}

// Define structures - DOC_INFO_1W has only 3 fields
export const DOC_INFO_1W = defineStruct('DOC_INFO_1W', {
  pDocName: 'str16',
  pOutputFile: 'str16',
  pDatatype: 'str16'
});

// Keep old name for compatibility but use correct structure
export const DOCINFOW = DOC_INFO_1W;

export const DEVMODEW = defineStruct('DEVMODEW', {
  dmDeviceName: koffi.array('uint16', 32),
  dmSpecVersion: 'uint16',
  dmDriverVersion: 'uint16',
  dmSize: 'uint16',
  dmDriverExtra: 'uint16',
  dmFields: 'uint32',
  dmOrientation: 'int16',
  dmPaperSize: 'int16',
  dmPaperLength: 'int16',
  dmPaperWidth: 'int16',
  dmScale: 'int16',
  dmCopies: 'int16',
  dmDefaultSource: 'int16',
  dmPrintQuality: 'int16',
  dmColor: 'int16',
  dmDuplex: 'int16',
  dmYResolution: 'int16',
  dmTTOption: 'int16',
  dmCollate: 'int16',
  dmFormName: koffi.array('uint16', 32),
  dmLogPixels: 'uint16',
  dmBitsPerPel: 'uint32',
  dmPelsWidth: 'uint32',
  dmPelsHeight: 'uint32',
  dmDisplayFlags: 'uint32',
  dmDisplayFrequency: 'uint32',
  dmICMMethod: 'uint32',
  dmICMIntent: 'uint32',
  dmMediaType: 'uint32',
  dmDitherType: 'uint32',
  dmReserved1: 'uint32',
  dmReserved2: 'uint32',
  dmPanningWidth: 'uint32',
  dmPanningHeight: 'uint32'
});

export const PRINTER_INFO_2W = defineStruct('PRINTER_INFO_2W', {
  pServerName: 'str16',
  pPrinterName: 'str16',
  pShareName: 'str16',
  pPortName: 'str16',
  pDriverName: 'str16',
  pComment: 'str16',
  pLocation: 'str16',
  pDevMode: koffi.pointer(DEVMODEW),
  pSepFile: 'str16',
  pPrintProcessor: 'str16',
  pDatatype: 'str16',
  pParameters: 'str16',
  pSecurityDescriptor: 'void*',
  Attributes: 'uint32',
  Priority: 'uint32',
  DefaultPriority: 'uint32',
  StartTime: 'uint32',
  UntilTime: 'uint32',
  Status: 'uint32',
  cJobs: 'uint32',
  AveragePPM: 'uint32'
});

// PRINTER_DEFAULTS structure for OpenPrinter
export const PRINTER_DEFAULTS = defineStruct('PRINTER_DEFAULTS', {
  pDatatype: 'str16',
  pDevMode: koffi.pointer(DEVMODEW),
  DesiredAccess: 'uint32'
});

// DocumentProperties flags
export const DM_IN_BUFFER = 8;
export const DM_OUT_BUFFER = 2;

// Define Windows API functions - only on Windows platform
export const OpenPrinterW = isWindows ? winspool.func('OpenPrinterW', 'bool', ['str16', koffi.out(koffi.pointer('void*')), koffi.pointer(PRINTER_DEFAULTS)]) : (() => { throw new Error('Windows API not available on this platform'); }) as any;
export const ClosePrinter = isWindows ? winspool.func('ClosePrinter', 'bool', ['void*']) : (() => { throw new Error('Windows API not available on this platform'); }) as any;
export const StartDocPrinterW = isWindows ? winspool.func('StartDocPrinterW', 'uint32', ['void*', 'uint32', koffi.pointer(DOC_INFO_1W)]) : (() => { throw new Error('Windows API not available on this platform'); }) as any;
export const EndDocPrinter = isWindows ? winspool.func('EndDocPrinter', 'bool', ['void*']) : (() => { throw new Error('Windows API not available on this platform'); }) as any;
export const StartPagePrinter = isWindows ? winspool.func('StartPagePrinter', 'bool', ['void*']) : (() => { throw new Error('Windows API not available on this platform'); }) as any;
export const EndPagePrinter = isWindows ? winspool.func('EndPagePrinter', 'bool', ['void*']) : (() => { throw new Error('Windows API not available on this platform'); }) as any;
export const WritePrinter = isWindows ? winspool.func('WritePrinter', 'bool', ['void*', 'void*', 'uint32', koffi.out(koffi.pointer('uint32'))]) : (() => { throw new Error('Windows API not available on this platform'); }) as any;
export const EnumPrintersW = isWindows ? winspool.func('EnumPrintersW', 'bool', ['uint32', 'str16', 'uint32', 'void*', 'uint32', koffi.out(koffi.pointer('uint32')), koffi.out(koffi.pointer('uint32'))]) : (() => { throw new Error('Windows API not available on this platform'); }) as any;
// GetDefaultPrinterW: BOOL GetDefaultPrinterW(LPWSTR pszBuffer, LPDWORD pcchBuffer);
export const GetDefaultPrinterW = isWindows ? winspool.func('GetDefaultPrinterW', 'bool', ['uint16*', koffi.inout(koffi.pointer('uint32'))]) : (() => { throw new Error('Windows API not available on this platform'); }) as any;
export const DocumentPropertiesW = isWindows ? winspool.func('DocumentPropertiesW', 'int32', ['void*', 'void*', 'str16', koffi.out(koffi.pointer(DEVMODEW)), koffi.pointer(DEVMODEW), 'uint32']) : (() => { throw new Error('Windows API not available on this platform'); }) as any;

// Enum flags
export const PRINTER_ENUM_LOCAL = 0x00000002;
export const PRINTER_ENUM_CONNECTIONS = 0x00000004;

// DevMode fields
export const DM_ORIENTATION = 0x00000001;
export const DM_PAPERSIZE = 0x00000002;
export const DM_PAPERLENGTH = 0x00000004;
export const DM_PAPERWIDTH = 0x00000008;
export const DM_COPIES = 0x00000100;
export const DM_DEFAULTSOURCE = 0x00000200;
export const DM_PRINTQUALITY = 0x00000400;
export const DM_COLOR = 0x00000800;
export const DM_DUPLEX = 0x00001000;
export const DM_COLLATE = 0x00008000;

// GetLastError from kernel32 - only on Windows
export const GetLastError = isWindows ? kernel32.func('GetLastError', 'uint32', []) : (() => 0) as any;
