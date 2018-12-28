import assert from 'assert';
import {parseCode, clean_func, clean_exp,fix_shapes } from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('test1', () => {
        assert.equal(
            clean_func('let a = [   true  , false ];\n' +
                'function f(x , y, z){\n' +
                '   if(a[1] === true)\n' +
                '  {\n' +
                '    return 1;\n' +
                '  }else if(a[0]){ return 2;}\n' +
                '  else{ return 3;}\n' +
                '\n' +
                '    return a[1][2];\n' +
                '}'),
            'function f(x , y, z){' +
            ' if(a[1] === true)' +
            ' {' +
            ' return 1;' +
            ' }else if(a[0]){ return 2;}' +
            ' else{ return 3;}' +
            '' +
            '  return a[1][2];' +
            ' }'
        );
    });

    it('test2', () => {
        assert.equal(
            parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '    }\n' +
                '    \n' +
                '    return c;\n' +
                '}\n', '(x=1, y=2, z=10)'),
            'n1 [label="-1-\n' +
            'let a = x + 1;", fillcolor = green, style = filled, shape = box]\n' +
            'n2 [label="-2-\n' +
            'let b = a + y;", fillcolor = green, style = filled, shape = box]\n' +
            'n3 [label="-3-\n' +
            'let c = 0;", fillcolor = green, style = filled, shape = box]\n' +
            'n4 [label="-4-\n' +
            'b < z", fillcolor = green, style = filled, shape = diamond]\n' +
            'n5 [label="-5-\n' +
            'c = c + 5", fillcolor = green, style = filled, shape = box]\n' +
            'n6 [label="-6-\n' +
            'return c;", fillcolor = green, style = filled, shape = box]\n' +
            'n7 [label="-7-\n' +
            'b < z * 2", shape = diamond]\n' +
            'n8 [label="-8-\n' +
            'c = c + x + 5", shape = box]\n' +
            'n9 [label="-9-\n' +
            'c = c + z + 5", shape = box]n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n7 [label="false"]\n' +
            'n5 -> n6 []\n' +
            'n7 -> n8 [label="true"]\n' +
            'n7 -> n9 [label="false"]\n' +
            'n8 -> n6 []\n' +
            'n9 -> n6 []'
        );
    });

    it('test3', () => {
        assert.equal(
            parseCode('function foo(x){\n' +
                '  let a = x + 1;\n' +
                '  let b = a + 1;\n' +
                '  let c = 0;\n' +
                '\n' +
                '  while (a < x) {\n' +
                '    c = a + b;\n' +
                '    z = c * 2;\n' +
                '    a++;\n' +
                '  }\n' +
                '  return x;\n' +
                '}', '(x=1)'),
            'n1 [label="-1-\n' +
            'let a = x + 1;", fillcolor = green, style = filled, shape = box]\n' +
            'n2 [label="-2-\n' +
            'let b = a + 1;", fillcolor = green, style = filled, shape = box]\n' +
            'n3 [label="-3-\n' +
            'let c = 0;", fillcolor = green, style = filled, shape = box]\n' +
            'n4 [label="-4-\n' +
            'a < x", fillcolor = green, style = filled, shape = diamond]\n' +
            'n5 [label="-5-\n' +
            'c = a + b", shape = box]\n' +
            'n6 [label="-6-\n' +
            'z = c * 2", shape = box]\n' +
            'n7 [label="-7-\n' +
            'a++", shape = box]\n' +
            'n8 [label="-8-\n' +
            'return x;", fillcolor = green, style = filled, shape = box]n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 []\n' +
            'n4 -> n5 [label="true"]\n' +
            'n4 -> n8 [label="false"]\n' +
            'n5 -> n6 []\n' +
            'n6 -> n7 []\n' +
            'n7 -> n4 []'
        );
    });

    it('test4', () => {
        assert.equal(
            parseCode('function foo(){\n' +
                '   let a = 2;\n' +
                '   let b = 3;\n' +
                '   let c = 7;\n' +
                '   \n' +
                '   if(a == 2){}\n' +
                '}', ''),
            'n1 [label="-1-\n' +
            'let a = 2;", fillcolor = green, style = filled, shape = box]\n' +
            'n2 [label="-2-\n' +
            'let b = 3;", fillcolor = green, style = filled, shape = box]\n' +
            'n3 [label="-3-\n' +
            'let c = 7;", fillcolor = green, style = filled, shape = box]\n' +
            'n4 [label="-4-\n' +
            'a == 2", fillcolor = green, style = filled, shape = diamond]n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 []'
        );
    });

    it('test5', () => {
        assert.equal(
            clean_exp('n0 [label="entry", style="rounded"]\n' +
                'n1 [label="let a = 2;"]\n' +
                'n2 [label="let b = 3;"]\n' +
                'n3 [label="let c = 7;"]\n' +
                'n4 [label="a == 2"]\n' +
                'n5 [label="exit", style="rounded"]\n' +
                'n0 -> n1 []\n' +
                'n1 -> n2 []\n' +
                'n2 -> n3 []\n' +
                'n3 -> n4 []\n' +
                'n4 -> n5 [label="true"]\n' +
                'n4 -> n5 [label="false"]\n' +
                'n4 -> n5 [color="red", label="exception"]'),
            'n1 [label="let a = 2;"]\n' +
            'n2 [label="let b = 3;"]\n' +
            'n3 [label="let c = 7;"]\n' +
            'n4 [label="a == 2"]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 []'
        );
    });

    it('test6', () => {
        assert.equal(
            clean_exp('n0 [label="entry", style="rounded"]\n' +
                'n1 [label="VariableDeclaration"]\n' +
                'n2 [label="VariableDeclaration"]\n' +
                'n3 [label="VariableDeclaration"]\n' +
                'n4 [label="BinaryExpression"]\n' +
                'n5 [label="exit", style="rounded"]\n' +
                'n0 -> n1 []\n' +
                'n1 -> n2 []\n' +
                'n2 -> n3 []\n' +
                'n3 -> n4 []\n' +
                'n4 -> n5 [label="true"]\n' +
                'n4 -> n5 [label="false"]\n' +
                'n4 -> n5 [color="red", label="exception"]'),
            'n1 [label="VariableDeclaration"]\n' +
            'n2 [label="VariableDeclaration"]\n' +
            'n3 [label="VariableDeclaration"]\n' +
            'n4 [label="BinaryExpression"]\n' +
            'n1 -> n2 []\n' +
            'n2 -> n3 []\n' +
            'n3 -> n4 []'
        );
    });

    it('test7', () => {
        assert.equal(
            fix_shapes(['n1 [label="-1-\nlet a = 2;", fillcolor = green, style = filled]','n2 [label="-2-\nlet b = 3;", fillcolor = green, style = filled]','n3 [label="-3-\nlet c = 7;", fillcolor = green, style = filled]', 'n4 [label="-4-\na == 2", fillcolor = green, style = filled]']).toString(),
            'n1 [label="-1-\n' +
            'let a = 2;", fillcolor = green, style = filled, shape = box],n2 [label="-2-\n' +
            'let b = 3;", fillcolor = green, style = filled, shape = box],n3 [label="-3-\n' +
            'let c = 7;", fillcolor = green, style = filled, shape = box],n4 [label="-4-\n' +
            'a == 2", fillcolor = green, style = filled, shape = diamond]'
        );
    });

    it('test8', () => {
        assert.equal(
            parseCode('function foo(x, z){\n' +
                '   \n' +
                '   let a = [1,2,3];\n' +
                '   if (x < z) {\n' +
                '       a = [2, 3, 4];\n' +
                '   }\n' +
                '   \n' +
                '   return a[1];\n' +
                '}\n','(x = 2, z = 1)'),
            'n1 [label="-1-\n' +
            'let a = [1,2,3];", fillcolor = green, style = filled, shape = box]\n' +
            'n2 [label="-2-\n' +
            'x < z", fillcolor = green, style = filled, shape = diamond]\n' +
            'n3 [label="-3-\n' +
            'a = [2, 3, 4]", shape = box]\n' +
            'n4 [label="-4-\n' +
            'return a[1];", fillcolor = green, style = filled, shape = box]n1 -> n2 []\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n4 [label="false"]\n' +
            'n3 -> n4 []'
        );
    });

    it('test9', () => {
        assert.equal(
            parseCode('let a = [1,2,3];\n' +
                'function foo(x, z){\n' +
                '  a = [0]; \n' +
                '  if (x[0] < z) {\n' +
                '    a = [2, 3, 4];\n' +
                '  }\n' +
                '  return a[0];\n' +
                '}','(x = [1], z = 2)'),
            'n1 [label="-1-\n' +
            'a = [0]", fillcolor = green, style = filled, shape = box]\n' +
            'n2 [label="-2-\n' +
            'x[0] < z", fillcolor = green, style = filled, shape = diamond]\n' +
            'n3 [label="-3-\n' +
            'a = [2, 3, 4]", fillcolor = green, style = filled, shape = box]\n' +
            'n4 [label="-4-\n' +
            'return a[0];", fillcolor = green, style = filled, shape = box]n1 -> n2 []\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n4 [label="false"]\n' +
            'n3 -> n4 []'
        );
    });

    it('test10', () => {
        assert.equal(
            parseCode('function foo(x){\n' +
                '   let a = 70;\n' +
                '   if (x) {\n' +
                '       a = [2, 3, 4];\n' +
                '   }\n' +
                '   \n' +
                '   return a;\n' +
                '}\n','(x = false)' ),
            'n1 [label="-1-\n' +
            'let a = 70;", fillcolor = green, style = filled, shape = box]\n' +
            'n2 [label="-2-\n' +
            'x", fillcolor = green, style = filled, shape = diamond]\n' +
            'n3 [label="-3-\n' +
            'a = [2, 3, 4]", shape = box]\n' +
            'n5 [label="-4-\n' +
            'return a;", fillcolor = green, style = filled, shape = box]n1 -> n2 []\n' +
            'n2 -> n3 [label="true"]\n' +
            'n2 -> n5 [label="false"]\n' +
            'n3 -> n5 []'
        );
    });
});
