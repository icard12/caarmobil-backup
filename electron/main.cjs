const electron = require('electron');
const { app, BrowserWindow } = electron;
const path = require('path');
const { spawn } = require('child_process');

// Proteção para não quebrar em ambientes sem Electron (como Render)
const isDev = app ? !app.isPackaged : process.env.NODE_ENV !== 'production';

let mainWindow;
let serverProcess;

function startServer() {
    console.log('Iniciando servidor backend...');

    let serverPath;
    let cmd = 'node';
    let args = [];

    if (isDev) {
        serverPath = path.join(__dirname, '..', 'server', 'index.ts');
        cmd = 'npx';
        args = ['tsx', serverPath];
    } else {
        serverPath = path.join(__dirname, '..', 'dist-server', 'index.cjs');
        args = [serverPath];
    }

    serverProcess = spawn(cmd, args, {
        shell: true,
        env: { ...process.env, PORT: 3000 }
    });

    serverProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
        console.warn(`Backend Erro: ${data}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "CAAR MOBIL - Sistema de Gestão",
        icon: path.join(__dirname, '..', 'src', 'assets', 'logo.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        backgroundColor: '#ffffff',
    });

    // Em desenvolvimento, carrega o Vite. Em produção, carrega o build.
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    startServer();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (serverProcess) serverProcess.kill();
    if (process.platform !== 'darwin') app.quit();
});
