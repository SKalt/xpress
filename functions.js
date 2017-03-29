var replacements = {'a':'b'}; 
// go for whitespace delimited // have option?

function replaceLastWord(replacements){
    let sel = window.getSelection();
    let parent = sel.anchorNode;
    let text = '';
    if (parent.nodeType == 3){ // text node
	let end = sel.getRangeAt(0).endOffset;
	text = parent.nodeValue.slice(0, end);
	let words = text.split(' ');
	let word = words[words.length - 1];
	if (replacements[word]){
	    words[words.length - 1] = replacements[word];
	}
	text = words.join(' ');
	parent.nodeValue = text + parent.nodeValue.slice(end);
    }
    return text;
}
function setCaretPosition(pos){
    var sel = window.getSelection();
    var node = sel.anchorNode;
    if (node.nodeType == 3){
	var range = document.createRange();
	range.setStart(node, pos);
	range.collapse(true);
	sel.removeAllRanges();
	sel.addRange(range);
    }
}

function listenTo(elementArray, cb){
    for (let el of elementArray){
	el.addEventListener(
	    'keydown',
	    function(e){
		if (e.keyCode == 32){ // space
		    replaceLastWord(replacements);
		}
	    }
	);
    }
}

function init(){
    let arr = document.querySelectorAll(
	'textarea, [contenteditable], input[type=text]'
    );
    listenTo(arr);
}

