import * as esprima from 'esprima';
import * as esgraph from 'esgraph';
import * as escodegen from 'escodegen';
// var esprima = require('esprima');
// var esgraph = require('esgraph');
// var escodegen = require('escodegen');
let args = [];
let r_val = ['Literal' , 'Identifier', 'BinaryExpression', 'MemberExpression', 'UnaryExpression', 'ArrayExpression'];
let to_color  = [];
let expr_nodes = [];
let glob = [];

const parseCode = (codeToParse, app) => {
    args = [];
    to_color = [];
    expr_nodes = [];
    glob = [];
    let func = clean_func(codeToParse);
    parse_application(esprima.parseScript(app));
    const cfg = esgraph(esprima.parse(func, { range: true }).body[0].body);
    let dot = esgraph.dot(cfg, { counter: 0, source: func });
    let expr_dot = esgraph.dot(cfg, {counter: 0});
    to_color =  discover_path(clean_exp(dot.toString()),clean_exp(expr_dot.toString()),glob.join(' ') + parse_args());
    return color(clean_exp(dot.toString()));
};

function args_line (left, right){
    this.left = left;
    this.right = right;
}

const clean_func = (code) => {
    let arr = code.split('\n').map(x => x.trim());
    let i = 0; ;
    for(i; i < arr. length; i++){
        if(arr[i].split(' ')[0] === 'function')
            break;
        else
            glob.push(arr[i]);
    }
    return arr.slice(i).join(' ');

}

const parse_application = (obj) => {
    try {
        let i;
        for (i = 0; i < obj.body[0].expression.expressions.length; i++) {
            let arg = new args_line(obj.body[0].expression.expressions[i].left.name,escodegen.generate(obj.body[0].expression.expressions[i].right));
            args.push(arg);
        }
    }
    catch(e){
        try {
            let arg = new args_line(obj.body[0].expression.left.name, escodegen.generate(obj.body[0].expression.right));
            args.push(arg);
        }
        catch(e){
            args = [];
        }
    }
};

const clean_exp = (dot_graph) => {
    let arr = dot_graph.split('\n').filter(x => !x.includes('label=exception') && !(x.includes('n0')));
    let i;
    let s = '';
    for (i = 0; i < arr.length; i++) {
        if(arr[i].includes('exit'))
            s = arr[i].split(' ')[0];
    }
    return arr.filter(x => !x.includes(s) && !x.includes('exit')).join('\n').trim();
};

const discover_path = (dot_graph,expr_graph, eval_str) => {
    let arr = dot_graph.split('\n');
    let expr_arr = expr_graph.split('\n');
    let edges = arr.filter(x => x.includes('->'));
    edges = edges.map((x) => x.split('->').map((y) => y.trim()));
    edges = edges.map(x => [x[0], x[1].split(' ')]);
    let nodes = arr.filter(x => (!x.includes('->')));
    expr_nodes = expr_arr.filter(x => !x.includes('->')).map(x => x.split(' ')).map(x => [x[0].substr(1), x[1].split('"')[1]]);
    let code_array = nodes.map(x => x.split('"')).map(x => [x[0].split(' ')[0].substr(1), x[1]]);
    nodes = nodes.map(x => x.split(' ')[0]);
    return discover_path_algorithm(edges,nodes,code_array,eval_str);
};

const discover_path_algorithm = (edges, nodes, code_array, eval_str) => {
    let to_color = [];
    let i = 0;
    let next_node = nodes[0];
    while(i < expr_nodes.length + 1){
        i = parseInt(next_node.slice(1));
        if(next_node === 'end'){
            break;}
        to_color.push(next_node);
        if(r_val.includes(find_expr(i))){
            let val = eval(eval_str + find_code(i, code_array));
            next_node = get_next_node_if(edges,next_node,val);}
        else{
            if(find_code(i, code_array).charAt(find_code(i, code_array).length - 1) === ';')
                eval_str += find_code(i, code_array) + ' ';
            else
                eval_str += find_code(i, code_array) + '; ';
            next_node = get_next_node(edges, next_node);    }   }
    return to_color;
};

const find_expr = (idx) =>{
    let ans = expr_nodes.filter(x => x[0] === idx + '');
    return ans[0][1];
};

const find_code = (idx, code_array) =>{
    let ans = code_array.filter(x => x[0] === idx + '');
    return ans[0][1];
};

const fix_shapes = (nodes) => {
    return nodes.map((x) => (r_val.includes(find_expr(parseInt(x.split(' ')[0].substr(1)))))? x.substr(0, x.length - 1) + ', shape = diamond]' : x.substr(0, x.length - 1) + ', shape = box]');
};

const parse_args = () => {
    return args.reduce(((str, line) => str + 'let ' + line.left + ' = ' + line.right + '; '), '');
};

const get_next_node = (edges, cur) => {
    let i;
    for(i = 0; i < edges.length; i++){
        if((edges[i][0] === cur) && (edges[i][1][1] === '[]')) {
            return edges[i][1][0];
        }
    }
    return 'end';
};

const get_next_node_if = (edges, cur, val) => {
    let i;
    for(i = 0; i < edges.length; i++){
        if(edges[i][0] === cur && edges[i][1][1].includes(val.toString()))
            return edges[i][1][0];
    }
    return 'end';
};

const color = (dot_graph) => {
    let arr = dot_graph.split('\n');
    let edges = arr.filter(x => x.includes('->'));
    let nodes = arr.filter(x => (!x.includes('->')));
    nodes = nodes.map(x => to_color.includes(x.split(' ')[0])? x.substr(0, x.length-1) + ', color = green, style = filled]' : x);
    nodes = nodes.map(x => x.split('"')).map((y,z) => y[0] + '"-' + (z + 1) + '-\n' + y[1] + '"' + y[2]);
    nodes = fix_shapes(nodes);
    nodes = nodes.join('\n');
    edges = edges.join('\n');
    return nodes + edges;
};

// let source = 'function foo(x, y, z){\n' +
//     '    let a = x + 1;\n' +
//     '    let b = a + y;\n' +
//     '    let c = 0;\n' +
//     '    \n' +
//     '    if (b < z) {\n' +
//     '        c = c + 5;\n' +
//     '    } else if (b < z * 2) {\n' +
//     '        c = c + x + 5;\n' +
//     '    } else {\n' +
//     '        c = c + z + 5;\n' +
//     '    }\n' +
//     '    \n' +
//     '    return c;\n' +
//     '}\n';

//console.log(parseCode(source,'(x=1, y=2, z=10)'));
// console.log(parseCode( 'function f(x , y, z){\n' +
//     '\n' +
//     '    if(true)\n' +
//     '    {\n' +
//     '        if(false)\n' +
//     '        {\n' +
//     '            let b = 1;\n' +
//     '            return b;\n' +
//     '        }\n' +
//     '        else if(false){\n' +
//     '            let a = 1;\n' +
//     '            let b = false;\n' +
//     '            while(b)\n' +
//     '            {\n' +
//     '                console.log(123);\n' +
//     '            }\n' +
//     '        } else{\n' +
//     '            let b = 3;\n' +
//
//     '        }\n' +
//     '    }\n' +
//     '    let t = 0;\n' +
//     '    while(t < 3 )\n' +
//     '    {\n' +
//     '        if(true){\n' +
//     '            t = t + 1;                   \n' +
//     '        }else if(false)\n' +
//     '        {\n' +
//     '            t = t - 1;\n' +
//     '        }else{\n' +
//     '            t = t - 1;\n' +
//     '        }\n' +
//     '    }\n' +
//     '    \n' +
//     '    if(false)\n' +
//     '    {\n' +
//     '        let c = 10;\n' +
//     '        return c;\n' +
//     '    }else{\n' +
//     '        if(true){\n' +
//     '            return 11111;\n' +
//     '        }\n' +
//     '    }\n' +
//     '}', '(x=1 ,y=2, z=111)'));

// module.exports = (parseCode);
export {parseCode};
