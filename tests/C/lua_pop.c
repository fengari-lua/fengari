#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <stdlib.h>
#include <stdio.h>

int main(void) {

    lua_State *L = luaL_newstate();

    luaL_openlibs(L);

    lua_pushstring(L, "hello");
    lua_pushstring(L, "world");

    lua_pop(L, 1);

    printf("L->top(%d): %s\n", lua_gettop(L), lua_tostring(L, -1));

    lua_close(L);

    return 0;

}