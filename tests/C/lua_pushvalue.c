#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <stdlib.h>
#include <stdio.h>

int main(void) {

    lua_State *L = luaL_newstate();

    luaL_openlibs(L);

    lua_pushstring(L, "hello");

    lua_pushvalue(L, -1);

    printf("L->top(%d): %s\n", lua_gettop(L), luaL_typename(L, -1));
    printf("L->top - 1(%d): %s\n", lua_gettop(L) - 1, luaL_typename(L, -2));

    lua_close(L);

    return 0;

}