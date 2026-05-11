const fs = require("fs");
const vm = require("vm");
const c = fs.readFileSync("d:\\\\personal\\\\Desktop\\\\知识库\\\\巴菲特\\\\meetings_data.js", "utf-8");
try {
    new vm.Script(c);
    console.log("VALID JS");
} catch(e) {
    console.log("INVALID: " + e.message);
}
