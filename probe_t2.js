const fs = require('fs'); const path = require('path'); const os = require('os');
const { pathToFileURL } = require('url');
(async () => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'probe_'));
    fs.mkdirSync(path.join(tmpdir, 'ai_workspace'), { recursive: true });
    fs.writeFileSync(path.join(tmpdir, 'ai_workspace', 'loop_state.md'),
        `**Goal Summary:** Test\n**Current Role:** Tester (Role 04) | History: \ntest_level=deep | do_docs=true | can_loop=true\n`);
    const captured = []; let buf = "";
    const oLog = console.log, oWrite = process.stdout.write;
    console.log = (...a) => { if (buf) { captured.push(buf); buf=""; } captured.push(a.join(" ")); };
    process.stdout.write = (c) => { const s=c.toString(); if (s==="\n") { if (buf){captured.push(buf);buf="";} } else buf+=s; };
    const commands = {}; const mockPi = { registerCommand:(n,c)=>{commands[n]=c;}, on:()=>{} };
    process.env.TEST_SCENARIO = "T2"; process.env.TEST_TMPDIR = tmpdir;
    const ext = await import(pathToFileURL('C:/repos/ai_flow_test/.pi/extensions/pipeline-auto.ts').href);
    ext.default(mockPi);
    await commands["pipeline-auto"].handler("", { cwd: tmpdir, hasUI:true, ui:{setStatus:()=>{}} });
    console.log = oLog; process.stdout.write = oWrite;
    if (buf) captured.push(buf);
    for (const l of captured) process.stdout.write("LINE> " + JSON.stringify(l) + "\n");
    fs.rmSync(tmpdir, {recursive:true, force:true});
})();
