var replacements = {
    'a':{
	'replacement':'b',
	'preventDefault':'true',
	'moveCursor': 'end'
    }
}; 
// go for whitespace delimited // have option?
const remove = (el)=>el.parentNode.removeChild(el);

function replaceLastWord(replacements, keydownEvent){
    let sel = window.getSelection();
    let parent = sel.anchorNode;
    let text = '';
    if (parent.nodeType == 3){ // text node
	let end = sel.getRangeAt(0).endOffset;
	text = parent.nodeValue.slice(0, end);
	let words = text.split(' ');
	let word = words[words.length - 1];
	if (replacements[word]){
	    words[words.length - 1] = replacements[word].replacement;
	    text = words.join(' ');
	    parent.nodeValue = text + parent.nodeValue.slice(end);
	    handleReplacement(replacements[word], keydownEvent, end);
	}
    }
    return text;
}
function setCaretAt(index){
    var sel = window.getSelection();
    var node = sel.anchorNode;
    if (node.nodeType == 3){
	var range = document.createRange();
	if (index > node.nodeValue.length){
	    index = node.nodeValue.length;
	}
	range.setStart(node, index);
	range.collapse(true);
	sel.removeAllRanges();
	sel.addRange(range);
    }
}

function handleReplacement(params, event, initialCaretIndex){
    debugger;
    if (params.preventDefault){
	event.preventDefault();
    }
    if (/^start$/i.exec(params.moveCursor)){
	setCaretAt(initialCaretIndex - 1);
    } else if (/^end$/i.exec(params.moveCursor)){
	setCaretAt(initialCaretIndex + params.replacement.length - 1);
    } else if (/^\d$/.exec(params.moveCursor)){
	setCaretAt(initialCaretIndex +  Number(params.moveCursor) - 1);
    }
}

function listenTo(elementArray, cb){
    for (let el of elementArray){
	el.addEventListener(
	    'keydown',
	    function(e){
		if (e.keyCode == 32){ // space
		    replaceLastWord(replacements, e);
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
    let reminder = document.createElement('button');
    reminder.style = 'position: fixed; left:0px; bottom:0px; opacity: 50%,';
    reminder.onclick = function(){
	debugger;
	this.parentNode.append(popupContainer(replacements));
    };
    reminder.textContent = 'Edit replacements';
    reminder.contenteditable = false;
    document.body.append(reminder);
}

init();

function popupContainer(replcements){
    const makePopupContainer = function(){
	let popup = document.createElement('div');
	popup.style = `font-family: monospace;
                       position: fixed;
                       left: 10%;
                       top: 10%;
                       border: 1px solid;`;
	let x = document.createElement('button');
	x.style = 'position: absolute; top: 0px; right: 0px;';
	x.textContent = 'x';
	x.onclick = function(){
	    remove(this.parentNode);
	};
	popup.append(x);
	popup.append(makeReplacementsTable());
	let newRowBtn = document.createElement('button');
	newRowBtn.textContent = 'Add replacement';
	newRowBtn.onclick = function(){
	    //debugger;
	    this.parentNode.querySelector('tbody').append(makeDefaultRow());
	    let rows = this.parentNode.querySelectorAll('tr');
	    let lastRow = rows[rows.length - 1];
	    lastRow.querySelector('td').focus();
	};
	popup.append(newRowBtn);
	let saveBtn = document.createElement('button');
	saveBtn.textContent = 'Save';
	saveBtn.onclick = function(){
	    saveReplacements(this.parentNode.querySelector('table'), replacements);
	};
	popup.append(saveBtn);
	return popup;
    };
    const saveReplacements = function(tbl, repl){
	let rows = tbl.querySelectorAll('tr');
	rows.forEach(function(el){
	    let cells =  el.querySelectorAll('input');
	    if (cells.length){
		if (cells[0].value){
		    let params = {};
		    params.replacement = cells[1].value;
		    params.preventDefault = cells[2].checked;
		    params.moveCursor = cells[3].value;
		    replacements[cells[0].value] = params;
		}
		repl = replacements;
	    }
	});
    };
    const makeReplacementsTable = function(){
	let table = document.createElement('table');
	table.style = "overflow:auto; max-height: 300px;";
	let tbody = document.createElement('tbody');
	var row = document.createElement('tr');
	let headers = ['replace', 'replacement', 'preventDefault', 'move cursor'];
	for (var text of headers){
	    var cell = document.createElement('th');
	    cell.textContent = text;
	    row.append(cell);
	}
	tbody.append(row);
	headers[3] = 'moveCursor'; //
	for (var key in replacements){
	    row = document.createElement('tr');
	    row.innerHTML = `
	    <td><input size="4" value="${key}"> </td>
	    <td><input size="6" value="${replacements[key].replacement}"></td>
	    <td><input type="checkbox" 
                       checked="${replacements[key].preventDefault}">
            </td>
	    <td><input size="5" value="${replacements[key].moveCursor}"></td>
	    `;
	    var killBtn = makeKillBtn();
	    row.append(killBtn);
	    tbody.append(row);
	}
	table.append(tbody);
	return table;
    };
    const makeKillBtn = function(){
	var killBtn = document.createElement('button');
	killBtn.onclick = function(){
	    remove(this.parentNode.parentNode);
	};
	killBtn.textContent = 'x';
	var td = document.createElement('td');
	td.contenteditable=false;
	td.append(killBtn);
	return td;
    };
    
    const makeDefaultRow = function(){
	var row = document.createElement('tr');
	row.innerHTML = `
	    <td><input size="4"></td>
	    <td><input size="6"></td>
	    <td><input type="checkbox" checked></td>
	    <td><input size="5" value="end"></td>
	    `;
	
	var killBtn = makeKillBtn();
	row.append(killBtn);
	return row;
    };
    return makePopupContainer();
}

//document.querySelector('body').append(display(replacements));
