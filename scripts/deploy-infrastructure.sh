#!/bin/bash

# Deploy Infrastructure Script
# This script automates the deployment of Google Cloud infrastructure

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform first."
        exit 1
    fi
    
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud CLI is not installed. Please install gcloud first."
        exit 1
    fi
    
    print_status "Prerequisites check passed!"
}

# Set up Google Cloud project
setup_gcloud() {
    print_status "Setting up Google Cloud..."
    
    if [ -z "$PROJECT_ID" ]; then
        print_error "PROJECT_ID environment variable is not set."
        print_error "Please set it with: export PROJECT_ID=your-project-id"
        exit 1
    fi
    
    gcloud config set project $PROJECT_ID
    print_status "Google Cloud project set to: $PROJECT_ID"
}

# Initialize Terraform
init_terraform() {
    print_status "Initializing Terraform..."
    cd infrastructure/terraform
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        print_warning "terraform.tfvars not found. Creating from example..."
        cp terraform.tfvars.example terraform.tfvars
        print_warning "Please edit terraform.tfvars with your project details before running again."
        exit 1
    fi
    
    terraform init
    print_status "Terraform initialized successfully!"
}

# Plan infrastructure
plan_infrastructure() {
    print_status "Planning infrastructure..."
    terraform plan -out=tfplan
    print_status "Infrastructure plan created!"
}

# Apply infrastructure
apply_infrastructure() {
    print_status "Applying infrastructure..."
    terraform apply tfplan
    print_status "Infrastructure deployed successfully!"
}

# Show outputs
show_outputs() {
    print_status "Infrastructure outputs:"
    terraform output
}

# Main execution
main() {
    print_status "Starting infrastructure deployment..."
    
    check_prerequisites
    setup_gcloud
    init_terraform
    plan_infrastructure
    
    # Ask for confirmation
    echo
    print_warning "Do you want to apply this infrastructure plan? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        apply_infrastructure
        show_outputs
        print_status "Infrastructure deployment completed!"
    else
        print_warning "Infrastructure deployment cancelled."
        exit 0
    fi
}

# Run main function
main "$@"
