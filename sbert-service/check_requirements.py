#!/usr/bin/env python3
"""
Pre-flight check for SBERT service deployment
Verifies all requirements are met before starting the service
"""

import sys
import subprocess
import platform
from colorama import init, Fore, Style

init(autoreset=True)

def print_header(text):
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{text}")
    print(f"{'='*60}{Style.RESET_ALL}\n")

def print_check(name, passed, details=""):
    if passed:
        print(f"{Fore.GREEN}✓ {name}{Style.RESET_ALL}")
    else:
        print(f"{Fore.RED}✗ {name}{Style.RESET_ALL}")
    if details:
        print(f"  {details}")

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    required = (3, 8)
    
    passed = version >= required
    details = f"Found: {version.major}.{version.minor}.{version.micro}"
    if not passed:
        details += f" (Required: {required[0]}.{required[1]}+)"
    
    print_check("Python Version", passed, details)
    return passed

def check_pip():
    """Check if pip is available"""
    try:
        result = subprocess.run(['pip', '--version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        passed = result.returncode == 0
        details = result.stdout.strip() if passed else "pip not found"
        print_check("pip", passed, details)
        return passed
    except Exception as e:
        print_check("pip", False, f"Error: {str(e)}")
        return False

def check_port_available(port=5002):
    """Check if port 5002 is available"""
    import socket
    
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            result = s.connect_ex(('localhost', port))
            
            if result == 0:
                # Port is in use
                print_check(f"Port {port}", False, 
                          f"Port {port} is already in use. Stop the service or change port.")
                return False
            else:
                # Port is available
                print_check(f"Port {port}", True, "Port is available")
                return True
    except Exception as e:
        print_check(f"Port {port}", False, f"Error checking port: {str(e)}")
        return False

def check_disk_space():
    """Check available disk space for model download"""
    import shutil
    
    try:
        stat = shutil.disk_usage('.')
        free_gb = stat.free / (1024**3)
        required_gb = 1.0
        
        passed = free_gb >= required_gb
        details = f"Available: {free_gb:.2f} GB"
        if not passed:
            details += f" (Required: {required_gb} GB for model download)"
        
        print_check("Disk Space", passed, details)
        return passed
    except Exception as e:
        print_check("Disk Space", False, f"Error: {str(e)}")
        return False

def check_memory():
    """Check available memory"""
    try:
        import psutil
        
        mem = psutil.virtual_memory()
        available_gb = mem.available / (1024**3)
        required_gb = 0.5
        
        passed = available_gb >= required_gb
        details = f"Available: {available_gb:.2f} GB"
        if not passed:
            details += f" (Required: {required_gb} GB)"
        
        print_check("Available Memory", passed, details)
        return passed
    except ImportError:
        print_check("Available Memory", True, 
                   "psutil not installed, skipping memory check")
        return True
    except Exception as e:
        print_check("Available Memory", False, f"Error: {str(e)}")
        return False

def check_dependencies():
    """Check if Python dependencies are installed"""
    required = ['flask', 'flask_cors', 'sentence_transformers', 'torch', 'numpy']
    all_installed = True
    
    for package in required:
        try:
            __import__(package)
            print_check(f"Package: {package}", True)
        except ImportError:
            print_check(f"Package: {package}", False, "Not installed")
            all_installed = False
    
    if not all_installed:
        print(f"\n{Fore.YELLOW}To install dependencies, run:{Style.RESET_ALL}")
        print(f"  cd sbert-service")
        print(f"  pip install -r requirements.txt")
    
    return all_installed

def check_docker():
    """Check if Docker is available (optional)"""
    try:
        result = subprocess.run(['docker', '--version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        passed = result.returncode == 0
        details = result.stdout.strip() if passed else "Docker not found"
        print_check("Docker (Optional)", passed, details)
        return passed
    except Exception:
        print_check("Docker (Optional)", False, 
                   "Docker not found (optional for manual deployment)")
        return False

def check_docker_compose():
    """Check if Docker Compose is available (optional)"""
    try:
        result = subprocess.run(['docker-compose', '--version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        passed = result.returncode == 0
        details = result.stdout.strip() if passed else "Docker Compose not found"
        print_check("Docker Compose (Optional)", passed, details)
        return passed
    except Exception:
        print_check("Docker Compose (Optional)", False, 
                   "Docker Compose not found (optional)")
        return False

def main():
    """Run all checks"""
    print_header("SBERT Service Pre-flight Check")
    
    print(f"{Fore.YELLOW}System Information:{Style.RESET_ALL}")
    print(f"  OS: {platform.system()} {platform.release()}")
    print(f"  Python: {platform.python_version()}")
    print(f"  Architecture: {platform.machine()}")
    
    print_header("Required Components")
    
    checks = [
        ("Python Version", check_python_version),
        ("pip", check_pip),
        ("Port 5002", check_port_available),
        ("Disk Space", check_disk_space),
        ("Memory", check_memory),
    ]
    
    results = {}
    for name, check_func in checks:
        try:
            results[name] = check_func()
        except Exception as e:
            print_check(name, False, f"Unexpected error: {str(e)}")
            results[name] = False
    
    print_header("Python Dependencies")
    results["Dependencies"] = check_dependencies()
    
    print_header("Optional Components")
    results["Docker"] = check_docker()
    results["Docker Compose"] = check_docker_compose()
    
    # Summary
    print_header("Summary")
    
    required_checks = ["Python Version", "pip", "Port 5002", "Disk Space", "Memory"]
    required_passed = all(results.get(check, False) for check in required_checks)
    
    deps_installed = results.get("Dependencies", False)
    
    if required_passed and deps_installed:
        print(f"{Fore.GREEN}✓ All required checks passed!{Style.RESET_ALL}")
        print(f"\n{Fore.GREEN}Ready to start SBERT service:{Style.RESET_ALL}")
        print(f"  python app.py")
        return 0
    elif required_passed and not deps_installed:
        print(f"{Fore.YELLOW}⚠ System requirements met, but dependencies need installation{Style.RESET_ALL}")
        print(f"\n{Fore.YELLOW}Next steps:{Style.RESET_ALL}")
        print(f"  1. cd sbert-service")
        print(f"  2. pip install -r requirements.txt")
        print(f"  3. python app.py")
        return 1
    else:
        print(f"{Fore.RED}✗ Some required checks failed{Style.RESET_ALL}")
        print(f"\n{Fore.RED}Please fix the issues above before proceeding{Style.RESET_ALL}")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}Check interrupted by user{Style.RESET_ALL}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Fore.RED}Unexpected error: {str(e)}{Style.RESET_ALL}")
        sys.exit(1)
