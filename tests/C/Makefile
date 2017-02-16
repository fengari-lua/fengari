CC= gcc-6 -std=gnu99
CFLAGS= -g -Wall -Wextra

LIBS= -lm -llua

all:
	$(CC) $(CFLAGS) $(LIBS) lua_pushnil.c -o lua_pushnil.out
	$(CC) $(CFLAGS) $(LIBS) lua_pushnumber.c -o lua_pushnumber.out