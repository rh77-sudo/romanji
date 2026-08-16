$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

$Port = 5173

function Stop-PortListener {
  param([int]$ListenPort)
  Get-NetTCPConnection -LocalPort $ListenPort -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object {
      Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

$jobSource = @"
using System;
using System.Runtime.InteropServices;

public sealed class KillOnCloseJob : IDisposable {
  [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
  static extern IntPtr CreateJobObject(IntPtr lpJobAttributes, string lpName);

  [DllImport("kernel32.dll", SetLastError = true)]
  static extern bool SetInformationJobObject(IntPtr hJob, int infoClass, IntPtr lpInfo, uint cbInfo);

  [DllImport("kernel32.dll", SetLastError = true)]
  static extern bool AssignProcessToJobObject(IntPtr hJob, IntPtr hProcess);

  [DllImport("kernel32.dll", SetLastError = true)]
  static extern bool CloseHandle(IntPtr hObject);

  [StructLayout(LayoutKind.Sequential)]
  struct IO_COUNTERS {
    public ulong ReadOperationCount;
    public ulong WriteOperationCount;
    public ulong OtherOperationCount;
    public ulong ReadTransferCount;
    public ulong WriteTransferCount;
    public ulong OtherTransferCount;
  }

  [StructLayout(LayoutKind.Sequential)]
  struct JOBOBJECT_BASIC_LIMIT_INFORMATION {
    public long PerProcessUserTimeLimit;
    public long PerJobUserTimeLimit;
    public uint LimitFlags;
    public UIntPtr MinimumWorkingSetSize;
    public UIntPtr MaximumWorkingSetSize;
    public uint ActiveProcessLimit;
    public UIntPtr Affinity;
    public uint PriorityClass;
    public uint SchedulingClass;
  }

  [StructLayout(LayoutKind.Sequential)]
  struct JOBOBJECT_EXTENDED_LIMIT_INFORMATION {
    public JOBOBJECT_BASIC_LIMIT_INFORMATION BasicLimitInformation;
    public IO_COUNTERS IoInfo;
    public UIntPtr ProcessMemoryLimit;
    public UIntPtr JobMemoryLimit;
    public UIntPtr PeakProcessMemoryUsed;
    public UIntPtr PeakJobMemoryUsed;
  }

  const int JobObjectExtendedLimitInformation = 9;
  const uint JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x2000;

  readonly IntPtr handle;

  public KillOnCloseJob() {
    handle = CreateJobObject(IntPtr.Zero, null);
    if (handle == IntPtr.Zero) {
      throw new System.ComponentModel.Win32Exception();
    }

    var info = new JOBOBJECT_EXTENDED_LIMIT_INFORMATION();
    info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
    int length = Marshal.SizeOf(typeof(JOBOBJECT_EXTENDED_LIMIT_INFORMATION));
    IntPtr ptr = Marshal.AllocHGlobal(length);
    try {
      Marshal.StructureToPtr(info, ptr, false);
      if (!SetInformationJobObject(handle, JobObjectExtendedLimitInformation, ptr, (uint)length)) {
        throw new System.ComponentModel.Win32Exception();
      }
    } finally {
      Marshal.FreeHGlobal(ptr);
    }
  }

  public void AddProcess(IntPtr processHandle) {
    if (!AssignProcessToJobObject(handle, processHandle)) {
      throw new System.ComponentModel.Win32Exception();
    }
  }

  public void Dispose() {
    if (handle != IntPtr.Zero) {
      CloseHandle(handle);
    }
  }
}
"@

Add-Type -TypeDefinition $jobSource -Language CSharp

Stop-PortListener -ListenPort $Port

$viteJs = Join-Path (Get-Location) "node_modules\vite\bin\vite.js"
if (-not (Test-Path $viteJs)) {
  throw "Vite is not installed. Run npm install in this folder first."
}

$job = New-Object KillOnCloseJob
try {
  $proc = Start-Process -FilePath "node" -ArgumentList @(
    $viteJs,
    "--host", "127.0.0.1",
    "--port", "$Port",
    "--strictPort",
    "--open"
  ) -WorkingDirectory (Get-Location) -NoNewWindow -PassThru

  $job.AddProcess($proc.Handle)

  Write-Host ""
  Write-Host "Romaji is running at http://127.0.0.1:$Port"
  Write-Host "Close this window to stop the app."
  Write-Host ""

  Wait-Process -Id $proc.Id
} finally {
  if ($job) { $job.Dispose() }
  Stop-PortListener -ListenPort $Port
}
