const path = require('path');

async function main() {
    try {
        const ext = await import('./.pi/extensions/pipeline-auto.ts');
        console.log("Import successful!");
        console.log("Type of default export:", typeof ext.default);
        
        const commands = {};
        const events = {};
        const mockPi = {
            registerCommand: (name, handler) => {
                commands[name] = handler;
            },
            on: (eventName, handler) => {
                events[eventName] = handler;
            }
        };
        
        ext.default(mockPi);
        console.log("Registered commands:", Object.keys(commands));
        console.log("Registered events:", Object.keys(events));
        
    } catch (err) {
        console.error("Import failed:", err);
    }
}
main();
