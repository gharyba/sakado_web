import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";

// Static command text. Paths are passed through a private child environment, never interpolated.
const windowsAcl = String.raw`
$ErrorActionPreference = 'Stop'
# Use the launched Windows PowerShell runtime's bundled modules, not an inherited PS7/user path.
$env:PSModulePath = [IO.Path]::Combine($PSHOME, 'Modules')
$target = $env:SAKADO_PRESENTATION_DIRECTORY
$operation = $env:SAKADO_PRESENTATION_ACL_OPERATION
$item = Get-Item -LiteralPath $target -Force
if (-not $item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Unsafe directory' }
$sidType = [Security.Principal.SecurityIdentifier]
$owner = [Security.Principal.WindowsIdentity]::GetCurrent().User
$system = 'S-1-5-18'
$allowed = @($owner.Value, $system)
$acl = Get-Acl -LiteralPath $target
if ($acl.GetOwner($sidType).Value -ne $owner.Value) { throw 'Unexpected directory owner' }
if ($operation -eq 'protect') {
  $explicit = @($acl.GetAccessRules($true, $false, $sidType))
  foreach ($rule in $explicit) {
    if ($rule.IdentityReference.Value -notin $allowed -or $rule.AccessControlType -ne [Security.AccessControl.AccessControlType]::Allow) { throw 'Unexpected explicit access' }
  }
  $private = New-Object Security.AccessControl.DirectorySecurity
  $private.SetOwner($owner)
  $private.SetAccessRuleProtection($true, $false)
  foreach ($principal in $allowed) {
    $identity = New-Object Security.Principal.SecurityIdentifier($principal)
    $rule = New-Object Security.AccessControl.FileSystemAccessRule($identity, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
    $private.AddAccessRule($rule)
  }
  # Persist only the owner/DACL modified above; never request audit/SACL privileges.
  [IO.Directory]::SetAccessControl($target, $private)
  $acl = Get-Acl -LiteralPath $target
} elseif ($operation -ne 'verify') { throw 'Unknown ACL operation' }
$rules = @($acl.GetAccessRules($true, $true, $sidType))
if (-not $acl.AreAccessRulesProtected -or $acl.GetOwner($sidType).Value -ne $owner.Value -or $rules.Count -ne 2) { throw 'Private ACL not established' }
$seen = @()
foreach ($rule in $rules) {
  if ($rule.IdentityReference.Value -notin $allowed -or $rule.IsInherited -or $rule.AccessControlType -ne [Security.AccessControl.AccessControlType]::Allow -or $rule.FileSystemRights -ne [Security.AccessControl.FileSystemRights]::FullControl -or [int]$rule.InheritanceFlags -ne 3 -or [int]$rule.PropagationFlags -ne 0) { throw 'Private ACL verification failed' }
  $seen += $rule.IdentityReference.Value
}
if (@($seen | Select-Object -Unique).Count -ne 2) { throw 'Required access missing' }
Write-Output 'PRIVATE_ACL_VERIFIED'
`;
async function directoryWithoutLinks(directory) {
  const absolute = path.resolve(directory);
  let current = absolute;
  for (;;) {
    const stat = await fs.lstat(current);
    if (!stat.isDirectory() || stat.isSymbolicLink())
      throw Error("Unsafe runtime directory");
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return absolute;
}
async function checkDirectory(directory, operation) {
  try {
    const absolute = await directoryWithoutLinks(directory);
    if (process.platform === "win32") {
      const result = execFileSync(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-Command", windowsAcl],
        {
          env: {
            ...process.env,
            SAKADO_PRESENTATION_DIRECTORY: absolute,
            SAKADO_PRESENTATION_ACL_OPERATION: operation,
          },
          encoding: "utf8",
          timeout: 15000,
          windowsHide: true,
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      if (result.trim() !== "PRIVATE_ACL_VERIFIED")
        throw Error("Unknown ACL result");
    } else {
      if (operation === "protect") await fs.chmod(absolute, 0o700);
      const stat = await fs.stat(absolute);
      if (stat.uid !== process.getuid() || (stat.mode & 0o777) !== 0o700)
        throw Error("Private mode not established");
    }
  } catch {
    // Captured OS errors can contain paths/account details; never forward them.
    throw Error(
      "Private presentation directory permissions could not be verified.",
    );
  }
}
export const securePresentationDirectory = (directory) =>
  checkDirectory(directory, "protect");
export const verifyPresentationDirectory = (directory) =>
  checkDirectory(directory, "verify");
export async function writePresentationRuntime(directory, name, content) {
  if (!["catalog.json", "access-code.txt"].includes(name))
    throw Error("Unexpected runtime file");
  await verifyPresentationDirectory(directory);
  const destination = path.join(directory, name);
  try {
    if ((await fs.lstat(destination)).isSymbolicLink())
      throw Error("Runtime link refused");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const temporary = path.join(
    directory,
    randomBytes(16).toString("hex") + ".tmp",
  );
  try {
    await fs.writeFile(temporary, content, { mode: 0o600, flag: "wx" });
    await fs.rename(temporary, destination);
  } finally {
    await fs.rm(temporary, { force: true });
  }
}
