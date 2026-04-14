const { spawn } = require("child_process");

const args = process.argv.slice(2);
const newArgs = [];
const positionalArgs = [];

const valueFlags = new Set([
    "-c", "--config", "--enable", "--disable",
    "--remote", "--remote-auth-token-env",
    "-i", "--image", "-m", "--model",
    "--local-provider", "-p", "--profile",
    "-s", "--sandbox", "-a", "--ask-for-approval",
    "-C", "--cd", "--add-dir"
]);

const validSubcommands = new Set([
    "exec", "e", "review", "login", "logout",
    "mcp", "mcp-server", "app-server", "completion",
    "sandbox", "debug", "apply", "a", "resume",
    "fork", "cloud", "exec-server", "features", "help"
]);

let i = 0;
let subFound = false;

while (i < args.length) {
    const arg = args[i];
    if (arg === "--approval-mode") {
        i++;
    } else if (valueFlags.has(arg)) {
        newArgs.push(arg);
        if (i + 1 < args.length) { newArgs.push(args[++i]); }
    } else if (arg.startsWith("-")) {
        newArgs.push(arg);
    } else if (subFound === false && validSubcommands.has(arg)) {
        newArgs.push(arg);
        subFound = true;
    } else {
        positionalArgs.push(arg);
    }
    i++;
}

const isInteractive = process.stdin.isTTY === true;

if (isInteractive === false && subFound === false) {
    newArgs.unshift("exec");
} else if (isInteractive === true && subFound === false) {
    newArgs.unshift("--full-auto");
}

if (positionalArgs.length > 0) {
    newArgs.push(positionalArgs.join(" "));
}

const cliPath = "C:\\Users\\Elebbre\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\bin\\codex.js";

// Usa pipe para stdin e fecha imediatamente (envia EOF)
// Assim o codex exec nao fica esperando input adicional
const proc = spawn(process.execPath, [cliPath, ...newArgs], {
    stdio: ["pipe", "inherit", "inherit"]
});
proc.stdin.end();

proc.on("exit", function(code) { process.exit(code || 0); });
