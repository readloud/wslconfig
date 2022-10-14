"use strict";

function initializeScript()
{
    return [new host.apiVersionSupport(1, 3)];
}

function continueExecution() {
    var cmd = "g";
    host.diagnostics.debugLog(cmd);
    var lines = host.namespace.Debugger.Utility.Control.ExecuteCommand(cmd)
    for (var line of lines) host.diagnostics.debugLog("  ", line, "\n");
}

function invokeScript()
{
    /* bp vmcompute!Marshal::JsonParser::JsonParser */

    var cmd;
    var lines;

    // 1. Check if WSL
    var magic = host.memory.readWideString(host.currentThread.Registers.User.rdx, 14);
    if (magic == '{"Owner":"WSL"') {
        host.diagnostics.debugLog("IS WSL\n");
    } else {
        host.diagnostics.debugLog("IS NOT WSL request\n");
        return continueExecution();
    }

    // dump length and read machine spec json
    var len = host.currentThread.Registers.User.r8;
    host.diagnostics.debugLog("String length: ", len, " dumping memory: ", host.currentThread.Registers.User.rdx, "\n");
    var jsonString = host.memory.readWideString(host.currentThread.Registers.User.rdx, len);
    host.diagnostics.debugLog("Before: ", jsonString, "\n");

    // parse and modify machine spec json
    var machineSpec = JSON.parse(jsonString);
    machineSpec.VirtualMachine.ComputeTopology.Processor.ExposeVirtualizationExtensions = true;
    var machineSpecJson = JSON.stringify(machineSpec);
    host.diagnostics.debugLog("After:  ", JSON.stringify(machineSpec), "\n");
    var newLen = "0x" + machineSpecJson.length.toString(16);

    // allocate memory
    cmd = ".dvalloc 4096"
    lines = host.namespace.Debugger.Utility.Control.ExecuteCommand(cmd)
    var addr = lines[0];
    var addrParts = addr.split(" ");
    var freeMem = addrParts[addrParts.length-1].replace("`", "");
    host.diagnostics.debugLog("Allocated ", freeMem, "\n");
    
    // write memory
    host.diagnostics.debugLog("Writing memory ", freeMem, " length: ", newLen, "\n");
    cmd = "eu " + freeMem + ' "' + machineSpecJson.split("\\").join("\\\\").split('"').join('\\"') + '"';
    lines = host.namespace.Debugger.Utility.Control.ExecuteCommand(cmd)
    for (var line of lines) host.diagnostics.debugLog("  ", line, "\n");

    // patch rdx with new memory
    var cmd = "r @rdx = " + freeMem;
    host.diagnostics.debugLog(cmd);
    var lines = host.namespace.Debugger.Utility.Control.ExecuteCommand(cmd)
    for (var line of lines) host.diagnostics.debugLog("  ", line, "\n");

    // patch r8 with new memory size
    var cmd = "r @r8 = " + newLen;
    host.diagnostics.debugLog(cmd);
    var lines = host.namespace.Debugger.Utility.Control.ExecuteCommand(cmd)
    for (var line of lines) host.diagnostics.debugLog("  ", line, "\n");

    return continueExecution();
}