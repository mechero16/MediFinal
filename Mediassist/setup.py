import os
import subprocess
import venv
import shutil
import sys

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "Model")
PYTHON_VENV = os.path.join(BASE_DIR, "venv")
REQUIREMENTS = os.path.join(BASE_DIR, "requirements.txt")
TRAIN_SCRIPT = os.path.join(BASE_DIR, "train_model.py")
NODE_DIR = BASE_DIR  # assuming server.js is here

# -----------------------------
# Step 1: Create Python virtual environment
# -----------------------------
if not os.path.exists(PYTHON_VENV):
    print("Creating Python virtual environment...")
    venv.create(PYTHON_VENV, with_pip=True)
else:
    print("Virtual environment already exists.")

python_exe = os.path.join(PYTHON_VENV, "Scripts", "python.exe")
pip_exe = os.path.join(PYTHON_VENV, "Scripts", "pip.exe")

# -----------------------------
# Step 2: Install Python packages
# -----------------------------
print("Installing Python packages...")
# subprocess.check_call([pip_exe, "install", "--upgrade", "pip", "setuptools", "wheel"])
subprocess.check_call([pip_exe, "install", "-r", REQUIREMENTS])

# -----------------------------
# Step 3: Train the ML model
# -----------------------------
print("Training Python model...")
env = os.environ.copy()
if shutil.which("nvidia-smi"):
    env["CUDA_VISIBLE_DEVICES"] = "0"
subprocess.check_call([python_exe, TRAIN_SCRIPT], env=env)
print("✅ Python setup complete. Model trained and ready!")

# -----------------------------
# Step 4: Detect Node.js and npm
# -----------------------------
NODE_EXE = shutil.which("node")
NPM_EXE = shutil.which("npm")

def is_node_installed():
    return NODE_EXE is not None and NPM_EXE is not None

# -----------------------------
# Step 5: Setup Node.js server
# -----------------------------
if is_node_installed():
    print(f"Node.js detected at: {NODE_EXE}")
    print(f"npm detected at: {NPM_EXE}")
    
    # Initialize Node.js project if package.json does not exist
    package_json = os.path.join(NODE_DIR, "package.json")
    if not os.path.exists(package_json):
        subprocess.check_call([NPM_EXE, "init", "-y"], cwd=NODE_DIR)
    
    # Install Express if not installed
    node_modules = os.path.join(NODE_DIR, "node_modules")
    express_path = os.path.join(node_modules, "express")
    if not os.path.exists(express_path):
        subprocess.check_call([NPM_EXE, "install", "express"], cwd=NODE_DIR)

    print("✅ Node.js server setup complete.")

    # Start server
    print("Starting Node.js server...")
    subprocess.Popen([NODE_EXE, "server.js"], cwd=NODE_DIR)
    print("Node.js server started on port 5000. Press Ctrl+C to stop.")

else:
    print("⚠️ Node.js or npm not found. Please install Node.js separately to run the server.")
