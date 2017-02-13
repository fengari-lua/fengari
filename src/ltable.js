/*jshint esversion: 6 */
"use strict";

const lobject = require('./lobject.js');
const Table   = lobject.Table;

/*
** Try to find a boundary in table 't'. A 'boundary' is an integer index
** such that t[i] is non-nil and t[i+1] is nil (and 0 if t[1] is nil).
*/
Table.prototype.luaH_getn = function() {
    let array = this.value.array;
    let hash = this.value.hash;

    let j = array.length;
    if (j > 0 && array[j - 1].ttisnil()) {
        /* there is a boundary in the array part: (binary) search for it */
        let i = 0;
        while (j - i > 1) {
            let m = (i+j)/2;
            if (array[m - 1].ttisnil()) j = m;
            else i = m;
        }
        return i;
    }
    /* else must find a boundary in hash part */
    else if (hash.size === 0)
        return j;
    else return j; // TODO: unbound_search(t, j) => but why ?
};