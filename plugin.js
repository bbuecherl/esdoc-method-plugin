var ASTNodeContainer;

var EMPTY = [];
var arrayToString = Object.prototype.toString.call(EMPTY);
var _isArray = function(a) {
  return Object.prototype.toString.call(a) === arrayToString;
}

exports.onHandleConfig = function(ev) {
  ev.data.config.lint = false;
};

exports.onHandleTag = function(ev) {
  ASTNodeContainer = require(process.cwd() +
      "/node_modules/esdoc/out/src/Util/ASTNodeContainer.js");
  for(var i = 0; i < ev.data.tag.length; ++i) {
    var tag = ev.data.tag[i];

    if(tag.kind === "variable" && _isArray(tag.unknown)) {
      for(var j = 0; j < tag.unknown.length; ++j) {
        if(tag.unknown[j].tagName === "@method") {
          var name = tag.unknown[j].tagValue;
          var splitName = name.split(".");
          var lastSplitName = splitName[splitName.length - 1];
          var isStatic = lastSplitName.indexOf("#") !== -1 ? false : true;
          var varName = isStatic ? lastSplitName :
              lastSplitName.split("#").pop();
          var file = tag.memberof;
          var params = tag.params || EMPTY;

          ev.data.tag.splice(i, 1, {
            __docId__: i,
            kind: "method",
            "static": isStatic,
            variation: tag.variation,
            name: varName,
            memberof: file + "~" + name.replace((isStatic ? "." : "#") +
              varName, "").trim(),
            longname: file + "~" + name,
            access: !tag.export ? "private" : tag.access,
            lineNumber: tag.lineNumber,
            description: tag.description,
            params: params,
            undocument: false,
            "return": tag["return"] || {types: ["*"]},
            generator: tag.generator || false
          });
          var node = ASTNodeContainer.getNode(i);
          node.type = "MethodDefinition";
          node.kind = "method";
          if(node.init) {
            node.value = node.init;
            node.body = node.init.body;
            delete node.value.body;
          } else {
            node.value = { params: [] };
          }
          break;
        }
      }
    }
  }
};
