#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>
#include <stdlib.h>
#include <stdio.h>

int func(lua_State *L) {
    const char *s = lua_tostring(L, lua_upvalueindex(1));
    lua_pushstring(L, s);
    return 1;
}

int main(void) {

    lua_State *L = luaL_newstate();

    luaL_openlibs(L);

    lua_pushstring(L, "upvalue hello !");
    lua_pushcclosure(L, func, 1);

    lua_call(L, 0, 1);

    printf("Lua returned: %s\n", lua_tostring(L, -1));

    lua_close(L);

    return 0;

}