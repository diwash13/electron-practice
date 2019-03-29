const electron = require('electron')
const url = require('url')
const path = require('path')

const { app, BrowserWindow, Menu, ipcMain } = electron;

//SET ENV
process.env.NODE_ENV = 'production'

let mainWindow
let addWindow

//Listen for the app to be ready
app.on('ready', function(){
    //Create new window
    mainWindow = new BrowserWindow({})

    //Load html in window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }))
    //Quit app when closed
    mainWindow.on('closed', function(){
        app.quit()
    })

    //Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    //Insert menu
    Menu.setApplicationMenu(mainMenu)
})

//Handle createAddWindow
function createAddWindow() {
    //Create new window
    addWindow = new BrowserWindow({
        width: 600,
        height: 400,
        title: 'Add shopping list item'
    })

    //Load html in window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file',
        slashes: true
    }))
    //Garbage Collection Handle
    addWindow.on('close', function(){
        addWindow = null
    })
}

//Catch item:add
ipcMain.on('item:add', function(e, package) {
    mainWindow.webContents.send('item:add', package)
    addWindow.close()
})

//Create Menu template

const mainMenuTemplate = [
    {
        label: 'File', 
        submenu: [
            {
                label: 'Add Item',
                click() {
                    createAddWindow()
                }
            },
            {
                label: 'Clear Items',
                click() {
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit()
                }
            },
            {
                label: "Edit",
                submenu: [
                    { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                    { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                    { type: "separator" },
                    { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                    { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                    { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                    { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
                ]
            }
        ]
    }
]

//if Mac, add empty object to menu
if(process.platform == 'darwin') {
    mainMenuTemplate.unshift({label: ''})
}

//Add developer tools item if not in production
if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: "Developer tools",
        submenu: [
            {
                label: 'Toggle DevTools',
                abel: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}