CC= gcc-6 -std=gnu99
CFLAGS= -g -Wall -Wextra

LIBS= -lm -llua

all:
	$(CC) $(CFLAGS) $(LIBS) lua_pushnil.c             -o lua_pushnil.out
	$(CC) $(CFLAGS) $(LIBS) lua_pushnumber.c          -o lua_pushnumber.out
	$(CC) $(CFLAGS) $(LIBS) lua_pushinteger.c         -o lua_pushinteger.out
	$(CC) $(CFLAGS) $(LIBS) lua_pushstring.c          -o lua_pushstring.out
	$(CC) $(CFLAGS) $(LIBS) lua_pushboolean.c         -o lua_pushboolean.out
	$(CC) $(CFLAGS) $(LIBS) lua_pushvalue.c           -o lua_pushvalue.out
	$(CC) $(CFLAGS) $(LIBS) lua_pushcclosure-light.c  -o lua_pushcclosure-light.out
	$(CC) $(CFLAGS) $(LIBS) lua_call.c 				  -o lua_call.out