import test from 'node:test';
import assert from 'node:assert/strict';
import {catalogDiagnostic} from '../js/catalog-diagnostics.js';
test('connection diagnostic retains failure coordinates without copying credentials or error details',()=>{
 const error={code:'READ_TIMEOUT',status:200,message:'Bearer secret-token',details:{password:'secret-password'},catalogRead:{offset:50,pageSize:20,loaded:50,access_token:'secret-token'}};
 const result=catalogDiagnostic(error);
 assert.equal(result.loaded,50);assert.equal(result.offset,50);assert.equal(result.pageSize,20);assert.equal(result.httpStatus,200);
 assert.doesNotMatch(JSON.stringify(result),/secret-token|secret-password|password|access_token|Bearer/);
});
