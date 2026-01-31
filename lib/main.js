"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const fs_1 = require("fs");
const process = __importStar(require("process"));
const os = __importStar(require("os"));
function xdg_config_home() {
    const xdg_config_home = process.env['XDG_CONFIG_HOME'];
    if (xdg_config_home)
        return xdg_config_home;
    return `${os.homedir()}/.config`;
}
function non_empty_trimmed_lines(input) {
    return input.split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const credentials = non_empty_trimmed_lines(core.getInput('credentials', { required: true }));
        // Get the current credentials so we can avoid adding duplicates.
        // On self-hosted runners, the credentials file could be retained between runs, so we don't want to add duplicates.
        yield fs_1.promises.mkdir(`${xdg_config_home()}/git`, { recursive: true });
        const file = yield fs_1.promises.open(`${xdg_config_home()}/git/credentials`, "a+", 0o600);
        const contents = (yield file.readFile()).toString();
        const old_credentials = non_empty_trimmed_lines(contents);
        const new_credentials = credentials.filter(entry => !old_credentials.includes(entry));
        // If the file didn't end with a newline, add one.
        if (contents.length > 0 && !contents.endsWith("\n")) {
            yield file.write("\n");
        }
        // Track the credentials we're adding for cleanup
        const addedCredentials = [];
        // Add credentials that aren't already in the file.
        for (const credential of new_credentials) {
            yield file.write(credential + "\n");
            addedCredentials.push(credential);
        }
        // Flush to disk before close - prevents race condition with git
        yield file.sync();
        yield file.close();
        // Store the added credentials for post-cleanup
        core.saveState('added-credentials', JSON.stringify(addedCredentials));
        // Add git configuration.
        yield (0, exec_1.exec)('git', ['config', '--global', 'credential.helper', 'store']);
        yield (0, exec_1.exec)('git', ['config', '--global', '--replace-all', 'url.https://github.com/.insteadOf', 'ssh://git@github.com/']);
        yield (0, exec_1.exec)('git', ['config', '--global', '--add', 'url.https://github.com/.insteadOf', 'git@github.com:']);
        // Log to ensure credentials exist in the credentials file
        const finalContents = (yield fs_1.promises.readFile(`${xdg_config_home()}/git/credentials`)).toString();
        const finalCredentials = non_empty_trimmed_lines(finalContents);
        for (const credential of credentials) {
            if (finalCredentials.includes(credential)) {
                core.info(`Credential exists in file: ${credential}`);
            }
            else {
                core.warning(`Credential missing from file: ${credential}`);
            }
        }
    });
}
run().catch(error => {
    core.setFailed(error.message);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvREFBc0M7QUFDdEMsd0NBQXFDO0FBRXJDLDJCQUFvQztBQUNwQyxpREFBbUM7QUFDbkMsdUNBQXlCO0FBRXpCLFNBQVMsZUFBZTtJQUN2QixNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdkQsSUFBSSxlQUFlO1FBQUUsT0FBTyxlQUFlLENBQUM7SUFDNUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFBO0FBQ2pDLENBQUM7QUFFRCxTQUFTLHVCQUF1QixDQUFDLEtBQWE7SUFDN0MsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztTQUN6QixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRUQsU0FBZSxHQUFHOztRQUNqQixNQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFOUYsaUVBQWlFO1FBQ2pFLG1IQUFtSDtRQUNuSCxNQUFNLGFBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxlQUFlLEVBQUUsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDaEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxhQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBZSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRixNQUFNLFFBQVEsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDcEQsTUFBTSxlQUFlLEdBQUcsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUQsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRXRGLGtEQUFrRDtRQUNsRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3JELE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBRUQsaURBQWlEO1FBQ2pELE1BQU0sZ0JBQWdCLEdBQWEsRUFBRSxDQUFDO1FBRXRDLG1EQUFtRDtRQUNuRCxLQUFLLE1BQU0sVUFBVSxJQUFJLGVBQWUsRUFBRSxDQUFDO1lBQzFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDcEMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRCxnRUFBZ0U7UUFDaEUsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEIsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFbkIsK0NBQStDO1FBQy9DLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFFdEUseUJBQXlCO1FBQ3pCLE1BQU0sSUFBQSxXQUFJLEVBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sSUFBQSxXQUFJLEVBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsbUNBQW1DLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1FBQ3pILE1BQU0sSUFBQSxXQUFJLEVBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsbUNBQW1DLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBRTNHLDBEQUEwRDtRQUMxRCxNQUFNLGFBQWEsR0FBRyxDQUFDLE1BQU0sYUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLGVBQWUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0YsTUFBTSxnQkFBZ0IsR0FBRyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNoRSxLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ3RDLElBQUksZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsOEJBQThCLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDdkQsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLElBQUksQ0FBQyxPQUFPLENBQUMsaUNBQWlDLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDN0QsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0NBQUE7QUFFRCxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjb3JlIGZyb20gJ0BhY3Rpb25zL2NvcmUnO1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gJ0BhY3Rpb25zL2V4ZWMnO1xuXG5pbXBvcnQgeyBwcm9taXNlcyBhcyBmcyB9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHByb2Nlc3MgZnJvbSAncHJvY2Vzcyc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5cbmZ1bmN0aW9uIHhkZ19jb25maWdfaG9tZSgpIHtcblx0Y29uc3QgeGRnX2NvbmZpZ19ob21lID0gcHJvY2Vzcy5lbnZbJ1hER19DT05GSUdfSE9NRSddO1xuXHRpZiAoeGRnX2NvbmZpZ19ob21lKSByZXR1cm4geGRnX2NvbmZpZ19ob21lO1xuXHRyZXR1cm4gYCR7b3MuaG9tZWRpcigpfS8uY29uZmlnYFxufVxuXG5mdW5jdGlvbiBub25fZW1wdHlfdHJpbW1lZF9saW5lcyhpbnB1dDogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRyZXR1cm4gaW5wdXQuc3BsaXQoL1xccj9cXG4vKVxuXHRcdC5tYXAobGluZSA9PiBsaW5lLnRyaW0oKSlcblx0XHQuZmlsdGVyKGxpbmUgPT4gbGluZS5sZW5ndGggPiAwKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xuXHRjb25zdCBjcmVkZW50aWFscyA9IG5vbl9lbXB0eV90cmltbWVkX2xpbmVzKGNvcmUuZ2V0SW5wdXQoJ2NyZWRlbnRpYWxzJywgeyByZXF1aXJlZDogdHJ1ZSB9KSk7XG5cblx0Ly8gR2V0IHRoZSBjdXJyZW50IGNyZWRlbnRpYWxzIHNvIHdlIGNhbiBhdm9pZCBhZGRpbmcgZHVwbGljYXRlcy5cblx0Ly8gT24gc2VsZi1ob3N0ZWQgcnVubmVycywgdGhlIGNyZWRlbnRpYWxzIGZpbGUgY291bGQgYmUgcmV0YWluZWQgYmV0d2VlbiBydW5zLCBzbyB3ZSBkb24ndCB3YW50IHRvIGFkZCBkdXBsaWNhdGVzLlxuXHRhd2FpdCBmcy5ta2RpcihgJHt4ZGdfY29uZmlnX2hvbWUoKX0vZ2l0YCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cdGNvbnN0IGZpbGUgPSBhd2FpdCBmcy5vcGVuKGAke3hkZ19jb25maWdfaG9tZSgpfS9naXQvY3JlZGVudGlhbHNgLCBcImErXCIsIDBvNjAwKTtcblx0Y29uc3QgY29udGVudHMgPSAoYXdhaXQgZmlsZS5yZWFkRmlsZSgpKS50b1N0cmluZygpO1xuXHRjb25zdCBvbGRfY3JlZGVudGlhbHMgPSBub25fZW1wdHlfdHJpbW1lZF9saW5lcyhjb250ZW50cyk7XG5cdGNvbnN0IG5ld19jcmVkZW50aWFscyA9IGNyZWRlbnRpYWxzLmZpbHRlcihlbnRyeSA9PiAhb2xkX2NyZWRlbnRpYWxzLmluY2x1ZGVzKGVudHJ5KSk7XG5cblx0Ly8gSWYgdGhlIGZpbGUgZGlkbid0IGVuZCB3aXRoIGEgbmV3bGluZSwgYWRkIG9uZS5cblx0aWYgKGNvbnRlbnRzLmxlbmd0aCA+IDAgJiYgIWNvbnRlbnRzLmVuZHNXaXRoKFwiXFxuXCIpKSB7XG5cdFx0YXdhaXQgZmlsZS53cml0ZShcIlxcblwiKTtcblx0fVxuXG5cdC8vIFRyYWNrIHRoZSBjcmVkZW50aWFscyB3ZSdyZSBhZGRpbmcgZm9yIGNsZWFudXBcblx0Y29uc3QgYWRkZWRDcmVkZW50aWFsczogc3RyaW5nW10gPSBbXTtcblxuXHQvLyBBZGQgY3JlZGVudGlhbHMgdGhhdCBhcmVuJ3QgYWxyZWFkeSBpbiB0aGUgZmlsZS5cblx0Zm9yIChjb25zdCBjcmVkZW50aWFsIG9mIG5ld19jcmVkZW50aWFscykge1xuXHRcdGF3YWl0IGZpbGUud3JpdGUoY3JlZGVudGlhbCArIFwiXFxuXCIpO1xuXHRcdGFkZGVkQ3JlZGVudGlhbHMucHVzaChjcmVkZW50aWFsKTtcblx0fVxuXG5cdC8vIEZsdXNoIHRvIGRpc2sgYmVmb3JlIGNsb3NlIC0gcHJldmVudHMgcmFjZSBjb25kaXRpb24gd2l0aCBnaXRcblx0YXdhaXQgZmlsZS5zeW5jKCk7XG5cdGF3YWl0IGZpbGUuY2xvc2UoKTtcblxuXHQvLyBTdG9yZSB0aGUgYWRkZWQgY3JlZGVudGlhbHMgZm9yIHBvc3QtY2xlYW51cFxuXHRjb3JlLnNhdmVTdGF0ZSgnYWRkZWQtY3JlZGVudGlhbHMnLCBKU09OLnN0cmluZ2lmeShhZGRlZENyZWRlbnRpYWxzKSk7XG5cblx0Ly8gQWRkIGdpdCBjb25maWd1cmF0aW9uLlxuXHRhd2FpdCBleGVjKCdnaXQnLCBbJ2NvbmZpZycsICctLWdsb2JhbCcsICdjcmVkZW50aWFsLmhlbHBlcicsICdzdG9yZSddKTtcblx0YXdhaXQgZXhlYygnZ2l0JywgWydjb25maWcnLCAnLS1nbG9iYWwnLCAnLS1yZXBsYWNlLWFsbCcsICd1cmwuaHR0cHM6Ly9naXRodWIuY29tLy5pbnN0ZWFkT2YnLCAnc3NoOi8vZ2l0QGdpdGh1Yi5jb20vJ10pO1xuXHRhd2FpdCBleGVjKCdnaXQnLCBbJ2NvbmZpZycsICctLWdsb2JhbCcsICctLWFkZCcsICd1cmwuaHR0cHM6Ly9naXRodWIuY29tLy5pbnN0ZWFkT2YnLCAnZ2l0QGdpdGh1Yi5jb206J10pO1xuXG5cdC8vIExvZyB0byBlbnN1cmUgY3JlZGVudGlhbHMgZXhpc3QgaW4gdGhlIGNyZWRlbnRpYWxzIGZpbGVcblx0Y29uc3QgZmluYWxDb250ZW50cyA9IChhd2FpdCBmcy5yZWFkRmlsZShgJHt4ZGdfY29uZmlnX2hvbWUoKX0vZ2l0L2NyZWRlbnRpYWxzYCkpLnRvU3RyaW5nKCk7XG5cdGNvbnN0IGZpbmFsQ3JlZGVudGlhbHMgPSBub25fZW1wdHlfdHJpbW1lZF9saW5lcyhmaW5hbENvbnRlbnRzKTtcblx0Zm9yIChjb25zdCBjcmVkZW50aWFsIG9mIGNyZWRlbnRpYWxzKSB7XG5cdFx0aWYgKGZpbmFsQ3JlZGVudGlhbHMuaW5jbHVkZXMoY3JlZGVudGlhbCkpIHtcblx0XHRcdGNvcmUuaW5mbyhgQ3JlZGVudGlhbCBleGlzdHMgaW4gZmlsZTogJHtjcmVkZW50aWFsfWApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb3JlLndhcm5pbmcoYENyZWRlbnRpYWwgbWlzc2luZyBmcm9tIGZpbGU6ICR7Y3JlZGVudGlhbH1gKTtcblx0XHR9XG5cdH1cbn1cblxucnVuKCkuY2F0Y2goZXJyb3IgPT4ge1xuXHRjb3JlLnNldEZhaWxlZChlcnJvci5tZXNzYWdlKTtcbn0pO1xuIl19