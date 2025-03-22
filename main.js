const { app, BrowserWindow, ipcMain, Tray, Menu, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let isQuitting = false;

// Create the browser window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        frame: false, // Custom frame
        titleBarStyle: 'hidden',
        backgroundColor: '#f5f5f5'
    });

    mainWindow.loadFile('index.html');

    // Create system tray
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Show App', 
            click: () => mainWindow.show() 
        },
        { 
            label: 'Set Sleep Reminder', 
            click: () => {
                const reminderTime = new Date();
                reminderTime.setHours(22, 0, 0); // Set to 10 PM
                scheduleSleepReminder(reminderTime);
            }
        },
        { type: 'separator' },
        { 
            label: 'Start with Windows', 
            type: 'checkbox',
            checked: app.getLoginItemSettings().openAtLogin,
            click: (menuItem) => {
                app.setLoginItemSettings({
                    openAtLogin: menuItem.checked
                });
            }
        },
        { type: 'separator' },
        { 
            label: 'Quit', 
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Sleep Journey');
    tray.setContextMenu(contextMenu);

    // Handle window close
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            return false;
        }
    });

    // Handle window minimize
    mainWindow.on('minimize', () => {
        mainWindow.hide();
    });

    // Handle window maximize
    mainWindow.on('maximize', () => {
        mainWindow.webContents.send('window-maximized');
    });

    // Handle window unmaximize
    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('window-unmaximized');
    });

    // Set initial theme to light mode
    mainWindow.webContents.send('theme-changed', false);
}

// Schedule sleep reminder
function scheduleSleepReminder(time) {
    const now = new Date();
    const timeUntilReminder = time - now;
    
    if (timeUntilReminder > 0) {
        setTimeout(() => {
            new Notification({
                title: 'Sleep Reminder',
                body: 'It\'s time to start winding down for bed!'
            }).show();
        }, timeUntilReminder);
    }
}

// Handle IPC messages
ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('close-window', () => {
    isQuitting = true;
    app.quit();
});

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    } else {
        mainWindow.show();
    }
});

// Handle sleep data persistence
const userDataPath = app.getPath('userData');
const sleepDataPath = path.join(userDataPath, 'sleep-data.json');

// Load saved sleep data
ipcMain.handle('load-sleep-data', () => {
    try {
        if (fs.existsSync(sleepDataPath)) {
            return JSON.parse(fs.readFileSync(sleepDataPath, 'utf8'));
        }
        return null;
    } catch (error) {
        console.error('Error loading sleep data:', error);
        return null;
    }
});

// Save sleep data
ipcMain.handle('save-sleep-data', (event, data) => {
    try {
        fs.writeFileSync(sleepDataPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving sleep data:', error);
        return false;
    }
}); 