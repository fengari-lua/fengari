#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <stdlib.h>
#include <stdio.h>

int func(lua_State *L) {
    return 0;
}

int main(void) {

    lua_State *L = luaL_newstate();

    luaL_openlibs(L);

    lua_pushcclosure(L, func, 0);

    printf("L->top(%d): %s\n", lua_gettop(L), luaL_typename(L, lua_gettop(L)));

    lua_close(L);

    return 0;

}