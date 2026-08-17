const { spawn } = require('child_process');
const fs = require('fs');

const child = spawn('npx', ['pi-coding-agent', '--mode', 'rpc'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
});

const out = fs.createWriteStream('debug.log');

child.stdout.on('data', data => {
    out.write(data);
});
child.stderr.on('data', data => {
    out.write("STDERR: " + data);
});

child.stdin.write(JSON.stringify({
    jsonrpc: "2.0",
    method: "prompt",
    params: { text: "Use the bash tool to run 'echo hello'" },
    id: 1
}) + "\n");
