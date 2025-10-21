# Deploy Infrastructure Script (PowerShell)
# This script automates the deployment of Google Cloud infrastructure

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
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

# Check if required tools are installed
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
        Write-Error "Terraform is not installed. Please install Terraform first."
        exit 1
    }
    
    if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
        Write-Error "Google Cloud CLI is not installed. Please install gcloud first."
        exit 1
    }
    
    Write-Status "Prerequisites check passed!"
}

# Set up Google Cloud project
function Set-GCloudProject {
    Write-Status "Setting up Google Cloud..."
    
    gcloud config set project $ProjectId
    Write-Status "Google Cloud project set to: $ProjectId"
}

# Initialize Terraform
function Initialize-Terraform {
    Write-Status "Initializing Terraform..."
    Set-Location infrastructure/terraform
    
    # Check if terraform.tfvars exists
    if (-not (Test-Path "terraform.tfvars")) {
        Write-Warning "terraform.tfvars not found. Creating from example..."
        Copy-Item terraform.tfvars.example terraform.tfvars
        Write-Warning "Please edit terraform.tfvars with your project details before running again."
        exit 1
    }
    
    terraform init
    Write-Status "Terraform initialized successfully!"
}

# Plan infrastructure
function Plan-Infrastructure {
    Write-Status "Planning infrastructure..."
    terraform plan -out=tfplan
    Write-Status "Infrastructure plan created!"
}

# Apply infrastructure
function Apply-Infrastructure {
    Write-Status "Applying infrastructure..."
    terraform apply tfplan
    Write-Status "Infrastructure deployed successfully!"
}

# Show outputs
function Show-Outputs {
    Write-Status "Infrastructure outputs:"
    terraform output
}

# Main execution
function Main {
    Write-Status "Starting infrastructure deployment..."
    
    Test-Prerequisites
    Set-GCloudProject
    Initialize-Terraform
    Plan-Infrastructure
    
    # Ask for confirmation
    Write-Host ""
    Write-Warning "Do you want to apply this infrastructure plan? (y/N)"
    $response = Read-Host
    if ($response -match "^[yY]([eE][sS])?$") {
        Apply-Infrastructure
        Show-Outputs
        Write-Status "Infrastructure deployment completed!"
    } else {
        Write-Warning "Infrastructure deployment cancelled."
        exit 0
    }
}

# Run main function
Main
