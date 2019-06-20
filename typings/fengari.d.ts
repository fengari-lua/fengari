/*
 * Typescruipt type declarations for Fengari
 */

// tslint:disable:class-name

export const FENGARI_AUTHORS: string;
export const FENGARI_COPYRIGHT: string;
export const FENGARI_RELEASE: string;
export const FENGARI_VERSION: string;
export const FENGARI_VERSION_NUM: number;
export const FENGARI_VERSION_MAJOR: string;
export const FENGARI_VERSION_RELEASE: string;
export const FENGARI_VERSION_MINOR: string;

export type lua_String = Uint8Array;

export function to_luastring(s: string): lua_String;
export function to_jsstring(s: lua_String): string;
export function to_uristring(s: lua_String): string;

export const LUA_OPADD: number;
export const LUA_OPSUB: number;
export const LUA_OPMUL: number;
export const LUA_OPMOD: number;
export const LUA_OPPOW: number;
export const LUA_OPDIV: number;
export const LUA_OPIDIV: number;
export const LUA_OPBAND: number;
export const LUA_OPBOR: number;
export const LUA_OPBXOR: number;
export const LUA_OPSHL: number;
export const LUA_OPSHR: number;
export const LUA_OPUNM: number;
export const LUA_OPBNOT: number;

export const LUA_TNONE: number;
export const LUA_TNIL: number;
export const LUA_TBOOLEAN: number;
export const LUA_TLIGHTUSERDATA : number;
export const LUA_TNUMBER : number;
export const LUA_TSTRING: number;
export const LUA_TTABLE: number;
export const LUA_TFUNCTION : number;
export const LUA_TUSERDATA: number;
export const LUA_TTHREAD: number;

export namespace lua {
  interface lua_State {
  }

  //export type lua_Type = LUA_TNONE | LUA_TNIL | LUA_TBOOLEAN | LUA_TLIGHTUSERDATA | LUA_TNUMBER | LUA_TSTRING | LUA_TTABLE | LUA_TFUNCTION | LUA_TUSERDATA | LUA_TTHREAD;
  export type lua_Type = number;
  export type lua_ArithOp = number;

  const LUA_OK: number;
  const LUA_ERRRUN: number;

  type lua_Alloc = (...a: any) => any; // TODO: define this correctly. Is alloc  actually used?
  type lua_Cfunction = (L: lua_State) => number;
  type lua_Integer = number
  type lua_KContext = any;
  type lua_KFunction = (L: lua_State, status: number, ctx: lua_KContext) => number;
  type lua_Number = number;
  type lua_Writer = (L: lua_State, p: any, sz: number, ud: any) => number;
  type lua_Reader = (L: lua_State, ud: any, size: any) => any;

  const LUA_AUTHORS: string;
  const LUA_COPYRIGHT: string;
  const LUA_VERSION: string;
  const LUA_RELEASE: string;

  const LUA_REGISTRYINDEX: number;
  const LUA_RIDX_MAINTHREAD: number;
  const LUA_RIDX_GLOBALS: number;

  function lua_absindex(L: lua_State, idx: number): number;
  function lua_arith(L: lua_State, op: lua_ArithOp): void;
  function lua_atnativeerror(L: lua_State, errfunc: lua_Cfunction): lua_Cfunction;
  function lua_atpanic(L: lua_State, panicf: lua_Cfunction): lua_Cfunction;

  function lua_call(L: lua_State, nargs: number, nresults: number): void;
  function lua_callk(L: lua_State, nargs: number, nresults: number, ctx: lua_KContext, k: lua_KFunction): void;
  function lua_checkstack(L: lua_State, extra: number): number;
  function lua_close(L: lua_State): void;
  function lua_compare(L: lua_State, index1: number, index2: number, op: number): number;
  function lua_concat(L: lua_State, n: number): void;
  function lua_copy(L: lua_State, fromidx: number, toidx: number): void;
  function lua_createtable(L: lua_State, narr: number, nrec: number): void;

  function lua_dump(L: lua_State, writer: lua_Writer, data: any, strip: boolean): number;

  function lua_error(L: lua_State): number;

  function lua_gc(L: lua_State, what: number, data: number): number;
  function lua_getallocf(L: lua_State, data: any): number;
  function lua_getfield(L: lua_State, index: number, k: string): lua_Type;
  function lua_getextraspace(L: lua_State): any;
  function lua_getglobal(L: lua_State, name: string): lua_Type;
  function lua_geti(L: lua_State, idx: number, i: lua_Integer): number;
  function lua_getmetatable(L: lua_State, index: number): number;
  function lua_gettable(L: lua_State, index: number): lua_Type;
  function lua_gettop(L: lua_State): number;
  function lua_getuservalue(L: lua_State, index: number): lua_Type;

  function lua_insert(L: lua_State, index: number): void;
  function lua_isboolean(L: lua_State, index: number): boolean;
  function lua_iscfunction(L: lua_State, index: number): boolean;
  function lua_isfunction(L: lua_State, index: number): boolean;
  function lua_isinteger(L: lua_State, index: number): boolean;
  function lua_islightuserdata(L: lua_State, index: number): boolean;
  function lua_isnil(L: lua_State, index: number): boolean;
  function lua_isnone(L: lua_State, index: number): boolean;
  function lua_isnoneornil(L: lua_State, index: number): boolean;
  function lua_isnumber(L: lua_State, index: number): boolean;
  function lua_isproxy(L: lua_State, index: number): boolean;
  function lua_isstring(L: lua_State, index: number): boolean;
  function lua_istable(L: lua_State, index: number): boolean;
  function lua_isuserdata(L: lua_State, index: number): boolean;
  function lua_isthread(L: lua_State, index: number): boolean;
  function lua_isyieldable(L: lua_State, index: number): boolean;

  function lua_len(L: lua_State, index: number): number;
  function lua_load(L: lua_State, reader: lua_Reader, data: any, chunkname: lua_String, mode: lua_String | null): number;

  function lua_newstate(f: lua_Alloc, ud: any): lua_State;
  function lua_newtable(L: lua_State): void;
  function lua_newthread(L: lua_State): lua_State;
  function lua_newuserdata(L: lua_State, size: number): any;
  function lua_next(L: lua_State, index: number): number;
  function lua_numbertointeger(n: lua_Number, p: lua_Integer): boolean;

  function lua_pcall(L: lua_State, nargs: number, nresults: number, errfunc: number): void;
  function lua_pcallk(L: lua_State, nargs: number, nresults: number, errfunc: number, ctx: lua_KContext, k: lua_KFunction): void;
  function lua_pop(L: lua_State, n: number): void;
  function lua_pushboolean(L: lua_State, b: boolean): void;
  function lua_pushcclosure(L: lua_State, fn: lua_Cfunction, idx: number): void;
  function lua_pushcfunction(L: lua_State, fn: lua_Cfunction): void;
  function lua_pushfstring(L: lua_State, s: lua_String, ...a: any): lua_String;

  function lua_pushglobaltable(L: lua_State): void;
  function lua_pushinteger(L: lua_State, n: number): void;
  function lua_pushlightuserdata(L: lua_State, p: any): void;
  function lua_pushliteral(L: lua_State, s: string): void;
  function lua_pushlstring(L: lua_State, s: lua_String | string, size: number): void;
  function lua_pushnil(L: lua_State): void;
  function lua_pushnumber(L: lua_State, n: number): void;
  function lua_pushstring(L: lua_State, s: lua_String | string): void;
  function lua_pushthread(L: lua_State): number;
  function lua_pushvalue(L: lua_State, index: number): void;
  function lua_pushvstring(L: lua_State, fmt: lua_String, argp: any): lua_String; // TODO: Check if this is supported

  function lua_pushjsfunction(L: lua_State, fn: lua_Cfunction): void;
  function lua_pushjsclosure(L: lua_State, fn: lua_Cfunction, idx: number): void;

  function lua_rawequal(L: lua_State, index1: number, index2: number): boolean;
  function lua_rawget(L: lua_State, index: number): number;
  function lua_rawgeti(L: lua_State, index: number, n: number): lua_Type;
  function lua_rawgetp(L: lua_State, index: number, p: any): lua_Type;
  function lua_rawset(L: lua_State, index: number): void;
  function lua_rawseti(L: lua_State, index: number, n: number): void;
  function lua_rawsetp(L: lua_State, index: number, p: any): void;
  function lua_register(L: lua_State, name: lua_String, f: lua_Cfunction): void;
  function lua_remove(L: lua_State, index: number): void;
  function lua_replace(L: lua_State, index: number): void;
  function lua_resume(L: lua_State, from: lua_State, nargs: number): number;
  function lua_rotate(L: lua_State, idx: number, n: number): void;

  function lua_setallocf(L: lua_State, f: lua_Alloc, ud: any): void;
  function lua_setfield(L: lua_State, index: number, s: lua_String): void;
  function lua_setglobal(L: lua_State, name: lua_String): void;
  function lua_seti(L: lua_State, index: number, n: lua_Integer): void;
  function lua_setmetatable(L: lua_State, index: number): void;
  function lua_settable(L: lua_State, index: number): void;
  function lua_settop(L: lua_State, index: number): void;
  function lua_setuservalue(L: lua_State, index: number): void;
  function lua_status(L: lua_State): number;
  function lua_stringtonumber(L: lua_State, s: lua_String): number;

  function lua_toboolean(L: lua_State, index: number): boolean;
  function lua_tocfunction(L: lua_State, index: number): boolean;
  function lua_tointeger(L: lua_State, index: number): lua_Integer;
  function lua_tointegerx(L: lua_State, index: number, isnum: any): lua_Integer;  // TODO: See how out param is implemented
  function lua_tojsstring(L: lua_State, index: number): string;
  function lua_tolstring(L: lua_State, index: number, len: any): lua_String; // TODO: See how out param is implemented
  function lua_tonumber(L: lua_State, index: number): lua_Number;
  function lua_tonumberx(L: lua_State, index: number, isnum: any): lua_Number; // TODO: See how out param is implemented
  function lua_topointer(L: lua_State, index: number): any;
  function lua_tostring(L: lua_State, index: number): lua_String;
  function lua_tothread(L: lua_State, index: number): lua_State;
  function lua_touserdata(L: lua_State, index: number): any;
  function lua_tovalue(L: lua_State, index: number): string;
  function lua_type(L: lua_State, index: number): lua_Type;
  function lua_typename(L: lua_State, tp: lua_Type): string;

  function lua_upvalueindex(index: number): number;

  function lua_version(L: lua_State): lua_Number;

  function lua_xmove(from: lua_State, to: lua_State, n: number): void;

  function lua_yield(L: lua_State, nresults: number): lua_Number;
  function lua_yieldk(L: lua_State, nresults: number, ctx: lua_KContext, k: lua_KFunction): number;
}

export namespace lualib {
  function luaL_openlibs(L: lua.lua_State): void;
}

export namespace lauxlib {

  interface luaL_Buffer {
  }

  function luaL_addchar(B: luaL_Buffer, c: number): void;
  function luaL_addlstring(B: luaL_Buffer, s: string, l: number): void;
  function luaL_addstring(B: luaL_Buffer, s: string): void;
  function luaL_addsize(B: luaL_Buffer, n: number): void;
  function luaL_addvalue(B: luaL_Buffer): void;
  function luaL_argcheck(L: lua.lua_State, cond: number, narg: number, extramsg: string): void;
  function luaL_argerror(L: lua.lua_State, narg: number, extramsg: string): void;

  function luaL_buffinit(B: luaL_Buffer): void;

  function luaL_callmeta(L: lua.lua_State, obj: number, e: string): number;
  function luaL_checkany(L: lua.lua_State, narg: number): void;
  function luaL_checkinteger(L: lua.lua_State, narg: number): lua.lua_Integer;
  function luaL_checknumber(L: lua.lua_State, narg: number): lua.lua_Number;
  function luaL_checklstring(L: lua.lua_State, narg: number): string;
  function luaL_checkoption(L: lua.lua_State, narg: number, def: string, lst: string[]): number;
  function luaL_checkstack(L: lua.lua_State, sz: number, msg: string): string;
  function luaL_checkstring(L: lua.lua_State, narg: number): string;
  function luaL_checktype(L: lua.lua_State, narg: number, t: lua.lua_Type): void;
  function luaL_checkudata(L: lua.lua_State, narg: number, tname: string): void;

  function luaL_dofile(L: lua.lua_State, filename: string): boolean;
  function luaL_dostring(L: lua.lua_State, str: lua_String): boolean;

  function luaL_error(L: lua.lua_State, fmt: lua_String, ...args: any[]): number;

  function luaL_getmetafield(L: lua.lua_State, obj: number, e: string): lua.lua_Type;
  function luaL_getmetatable(L: lua.lua_State, tname: string): lua.lua_Type;
  function luaL_gsub(L: lua.lua_State, s: string, p: string, r: string): string;

  function luaL_loadbuffer(L: lua.lua_State, buff: string, size: number, name: string): number;
  function luaL_loadfile(L: lua.lua_State, filename: string): number;
  function luaL_loadstring(L: lua.lua_State, s: lua_String): number;

  function luaL_newmetatable(L: lua.lua_State, tname: string): number;
  function luaL_newstate(): lua.lua_State;

  function luaL_optinteger(L: lua.lua_State, narg: number, d: lua.lua_Integer): lua.lua_Integer;
  function luaL_optlstring(L: lua.lua_State, narg: number, d: string): string;
  function luaL_optnumber(L: lua.lua_State, narg: number, d: lua.lua_Number): lua.lua_Number;
  function luaL_optstring(L: lua.lua_State, narg: number, d: string): string;

  function luaL_prepbuffer(B: luaL_Buffer): any;
  function luaL_pushresult(B: luaL_Buffer): void;

  function luaL_ref(L: lua.lua_State, t: number): number;

  function luaL_typename(L: lua.lua_State, idx: number): lua_String;
  function luaL_unref(L: lua.lua_State, t: number, ref: number): void;
  function luaL_where(L: lua.lua_State, lvl: number): void;
}
