# Install Prerequisites Script
# This script installs all required tools for the bike posts backend

param(
    [switch]$SkipChocolatey,
    [switch]$SkipDocker
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if running as Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Install Chocolatey
function Install-Chocolatey {
    if (-not $SkipChocolatey) {
        Write-Status "Installing Chocolatey package manager..."
        try {
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
            Write-Status "Chocolatey installed successfully!"
        } catch {
            Write-Error "Failed to install Chocolatey: $($_.Exception.Message)"
            return $false
        }
    }
    return $true
}

# Install Node.js
function Install-NodeJS {
    Write-Status "Installing Node.js..."
    try {
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            choco install nodejs -y
        } else {
            Write-Warning "Chocolatey not available. Please install Node.js manually from https://nodejs.org/"
            return $false
        }
        Write-Status "Node.js installed successfully!"
    } catch {
        Write-Error "Failed to install Node.js: $($_.Exception.Message)"
        return $false
    }
    return $true
}

# Install Google Cloud CLI
function Install-GoogleCloudCLI {
    Write-Status "Installing Google Cloud CLI..."
    try {
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            choco install gcloudsdk -y
        } else {
            # Manual installation
            Write-Status "Downloading Google Cloud CLI installer..."
            $installerPath = "$env:Temp\GoogleCloudSDKInstaller.exe"
            (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", $installerPath)
            
            Write-Status "Running Google Cloud CLI installer..."
            Start-Process -FilePath $installerPath -Wait
        }
        Write-Status "Google Cloud CLI installed successfully!"
    } catch {
        Write-Error "Failed to install Google Cloud CLI: $($_.Exception.Message)"
        return $false
    }
    return $true
}

# Install Terraform
function Install-Terraform {
    Write-Status "Installing Terraform..."
    try {
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            choco install terraform -y
        } else {
            Write-Warning "Chocolatey not available. Please install Terraform manually from https://terraform.io/downloads"
            return $false
        }
        Write-Status "Terraform installed successfully!"
    } catch {
        Write-Error "Failed to install Terraform: $($_.Exception.Message)"
        return $false
    }
    return $true
}

# Install Docker Desktop
function Install-DockerDesktop {
    if (-not $SkipDocker) {
        Write-Status "Installing Docker Desktop..."
        try {
            if (Get-Command choco -ErrorAction SilentlyContinue) {
                choco install docker-desktop -y
            } else {
                Write-Warning "Chocolatey not available. Please install Docker Desktop manually from https://docker.com/products/docker-desktop"
                return $false
            }
            Write-Status "Docker Desktop installed successfully!"
            Write-Warning "Please restart your computer after Docker Desktop installation."
        } catch {
            Write-Error "Failed to install Docker Desktop: $($_.Exception.Message)"
            return $false
        }
    }
    return $true
}

# Verify installations
function Test-Installations {
    Write-Status "Verifying installations..."
    
    $tools = @(
        @{Name="Node.js"; Command="node"; Args="--version"},
        @{Name="npm"; Command="npm"; Args="--version"},
        @{Name="Google Cloud CLI"; Command="gcloud"; Args="--version"},
        @{Name="Terraform"; Command="terraform"; Args="version"}
    )
    
    foreach ($tool in $tools) {
        try {
            $output = & $tool.Command $tool.Args 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Status "$($tool.Name): $output"
            } else {
                Write-Warning "$($tool.Name): Not found or not working"
            }
        } catch {
            Write-Warning "$($tool.Name): Not found or not working"
        }
    }
}

# Main execution
function Main {
    Write-Status "Starting prerequisite installation..."
    
    # Check if running as Administrator
    if (-not (Test-Administrator)) {
        Write-Error "This script must be run as Administrator. Please run PowerShell as Administrator and try again."
        exit 1
    }
    
    # Install tools
    $success = $true
    
    if (-not (Install-Chocolatey)) { $success = $false }
    if (-not (Install-NodeJS)) { $success = $false }
    if (-not (Install-GoogleCloudCLI)) { $success = $false }
    if (-not (Install-Terraform)) { $success = $false }
    if (-not (Install-DockerDesktop)) { $success = $false }
    
    # Verify installations
    Test-Installations
    
    if ($success) {
        Write-Status "Installation completed successfully!"
        Write-Warning "Please restart your terminal or PowerShell to ensure all tools are available in PATH."
    } else {
        Write-Error "Some installations failed. Please check the errors above and install manually if needed."
    }
}

# Run main function
Main


