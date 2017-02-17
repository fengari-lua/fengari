#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <stdlib.h>
#include <stdio.h>

int main(void) {

    lua_State *L = luaL_newstate();

    luaL_openlibs(L);

    lua_newtable(L);

    lua_pushstring(L, "key");
    lua_pushstring(L, "value");

    lua_settable(L, -3);

    lua_pushstring(L, "key");
    lua_gettable(L, -2);


    printf("L->top(%d): %s\n", lua_gettop(L), luaL_typename(L, -1));
    printf("Table has value: %s\n", lua_tostring(L, -1));

    lua_close(L);

    return 0;

}