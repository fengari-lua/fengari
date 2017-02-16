#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <stdlib.h>
#include <stdio.h>

int main(void) {

    lua_State *L = luaL_newstate();

    luaL_openlibs(L);

    lua_pushinteger(L, 10);

    printf("L->top(%d): type %s, value %ld\n", lua_gettop(L), luaL_typename(L, lua_gettop(L)), lua_tointeger(L, -1));

    lua_close(L);

    return 0;

}