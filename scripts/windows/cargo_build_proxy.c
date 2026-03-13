#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <windows.h>

static int append_quoted(char *dest, size_t dest_size, const char *value) {
    size_t used = strlen(dest);
    int written = _snprintf_s(dest + used, dest_size - used, _TRUNCATE, "\"%s\"", value);
    return written < 0 ? 1 : 0;
}

int main(void) {
    char exe_path[MAX_PATH];
    char dir_path[MAX_PATH];
    char script_path[MAX_PATH];
    char command[32768] = "cmd.exe /c \"";
    const char *base_name;
    LPWSTR *argv_w = NULL;
    int argc = 0;

    DWORD len = GetModuleFileNameA(NULL, exe_path, MAX_PATH);
    if (len == 0 || len >= MAX_PATH) {
        return 1;
    }

    strcpy_s(dir_path, MAX_PATH, exe_path);
    char *last_sep = strrchr(dir_path, '\\');
    if (!last_sep) {
        return 1;
    }

    base_name = last_sep + 1;
    *last_sep = '\0';
    strcpy_s(script_path, MAX_PATH, dir_path);
    strcat_s(script_path, MAX_PATH, "\\");
    strcat_s(script_path, MAX_PATH, base_name);
    char *dot = strrchr(script_path, '.');
    if (dot) {
        strcpy_s(dot, MAX_PATH - (size_t)(dot - script_path), ".cmd");
    } else {
        strcat_s(script_path, MAX_PATH, ".cmd");
    }

    if (append_quoted(command, sizeof(command), script_path) != 0) {
        return 1;
    }

    argv_w = CommandLineToArgvW(GetCommandLineW(), &argc);
    if (!argv_w) {
        return 1;
    }

    for (int i = 1; i < argc; i++) {
        char arg[4096];
        if (WideCharToMultiByte(CP_UTF8, 0, argv_w[i], -1, arg, sizeof(arg), NULL, NULL) == 0) {
            LocalFree(argv_w);
            return 1;
        }

        strcat_s(command, sizeof(command), " ");
        if (append_quoted(command, sizeof(command), arg) != 0) {
            LocalFree(argv_w);
            return 1;
        }
    }

    LocalFree(argv_w);
    strcat_s(command, sizeof(command), "\"");
    return system(command);
}
